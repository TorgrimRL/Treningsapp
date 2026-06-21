import calculateNewTarget from "../utils/calculateNewTarget.js";
import createDeloadWeek from "../utils/createDeloadWeek.js";
import processPlan from "../utils/processPlan.js";
import { buildResponsePayload } from "../utils/buildResponsePayload.js";

describe("backend utility regression", () => {
  it("calculates rounded barbell and dumbbell targets", () => {
    expect(calculateNewTarget(50, 8, "barbell", 1, 1.05)).toEqual({
      weight: 52.5,
      reps: 8,
    });
    expect(calculateNewTarget(32, 8, "dumbbell", 1, 1)).toEqual({
      weight: 32,
      reps: 9,
    });
  });

  it("creates deload weeks from the first week and keeps current completion state", () => {
    const firstWeekExercises = [
      {
        exercise: "Bench Press",
        sets: [
          { weight: "50", reps: "8", completed: true },
          { weight: "55", reps: "6", completed: true },
          { weight: "60", reps: "4", completed: true },
        ],
      },
    ];
    const currentWeekExercises = [
      {
        exercise: "Bench Press",
        sets: [{ completed: false }, { completed: true }, { completed: false }],
      },
    ];

    expect(createDeloadWeek(firstWeekExercises, currentWeekExercises)).toEqual([
      {
        exercise: "Bench Press",
        sets: [
          {
            weight: 50,
            reps: 4,
            targetWeight: 50,
            targetReps: 4,
            completed: false,
          },
          {
            weight: 55,
            reps: 3,
            targetWeight: 55,
            targetReps: 3,
            completed: true,
          },
        ],
      },
    ]);
  });

  it("marks completed days and finds the first incomplete day", () => {
    const result = processPlan([
      {
        exercises: [{ sets: [{ completed: true }, { completed: true }] }],
      },
      {
        exercises: [{ sets: [{ completed: true }, { completed: false }] }],
      },
      {
        exercises: [{ exercise: "Missing sets" }],
      },
    ]);

    expect(result.firstIncompleteDayIndex).toBe(1);
    expect(result.updatedPlan.map((day) => day.isCompleted)).toEqual([
      true,
      false,
      false,
    ]);
  });

  it("builds the retry response payload expected by the frontend", () => {
    expect(buildResponsePayload(false, { message: "ok", data: [1] })).toEqual({
      message: "ok",
      data: [1],
    });
    expect(buildResponsePayload(true, { message: "ok", data: [1] })).toEqual({
      message: "Database went to sleep!",
      data: [1],
    });
  });
});
