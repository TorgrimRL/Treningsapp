export default function processPlan(plan) {
  let firstIncompleteDayIndex = -1;

  const updatedPlan = plan.map((day, index) => {
    const isCompleted = day.exercises.every((exercise) => {
      if (!exercise.sets) {
        return false;
      }
      return exercise.sets.every((set) => set.completed);
    });

    if (firstIncompleteDayIndex === -1 && !isCompleted) {
      firstIncompleteDayIndex = index;
    }
    return {
      ...day,
      isCompleted,
    };
  });
  return { updatedPlan, firstIncompleteDayIndex };
}
