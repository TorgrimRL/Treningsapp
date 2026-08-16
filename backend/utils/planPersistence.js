function isValidStoredTimestamp(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value))
  );
}

function getDaySets(day) {
  if (!Array.isArray(day?.exercises)) {
    return [];
  }

  return day.exercises.flatMap((exercise) =>
    Array.isArray(exercise?.sets) ? exercise.sets : []
  );
}

export function hasCompletedWorkoutSet(day) {
  return getDaySets(day).some((set) => set?.completed === true);
}

export function isWorkoutDayComplete(day) {
  if (!Array.isArray(day?.exercises) || day.exercises.length === 0) {
    return false;
  }

  return day.exercises.every(
    (exercise) =>
      Array.isArray(exercise?.sets) &&
      exercise.sets.length > 0 &&
      exercise.sets.every((set) => set?.completed === true)
  );
}

export function stripPersonalRecordData(plan) {
  if (!Array.isArray(plan)) {
    throw new TypeError("Plan must be an array");
  }

  return plan.map((day) => ({
    ...day,
    exercises: Array.isArray(day?.exercises)
      ? day.exercises.map((exercise) => {
          const { personalRecordsByWeight, ...persistedExercise } =
            exercise || {};
          return persistedExercise;
        })
      : day?.exercises,
  }));
}

export function applyWorkoutDayTimestamps(
  incomingPlan,
  existingPlan,
  now = new Date().toISOString()
) {
  const sanitizedPlan = stripPersonalRecordData(incomingPlan);
  const storedPlan = Array.isArray(existingPlan) ? existingPlan : [];

  return sanitizedPlan.map((day, dayIndex) => {
    const storedDay = storedPlan[dayIndex];
    const {
      startedAt: ignoredStartedAt,
      completedAt: ignoredCompletedAt,
      ...persistedDay
    } = day || {};
    const hadCompletedSet = hasCompletedWorkoutSet(storedDay);
    const hasCompletedSet = hasCompletedWorkoutSet(day);
    const wasComplete = isWorkoutDayComplete(storedDay);
    const isComplete = isWorkoutDayComplete(day);
    const storedStartedAt = isValidStoredTimestamp(storedDay?.startedAt)
      ? storedDay.startedAt
      : null;
    const storedCompletedAt = isValidStoredTimestamp(storedDay?.completedAt)
      ? storedDay.completedAt
      : null;

    if (storedStartedAt) {
      persistedDay.startedAt = storedStartedAt;
    } else if (!hadCompletedSet && hasCompletedSet) {
      persistedDay.startedAt = now;
    }

    if (isComplete) {
      if (storedCompletedAt) {
        persistedDay.completedAt = storedCompletedAt;
      } else if (!wasComplete) {
        persistedDay.completedAt = now;
      }
    }

    return persistedDay;
  });
}
