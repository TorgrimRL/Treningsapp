import crypto from "node:crypto";
import express from "express";
import { authenticateToken, csrfProtection } from "../../middleware.js";
import { safeQuery } from "../../utils/safeQuery.js";
import { getDefaultWeightIncrement } from "../../utils/calculateNewTarget.js";
import { assertMesocycleQuota } from "../../utils/mesocycleLimits.js";
import {
  getPlanByteLength,
  MAX_DROPSET_SET_COUNT,
  MAX_EXERCISES_PER_DAY,
  MAX_PLAN_BYTES,
  MAX_SETS_PER_EXERCISE,
  PlanValidationError,
  validateMesocycleInput,
} from "../../utils/planValidation.js";

const router = express.Router();
const onboardingKinds = new Set(["discovery", "import", "template", "scratch"]);
const onboardingStatuses = new Set(["not_started", "in_progress", "completed", "skipped"]);
const exerciseTypes = new Set(["barbell", "machine", "dumbbell", "bodyweight", "cable"]);
const MAX_DRAFT_DAYS = 14;

function parseJson(value, fallback = {}) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value || fallback;
  } catch {
    return fallback;
  }
}

function serializeDraft(row) {
  if (!row) return null;
  return {
    id: row.id,
    path: row.path,
    revision: Number(row.revision),
    data: parseJson(row.data),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeStatus(user, draft) {
  return {
    version: Number(user.onboarding_version) || 1,
    status: onboardingStatuses.has(user.onboarding_status)
      ? user.onboarding_status
      : "completed",
    step: user.onboarding_step || null,
    startedAt: user.onboarding_started_at || null,
    firstSetAt: user.onboarding_first_set_at || null,
    completedAt: user.onboarding_completed_at || null,
    draft: serializeDraft(draft),
  };
}

function hasValidCompletedSet(day) {
  return day?.exercises?.some((exercise) =>
    exercise?.sets?.some((set) => {
      const weight = Number(set?.weight);
      const reps = Number(set?.reps);
      return set?.completed === true && Number.isFinite(weight) && weight >= 0 &&
        Number.isInteger(reps) && reps >= 1 && reps <= 30;
    })
  );
}

function validateDraftData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new PlanValidationError("Draft data must be an object");
  }
  if (getPlanByteLength(data) > MAX_PLAN_BYTES) {
    throw new PlanValidationError(`Draft must not exceed ${MAX_PLAN_BYTES} bytes`);
  }
  const days = data.days ?? [];
  if (!Array.isArray(days) || days.length > MAX_DRAFT_DAYS) {
    throw new PlanValidationError(`Draft must contain no more than ${MAX_DRAFT_DAYS} days`);
  }
  days.forEach((day, dayIndex) => {
    if (!day || !Array.isArray(day.exercises) || day.exercises.length > MAX_EXERCISES_PER_DAY) {
      throw new PlanValidationError(`Day ${dayIndex + 1} has invalid exercises`);
    }
    day.exercises.forEach((exercise, exerciseIndex) => {
      if (!exercise || !Array.isArray(exercise.sets) || exercise.sets.length > MAX_SETS_PER_EXERCISE) {
        throw new PlanValidationError(`Exercise ${exerciseIndex + 1} has invalid sets`);
      }
      if (exercise.note !== undefined && (typeof exercise.note !== "string" || exercise.note.length > 1000)) {
        throw new PlanValidationError("Exercise notes must not exceed 1000 characters");
      }
      if (exercise.dropset !== undefined &&
        (!exercise.dropset || typeof exercise.dropset !== "object" || Array.isArray(exercise.dropset))) {
        throw new PlanValidationError("Dropset settings must be an object");
      }
      if (exercise.dropset?.enabled && exercise.sets.length > MAX_DROPSET_SET_COUNT) {
        throw new PlanValidationError(`Dropsets must not contain more than ${MAX_DROPSET_SET_COUNT} sets`);
      }
      exercise.sets.forEach((set) => {
        if (!set || typeof set !== "object" || Array.isArray(set)) {
          throw new PlanValidationError("Sets must be objects");
        }
        if (set.completed === true) {
          const weight = Number(set.weight);
          const reps = Number(set.reps);
          if (!Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps < 1 || reps > 30) {
            throw new PlanValidationError("Completed sets require Weight ≥ 0 and Reps from 1 to 30");
          }
        }
      });
    });
  });
  return data;
}

