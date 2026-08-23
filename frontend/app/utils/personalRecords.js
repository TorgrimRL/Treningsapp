export function normalizeExerciseName(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLowerCase();
}

export const normalizeExerciseKey = normalizeExerciseName;

export function normalizeWeight(value) {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const numericWeight = Number(value);
  if (!Number.isFinite(numericWeight) || numericWeight < 0) {
    return null;
  }

  return Object.is(numericWeight, -0) ? 0 : numericWeight;
}

export function getWeightKey(value) {
  const normalizedWeight = normalizeWeight(value);
  return normalizedWeight === null ? null : String(normalizedWeight);
}

function normalizeReps(value) {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const numericReps = Number(value);
  return Number.isInteger(numericReps) && numericReps > 0
    ? numericReps
    : null;
}

function getExerciseKey(value) {
  return normalizeExerciseName(value?.exerciseKey || value?.exercise);
}

function getMilestoneWeightKey(milestone) {
  return getWeightKey(milestone?.weightKey ?? milestone?.weight);
}

function identifiersMatch(first, second) {
  if (first === undefined || first === null) {
    return second === undefined || second === null;
  }

  if (second === undefined || second === null) {
    return false;
  }

  return String(first) === String(second);
}

function milestoneMatchesCandidate(
  milestone,
  workout,
  dayIndex,
  candidate
) {
  const hasMilestoneSetIndex =
    milestone?.setIndex !== null &&
    milestone?.setIndex !== undefined &&
    Number.isInteger(Number(milestone.setIndex));
  const milestoneSetIndex = hasMilestoneSetIndex
    ? Number(milestone.setIndex)
    : null;

  return (
    identifiersMatch(
      milestone?.mesocycleId,
      workout?.id ?? workout?.mesocycleId
    ) &&
    Number(milestone?.dayIndex) === dayIndex &&
    Number(milestone?.exerciseIndex) === candidate.exerciseIndex &&
    (!hasMilestoneSetIndex || milestoneSetIndex === candidate.setIndex) &&
    getExerciseKey(milestone) === candidate.exerciseKey &&
    getMilestoneWeightKey(milestone) === candidate.weightKey &&
    normalizeReps(milestone?.reps) === candidate.reps
  );
}

function isMatchingRecord(milestone, candidate) {
  return (
    getExerciseKey(milestone) === candidate.exerciseKey &&
    getMilestoneWeightKey(milestone) === candidate.weightKey &&
    normalizeReps(milestone?.reps) !== null
  );
}

function isMilestoneBeforeDay(milestone, workout, dayIndex) {
  const currentMesocycleId = workout?.id ?? workout?.mesocycleId;
  if (!identifiersMatch(milestone?.mesocycleId, currentMesocycleId)) {
    return true;
  }

  return Number(milestone?.dayIndex) < dayIndex;
}

function getRecordState(history, workout, dayIndex, candidate) {
  const exactMilestoneIndex = history.findIndex((milestone) =>
    milestoneMatchesCandidate(
      milestone,
      workout,
      dayIndex,
      candidate
    )
  );
  const earlierHistory =
    exactMilestoneIndex >= 0
      ? history.slice(0, exactMilestoneIndex)
      : history.filter((milestone) =>
          isMilestoneBeforeDay(milestone, workout, dayIndex)
        );
  const previousRecord = earlierHistory.reduce((highestReps, milestone) => {
    if (!isMatchingRecord(milestone, candidate)) {
      return highestReps;
    }

    const reps = normalizeReps(milestone.reps);
    return highestReps === null || reps > highestReps
      ? reps
      : highestReps;
  }, null);

  return {
    isNewRecord: exactMilestoneIndex >= 0,
    previousRecord,
  };
}

function collectDayCandidates(day) {
  const candidates = [];

  day?.exercises?.forEach((exercise, exerciseIndex) => {
    const exerciseKey = normalizeExerciseName(exercise?.exercise);
    if (!exerciseKey || !Array.isArray(exercise?.sets)) {
      return;
    }

    exercise.sets.forEach((set, setIndex) => {
      if (set?.completed !== true) {
        return;
      }

      const weight = normalizeWeight(set.weight);
      const reps = normalizeReps(set.reps);
      if (weight === null || reps === null) {
        return;
      }

      const weightKey = String(weight);
      candidates.push({
        exerciseIndex,
        exerciseKey,
        setIndex,
        reps,
        weight,
        weightKey,
      });
    });
  });

  return candidates;
}

function isMilestoneFromWorkout(milestone, workout) {
  return identifiersMatch(
    milestone?.mesocycleId,
    workout?.id ?? workout?.mesocycleId
  );
}

function getRecordKey(value) {
  const exerciseKey = getExerciseKey(value);
  const weightKey = getMilestoneWeightKey(value);

  return exerciseKey && weightKey !== null
    ? JSON.stringify([exerciseKey, weightKey])
    : null;
}

function getWorkoutDate(day) {
  const startedAt = day?.startedAt;

  return typeof startedAt === "string" && !Number.isNaN(Date.parse(startedAt))
    ? startedAt
    : null;
}

