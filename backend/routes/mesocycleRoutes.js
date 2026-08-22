import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken, csrfProtection } from "../middleware.js";
import calculateNewTarget, { normalizeProgressionSettings } from "../utils/calculateNewTarget.js";
import createDeloadWeek from "../utils/createDeloadWeek.js";
import processPlan from "../utils/processPlan.js";
import { safeQuery } from "../utils/safeQuery.js";
import { buildResponsePayload } from "../utils/buildResponsePayload.js";
import {
  buildPersonalRecordHistory,
  buildPersonalRecordOverview,
} from "../utils/personalRecords.js";
import {
  applyWorkoutDayTimestamps,
  isWorkoutDayComplete,
} from "../utils/planPersistence.js";
import {
  MesocycleQuotaError,
  assertMesocycleQuota,
} from "../utils/mesocycleLimits.js";
import {
  MAX_DROPSET_SET_COUNT,
  PlanValidationError,
  getPlanByteLength,
  parseAndValidatePlan,
  validateMesocycleInput,
} from "../utils/planValidation.js";
const router = express.Router();

const renameRequestRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many rename attempts. Please try again in a minute.",
  },
});

const renameUserRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user.id),
  message: {
    error: "Too many rename attempts. Please try again in a minute.",
  },
});

function parsePlan(plan) {
  return parseAndValidatePlan(plan);
}

function normalizeCompletedDate(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function normalizeMesocycleRow(row, plan = parsePlan(row.plan)) {
  return {
    ...row,
    plan,
    isCurrent: !!row.isCurrent,
    includeDeload: !!row.include_deload,
    completedDate: normalizeCompletedDate(row.completedDate),
  };
}

function sendMesocycleWriteError(res, error, fallbackMessage) {
  if (error instanceof PlanValidationError) {
    return res.status(400).json({ error: "Invalid plan data" });
  }

  if (error instanceof MesocycleQuotaError) {
    return res.status(422).json({ error: "Mesocycle limit reached" });
  }

  console.error(fallbackMessage, {
    code: error?.code,
    name: error?.name,
  });
  return res.status(500).json({ error: fallbackMessage });
}

async function getMesocycleUsage(userId) {
  const { result, hadRetry } = await safeQuery`
    SELECT COUNT(*) AS mesocycleCount,
           COALESCE(SUM(LENGTH(CAST(plan AS BLOB))), 0) AS planBytes
    FROM mesocycles
    WHERE user_id = ${userId}
  `;

  return {
    mesocycleCount: Number(result?.[0]?.mesocycleCount) || 0,
    planBytes: Number(result?.[0]?.planBytes) || 0,
    hadRetry,
  };
}

function getMesocycleCompletion(plan) {
  return (
    Array.isArray(plan) &&
    plan.length > 0 &&
    plan.every((day) => isWorkoutDayComplete(day))
  );
}

// Endpoint to add a new mesocycle
router.post("/mesocycles", authenticateToken, csrfProtection, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, weeks, daysPerWeek, plan, includeDeload } = req.body;
    const normalizedWeeks = Number(weeks);
    const normalizedDaysPerWeek = Number(daysPerWeek);
    const validatedPlan = validateMesocycleInput({
      weeks: normalizedWeeks,
      daysPerWeek: normalizedDaysPerWeek,
      plan,
    });
    const normalizedPlan = applyWorkoutDayTimestamps(validatedPlan, []);
    const planJson = JSON.stringify(normalizedPlan);
    const completedDate = getMesocycleCompletion(normalizedPlan)
      ? new Date().toISOString()
      : null;
    const usage = await getMesocycleUsage(userId);

    assertMesocycleQuota({
      mesocycleCount: usage.mesocycleCount,
      currentPlanBytes: usage.planBytes,
      newPlanBytes: getPlanByteLength(planJson),
      isCreate: true,
    });

    const { hadRetry: updateHadRetry } = await safeQuery`
      UPDATE mesocycles 
      SET isCurrent = 0 
      WHERE user_id = ${userId}
    `;

    // noinspection SqlResolve -- include_deload is added idempotently in db/schema.js.
    const { result: insertResult, hadRetry: insertHadRetry } = await safeQuery`
      INSERT INTO mesocycles (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent, include_deload)
      VALUES (${name}, ${normalizedWeeks}, ${normalizedDaysPerWeek}, ${planJson}, ${userId}, ${completedDate}, 1, ${includeDeload ? 1 : 0})
    `;

    const hadRetry = usage.hadRetry || updateHadRetry || insertHadRetry;
    const basePayload = {
      message: "Mesocycle created successfully",
      mesocycleId: insertResult.lastID,
    };
    const responsePayload = buildResponsePayload(hadRetry, basePayload);
    return res.status(201).json(responsePayload);
  } catch (err) {
    return sendMesocycleWriteError(
      res,
      err,
      "Failed to create new mesocycle"
    );
  }
});

