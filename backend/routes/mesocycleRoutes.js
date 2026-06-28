import express from "express";
import { authenticateToken, csrfProtection } from "../middleware.js";
import calculateNewTarget, { normalizeProgressionSettings } from "../utils/calculateNewTarget.js";
import createDeloadWeek from "../utils/createDeloadWeek.js";
import processPlan from "../utils/processPlan.js";
import { safeQuery } from "../utils/safeQuery.js";
import { buildResponsePayload } from "../utils/buildResponsePayload.js";
const router = express.Router();

// Endpoint to add a new mesocycle
router.post("/mesocycles", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, weeks, daysPerWeek, plan, completedDate } = req.body;

    const { hadRetry: updateHadRetry } = await safeQuery`
      UPDATE mesocycles 
      SET isCurrent = 0 
      WHERE user_id = ${userId}
    `;

    const planJson = JSON.stringify(plan);

    const { result: insertResult, hadRetry: insertHadRetry } = await safeQuery`
      INSERT INTO mesocycles (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
      VALUES (${name}, ${weeks}, ${daysPerWeek}, ${planJson}, ${userId}, ${completedDate}, 1)
    `;

    const hadRetry = updateHadRetry || insertHadRetry;
    const basePayload = {
      message: "Mesocycle created successfully",
      mesocycleId: insertResult.lastID,
    };
    const responsePayload = buildResponsePayload(hadRetry, basePayload);
    res.status(201).json(responsePayload);
  } catch (err) {
    console.error("Error creating new mesocycle:", err.message);
    res.status(500).json({ error: "Failed to create new mesocycle" });
  }
});

