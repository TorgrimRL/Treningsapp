import { normalizeProgressionSettings } from "../../../constants/constants";
import {
  DROPSET_DROP_PERCENT,
  generateDropsetWeights,
} from "../../../utils/dropsets";

export const REP_RANGE = Array.from({ length: 30 }, (_, index) => index + 1);

const PROGRESSION_FACTORS = [1.0, 1.05, 1.075, 1.1, 1.125];
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const isBlankValue = (value) =>
  value === undefined || value === null || value === "";

export const isUnsetRepValue = (value) =>
  isBlankValue(value) || Number(value) === 0;

export const getSetLogWeight = (set) =>
  isBlankValue(set.weight) ? set.targetWeight ?? "" : set.weight;

export const getSetLogReps = (set) =>
  isUnsetRepValue(set.reps) ? set.targetReps ?? "" : set.reps;

export const getSetRepsSelectValue = (set) => {
  if (!isUnsetRepValue(set.reps)) {
    return set.reps;
  }

  return isUnsetRepValue(set.targetReps) ? "" : set.targetReps;
};

export const getProgressionKey = (dayIndex, exerciseIndex) =>
  dayIndex + "-" + exerciseIndex;

export const getCurrentExerciseAtSlot = (mesocycle, dayIndex, exerciseIndex) =>
  mesocycle?.plan?.[dayIndex]?.exercises?.[exerciseIndex] || null;

export const getWeekAndDay = (index, daysOfWeek) => {
  const safeDaysOfWeek = daysOfWeek || 1;
  const week = Math.floor(index / safeDaysOfWeek) + 1;
  const day = (index % safeDaysOfWeek) + 1;

  return { week, day };
};

export const getDayLabel = (day) =>
  DAYS_OF_WEEK.includes(day?.label) ? day.label : "";

export const buildWorkoutState = (workout) => {
  const notes = {};
  const sets = {};

  workout?.plan?.forEach((day, dayIndex) => {
    sets[dayIndex] = {};
    notes[dayIndex] = {};

    day.exercises.forEach((exercise, exerciseIndex) => {
      sets[dayIndex][exerciseIndex] = Array.isArray(exercise.sets)
        ? exercise.sets
        : [];
      notes[dayIndex][exerciseIndex] = exercise.note || "";
    });
  });

  return { notes, sets };
};

export const calculateWorkoutProgress = ({ currentMesocycle, currentDayIndex }) => {
  const exercises = currentMesocycle?.plan?.[currentDayIndex]?.exercises || [];
  let totalSets = 0;
  let completeSets = 0;

  exercises.forEach((exercise) => {
    (exercise.sets || []).forEach((set) => {
      totalSets += 1;
      if (set.completed) {
        completeSets += 1;
      }
    });
  });

  return totalSets === 0 ? 0 : (completeSets / totalSets) * 100;
};

export const buildMesocycleWithSets = (currentMesocycle, updatedSets) => ({
  ...currentMesocycle,
  plan: currentMesocycle.plan.map((day, dayIndex) => ({
    ...day,
    exercises: day.exercises.map((exercise, exerciseIndex) => ({
      ...exercise,
      sets: updatedSets[dayIndex]?.[exerciseIndex] || exercise.sets,
    })),
  })),
});

export const getPositiveNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

export const getDropsetStartWeight = (exerciseSets = [], fallbackStartWeight) => {
  const firstSet = exerciseSets[0] || {};

  return (
    getPositiveNumber(firstSet.targetWeight) ??
    getPositiveNumber(firstSet.weight) ??
    fallbackStartWeight
  );
};

export const roundToIncrement = (value, increment) =>
  Number((Math.round(value / increment) * increment).toFixed(2));

export const getSetProgressionReps = (set = {}) => {
  const reps = isUnsetRepValue(set.reps) ? set.targetReps : set.reps;
  const parsedReps = Number(reps);

  return Number.isFinite(parsedReps) ? parsedReps : 0;
};