// Fetch all mesocycles
router.get(
  "/mesocycles",
  authenticateToken,
  async (req, res) => {
    try {
      const userID = req.user.id;
      const { result: rows, hadRetry } =
        await safeQuery`SELECT * FROM mesocycles WHERE user_id = ${userID}`;
      const mesocycles = rows.map((row) => normalizeMesocycleRow(row));
      const responsePayload = hadRetry
        ? buildResponsePayload(hadRetry, { data: mesocycles })
        : mesocycles;
      res.json(responsePayload);
    } catch (err) {
      console.error("Error fetching mesocycles", {
        code: err?.code,
        name: err?.name,
      });
      res.status(500).json({ error: "Failed to fetch mesocycles" });
    }
  }
);

router.patch(
  "/mesocycles/:id/name",
  renameRequestRateLimiter,
  authenticateToken,
  csrfProtection,
  renameUserRateLimiter,
  async (req, res) => {
    const normalizedName =
      typeof req.body?.name === "string" ? req.body.name.trim() : "";

    if (!normalizedName) {
      return res.status(400).json({ error: "Mesocycle name is required" });
    }

    try {
      const { id } = req.params;
      const userID = req.user.id;
      const { result: ownedRows, hadRetry: ownerHadRetry } = await safeQuery`
        SELECT id FROM mesocycles
        WHERE id = ${id} AND user_id = ${userID}
        LIMIT 1
      `;

      if (!ownedRows || ownedRows.length === 0) {
        return res.status(404).json({ error: "Mesocycle not found" });
      }

      const { result: duplicateRows, hadRetry: duplicateHadRetry } =
        await safeQuery`
          SELECT id FROM mesocycles
          WHERE user_id = ${userID}
            AND id != ${id}
            AND LOWER(TRIM(name)) = LOWER(${normalizedName})
          LIMIT 1
        `;

      if (duplicateRows?.length) {
        return res
          .status(409)
          .json({ error: "Mesocycle name is already in use" });
      }

      const { hadRetry: updateHadRetry } = await safeQuery`
        UPDATE mesocycles
        SET name = ${normalizedName}
        WHERE id = ${id} AND user_id = ${userID}
      `;
      const responsePayload = buildResponsePayload(
        ownerHadRetry || duplicateHadRetry || updateHadRetry,
        {
          message: "Mesocycle renamed successfully",
          mesocycle: {
            id: ownedRows[0].id,
            name: normalizedName,
          },
        }
      );

      return res.status(200).json(responsePayload);
    } catch (error) {
      console.error("Error renaming mesocycle", {
        code: error?.code,
        name: error?.name,
      });
      return res.status(500).json({ error: "Failed to rename mesocycle" });
    }
  }
);

