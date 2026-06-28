export const DROPSET_DROP_PERCENT = 20;
export const DEFAULT_DROPSET_SET_COUNT = 5;
export const MIN_DROPSET_SET_COUNT = 1;
export const MAX_DROPSET_SET_COUNT = 8;

const isBlankValue = (value) =>
  value === undefined || value === null || value === "";

const isUnsetRepValue = (value) =>
  isBlankValue(value) || Number(value) === 0;

const roundToIncrement = (value, increment) =>
  Number((Math.round(value / increment) * increment).toFixed(2));

const ceilToIncrement = (value, increment) =>
  Number((Math.ceil(value / increment) * increment).toFixed(2));

export function generateDropsetWeights({
  startWeight,
  setCount,
  increment,
  dropPercent = DROPSET_DROP_PERCENT,
}) {
  const parsedStartWeight = Number(startWeight);
  const parsedSetCount = Number(setCount);
  const parsedIncrement = Number(increment);

  if (!Number.isFinite(parsedStartWeight) || parsedStartWeight <= 0) {
    return { weights: [], error: "Choose a start weight above 0." };
  }

  if (
    !Number.isInteger(parsedSetCount) ||
    parsedSetCount < MIN_DROPSET_SET_COUNT ||
    parsedSetCount > MAX_DROPSET_SET_COUNT
  ) {
    return {
      weights: [],
      error: `Choose between ${MIN_DROPSET_SET_COUNT} and ${MAX_DROPSET_SET_COUNT} sets.`,
    };
  }

  if (!Number.isFinite(parsedIncrement) || parsedIncrement <= 0) {
    return { weights: [], error: "Choose a valid weight increment." };
  }

  const roundedStartWeight = roundToIncrement(
    parsedStartWeight,
    parsedIncrement
  );
  const weights = [];
  const dropMultiplier = 1 - dropPercent / 100;
  const minimumFinalWeight = ceilToIncrement(
    roundedStartWeight * 0.5,
    parsedIncrement
  );
  const minimumStartWeight = Number(
    (minimumFinalWeight + (parsedSetCount - 1) * parsedIncrement).toFixed(2)
  );

  if (roundedStartWeight < minimumStartWeight) {
    return {
      weights: [],
      error:
        "Start weight is too low for that many real drops with this increment.",
    };
  }

  for (let index = 0; index < parsedSetCount; index += 1) {
    const rawWeight =
      index === 0 ? roundedStartWeight : weights[index - 1] * dropMultiplier;
    let nextWeight = roundToIncrement(rawWeight, parsedIncrement);
    const remainingDrops = parsedSetCount - index - 1;
    const minimumWeightForRealDrops = Number(
      (minimumFinalWeight + remainingDrops * parsedIncrement).toFixed(2)
    );

    nextWeight = Math.max(nextWeight, minimumWeightForRealDrops);

    if (index > 0 && nextWeight >= weights[index - 1]) {
      return {
        weights: [],
        error:
          "Start weight is too low for that many real drops with this increment.",
      };
    }

    if (nextWeight <= 0 || nextWeight < minimumFinalWeight) {
      return {
        weights: [],
        error:
          "Start weight is too low for that many drops without going below 50%.",
      };
    }

    weights.push(nextWeight);
  }

  return { weights, error: null };
}

export function buildDropsetSets({
  existingSets = [],
  startWeight,
  setCount,
  increment,
  dropPercent = DROPSET_DROP_PERCENT,
  targetReps: targetRepsOverride,
}) {
  const { weights, error } = generateDropsetWeights({
    startWeight,
    setCount,
    increment,
    dropPercent,
  });

  if (error) {
    return { sets: [], weights: [], error };
  }

  const firstSet = existingSets[0] || {};
  const fallbackTargetReps = isUnsetRepValue(targetRepsOverride)
    ? isUnsetRepValue(firstSet.targetReps)
      ? firstSet.reps ?? 0
      : firstSet.targetReps
    : targetRepsOverride;

  const sets = weights.map((weight, index) => {
    const existingSet = existingSets[index] || {};
    const targetReps = isUnsetRepValue(targetRepsOverride)
      ? isUnsetRepValue(existingSet.targetReps)
        ? fallbackTargetReps
        : existingSet.targetReps
      : targetRepsOverride;
    const reps = isUnsetRepValue(existingSet.reps)
      ? targetReps
      : existingSet.reps;

    return {
      ...existingSet,
      completed: false,
      weight,
      reps,
      targetWeight: weight,
      targetReps,
    };
  });

  return { sets, weights, error: null };
}
