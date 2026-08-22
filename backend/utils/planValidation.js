export const MAX_DROPSET_SET_COUNT = 8;
export const MAX_PLAN_BYTES = 100 * 1024;
export const MAX_PLAN_DAYS = 728;
export const MAX_EXERCISES_PER_DAY = 50;
export const MAX_SETS_PER_EXERCISE = 20;
export const MAX_MESOCYCLE_WEEKS = 52;
export const MAX_DAYS_PER_WEEK = 14;

export class PlanValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "PlanValidationError";
  }
}

function fail(message) {
  throw new PlanValidationError(message);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parsePositiveInteger(value, maximum, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    fail(`${fieldName} must be an integer between 1 and ${maximum}`);
  }

  return parsed;
}

export function getPlanByteLength(plan) {
  let serialized;
  try {
    serialized = typeof plan === "string" ? plan : JSON.stringify(plan);
  } catch {
    fail("Plan must be JSON serializable");
  }

  if (typeof serialized !== "string") {
    fail("Plan must be JSON serializable");
  }

  return Buffer.byteLength(serialized, "utf8");
}

export function validatePlan(plan) {
  if (!Array.isArray(plan)) {
    fail("Plan must be an array");
  }

  if (getPlanByteLength(plan) > MAX_PLAN_BYTES) {
    fail(`Plan must not exceed ${MAX_PLAN_BYTES} bytes`);
  }

  if (plan.length > MAX_PLAN_DAYS) {
    fail(`Plan must not contain more than ${MAX_PLAN_DAYS} days`);
  }

  plan.forEach((day, dayIndex) => {
    if (!isRecord(day) || !Array.isArray(day.exercises)) {
      fail(`Plan day ${dayIndex + 1} must contain an exercises array`);
    }

    if (day.exercises.length > MAX_EXERCISES_PER_DAY) {
      fail(
        `Plan day ${dayIndex + 1} must not contain more than ${MAX_EXERCISES_PER_DAY} exercises`
      );
    }

    day.exercises.forEach((exercise, exerciseIndex) => {
      if (!isRecord(exercise) || !Array.isArray(exercise.sets)) {
        fail(
          `Exercise ${exerciseIndex + 1} on day ${dayIndex + 1} must contain a sets array`
        );
      }

      if (exercise.sets.length > MAX_SETS_PER_EXERCISE) {
        fail(
          `Exercise ${exerciseIndex + 1} on day ${dayIndex + 1} must not contain more than ${MAX_SETS_PER_EXERCISE} sets`
        );
      }

      exercise.sets.forEach((set, setIndex) => {
        if (!isRecord(set)) {
          fail(
            `Set ${setIndex + 1} for exercise ${exerciseIndex + 1} on day ${dayIndex + 1} must be an object`
          );
        }
      });

      if (exercise.dropset !== undefined) {
        if (!isRecord(exercise.dropset)) {
          fail("Dropset settings must be an object");
        }

        if (exercise.dropset.setCount !== undefined) {
          parsePositiveInteger(
            exercise.dropset.setCount,
            MAX_DROPSET_SET_COUNT,
            "Dropset setCount"
          );
        }
      }
    });
  });

  return plan;
}

export function parseAndValidatePlan(plan) {
  if (typeof plan === "string") {
    if (getPlanByteLength(plan) > MAX_PLAN_BYTES) {
      fail(`Plan must not exceed ${MAX_PLAN_BYTES} bytes`);
    }

    try {
      return validatePlan(JSON.parse(plan));
    } catch (error) {
      if (error instanceof PlanValidationError) {
        throw error;
      }
      fail("Plan must contain valid JSON");
    }
  }

  return validatePlan(plan);
}

export function validateMesocycleInput({ weeks, daysPerWeek, plan }) {
  parsePositiveInteger(weeks, MAX_MESOCYCLE_WEEKS, "weeks");
  parsePositiveInteger(daysPerWeek, MAX_DAYS_PER_WEEK, "daysPerWeek");
  return validatePlan(plan);
}