// Update a specific mesocycle
router.put("/mesocycles/:id", authenticateToken, csrfProtection, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      weeks,
      plan,
      daysPerWeek,
      isCurrent,
      includeDeload,
    } = req.body;
    const normalizedWeeks = Number(weeks);
    const normalizedDaysPerWeek = Number(daysPerWeek);
    const validatedPlan = validateMesocycleInput({
      weeks: normalizedWeeks,
      daysPerWeek: normalizedDaysPerWeek,
      plan,
    });
    const userID = req.user.id;
    const { result: existingRows, hadRetry: selectHadRetry } = await safeQuery`
      SELECT * FROM mesocycles WHERE id = ${id} AND user_id = ${userID}
    `;

    if (!existingRows || existingRows.length === 0) {
      const { result: userRows, hadRetry: historyHadRetry } = await safeQuery`
        SELECT * FROM mesocycles WHERE user_id = ${userID} ORDER BY id
      `;
      const responsePayload = buildResponsePayload(
        selectHadRetry || historyHadRetry,
        {
          changes: 0,
          message: "Mesocycle updated successfully",
          mesocycle: null,
          personalRecordHistory: buildPersonalRecordHistory(userRows),
        }
      );
      return res.status(200).json(responsePayload);
    }

    const existingRow = existingRows[0];
    const requestedIncludeDeload =
      typeof includeDeload === "boolean"
        ? includeDeload
        : !!existingRow.include_deload;
    const existingPlan = parsePlan(existingRow.plan);
    const normalizedPlan = applyWorkoutDayTimestamps(
      validatedPlan,
      existingPlan
    );
    const allDaysCompleted = getMesocycleCompletion(normalizedPlan);
    const existingCompletedDate = normalizeCompletedDate(
      existingRow.completedDate
    );
    const newCompletedDate = allDaysCompleted
      ? existingCompletedDate || new Date().toISOString()
      : null;
    const planJson = JSON.stringify(normalizedPlan);
    const usage = await getMesocycleUsage(userID);

    assertMesocycleQuota({
      mesocycleCount: usage.mesocycleCount,
      currentPlanBytes: usage.planBytes,
      replacedPlanBytes: getPlanByteLength(existingRow.plan),
      newPlanBytes: getPlanByteLength(planJson),
      isCreate: false,
    });
    // noinspection SqlResolve -- include_deload is added idempotently in db/schema.js.
    const { result, hadRetry: updateHadRetry } = await safeQuery`
      UPDATE mesocycles
      SET name = ${name}, weeks = ${normalizedWeeks}, plan = ${planJson},
          daysPerWeek = ${normalizedDaysPerWeek}, isCurrent = ${isCurrent ? 1 : 0},
          completedDate = ${newCompletedDate},
          include_deload = ${requestedIncludeDeload ? 1 : 0}
      WHERE id = ${id} AND user_id = ${userID}
    `;
    const { result: userRows, hadRetry: historyHadRetry } = await safeQuery`
      SELECT * FROM mesocycles WHERE user_id = ${userID} ORDER BY id
    `;
    const storedRow = userRows.find(
      (row) => String(row.id) === String(id)
    );
    const basePayload = {
      changes: result.changes,
      message: "Mesocycle updated successfully",
      mesocycle: storedRow ? normalizeMesocycleRow(storedRow) : null,
      personalRecordHistory: buildPersonalRecordHistory(userRows),
    };
    const responsePayload = buildResponsePayload(
      selectHadRetry || usage.hadRetry || updateHadRetry || historyHadRetry,
      basePayload
    );
    return res.status(200).json(responsePayload);
  } catch (err) {
    return sendMesocycleWriteError(res, err, "Failed to update mesocycle");
  }
});