export const calculateProgressedTarget = ({
  weight,
  reps,
  exercise,
  currentWeek,
}) => {
  const progressionSettings = normalizeProgressionSettings(exercise);

  if (progressionSettings.progressionMode === "reps") {
    return { weight, reps: reps + 1 };
  }

  if (progressionSettings.progressionMode === "weight") {
    return {
      weight: roundToIncrement(
        weight + progressionSettings.weightIncrement,
        progressionSettings.weightIncrement
      ),
      reps,
    };
  }

  const previousFactor = PROGRESSION_FACTORS[currentWeek - 2] || 1.0;
  const currentFactor = PROGRESSION_FACTORS[currentWeek - 1];
  const baseWeight = weight / previousFactor;
  const roundedWeight = roundToIncrement(
    baseWeight * currentFactor,
    progressionSettings.weightIncrement
  );

  if (Math.abs(roundedWeight - weight) > 0.001) {
    return { weight: roundedWeight, reps };
  }

  return { weight, reps: reps + 1 };
};

export const updateDropsetSetsFromStartWeight = ({
  exerciseSets,
  exercise,
  startWeight,
}) => {
  const setCount = exerciseSets.length || exercise.dropset?.setCount || 1;
  const increment = normalizeProgressionSettings(exercise).weightIncrement;
  const { weights, error } = generateDropsetWeights({
    startWeight,
    setCount,
    increment,
    dropPercent: exercise.dropset?.dropPercent ?? DROPSET_DROP_PERCENT,
  });

  if (error) {
    return { sets: exerciseSets, error };
  }

  return {
    sets: exerciseSets.map((set, index) => {
      if (index > 0 && set.completed) {
        return set;
      }

      return {
        ...set,
        completed: false,
        weight: weights[index],
        targetWeight: weights[index],
      };
    }),
    error: null,
  };
};

export const getWeightOptions = (exercise, selectedWeight) => {
  const increment = normalizeProgressionSettings(exercise).weightIncrement;
  const maxWeight = exercise.type === "dumbbell" ? 100 : 400;
  const weights = [];

  for (let weight = increment; weight <= maxWeight; weight += increment) {
    weights.push(Number(weight.toFixed(2)));
  }

  if (isBlankValue(selectedWeight)) {
    return weights;
  }

  const parsedSelectedWeight = Number(selectedWeight);
  if (Number.isFinite(parsedSelectedWeight) && parsedSelectedWeight >= 0) {
    const snappedSelectedWeight =
      parsedSelectedWeight === 0
        ? 0
        : Number(
            (Math.ceil(parsedSelectedWeight / increment) * increment).toFixed(2)
          );

    if (!weights.includes(snappedSelectedWeight)) {
      weights.push(snappedSelectedWeight);
      weights.sort((a, b) => a - b);
    }
  }

  return weights;
};

export const getPerformanceStatus = (set, exercise, weekIndex) => {
  if (weekIndex === 1) {
    if (isUnsetRepValue(set.targetReps) || isBlankValue(set.targetWeight)) {
      return "noIndicator";
    }

    if (isUnsetRepValue(set.reps) && Number(set.weight) === 0) {
      return "noIndicator";
    }
  }

  if (isUnsetRepValue(set.reps)) {
    return "noIndicator";
  }

  const incrementSize = normalizeProgressionSettings(exercise).weightIncrement;
  const targetWeight = parseFloat(set.targetWeight);
  const targetReps = parseInt(set.targetReps, 10);
  const currentWeight = parseFloat(set.weight);

  if (["3 RIR", "2 RIR", "0/1 RIR"].includes(set.reps)) {
    return "noIndicator";
  }

  const currentReps = parseInt(set.reps, 10);

  if (
    !Number.isFinite(targetWeight) ||
    !Number.isFinite(targetReps) ||
    !Number.isFinite(currentWeight) ||
    !Number.isFinite(currentReps)
  ) {
    return "noIndicator";
  }

  const weightDifference = currentWeight - targetWeight;
  const maxIncrementDeviation = 3 * incrementSize;
  const incrementDifference = weightDifference / incrementSize;
  const adjustedReps = targetReps - incrementDifference * 2;
  const roundedAdjustedReps = Math.round(adjustedReps);
  const isWeightInRange = Math.abs(weightDifference) <= maxIncrementDeviation;

  if (isWeightInRange && currentReps === roundedAdjustedReps) {
    return "target";
  }

  if (isWeightInRange && currentReps > roundedAdjustedReps) {
    return "above";
  }

  if (!isWeightInRange || currentReps < roundedAdjustedReps) {
    return "below";
  }

  return "offTarget";
};