function applyServerTimestamps(incoming, previous, now) {
  const previousDays = Array.isArray(previous?.days) ? previous.days : [];
  return {
    ...incoming,
    days: (incoming.days || []).map((day, index) => {
      const storedDay = previousDays[index] || {};
      const next = { ...day };
      delete next.startedAt;
      delete next.completedAt;
      const hasSet = hasValidCompletedSet(day);
      const hadSet = hasValidCompletedSet(storedDay);
      if (storedDay.startedAt) next.startedAt = storedDay.startedAt;
      else if (hasSet && !hadSet) next.startedAt = now;
      if (storedDay.completedAt) next.completedAt = storedDay.completedAt;
      else if (day.finished === true && hasSet) next.completedAt = now;
      return next;
    }),
  };
}

async function getUserAndDraft(userId) {
  const [{ result: users }, { result: drafts }] = await Promise.all([
    safeQuery`SELECT onboarding_version, onboarding_status, onboarding_step,
      onboarding_started_at, onboarding_first_set_at, onboarding_completed_at
      FROM users WHERE id = ${userId} LIMIT 1`,
    safeQuery`SELECT * FROM onboarding_drafts WHERE user_id = ${userId} LIMIT 1`,
  ]);
  return { user: users[0], draft: drafts[0] };
}

router.get("/onboarding", authenticateToken, async (req, res) => {
  try {
    const { user, draft } = await getUserAndDraft(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(serializeStatus(user, draft));
  } catch (error) {
    console.error("Onboarding lookup failed", { code: error?.code, name: error?.name });
    return res.status(500).json({ error: "Failed to load onboarding" });
  }
});

router.post("/onboarding/start", authenticateToken, csrfProtection, async (req, res) => {
  const kind = req.body?.kind;
  if (!onboardingKinds.has(kind)) {
    return res.status(400).json({ error: "Invalid onboarding path" });
  }
  try {
    const { user, draft } = await getUserAndDraft(req.user.id);
    if (draft && user?.onboarding_status === "in_progress") {
      return res.json(serializeStatus(user, draft));
    }
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    if (draft) {
      await safeQuery`DELETE FROM onboarding_drafts WHERE user_id = ${req.user.id}`;
    }
    await safeQuery`INSERT INTO onboarding_drafts
      (id, user_id, path, revision, data, created_at, updated_at)
      VALUES (${id}, ${req.user.id}, ${kind}, ${0}, ${JSON.stringify({ kind, days: [] })}, ${now}, ${now})`;
    await safeQuery`UPDATE users SET onboarding_version = ${1}, onboarding_status = ${"in_progress"},
      onboarding_step = ${kind}, onboarding_started_at = ${now}, onboarding_first_set_at = NULL,
      onboarding_completed_at = NULL WHERE id = ${req.user.id}`;
    const state = await getUserAndDraft(req.user.id);
    return res.status(201).json(serializeStatus(state.user, state.draft));
  } catch (error) {
    console.error("Onboarding start failed", { code: error?.code, name: error?.name });
    return res.status(500).json({ error: "Failed to start onboarding" });
  }
});

router.put("/onboarding/draft", authenticateToken, csrfProtection, async (req, res) => {
  try {
    const revision = Number(req.body?.revision);
    const path = typeof req.body?.path === "string" ? req.body.path.trim() : "";
    if (!req.body?.draftId || !Number.isInteger(revision) || revision < 0 || !path || path.length > 80) {
      return res.status(400).json({ error: "Invalid draft request" });
    }
    const { result: rows } = await safeQuery`SELECT * FROM onboarding_drafts
      WHERE id = ${req.body.draftId} AND user_id = ${req.user.id} LIMIT 1`;
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "Draft not found" });
    if (Number(row.revision) !== revision) {
      return res.status(409).json({ error: "Draft has changed", draft: serializeDraft(row) });
    }
    const validated = validateDraftData(req.body.data);
    const now = new Date().toISOString();
    const data = applyServerTimestamps(validated, parseJson(row.data), now);
    const nextRevision = revision + 1;
    const { result } = await safeQuery`UPDATE onboarding_drafts SET path = ${path},
      revision = ${nextRevision}, data = ${JSON.stringify(data)}, updated_at = ${now}
      WHERE id = ${row.id} AND user_id = ${req.user.id} AND revision = ${revision}`;
    if (result.changes !== 1) {
      const { result: current } = await safeQuery`SELECT * FROM onboarding_drafts WHERE id = ${row.id} AND user_id = ${req.user.id}`;
      return res.status(409).json({ error: "Draft has changed", draft: serializeDraft(current[0]) });
    }
    if (data.days.some(hasValidCompletedSet)) {
      await safeQuery`UPDATE users SET onboarding_first_set_at = COALESCE(onboarding_first_set_at, ${now}),
        onboarding_step = ${path} WHERE id = ${req.user.id}`;
    } else {
      await safeQuery`UPDATE users SET onboarding_step = ${path} WHERE id = ${req.user.id}`;
    }
    const { result: saved } = await safeQuery`SELECT * FROM onboarding_drafts WHERE id = ${row.id} AND user_id = ${req.user.id}`;
    return res.json({ draft: serializeDraft(saved[0]) });
  } catch (error) {
    if (error instanceof PlanValidationError) return res.status(400).json({ error: error.message });
    console.error("Onboarding autosave failed", { code: error?.code, name: error?.name });
    return res.status(500).json({ error: "Failed to save onboarding" });
  }
});

