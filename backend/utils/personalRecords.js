function normalizeDisplayName(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

/**
 * Returns the stable key used to compare exercise names across workouts.
 */
export function normalizeExerciseName(value) {
  return normalizeDisplayName(value).toLowerCase();
}

function parseFiniteNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeWeight(value) {
  const parsed = parseFiniteNumber(value);

  if (parsed === null || parsed < 0) {
    return null;
  }

  return Object.is(parsed, -0) ? 0 : parsed;
}

/**
 * Converts numerically equivalent weights to the same map key.
 */
export function getWeightKey(value) {
  const weight = normalizeWeight(value);
  return weight === null ? null : String(weight);
}

function normalizeReps(value) {
  const parsed = parseFiniteNumber(value);
  return parsed !== null && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null;
}

function parsePlan(plan) {
  if (Array.isArray(plan)) {
    return plan;
  }

  if (typeof plan !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(plan);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getWorkoutDate(day) {
  const startedAt = day?.startedAt;

  if (
    typeof startedAt !== "string" ||
    startedAt.trim() === "" ||
    Number.isNaN(Date.parse(startedAt))
  ) {
    return null;
  }

  return startedAt;
}

function getDaysPerWeek(mesocycle) {
  const parsed = parseFiniteNumber(mesocycle.daysPerWeek);
  return parsed !== null && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : 1;
}

function isCurrentMesocycle(mesocycle) {
  return (
    mesocycle.isCurrent === true ||
    mesocycle.isCurrent === 1 ||
    mesocycle.isCurrent === "1"
  );
}

function getNumericId(value) {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function compareIds(left, right) {
  const leftNumeric = getNumericId(left);
  const rightNumeric = getNumericId(right);

  if (leftNumeric !== null && rightNumeric !== null) {
    return leftNumeric - rightNumeric;
  }

  if (
    typeof left === "string" &&
    typeof right === "string" &&
    left !== right
  ) {
    return left < right ? -1 : 1;
  }

  return 0;
}

function compareMesocycles(left, right) {
  if (left.isCurrent !== right.isCurrent) {
    return left.isCurrent ? 1 : -1;
  }

  const idComparison = compareIds(left.mesocycle.id, right.mesocycle.id);
  return idComparison || left.originalIndex - right.originalIndex;
}

function mergeWorkoutQueues(workoutQueues) {
  const nextDayByBlock = workoutQueues.map(() => 0);
  const orderedWorkouts = [];

  while (true) {
    const candidates = workoutQueues
      .map((workouts, blockIndex) => workouts[nextDayByBlock[blockIndex]])
      .filter(Boolean);

    if (candidates.length === 0) {
      return orderedWorkouts;
    }

    const historicalCandidates = candidates.filter(
      (workout) => !workout.isCurrent
    );
    const eligibleCandidates =
      historicalCandidates.length > 0 ? historicalCandidates : candidates;
    const allCandidatesHaveDates = eligibleCandidates.every(
      (workout) => workout.workoutTimestamp !== null
    );
    const nextWorkout = eligibleCandidates.reduce((earliest, workout) => {
      if (!earliest) {
        return workout;
      }

      if (allCandidatesHaveDates) {
        return workout.workoutTimestamp < earliest.workoutTimestamp ||
          (workout.workoutTimestamp === earliest.workoutTimestamp &&
            workout.blockIndex < earliest.blockIndex)
          ? workout
          : earliest;
      }

      return workout.blockIndex < earliest.blockIndex ? workout : earliest;
    }, null);

    orderedWorkouts.push(nextWorkout);
    nextDayByBlock[nextWorkout.blockIndex] += 1;
  }
}

function prepareWorkouts(mesocycles) {
  if (!Array.isArray(mesocycles)) {
    return [];
  }

  const preparedMesocycles = mesocycles
    .map((mesocycle, originalIndex) => {
      if (!mesocycle || typeof mesocycle !== "object") {
        return null;
      }

      const plan = parsePlan(mesocycle.plan);
      if (plan === null) {
        return null;
      }

      return {
        mesocycle,
        originalIndex,
        plan,
        isCurrent: isCurrentMesocycle(mesocycle),
        daysPerWeek: getDaysPerWeek(mesocycle),
      };
    })
    .filter(Boolean)
    .sort(compareMesocycles);

  const workoutQueues = preparedMesocycles.map(
    ({ mesocycle, plan, isCurrent, daysPerWeek }, blockIndex) =>
      plan.map((day, dayIndex) => {
        const workoutDate = getWorkoutDate(day);

        return {
          mesocycle,
          day,
          dayIndex,
          blockIndex,
          isCurrent,
          daysPerWeek,
          workoutDate,
          workoutTimestamp:
            workoutDate === null ? null : Date.parse(workoutDate),
        };
      })
  );

  return mergeWorkoutQueues(workoutQueues);
}

function getWorkoutCandidates(day) {
  if (!day || typeof day !== "object" || !Array.isArray(day.exercises)) {
    return [];
  }

  const candidates = [];

  day.exercises.forEach((exercise, exerciseIndex) => {
    if (!exercise || typeof exercise !== "object") {
      return;
    }

    const exerciseName = normalizeDisplayName(exercise.exercise);
    const exerciseKey = normalizeExerciseName(exercise.exercise);

    if (exerciseKey === "" || !Array.isArray(exercise.sets)) {
      return;
    }

    exercise.sets.forEach((set, setIndex) => {
      if (!set || typeof set !== "object" || set.completed !== true) {
        return;
      }

      const weight = normalizeWeight(set.weight);
      const reps = normalizeReps(set.reps);

      if (weight === null || reps === null) {
        return;
      }

      const weightKey = getWeightKey(weight);
      candidates.push({
        exercise: exerciseName,
        exerciseKey,
        muscleGroup: normalizeDisplayName(exercise.muscleGroup),
        weight,
        weightKey,
        reps,
        exerciseIndex,
        setIndex,
        setPosition: setIndex + 1,
      });
    });
  });

  return candidates;
}

/**
 * Derives compact personal-record milestones from canonical mesocycle plans.
 *
 * The input is never mutated. Invalid plan payloads are ignored so one corrupt
 * historical mesocycle cannot prevent records from being calculated.
 */
export function buildPersonalRecordHistory(mesocycles) {
  const records = new Map();
  const history = [];

  prepareWorkouts(mesocycles).forEach(
    ({ mesocycle, day, dayIndex, workoutDate, daysPerWeek }) => {
      getWorkoutCandidates(day).forEach((candidate) => {
        const recordKey = JSON.stringify([
          candidate.exerciseKey,
          candidate.weightKey,
        ]);
        const previousRecord = records.get(recordKey);

        if (
          previousRecord !== undefined &&
          candidate.reps <= previousRecord
        ) {
          return;
        }

        records.set(recordKey, candidate.reps);
        history.push({
          exercise: candidate.exercise,
          exerciseKey: candidate.exerciseKey,
          weight: candidate.weight,
          weightKey: candidate.weightKey,
          reps: candidate.reps,
          mesocycleId: mesocycle.id,
          mesocycleName: mesocycle.name ?? "",
          week: Math.floor(dayIndex / daysPerWeek) + 1,
          day: (dayIndex % daysPerWeek) + 1,
          dayIndex,
          exerciseIndex: candidate.exerciseIndex,
          exercisePosition: candidate.exerciseIndex + 1,
          setIndex: candidate.setIndex,
          setPosition: candidate.setPosition,
          workoutDate,
        });
      });
    }
  );

  return history;
}


function getMostRecentDate(currentDate, candidateDate) {
  if (candidateDate === null) {
    return currentDate;
  }

  if (currentDate === null) {
    return candidateDate;
  }

  return Date.parse(candidateDate) > Date.parse(currentDate)
    ? candidateDate
    : currentDate;
}

/**
 * Builds the compact payload used by the standalone personal-records page.
 *
 * Exercise summaries are based only on valid, completed sets. Dates always
 * come from a workout's persisted startedAt value; undated legacy workouts do
 * not receive an inferred timestamp.
 */
export function buildPersonalRecordOverview(mesocycles) {
  const summaries = new Map();

  prepareWorkouts(mesocycles).forEach(({ day, workoutDate }) => {
    getWorkoutCandidates(day).forEach((candidate) => {
      const existing = summaries.get(candidate.exerciseKey);
      const summary = existing ?? {
        exercise: candidate.exercise,
        exerciseKey: candidate.exerciseKey,
        muscleGroup: candidate.muscleGroup,
        weightKeys: new Set(),
        milestoneCount: 0,
        lastPersonalRecord: null,
        lastPersonalRecordAt: null,
        lastLoggedAt: null,
      };

      // Keep the most recently encountered canonical display data while not
      // discarding an earlier muscle group when a legacy entry omitted it.
      summary.exercise = candidate.exercise;
      if (candidate.muscleGroup !== "") {
        summary.muscleGroup = candidate.muscleGroup;
      }
      summary.weightKeys.add(candidate.weightKey);
      summary.lastLoggedAt = getMostRecentDate(
        summary.lastLoggedAt,
        workoutDate
      );
      summaries.set(candidate.exerciseKey, summary);
    });
  });

  const personalRecordHistory = buildPersonalRecordHistory(mesocycles);

  personalRecordHistory.forEach((milestone) => {
    const summary = summaries.get(milestone.exerciseKey);

    if (!summary) {
      return;
    }

    summary.milestoneCount += 1;
    summary.lastPersonalRecord = milestone;
    summary.lastPersonalRecordAt = milestone.workoutDate;
  });

  const exercises = [...summaries.values()]
    .map(({ weightKeys, ...summary }) => ({
      ...summary,
      weightCount: weightKeys.size,
    }))
    .sort((left, right) =>
      left.exerciseKey < right.exerciseKey
        ? -1
        : left.exerciseKey > right.exerciseKey
          ? 1
          : 0
    );

  return { personalRecordHistory, exercises };
}
