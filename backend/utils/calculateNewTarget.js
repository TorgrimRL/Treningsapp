export const progressionModes = ["percent", "reps", "weight"];
export const weightIncrements = [1, 2, 2.5, 5, 10];

export function getDefaultWeightIncrement(type) {
  return type === "dumbbell" ? 2 : 2.5;
}

export function normalizeProgressionSettings(exercise = {}) {
  const progressionMode = progressionModes.includes(exercise.progressionMode)
    ? exercise.progressionMode
    : "percent";
  const parsedIncrement = Number(exercise.weightIncrement);
  const weightIncrement = weightIncrements.includes(parsedIncrement)
    ? parsedIncrement
    : getDefaultWeightIncrement(exercise.type);

  return {
    progressionMode,
    weightIncrement,
  };
}

function roundToIncrement(value, increment) {
  return Number((Math.round(value / increment) * increment).toFixed(2));
}

export default function calculateNewTarget(
  weight,
  reps,
  type,
  previousFactor,
  currentFactor,
  progressionSettings = {}
) {
  const baseWeightInput = parseFloat(weight);
  const baseRepsInput = parseInt(reps, 10);
  const { progressionMode, weightIncrement } = normalizeProgressionSettings({
    ...progressionSettings,
    type,
  });

  if (progressionMode === "reps") {
    return {
      weight: baseWeightInput,
      reps: baseRepsInput + 1,
    };
  }

  if (progressionMode === "weight") {
    return {
      weight: roundToIncrement(baseWeightInput + weightIncrement, weightIncrement),
      reps: baseRepsInput,
    };
  }

  const baseWeight = baseWeightInput / previousFactor;
  const roundedWeight = roundToIncrement(baseWeight * currentFactor, weightIncrement);
  const tolerance = 0.001;
  const incrementedReps = baseRepsInput + 1;

  if (Math.abs(roundedWeight - baseWeightInput) > tolerance) {
    return { weight: roundedWeight, reps };
  }

  return { weight: baseWeightInput, reps: incrementedReps };
}
