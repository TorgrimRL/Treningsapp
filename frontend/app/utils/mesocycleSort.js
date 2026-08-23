function timestamp(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getLastCompletedWorkoutTime(mesocycle) {
  const dayTimes = Array.isArray(mesocycle?.plan)
    ? mesocycle.plan.map((day) => day?.completedAt)
    : [];
  const loggedTime = Math.max(0, ...dayTimes.map(timestamp));
  return loggedTime || timestamp(mesocycle?.completedDate);
}

export function sortMesocyclesByActivity(plans = []) {
  const byLatestActivity = (first, second) =>
    getLastCompletedWorkoutTime(second) - getLastCompletedWorkoutTime(first) ||
    Number(second.id) - Number(first.id);
  const current = plans.filter((plan) => plan.isCurrent).sort(byLatestActivity);
  const pending = plans
    .filter((plan) => !plan.isCurrent && plan.completedDate === null)
    .sort(byLatestActivity);
  const completed = plans
    .filter((plan) => plan.completedDate !== null)
    .sort(byLatestActivity);
  return [...current, ...pending, ...completed];
}
