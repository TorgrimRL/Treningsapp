export const progressionModes = ["percent", "reps", "weight"];
export const weightIncrements = Array.from({ length: 37 }, (_, index) => Number((1 + index * 0.25).toFixed(2)));

export function getDefaultWeightIncrement(type) {
  return type === "dumbbell" ? 2 : 2.5;
}

export function getDefaultMinimumWeight(type, weightIncrement) {
  return type === "bodyweight" ? 0 : weightIncrement;
}

function isQuarterKilogram(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && Math.round(parsedValue * 100) % 25 === 0;
}

export function normalizeProgressionSettings(exercise = {}) {
  const progressionMode = progressionModes.includes(exercise.progressionMode)
    ? exercise.progressionMode
    : "percent";
  const parsedIncrement = Number(exercise.weightIncrement);
  const weightIncrement = weightIncrements.includes(parsedIncrement)
    ? parsedIncrement
    : getDefaultWeightIncrement(exercise.type);

  const parsedMinimumWeight = Number(exercise.minimumWeight);
  const defaultMinimumWeight = getDefaultMinimumWeight(exercise.type, weightIncrement);
  const minimumWeight =
    Number.isFinite(parsedMinimumWeight) &&
    parsedMinimumWeight >= 0 &&
    parsedMinimumWeight <= 400 &&
    isQuarterKilogram(parsedMinimumWeight)
      ? Number(parsedMinimumWeight.toFixed(2))
      : defaultMinimumWeight;

  return {
    progressionMode,
    weightIncrement,
    minimumWeight,
  };
}

export function roundToWeightGrid(value, minimumWeight, increment) {
  const valueCenti = Math.round(Number(value) * 100);
  const minimumCenti = Math.round(Number(minimumWeight) * 100);
  const incrementCenti = Math.round(Number(increment) * 100);
  return Number(((minimumCenti + Math.round((valueCenti - minimumCenti) / incrementCenti) * incrementCenti) / 100).toFixed(2));
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
  const { progressionMode, weightIncrement, minimumWeight } = normalizeProgressionSettings({
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
      weight: roundToWeightGrid(baseWeightInput + weightIncrement, minimumWeight, weightIncrement),
      reps: baseRepsInput,
    };
  }

  const baseWeight = baseWeightInput / previousFactor;
  const roundedWeight = roundToWeightGrid(baseWeight * currentFactor, minimumWeight, weightIncrement);
  const tolerance = 0.001;
  const incrementedReps = baseRepsInput + 1;

  if (Math.abs(roundedWeight - baseWeightInput) > tolerance) {
    return { weight: roundedWeight, reps };
  }

  return { weight: baseWeightInput, reps: incrementedReps };
}
