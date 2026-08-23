export default function createDeloadWeek(
  firstWeekExercises,
  currentWeeksExercises
) {
  if (!firstWeekExercises || firstWeekExercises.length === 0) {
    return currentWeeksExercises;
  }

  return currentWeeksExercises.map((exercise, exerciseIndex) => {
    const firstWeekExercise = firstWeekExercises[exerciseIndex];
    const currentName = String(exercise?.exercise || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("en");
    const firstWeekName = String(firstWeekExercise?.exercise || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("en");

    if (!firstWeekExercise || !Array.isArray(firstWeekExercise.sets)) {
      return {
        ...exercise,
        sets: [],
      };
    }

    if (!currentName || currentName !== firstWeekName) {
      return {
        ...exercise,
      };
    }
    const updatedSets = firstWeekExercise.sets
      .slice(0, 2)
      .map((baseWeekset, setIndex) => {
        if (!baseWeekset) {
          return null;
        }

        const deloadWeight = parseFloat(baseWeekset.weight);
        const deloadReps = Math.floor(parseInt(baseWeekset.reps, 10) / 2);
        const completedStatus =
          currentWeeksExercises[exerciseIndex]?.sets?.[setIndex]?.completed ??
          false;
        return {
          ...baseWeekset,
          weight: deloadWeight,
          reps: deloadReps,
          targetWeight: deloadWeight,
          targetReps: deloadReps,
          completed: completedStatus,
        };
      })
      .filter(Boolean);

    return {
      ...exercise,
      sets: updatedSets,
    };
  });
}
