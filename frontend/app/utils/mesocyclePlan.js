import { normalizeProgressionSettings } from "../constants/constants";

export const emptySet = (overrides = {}) => ({
  completed: false,
  targetWeight: 0,
  targetReps: 0,
  ...overrides,
});

export const createEmptyExercise = (overrides = {}) => {
  const exercise = {
    muscleGroup: "",
    exercise: "",
    type: "",
    videoLink: "",
    sets: [emptySet(), emptySet()],
    ...overrides,
  };
  return { ...exercise, ...normalizeProgressionSettings(exercise) };
};

export function buildMesocyclePayload({ name, weeks, includeDeload, plan }) {
  const weekCount = Number(weeks);
  const firstWeekPlan = plan.map((day) => ({
    ...day,
    exercises: day.exercises.map((exercise) => ({
      ...exercise,
      ...normalizeProgressionSettings(exercise),
    })),
  }));
  const filledPlan = Array.from({ length: weekCount }, () =>
    firstWeekPlan.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
      })),
    }))
  ).flat();

  return {
    name: name.trim(),
    weeks: weekCount,
    daysPerWeek: firstWeekPlan.length,
    plan: filledPlan,
    completedDate: null,
    isCurrent: true,
    includeDeload: Boolean(includeDeload),
  };
}