export function projectCurrentWorkoutPersonalRecords(workout) {
  if (!workout || typeof workout !== "object") {
    return workout;
  }

  const confirmedHistory = Array.isArray(workout.personalRecordHistory)
    ? workout.personalRecordHistory
    : [];
  const historicalMilestones = confirmedHistory.filter(
    (milestone) => !isMilestoneFromWorkout(milestone, workout)
  );
  const recordBests = new Map();

  historicalMilestones.forEach((milestone) => {
    const recordKey = getRecordKey(milestone);
    const reps = normalizeReps(milestone?.reps);
    if (recordKey === null || reps === null) {
      return;
    }

    const previousBest = recordBests.get(recordKey);
    if (previousBest === undefined || reps > previousBest) {
      recordBests.set(recordKey, reps);
    }
  });

  const projectedMilestones = [];
  const daysPerWeek = Number.isInteger(Number(workout.daysPerWeek)) &&
    Number(workout.daysPerWeek) > 0
    ? Number(workout.daysPerWeek)
    : 1;

  workout.plan?.forEach((day, dayIndex) => {
    collectDayCandidates(day).forEach((candidate) => {
      const recordKey = getRecordKey(candidate);
      const previousRecord = recordBests.get(recordKey);
      if (previousRecord !== undefined && candidate.reps <= previousRecord) {
        return;
      }

      const exercise = day.exercises?.[candidate.exerciseIndex] || {};
      recordBests.set(recordKey, candidate.reps);
      projectedMilestones.push({
        exercise: exercise.exercise || "",
        exerciseKey: candidate.exerciseKey,
        muscleGroup: exercise.muscleGroup || "",
        weight: candidate.weight,
        weightKey: candidate.weightKey,
        reps: candidate.reps,
        mesocycleId: workout.id ?? workout.mesocycleId,
        mesocycleName: workout.name || "",
        week: Math.floor(dayIndex / daysPerWeek) + 1,
        day: (dayIndex % daysPerWeek) + 1,
        dayIndex,
        exerciseIndex: candidate.exerciseIndex,
        exercisePosition: candidate.exerciseIndex + 1,
        setIndex: candidate.setIndex,
        setPosition: candidate.setIndex + 1,
        workoutDate: getWorkoutDate(day),
        optimistic: true,
      });
    });
  });

  return enrichWorkoutWithPersonalRecords({
    ...workout,
    personalRecordHistory: [
      ...historicalMilestones,
      ...projectedMilestones,
    ],
  });
}

function cloneExercise(exercise) {
  return {
    ...exercise,
    sets: Array.isArray(exercise?.sets)
      ? exercise.sets.map((set) => ({ ...set }))
      : exercise?.sets,
    personalRecordsByWeight: {},
  };
}

export function enrichWorkoutWithPersonalRecords(workout) {
  if (!workout || typeof workout !== "object") {
    return workout;
  }

  const history = Array.isArray(workout.personalRecordHistory)
    ? workout.personalRecordHistory
    : [];
  const plan = Array.isArray(workout.plan)
    ? workout.plan.map((day, dayIndex) => {
        const exercises = Array.isArray(day?.exercises)
          ? day.exercises.map(cloneExercise)
          : day?.exercises;
        const clonedDay = {
          ...day,
          exercises,
        };

        if (!Array.isArray(exercises)) {
          return clonedDay;
        }

        const candidates = collectDayCandidates(day);
        const recordsByExerciseAndWeight = new Map();

        candidates.forEach((candidate) => {
          const exercise = exercises[candidate.exerciseIndex];
          if (!exercise) {
            return;
          }

          const { isNewRecord, previousRecord } = getRecordState(
            history,
            workout,
            dayIndex,
            candidate
          );

          const recordKey = JSON.stringify([
            candidate.exerciseIndex,
            candidate.weightKey,
          ]);
          const existingRecord = recordsByExerciseAndWeight.get(recordKey);
          const recordForSet = {
            previousRecord,
            workoutBestReps: candidate.reps,
            isNewRecord,
            recordSetIndex: candidate.setIndex,
            setIndex: candidate.setIndex,
            setPosition: candidate.setIndex + 1,
            weight: candidate.weight,
            weightKey: candidate.weightKey,
            exerciseKey: candidate.exerciseKey,
          };

          if (!existingRecord) {
            recordsByExerciseAndWeight.set(recordKey, {
              previousRecord,
              workoutBestReps: candidate.reps,
              isNewRecord,
              recordSetIndex: isNewRecord ? candidate.setIndex : null,
              recordSetIndices: isNewRecord ? [candidate.setIndex] : [],
              recordsBySetIndex: isNewRecord
                ? { [candidate.setIndex]: recordForSet }
                : {},
              weight: candidate.weight,
              weightKey: candidate.weightKey,
              exerciseKey: candidate.exerciseKey,
            });
            return;
          }

          if (candidate.reps > existingRecord.workoutBestReps) {
            existingRecord.workoutBestReps = candidate.reps;
          }

          if (isNewRecord) {
            existingRecord.isNewRecord = true;
            existingRecord.recordSetIndex = candidate.setIndex;
            existingRecord.recordSetIndices.push(candidate.setIndex);
            existingRecord.recordsBySetIndex[candidate.setIndex] = recordForSet;
          }
        });

        recordsByExerciseAndWeight.forEach((record, recordKey) => {
          const [exerciseIndex] = JSON.parse(recordKey);
          const exercise = exercises[exerciseIndex];

          if (exercise) {
            exercise.personalRecordsByWeight[record.weightKey] = record;
          }
        });

        return clonedDay;
      })
    : workout.plan;

  return {
    ...workout,
    plan,
  };
}
