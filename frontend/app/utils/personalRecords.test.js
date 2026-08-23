import { describe, expect, it } from "vitest";
import {
  enrichWorkoutWithPersonalRecords,
  getWeightKey,
  normalizeExerciseName,
  projectCurrentWorkoutPersonalRecords,
} from "./personalRecords";

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

  it("projects sequential records from the local current workout", () => {
    const workout = {
      id: 10,
      name: "Current block",
      daysPerWeek: 2,
      personalRecordHistory: [
        {
          mesocycleId: 4,
          exercise: "Bench Press",
          weight: 80,
          reps: 5,
        },
      ],
      plan: [
        {
          startedAt: "2026-08-23T12:00:00.000Z",
          exercises: [
            {
              exercise: "Bench Press",
              muscleGroup: "Chest",
              sets: [
                { completed: true, weight: 80, reps: 8 },
                { completed: true, weight: "80.0", reps: 10 },
              ],
            },
          ],
        },
      ],
    };

    const projected = projectCurrentWorkoutPersonalRecords(workout);
    const record =
      projected.plan[0].exercises[0].personalRecordsByWeight["80"];

    expect(record.recordSetIndices).toEqual([0, 1]);
    expect(record.recordsBySetIndex[0]).toMatchObject({
      isNewRecord: true,
      previousRecord: 5,
      workoutBestReps: 8,
    });
    expect(record.recordsBySetIndex[1]).toMatchObject({
      isNewRecord: true,
      previousRecord: 8,
      workoutBestReps: 10,
    });
    expect(projected.personalRecordHistory.at(-1)).toMatchObject({
      mesocycleId: 10,
      week: 1,
      day: 1,
      setIndex: 1,
      workoutDate: "2026-08-23T12:00:00.000Z",
      optimistic: true,
    });
  });

  it("replaces stale current-workout milestones when a result is corrected", () => {
    const workout = {
      id: 10,
      daysPerWeek: 1,
      personalRecordHistory: [
        {
          mesocycleId: 4,
          exercise: "Bench Press",
          weight: 80,
          reps: 5,
        },
        {
          mesocycleId: 10,
          dayIndex: 0,
          exerciseIndex: 0,
          setIndex: 0,
          exercise: "Bench Press",
          weight: 80,
          reps: 8,
        },
      ],
      plan: [
        {
          exercises: [
            {
              exercise: "Bench Press",
              sets: [{ completed: true, weight: 80, reps: 4 }],
            },
          ],
        },
      ],
    };

    const projected = projectCurrentWorkoutPersonalRecords(workout);

    expect(projected.personalRecordHistory).toHaveLength(1);
    expect(
      projected.plan[0].exercises[0].personalRecordsByWeight["80"]
    ).toMatchObject({ isNewRecord: false, previousRecord: 5 });
  });

  it("supports zero weight and does not project tied reps as a new record", () => {
    const projected = projectCurrentWorkoutPersonalRecords({
      id: 10,
      daysPerWeek: 1,
      personalRecordHistory: [
        {
          mesocycleId: 4,
          exercise: "Pull Up",
          weight: 0,
          reps: 8,
        },
      ],
      plan: [
        {
          exercises: [
            {
              exercise: " pull   up ",
              sets: [{ completed: true, weight: "0", reps: 8 }],
            },
          ],
        },
      ],
    });

    expect(projected.personalRecordHistory).toHaveLength(1);
    expect(
      projected.plan[0].exercises[0].personalRecordsByWeight["0"]
    ).toMatchObject({ isNewRecord: false, previousRecord: 8 });
  });
});
