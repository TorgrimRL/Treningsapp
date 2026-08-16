export const DROPSET_DROP_PERCENT = 20;
export const DEFAULT_DROPSET_SET_COUNT = 5;
export const MIN_DROPSET_SET_COUNT = 1;
export const MAX_DROPSET_SET_COUNT = 8;

const isBlankValue = (value) =>
  value === undefined || value === null || value === "";

const isUnsetRepValue = (value) =>
  isBlankValue(value) || Number(value) === 0;

const roundToWeightGrid = (value, increment, minimumWeight) => {
  const valueCenti = Math.round(value * 100);
  const incrementCenti = Math.round(increment * 100);
  const minimumCenti = Math.round(minimumWeight * 100);

  return Number(
    ((minimumCenti + Math.round((valueCenti - minimumCenti) / incrementCenti) * incrementCenti) / 100).toFixed(2)
  );
};

const ceilToWeightGrid = (value, increment, minimumWeight) => {
  const valueCenti = Math.round(value * 100);
  const incrementCenti = Math.round(increment * 100);
  const minimumCenti = Math.round(minimumWeight * 100);

  return Number(
    ((minimumCenti + Math.ceil((valueCenti - minimumCenti) / incrementCenti) * incrementCenti) / 100).toFixed(2)
  );
};

export function generateDropsetWeights({
  startWeight,
  setCount,
  increment,
  minimumWeight = 0,
  dropPercent = DROPSET_DROP_PERCENT,
}) {
  const parsedStartWeight = Number(startWeight);
  const parsedSetCount = Number(setCount);
  const parsedIncrement = Number(increment);
  const parsedMinimumWeight = Number(minimumWeight);

  if (
    !Number.isFinite(parsedStartWeight) ||
    parsedStartWeight <= 0 ||
    !Number.isFinite(parsedMinimumWeight) ||
    parsedMinimumWeight < 0 ||
    parsedStartWeight < parsedMinimumWeight
  ) {
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

  const roundedStartWeight = roundToWeightGrid(
    parsedStartWeight,
    parsedIncrement,
    parsedMinimumWeight
  );
  const weights = [];
  const dropMultiplier = 1 - dropPercent / 100;
  const minimumFinalWeight = Math.max(
    ceilToWeightGrid(
      roundedStartWeight * 0.5,
      parsedIncrement,
      parsedMinimumWeight
    ),
    parsedMinimumWeight
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
    let nextWeight = roundToWeightGrid(
      rawWeight,
      parsedIncrement,
      parsedMinimumWeight
    );
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
  minimumWeight = 0,
  dropPercent = DROPSET_DROP_PERCENT,
  targetRepsBySet = [],
}) {
  const { weights, error } = generateDropsetWeights({
    startWeight,
    setCount,
    increment,
    minimumWeight,
    dropPercent,
  });

  if (error) {
    return { sets: [], weights: [], error };
  }

  const firstSet = existingSets[0] || {};
  const fallbackTargetReps = isUnsetRepValue(firstSet.targetReps)
    ? firstSet.reps ?? 0
    : firstSet.targetReps;

  const sets = weights.map((weight, index) => {
    const existingSet = existingSets[index] || {};
    const targetRepsOverride = targetRepsBySet[index];
    const hasTargetRepsOverride = !isUnsetRepValue(targetRepsOverride);
    const targetReps = hasTargetRepsOverride
      ? targetRepsOverride
      : isUnsetRepValue(existingSet.targetReps)
        ? fallbackTargetReps
        : existingSet.targetReps;
    const reps = hasTargetRepsOverride
      ? targetReps
      : isUnsetRepValue(existingSet.reps)
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