router.post("/onboarding/skip", authenticateToken, csrfProtection, async (req, res) => {
  try {
    const now = new Date().toISOString();
    await safeQuery`UPDATE users SET onboarding_status = ${"skipped"}, onboarding_step = ${"templates"},
      onboarding_completed_at = ${now} WHERE id = ${req.user.id}`;
    return res.json({ status: "skipped", redirectTo: "/templates" });
  } catch {
    return res.status(500).json({ error: "Failed to skip onboarding" });
  }
});

function normalizeExercise(exercise) {
  const name = typeof exercise?.exercise === "string" ? exercise.exercise.trim().replace(/\s+/g, " ") : "";
  const muscleGroup = typeof exercise?.muscleGroup === "string" ? exercise.muscleGroup.trim() : "";
  const type = exerciseTypes.has(exercise?.type) ? exercise.type : "barbell";
  if (!name || !muscleGroup) throw new PlanValidationError("Every exercise needs a name and muscle group");
  const completedSets = exercise.sets.filter((set) => set.completed === true).map((set) => ({
    completed: true,
    weight: Number(set.weight),
    reps: Number(set.reps),
    targetWeight: 0,
    targetReps: 0,
  }));
  if (!completedSets.length) return null;
  const normalized = {
    exercise: name,
    muscleGroup,
    type,
    videoLink: exercise.videoLink || "",
    progressionMode: "percent",
    weightIncrement: getDefaultWeightIncrement(type),
    minimumWeight: type === "bodyweight" ? 0 : getDefaultWeightIncrement(type),
    sets: completedSets,
  };
  const note = typeof exercise.note === "string" ? exercise.note.trim() : "";
  if (note) normalized.note = note;
  if (exercise.dropset?.enabled) {
    normalized.dropset = {
      enabled: true,
      setCount: completedSets.length,
      startWeight: completedSets[0].weight,
      dropPercent: 20,
    };
  }
  return normalized;
}

function buildTrainingPlan(data) {
  const finishedDays = data.days.filter((day) => day.finished === true && hasValidCompletedSet(day));
  if (!finishedDays.length || finishedDays.length > MAX_DRAFT_DAYS) {
    throw new PlanValidationError("Finish at least one training day before creating your plan");
  }
  const replacements = Array.isArray(data.review?.replacements) ? data.review.replacements : [];
  const weeks = Number(data.review?.weeks ?? 5);
  if (!Number.isInteger(weeks) || weeks < 3 || weeks > 12) {
    throw new PlanValidationError("Training block must contain between 3 and 12 weeks");
  }
  const firstWeek = finishedDays.map((day, dayIndex) => ({
    label: typeof day.label === "string" && day.label.trim() ? day.label.trim() : `Day ${dayIndex + 1}`,
    startedAt: day.startedAt,
    completedAt: day.completedAt,
    exercises: day.exercises.map(normalizeExercise).filter(Boolean),
  }));
  const futureWeek = firstWeek.map((day, dayIndex) => ({
    label: day.label,
    exercises: day.exercises.map((exercise, exerciseIndex) => {
      const requested = replacements.find((item) => Number(item.dayIndex) === dayIndex && Number(item.exerciseIndex) === exerciseIndex)?.exercise;
      const replacement = requested ? normalizeExercise({ ...requested, sets: [{ completed: true, weight: 0, reps: 1 }] }) : null;
      const source = replacement || exercise;
      return {
        ...source,
        sets: exercise.sets.map(() => ({ completed: false, weight: 0, reps: 0, targetWeight: 0, targetReps: 0 })),
      };
    }),
  }));
  const plan = [firstWeek, ...Array.from({ length: weeks - 1 }, () => futureWeek)].flat().map((day) => ({
    ...day,
    exercises: day.exercises.map((exercise) => ({ ...exercise, sets: exercise.sets.map((set) => ({ ...set })) })),
  }));
  validateMesocycleInput({ weeks, daysPerWeek: firstWeek.length, plan });
  return { plan, daysPerWeek: firstWeek.length, weeks };
}

