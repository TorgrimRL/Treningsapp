import { describe, expect, it } from "vitest";
import {
  buildMesocycleWithSets,
  calculateProgressedTarget,
  calculateWorkoutProgress,
  getSetLogReps,
  getSetProgressionReps,
  updateDropsetSetsFromStartWeight,
} from "./workoutUtils";

describe("workoutUtils", () => {
  it("uses target reps for an unlogged bodyweight set", () => {
    expect(getSetLogReps({ weight: 0, reps: 0, targetReps: 12 })).toBe(12);
    expect(getSetLogReps({ weight: 0, reps: 9, targetReps: 12 })).toBe(9);
  });

  it("calculates progress from completed sets only", () => {
    const currentMesocycle = {
      plan: [{ exercises: [{ sets: [{ completed: true }, { completed: false }] }] }],
    };
    expect(calculateWorkoutProgress({ currentMesocycle, currentDayIndex: 0 })).toBe(50);
  });

  it("updates dropset targets without changing completed follow-up sets", () => {
    const result = updateDropsetSetsFromStartWeight({
      exercise: { type: "barbell", weightIncrement: 2.5, minimumWeight: 20 },
      exerciseSets: [
        { targetWeight: 80, targetReps: 8 },
        { targetWeight: 60, targetReps: 8, completed: true, weight: 60 },
        { targetWeight: 50, targetReps: 8 },
      ],
      startWeight: 80,
    });

    expect(result.error).toBeNull();
    expect(result.sets[0]).toMatchObject({ targetWeight: 80, weight: 80, completed: false });
    expect(result.sets[1]).toMatchObject({ targetWeight: 60, weight: 60, completed: true });
    expect(result.sets[2].targetWeight).toBeLessThan(80);
  });

  it("progresses reps from the completed set before using the next target", () => {
    expect(getSetProgressionReps({ completed: true, reps: 9, targetReps: 8 })).toBe(9);
    expect(getSetProgressionReps({ completed: false, reps: 0, targetReps: 8 })).toBe(8);
  });

  it("applies the configured progression mode", () => {
    const exercise = { type: "barbell", progressionMode: "weight", weightIncrement: 2.5, minimumWeight: 20 };
    expect(calculateProgressedTarget({ weight: 80, reps: 8, exercise, currentWeek: 2 })).toEqual({ weight: 82.5, reps: 8 });
  });

  it("replaces only the supplied sets in a mesocycle", () => {
    const mesocycle = { plan: [{ exercises: [{ sets: [{ reps: 8 }] }, { sets: [{ reps: 10 }] }] }] };
    const updated = buildMesocycleWithSets(mesocycle, { 0: { 0: [{ reps: 9 }] } });
    expect(updated.plan[0].exercises[0].sets).toEqual([{ reps: 9 }]);
    expect(updated.plan[0].exercises[1].sets).toEqual([{ reps: 10 }]);
  });
});

