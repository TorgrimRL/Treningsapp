import { describe, expect, it } from "vitest";
import { enrichWorkoutWithPersonalRecords, getWeightKey, normalizeExerciseName } from "./personalRecords";

describe("personal-record helpers", () => {
  it("normalizes exercise and weight identities", () => {
    expect(normalizeExerciseName("  Paused   Bench Press ")).toBe("paused bench press");
    expect(getWeightKey("80.0")).toBe("80");
  });

  it("marks a completed set as a record only when its milestone exists", () => {
    const workout = {
      id: 10,
      personalRecordHistory: [{ mesocycleId: 10, dayIndex: 0, exerciseIndex: 0, setIndex: 0, exercise: "Bench Press", weight: 80, reps: 8 }],
      plan: [{ exercises: [{ exercise: "Bench Press", sets: [{ completed: true, weight: 80, reps: 8 }] }] }],
    };
    const enriched = enrichWorkoutWithPersonalRecords(workout);
    expect(enriched.plan[0].exercises[0].personalRecordsByWeight["80"]).toMatchObject({ isNewRecord: true, previousRecord: null });
    expect(workout.plan[0].exercises[0]).not.toHaveProperty("personalRecordsByWeight");
  });
});