router.post("/onboarding/finalize", authenticateToken, csrfProtection, async (req, res) => {
  const draftId = req.body?.draftId;
  if (typeof draftId !== "string" || !draftId) return res.status(400).json({ error: "Draft ID is required" });
  let transactionStarted = false;
  try {
    const { result: prior } = await safeQuery`SELECT id FROM mesocycles
      WHERE source_onboarding_draft_id = ${draftId} AND user_id = ${req.user.id} LIMIT 1`;
    if (prior[0]) return res.json({ mesocycleId: prior[0].id, redirectTo: "/currentworkout", idempotent: true });
    await safeQuery`BEGIN IMMEDIATE`;
    transactionStarted = true;
    const { result: drafts } = await safeQuery`SELECT * FROM onboarding_drafts
      WHERE id = ${draftId} AND user_id = ${req.user.id} LIMIT 1`;
    if (!drafts[0]) throw Object.assign(new Error("Draft not found"), { status: 404 });
    const data = validateDraftData(parseJson(drafts[0].data));
    const { plan, daysPerWeek, weeks } = buildTrainingPlan(data);
    const name = typeof data.review?.name === "string" && data.review.name.trim()
      ? data.review.name.trim().slice(0, 120) : "My first training block";
    const planJson = JSON.stringify(plan);
    const { result: usage } = await safeQuery`SELECT COUNT(*) AS mesocycleCount,
      COALESCE(SUM(LENGTH(CAST(plan AS BLOB))), 0) AS planBytes FROM mesocycles WHERE user_id = ${req.user.id}`;
    assertMesocycleQuota({
      mesocycleCount: Number(usage[0]?.mesocycleCount) || 0,
      currentPlanBytes: Number(usage[0]?.planBytes) || 0,
      newPlanBytes: getPlanByteLength(planJson),
      isCreate: true,
    });
    await safeQuery`UPDATE mesocycles SET isCurrent = 0 WHERE user_id = ${req.user.id}`;
    const { result: inserted } = await safeQuery`INSERT INTO mesocycles
      (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent, include_deload, source_onboarding_draft_id)
      VALUES (${name}, ${weeks}, ${daysPerWeek}, ${planJson}, ${req.user.id}, ${null}, ${1},
        ${data.review?.includeDeload ? 1 : 0}, ${draftId})`;
    const now = new Date().toISOString();
    await safeQuery`UPDATE users SET onboarding_status = ${"completed"}, onboarding_step = ${"completed"},
      onboarding_completed_at = ${now} WHERE id = ${req.user.id}`;
    await safeQuery`DELETE FROM onboarding_drafts WHERE id = ${draftId} AND user_id = ${req.user.id}`;
    await safeQuery`COMMIT`;
    transactionStarted = false;
    return res.status(201).json({ mesocycleId: inserted.lastID, redirectTo: "/currentworkout" });
  } catch (error) {
    if (transactionStarted) {
      try { await safeQuery`ROLLBACK`; } catch { /* preserve the original failure */ }
    }
    if (error instanceof PlanValidationError) return res.status(400).json({ error: error.message });
    if (error?.status === 404) return res.status(404).json({ error: "Draft not found" });
    if (error?.name === "MesocycleQuotaError") return res.status(422).json({ error: "Mesocycle limit reached" });
    console.error("Onboarding finalize failed", { code: error?.code, name: error?.name });
    return res.status(500).json({ error: "Failed to finish onboarding" });
  }
});

export default router;