// Fetch all mesocycles
router.get(
  "/mesocycles",
  authenticateToken,
  csrfProtection,
  async (req, res) => {
    try {
      const userID = req.user.id;
      const { result: rows, hadRetry } =
        await safeQuery`SELECT * FROM mesocycles WHERE user_id = ${userID}`;
      const mesocycles = rows.map((row) => ({
        ...row,
        plan: JSON.parse(row.plan),
        isCurrent: !!row.isCurrent,
        completedDate: row.completedDate
          ? new Date(row.completedDate).toISOString()
          : null,
      }));
      const responsePayload = hadRetry
        ? buildResponsePayload(hadRetry, { data: mesocycles })
        : mesocycles;
      res.json(responsePayload);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update a specific mesocycle
router.put("/mesocycles/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, weeks, plan, daysPerWeek, isCurrent, completedDate } =
      req.body;
    const userID = req.user.id;
    const allDaysCompleted = plan.every((day) =>
      day.exercises.every(
        (exercise) =>
          Array.isArray(exercise.sets) &&
          exercise.sets.every((set) => set.completed)
      )
    );
    const newCompletedDate =
      allDaysCompleted && !completedDate
        ? new Date().toISOString()
        : completedDate;
    const { result, hadRetry } = await safeQuery`
      UPDATE mesocycles
      SET name = ${name}, weeks = ${weeks}, plan = ${JSON.stringify(plan)}, 
          daysPerWeek = ${daysPerWeek}, isCurrent = ${isCurrent ? 1 : 0}, 
          completedDate = ${newCompletedDate}
      WHERE id = ${id} AND user_id = ${userID}
    `;
    const basePayload = {
      changes: result.changes,
      message: "Mesocycle updated successfully",
    };
    const responsePayload = buildResponsePayload(hadRetry, basePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch a specific mesocycle
router.get("/mesocycles/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { result: rows, hadRetry } = await safeQuery`
      SELECT * FROM mesocycles WHERE id = ${id} AND (user_id = ${req.user.id} OR user_id IS NULL)
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
    console.error("Error fetching mesocycle:", err.message);
    res.status(500).json({ error: err.message });
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

function roundToIncrement(value, increment) {
  return Number((Math.round(value / increment) * increment).toFixed(2));
}

function ceilToIncrement(value, increment) {
  return Number((Math.ceil(value / increment) * increment).toFixed(2));
}

function generateDropsetWeights({
  startWeight,
  setCount,
  increment,
  dropPercent = DROPSET_DROP_PERCENT,
}) {
  const parsedStartWeight = Number(startWeight);
  const parsedSetCount = Number(setCount);
  const parsedIncrement = Number(increment);

  if (
    !Number.isFinite(parsedStartWeight) ||
    parsedStartWeight <= 0 ||
    !Number.isInteger(parsedSetCount) ||
    parsedSetCount <= 0 ||
    !Number.isFinite(parsedIncrement) ||
    parsedIncrement <= 0
  ) {
    return { weights: [], error: "Invalid dropset inputs." };
  }

  const roundedStartWeight = roundToIncrement(
    parsedStartWeight,
    parsedIncrement
  );
  const weights = [];
  const dropMultiplier = 1 - dropPercent / 100;
  const minimumFinalWeight = ceilToIncrement(
    roundedStartWeight * 0.5,
    parsedIncrement
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
    let nextWeight = roundToIncrement(rawWeight, parsedIncrement);
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

  if (Number.isInteger(configuredSetCount) && configuredSetCount > 0) {
    return configuredSetCount;
  }

  return Array.isArray(exercise.sets) ? exercise.sets.length : 1;
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
  progressionSettings,
  useTargetsForValues,
}) {
  const setCount = getDropsetSetCount(exercise);
  const { weights, error } = generateDropsetWeights({
    startWeight,
    setCount,
    increment: progressionSettings.weightIncrement,
    dropPercent: exercise.dropset?.dropPercent ?? DROPSET_DROP_PERCENT,
  });

  if (error) {
    return exercise.sets;
  }

  return weights.map((weight, setIndex) => {
    const set = exercise.sets[setIndex] || {};
    const nextTargetReps = isUnsetRepValue(set.targetReps)
      ? targetReps
      : set.targetReps;

    return {
      ...set,
      weight:
        useTargetsForValues && !set.completed
          ? weight
          : set.weight ?? weight,
      reps:
        useTargetsForValues && !set.completed
          ? targetReps
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

  if (hasConfiguredDropsetStart(exercise)) {
    const firstSet = exercise.sets[0] || {};
    const targetReps = isUnsetRepValue(firstSet.targetReps)
      ? firstSet.reps ?? 0
      : firstSet.targetReps;

    return buildDropsetSetsFromTargets({
      exercise,
      startWeight: configuredStartWeight,
      targetReps,
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

function getExercises(day, dayIndex, daysPerWeek, plan, currentWeek, totalWeeks, firstWeekExercises) {
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
      const isDeloadWeek = currentWeek === totalWeeks;
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

function getFinalPlan(updatedPlan, daysPerWeek, plan, totalWeeks) {
  return updatedPlan.map((day, dayIndex) => {
    const currentWeek = Math.floor(dayIndex / daysPerWeek) + 1;
    const firstWeekExercises = plan[dayIndex % daysPerWeek].exercises;
    return {
      ...day,
      exercises: getExercises(day, dayIndex, daysPerWeek, plan, currentWeek, totalWeeks, firstWeekExercises),
    };
  });
}

// Endpoint to fetch the current workout
router.get(
  "/current-workout",
  authenticateToken,
  csrfProtection,
  async (req, res) => {
    try {
      const userID = req.user.id;
      const { result: rows, hadRetry } = await safeQuery`
      SELECT * FROM mesocycles WHERE isCurrent = 1 AND user_id = ${userID}
    `;
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Current workout not found" });
      }
      const row = rows[0];
      let plan;
      try {
        plan = JSON.parse(row.plan);
      } catch (error) {
        return res.status(500).json({ error: "Invalid plan data" });
      }

      const { updatedPlan, firstIncompleteDayIndex } = processPlan(plan);
      const daysPerWeek = row.daysPerWeek;
      const totalWeeks = row.weeks;
      const finalPlan = getFinalPlan(updatedPlan, daysPerWeek, plan, totalWeeks);

      const finalResponse = {
        ...row,
        plan: finalPlan,
        isCurrent: !!row.isCurrent,
        completedDate: row.completedDate
          ? new Date(row.completedDate).toISOString()
          : null,
        totalWeeks: row.weeks,
        daysPerWeek: row.daysPerWeek,
        firstIncompleteDayIndex,
      };

      const responsePayload = hadRetry
        ? buildResponsePayload(hadRetry, { data: finalResponse })
        : finalResponse;

      res.json(responsePayload);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
