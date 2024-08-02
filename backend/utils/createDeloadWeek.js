export default function createDeloadWeek(
  firstWeekExercises,
  currentWeeksExercises
) {
  if (!firstWeekExercises || firstWeekExercises.length === 0) {
    console.error("No valid exercises found for the first week.");
    return currentWeeksExercises;
  }

  return currentWeeksExercises.map((exercise, exerciseIndex) => {
    const firstWeekExercise = firstWeekExercises[exerciseIndex];

    if (!firstWeekExercise || !Array.isArray(firstWeekExercise.sets)) {
      console.error(
        `No valid firstWeekExercise found for exerciseIndex: ${exerciseIndex}`
      );
      return {
        ...exercise,
        sets: [],
      };
    }

    const updatedSets = firstWeekExercise.sets
      .slice(0, 2)
      .map((baseWeekset, setIndex) => {
        if (!baseWeekset) {
          console.error(
            `No corresponding set found for setIndex: ${setIndex} in first week exercise`
          );
          return null;
        }

        const deloadWeight = parseFloat(baseWeekset.weight);
        const deloadReps = Math.floor(parseInt(baseWeekset.reps, 10) / 2);
        return {
          ...baseWeekset,
          weight: deloadWeight,
          reps: deloadReps,
          targetWeight: deloadWeight,
          targetReps: deloadReps,
          completed: false,
        };
      })
      .filter(Boolean);

    return {
      ...exercise,
      sets: updatedSets,
    };
  });
}