// Endpoint to fetch a specific mesocycle
router.get("/mesocycles/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { result: rows, hadRetry } = await safeQuery`
      SELECT * FROM mesocycles WHERE id = ${id} AND user_id = ${req.user.id}
    `;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Mesocycle not found" });
    }
    const row = rows[0];
    const responsePayload = hadRetry
      ? buildResponsePayload(hadRetry, { data: row })
      : row;
    res.json(responsePayload);
  } catch (err) {
    console.error("Error fetching mesocycle", {
      code: err?.code,
      name: err?.name,
    });
    res.status(500).json({ error: "Failed to fetch mesocycle" });
  }
});

// Endpoint to fetch all mesocycle names for the authenticated user
router.get("/mesocycle-names", authenticateToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { result: mesocycles, hadRetry } = await safeQuery`
      SELECT name FROM mesocycles WHERE user_id = ${userID}
    `;
    const names = mesocycles.map((mesocycle) => mesocycle.name);
    const responsePayload = hadRetry
      ? buildResponsePayload(hadRetry, { data: names })
      : names;
    res.status(200).json(responsePayload);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const DROPSET_DROP_PERCENT = 20;

function isBlankValue(value) {
  return value === undefined || value === null || value === "";
}

function getPositiveNumber(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function isUnsetRepValue(value) {
  return isBlankValue(value) || Number(value) === 0;
}

function roundToWeightGrid(value, increment, minimumWeight) {
  const valueCenti = Math.round(value * 100);
  const incrementCenti = Math.round(increment * 100);
  const minimumCenti = Math.round(minimumWeight * 100);

  return Number(
    ((minimumCenti + Math.round((valueCenti - minimumCenti) / incrementCenti) * incrementCenti) / 100).toFixed(2)
  );
}

function ceilToWeightGrid(value, increment, minimumWeight) {
  const valueCenti = Math.round(value * 100);
  const incrementCenti = Math.round(increment * 100);
  const minimumCenti = Math.round(minimumWeight * 100);

  return Number(
    ((minimumCenti + Math.ceil((valueCenti - minimumCenti) / incrementCenti) * incrementCenti) / 100).toFixed(2)
  );
}

function generateDropsetWeights({
  startWeight,
  setCount,
  increment,
  minimumWeight = 0,
  dropPercent = DROPSET_DROP_PERCENT,
}) {
  const parsedStartWeight = Number(startWeight);
  const parsedSetCount = Number(setCount);
  const parsedIncrement = Number(increment);
  const parsedMinimumWeight = Number(minimumWeight);

  if (
    !Number.isFinite(parsedStartWeight) ||
    parsedStartWeight <= 0 ||
    !Number.isInteger(parsedSetCount) ||
    parsedSetCount <= 0 ||
    parsedSetCount > MAX_DROPSET_SET_COUNT ||
    !Number.isFinite(parsedIncrement) ||
    parsedIncrement <= 0 ||
    !Number.isFinite(parsedMinimumWeight) ||
    parsedMinimumWeight < 0 ||
    parsedStartWeight < parsedMinimumWeight
  ) {
    return { weights: [], error: "Invalid dropset inputs." };
  }

  const roundedStartWeight = roundToWeightGrid(
    parsedStartWeight,
    parsedIncrement,
    parsedMinimumWeight
  );
  const weights = [];
  const dropMultiplier = 1 - dropPercent / 100;
  const minimumFinalWeight = Math.max(
    ceilToWeightGrid(
      roundedStartWeight * 0.5,
      parsedIncrement,
      parsedMinimumWeight
    ),
    parsedMinimumWeight
  );
  const minimumStartWeight = Number(
    (minimumFinalWeight + (parsedSetCount - 1) * parsedIncrement).toFixed(2)
  );

  if (roundedStartWeight < minimumStartWeight) {
    return { weights: [], error: "Dropset cannot keep real drops above 50%." };
  }

  for (let index = 0; index < parsedSetCount; index += 1) {
    const rawWeight =
      index === 0 ? roundedStartWeight : weights[index - 1] * dropMultiplier;
    let nextWeight = roundToWeightGrid(
      rawWeight,
      parsedIncrement,
      parsedMinimumWeight
    );
    const remainingDrops = parsedSetCount - index - 1;
    const minimumWeightForRealDrops = Number(
      (minimumFinalWeight + remainingDrops * parsedIncrement).toFixed(2)
    );

    nextWeight = Math.max(nextWeight, minimumWeightForRealDrops);

    if (index > 0 && nextWeight >= weights[index - 1]) {
      return { weights: [], error: "Dropset cannot keep real drops above 50%." };
    }

    weights.push(nextWeight);
  }

  return { weights, error: null };
}

function getProgressionFactors(currentWeek) {
  const factors = [1.0, 1.05, 1.075, 1.1, 1.125];

  return {
    previousFactor: factors[currentWeek - 2] || 1.0,
    currentFactor: factors[currentWeek - 1],
  };
}

function getSetProgressionValues(set) {
  return {
    weight: set.completed
      ? parseFloat(set.weight)
      : parseFloat(set.targetWeight),
    reps: set.completed
      ? parseInt(set.reps, 10)
      : parseInt(set.targetReps, 10),
  };
}

function getDropsetSetCount(exercise) {
  const configuredSetCount = Number(exercise.dropset?.setCount);

  if (
    Number.isInteger(configuredSetCount) &&
    configuredSetCount > 0 &&
    configuredSetCount <= MAX_DROPSET_SET_COUNT
  ) {
    return configuredSetCount;
  }

  return Array.isArray(exercise.sets)
    ? Math.min(exercise.sets.length, MAX_DROPSET_SET_COUNT)
    : 1;
}

function getDropsetTargetRepsBySet(
  previousWeekExercise,
  currentWeek,
  progressionSettings
) {
  if (!Array.isArray(previousWeekExercise.sets)) {
    return null;
  }

  const { previousFactor, currentFactor } = getProgressionFactors(currentWeek);

  return previousWeekExercise.sets.map((previousSet) => {
    if (!previousSet?.completed) {
      return undefined;
    }

    const { weight, reps } = getSetProgressionValues(previousSet);
    if (
      !Number.isFinite(weight) ||
      weight <= 0 ||
      !Number.isFinite(reps) ||
      reps <= 0
    ) {
      return undefined;
    }

    return calculateNewTarget(
      weight,
      reps,
      previousWeekExercise.type,
      previousFactor,
      currentFactor,
      progressionSettings
    ).reps;
  });
}

function hasConfiguredDropsetStart(exercise) {
  const configuredStartWeight = getPositiveNumber(exercise.dropset?.startWeight);
  const firstSet = exercise.sets?.[0] || {};
  const firstSetWeight =
    getPositiveNumber(firstSet.targetWeight) ?? getPositiveNumber(firstSet.weight);

  return !!configuredStartWeight && !!firstSetWeight;
}

function buildDropsetSetsFromTargets({
  exercise,
  startWeight,
  targetReps,
  targetRepsBySet,
  progressionSettings,
  useTargetsForValues,
}) {
  const setCount = getDropsetSetCount(exercise);
  const { weights, error } = generateDropsetWeights({
    startWeight,
    setCount,
    increment: progressionSettings.weightIncrement,
    minimumWeight: progressionSettings.minimumWeight,
    dropPercent: exercise.dropset?.dropPercent ?? DROPSET_DROP_PERCENT,
  });

  if (error) {
    return exercise.sets;
  }

  return weights.map((weight, setIndex) => {
    const set = exercise.sets[setIndex] || {};
    const usesPerSetTargets = Array.isArray(targetRepsBySet);
    const setSpecificTargetReps = targetRepsBySet?.[setIndex];
    const hasSetSpecificTargetReps = !isUnsetRepValue(
      setSpecificTargetReps
    );
    const progressedTargetReps = usesPerSetTargets
      ? hasSetSpecificTargetReps
        ? setSpecificTargetReps
        : 0
      : targetReps;
    const nextTargetReps = usesPerSetTargets
      ? progressedTargetReps
      : isUnsetRepValue(set.targetReps)
        ? progressedTargetReps
        : set.targetReps;

    return {
      ...set,
      weight:
        useTargetsForValues && !set.completed
          ? weight
          : set.weight ?? weight,
      reps:
        useTargetsForValues && !set.completed
          ? progressedTargetReps
          : set.reps ?? nextTargetReps,
      targetWeight: weight,
      targetReps: nextTargetReps,
    };
  });
}

function getUpdatedDropsetSets(
  exercise,
  previousWeekExercise,
  currentWeek,
  progressionSettings
) {
  const configuredStartWeight = getPositiveNumber(exercise.dropset?.startWeight);
  const targetRepsBySet = getDropsetTargetRepsBySet(
    previousWeekExercise,
    currentWeek,
    progressionSettings
  );

  if (hasConfiguredDropsetStart(exercise)) {
    const firstSet = exercise.sets[0] || {};
    const configuredTargetReps = isUnsetRepValue(firstSet.targetReps)
      ? firstSet.reps ?? 0
      : firstSet.targetReps;

    return buildDropsetSetsFromTargets({
      exercise,
      startWeight: configuredStartWeight,
      targetReps: targetRepsBySet?.[0] ?? configuredTargetReps,
      targetRepsBySet,
      progressionSettings,
      useTargetsForValues: true,
    });
  }

  const previousFirstSet = previousWeekExercise.sets?.[0];
  if (!previousFirstSet) {
    return exercise.sets;
  }

  const { weight: lastWeekWeight, reps: lastWeekReps } =
    getSetProgressionValues(previousFirstSet);
  const { previousFactor, currentFactor } = getProgressionFactors(currentWeek);
  const newTarget = calculateNewTarget(
    lastWeekWeight,
    lastWeekReps,
    previousWeekExercise.type,
    previousFactor,
    currentFactor,
    progressionSettings
  );

  return buildDropsetSetsFromTargets({
    exercise,
    startWeight: newTarget.weight,
    targetReps: newTarget.reps,
    targetRepsBySet,
    progressionSettings,
    useTargetsForValues: previousFirstSet.completed,
  });
}

function getUpdatedSets(exercise, previousWeekExercise, currentWeek, progressionSettings) {
  if (exercise.dropset?.enabled) {
    return getUpdatedDropsetSets(
      exercise,
      previousWeekExercise,
      currentWeek,
      progressionSettings
    );
  }

  return exercise.sets.map((set, setIndex) => {
    const prevWeekset = previousWeekExercise.sets[setIndex];
    if (!prevWeekset) return set;
    const { weight: lastWeekWeight, reps: lastWeekReps } =
      getSetProgressionValues(prevWeekset);
    const { previousFactor, currentFactor } = getProgressionFactors(currentWeek);
    const newTarget = calculateNewTarget(
        lastWeekWeight,
        lastWeekReps,
        previousWeekExercise.type,
        previousFactor,
        currentFactor,
        progressionSettings
    );
    const weightToUse =
        !prevWeekset.completed || set.completed
            ? set.weight
            : newTarget.weight;
    const repsToUse =
        !prevWeekset.completed || set.completed
            ? set.reps
            : newTarget.reps;
    return {
      ...set,
      weight: weightToUse,
      reps: repsToUse,
      targetWeight: newTarget.weight,
      targetReps: newTarget.reps,
    };
  });
}

function getExercises(
  day,
  dayIndex,
  daysPerWeek,
  plan,
  currentWeek,
  totalWeeks,
  firstWeekExercises,
  includeDeload
) {
  return day.exercises.map((exercise, exerciseIndex) => {
    const progressionSettings = normalizeProgressionSettings(exercise);
    const exerciseWithProgression = {
      ...exercise,
      ...progressionSettings,
    };

    // For week 2+, apply progression relative to the same exercise from the previous week.
    // On the final (deload) week, reset to first-week loads instead of progressing further.
    if (dayIndex >= daysPerWeek) {
      const previousWeekIndex = dayIndex - daysPerWeek;
      const previousWeekExercise =
          plan[previousWeekIndex].exercises[exerciseIndex];
      if (!previousWeekExercise) return exerciseWithProgression;
      if (!Array.isArray(exercise.sets)) return exerciseWithProgression;
      const isDeloadWeek = includeDeload && currentWeek === totalWeeks;
      if (isDeloadWeek) {
        const deloadExercise = createDeloadWeek(
            firstWeekExercises,
            plan[dayIndex].exercises
        )[exerciseIndex];
        return {
          ...deloadExercise,
          ...progressionSettings,
        };
      }
      const updatedSets = getUpdatedSets(exercise, previousWeekExercise, currentWeek, progressionSettings);
      return {...exerciseWithProgression, sets: updatedSets};
    }
    return exerciseWithProgression;
  });
}

function getFinalPlan(
  updatedPlan,
  daysPerWeek,
  plan,
  totalWeeks,
  includeDeload
) {
  return updatedPlan.map((day, dayIndex) => {
    const currentWeek = Math.floor(dayIndex / daysPerWeek) + 1;
    const firstWeekExercises = plan[dayIndex % daysPerWeek].exercises;
    return {
      ...day,
      exercises: getExercises(
        day,
        dayIndex,
        daysPerWeek,
        plan,
        currentWeek,
        totalWeeks,
        firstWeekExercises,
        includeDeload
      ),
    };
  });
}

// Compact record data for the standalone personal-records page. This route is
// intentionally independent of whether the user currently has an active plan.
router.get(
  "/personal-records",
  authenticateToken,
  async (req, res) => {
    try {
      const userID = req.user.id;
      const { result: rows, hadRetry } = await safeQuery`
        SELECT * FROM mesocycles WHERE user_id = ${userID} ORDER BY id
      `;
      const currentRow = rows?.find(
        (mesocycle) =>
          mesocycle.isCurrent === true || Number(mesocycle.isCurrent) === 1
      );

      if (currentRow) {
        try {
          parsePlan(currentRow.plan);
        } catch {
          return res.status(500).json({ error: "Invalid plan data" });
        }
      }

      const overview = buildPersonalRecordOverview(rows);
      res.json(buildResponsePayload(hadRetry, overview));
    } catch (err) {
      console.error("Error fetching personal records", {
        code: err?.code,
        name: err?.name,
      });
      res.status(500).json({ error: "Failed to fetch personal records" });
    }
  }
);

// Endpoint to fetch the current workout
router.get(
  "/current-workout",
  authenticateToken,
  async (req, res) => {
    const startedAt = performance.now();
    const timings = {};
    const recordTiming = (name, start) => {
      timings[name] = performance.now() - start;
    };
    const sendTiming = () => {
      res.set(
        "Server-Timing",
        [
          `db;dur=${(timings.db || 0).toFixed(1)}`,
          `plan;dur=${(timings.plan || 0).toFixed(1)}`,
          `pr;dur=${(timings.pr || 0).toFixed(1)}`,
          `total;dur=${(performance.now() - startedAt).toFixed(1)}`,
        ].join(", ")
      );
    };

    try {
      const userID = req.user.id;
      const includePersonalRecords = req.query.includePersonalRecords !== "false";
      const dbStartedAt = performance.now();
      const currentWorkoutQuery = await safeQuery`
        SELECT * FROM mesocycles
        WHERE user_id = ${userID} AND (isCurrent = 1 OR isCurrent = true)
        ORDER BY id
      `;
      let hadRetry = currentWorkoutQuery.hadRetry;
      const currentRows = currentWorkoutQuery.result;
      recordTiming("db", dbStartedAt);
      const row = currentRows?.[0];
      if (!row) {
        sendTiming();
        return res.status(404).json({ error: "Current workout not found" });
      }

      const planStartedAt = performance.now();
      let plan;
      try {
        plan = parsePlan(row.plan);
        validateMesocycleInput({
          weeks: row.weeks,
          daysPerWeek: row.daysPerWeek,
          plan,
        });
      } catch (error) {
        sendTiming();
        return res.status(500).json({ error: "Invalid plan data" });
      }

      const { updatedPlan, firstIncompleteDayIndex } = processPlan(plan);
      const daysPerWeek = row.daysPerWeek;
      const totalWeeks = row.weeks;
      const finalPlan = getFinalPlan(
        updatedPlan,
        daysPerWeek,
        plan,
        totalWeeks,
        !!row.include_deload
      );
      recordTiming("plan", planStartedAt);

      const finalResponse = {
        ...row,
        plan: finalPlan,
        isCurrent: !!row.isCurrent,
        includeDeload: !!row.include_deload,
        completedDate: normalizeCompletedDate(row.completedDate),
        totalWeeks: row.weeks,
        daysPerWeek: row.daysPerWeek,
        firstIncompleteDayIndex,
      };

      if (includePersonalRecords) {
        const personalRecordsStartedAt = performance.now();
        const personalRecordsQuery = await safeQuery`
          SELECT * FROM mesocycles WHERE user_id = ${userID} ORDER BY id
        `;
        hadRetry ||= personalRecordsQuery.hadRetry;
        finalResponse.personalRecordHistory = buildPersonalRecordHistory(
          personalRecordsQuery.result
        );
        recordTiming("pr", personalRecordsStartedAt);
      }

      const responsePayload = hadRetry
        ? buildResponsePayload(hadRetry, { data: finalResponse })
        : finalResponse;

      sendTiming();
      res.json(responsePayload);
    } catch (err) {
      sendTiming();
      console.error("Error fetching current workout", {
        code: err?.code,
        name: err?.name,
      });
      res.status(500).json({ error: "Failed to fetch current workout" });
    }
  }
);

export default router;
