import {
  buildPersonalRecordHistory,
  getWeightKey,
  normalizeExerciseName,
} from "../utils/personalRecords.js";

function makeSet(weight, reps, completed = true) {
  return { weight, reps, completed };
}

function makeExercise(exercise, sets) {
  return { exercise, sets };
}

function makeDay(exercises, startedAt) {
  return {
    exercises,
    ...(startedAt === undefined ? {} : { startedAt }),
  };
}

function makeMesocycle(overrides = {}) {
  return {
    id: 1,
    name: "Block 1",
    weeks: 1,
    daysPerWeek: 1,
    isCurrent: false,
    plan: [],
    ...overrides,
  };
}

describe("personal record history", () => {
  it("normalizes exercise names and numeric weight keys", () => {
    expect(normalizeExerciseName("  BENCH\u00a0 Press  ")).toBe("bench press");
    expect(normalizeExerciseName(null)).toBe("");
    expect(getWeightKey("050.00")).toBe("50");
    expect(getWeightKey("-0")).toBe("0");
    expect(getWeightKey("")).toBeNull();
    expect(getWeightKey(-1)).toBeNull();
  });

  it("emits the first result and only strictly higher later records", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        daysPerWeek: 3,
        plan: [
          makeDay([makeExercise("Bench Press", [makeSet("50", "8")])]),
          makeDay([makeExercise("Bench Press", [makeSet(50, 8)])]),
          makeDay([makeExercise("Bench Press", [makeSet(50, 9)])]),
        ],
      }),
    ]);

    expect(history).toHaveLength(2);
    expect(history.map(({ reps }) => reps)).toEqual([8, 9]);
    expect(history[1]).toMatchObject({
      exercise: "Bench Press",
      exerciseKey: "bench press",
      weight: 50,
      weightKey: "50",
      week: 1,
      day: 3,
      dayIndex: 2,
      exerciseIndex: 0,
      exercisePosition: 1,
      setIndex: 0,
      setPosition: 1,
      workoutDate: null,
    });
  });

  it("keeps canonical week/day order when timestamps are out of order", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        daysPerWeek: 1,
        plan: [
          makeDay(
            [makeExercise("Bench Press", [makeSet(50, 8)])],
            "2026-07-20T10:01:00.000Z"
          ),
          makeDay(
            [makeExercise("Bench Press", [makeSet(50, 7)])],
            "2026-07-20T10:00:00.000Z"
          ),
        ],
      }),
    ]);

    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      reps: 8,
      dayIndex: 0,
      week: 1,
      day: 1,
    });
  });

  it("keeps separate records for exact numeric weights, including zero", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        plan: [
          makeDay([
            makeExercise("Pull-up", [
              makeSet(0, 10),
              makeSet("0.0", 12),
              makeSet(2.5, 6),
              makeSet("2.50", 7),
            ]),
          ]),
        ],
      }),
    ]);

    expect(history).toEqual([
      expect.objectContaining({
        weight: 0,
        weightKey: "0",
        reps: 10,
        setIndex: 0,
        setPosition: 1,
      }),
      expect.objectContaining({
        weight: 0,
        weightKey: "0",
        reps: 12,
        setIndex: 1,
        setPosition: 2,
      }),
      expect.objectContaining({
        weight: 2.5,
        weightKey: "2.5",
        reps: 6,
        setIndex: 2,
        setPosition: 3,
      }),
      expect.objectContaining({
        weight: 2.5,
        weightKey: "2.5",
        reps: 7,
        setIndex: 3,
        setPosition: 4,
      }),
    ]);
  });

  it("emits every strictly improving set within the same workout", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        plan: [
          makeDay([
            makeExercise("Squat", [
              makeSet(100, 5),
              makeSet(100, 8),
              makeSet(100, 7),
            ]),
          ]),
        ],
      }),
    ]);

    expect(history).toHaveLength(2);
    expect(history).toEqual([
      expect.objectContaining({
        reps: 5,
        exerciseIndex: 0,
        setIndex: 0,
        setPosition: 1,
      }),
      expect.objectContaining({
        reps: 8,
        exerciseIndex: 0,
        setIndex: 1,
        setPosition: 2,
      }),
    ]);
  });

  it("retains the first exercise position on a tie and moves it for a higher result", () => {
    const tied = buildPersonalRecordHistory([
      makeMesocycle({
        plan: [
          makeDay([
            makeExercise("Row", [makeSet(60, 10)]),
            makeExercise(" row ", [makeSet(60, 10)]),
          ]),
        ],
      }),
    ]);
    const higher = buildPersonalRecordHistory([
      makeMesocycle({
        plan: [
          makeDay([
            makeExercise("Row", [makeSet(60, 10)]),
            makeExercise(" row ", [makeSet(60, 11)]),
          ]),
        ],
      }),
    ]);

    expect(tied).toHaveLength(1);
    expect(tied[0]).toMatchObject({ reps: 10, exerciseIndex: 0 });
    expect(higher).toHaveLength(2);
    expect(higher[1]).toMatchObject({
      exercise: "row",
      reps: 11,
      exerciseIndex: 1,
      exercisePosition: 2,
      setIndex: 0,
      setPosition: 1,
    });
  });

  it("ignores incomplete sets and invalid weights or reps", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        plan: [
          makeDay([
            makeExercise("Press", [
              makeSet(40, 99, false),
              makeSet(40, 99, "true"),
              makeSet("", 10),
              makeSet(-1, 10),
              makeSet(Number.POSITIVE_INFINITY, 10),
              makeSet(40, 0),
              makeSet(40, -1),
              makeSet(40, 3.5),
              makeSet(40, "not reps"),
              makeSet(40, Number.NaN),
              makeSet(40, "7"),
            ]),
          ]),
        ],
      }),
    ]);

    expect(history).toHaveLength(1);
    expect(history[0].reps).toBe(7);
  });

  it("matches normalized exercise variants while preserving milestone display text", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        plan: [
          makeDay([makeExercise("Bench Press", [makeSet(70, 8)])]),
          makeDay([makeExercise("  BENCH   PRESS ", [makeSet(70, 9)])]),
        ],
      }),
    ]);

    expect(history.map(({ exerciseKey }) => exerciseKey)).toEqual([
      "bench press",
      "bench press",
    ]);
    expect(history[1]).toMatchObject({
      exercise: "BENCH PRESS",
      reps: 9,
    });
  });

  it("recalculates later milestones when an earlier result is corrected", () => {
    const laterWorkout = makeMesocycle({
      id: 2,
      name: "Block 2",
      plan: [makeDay([makeExercise("Deadlift", [makeSet(120, 19)])])],
    });
    const withMistake = makeMesocycle({
      plan: [makeDay([makeExercise("Deadlift", [makeSet(120, 20)])])],
    });
    const corrected = makeMesocycle({
      plan: [makeDay([makeExercise("Deadlift", [makeSet(120, 18)])])],
    });

    expect(
      buildPersonalRecordHistory([withMistake, laterWorkout]).map(
        ({ reps }) => reps,
      ),
    ).toEqual([20]);
    expect(
      buildPersonalRecordHistory([corrected, laterWorkout]).map(
        ({ reps }) => reps,
      ),
    ).toEqual([18, 19]);
  });

  it("accepts JSON plans and skips corrupt or non-array plans", () => {
    const validPlan = [
      makeDay([makeExercise("Curl", [makeSet(10, 12)])]),
    ];
    const history = buildPersonalRecordHistory([
      makeMesocycle({ id: 1, plan: "{broken" }),
      makeMesocycle({ id: 2, plan: JSON.stringify({ days: validPlan }) }),
      makeMesocycle({ id: 3, plan: JSON.stringify(validPlan) }),
    ]);

    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      mesocycleId: 3,
      mesocycleName: "Block 1",
      reps: 12,
    });
  });

  it("sorts blocks by dates, preserves their day order, and keeps current last", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        id: 30,
        name: "Current",
        isCurrent: true,
        daysPerWeek: 2,
        plan: [
          makeDay(
            [makeExercise("Press", [makeSet(40, 13)])],
            "2023-01-01T10:00:00.000Z",
          ),
        ],
      }),
      makeMesocycle({
        id: 20,
        name: "Later dated block",
        daysPerWeek: 2,
        plan: [
          makeDay(
            [makeExercise("Press", [makeSet(40, 12)])],
            "2024-02-02T10:00:00.000Z",
          ),
          makeDay(
            [makeExercise("Press", [makeSet(40, 10)])],
            "2024-02-01T10:00:00.000Z",
          ),
        ],
      }),
      makeMesocycle({
        id: 10,
        name: "Earlier dated block",
        plan: [
          makeDay(
            [makeExercise("Press", [makeSet(40, 8)])],
            "2024-01-01T10:00:00.000Z",
          ),
        ],
      }),
    ]);

    expect(history.map(({ reps }) => reps)).toEqual([8, 12, 13]);
    expect(history[1]).toMatchObject({
      mesocycleId: 20,
      dayIndex: 0,
      week: 1,
      day: 1,
      workoutDate: "2024-02-02T10:00:00.000Z",
    });
    expect(history[2].mesocycleId).toBe(30);
  });

  it("sorts dated workouts globally across overlapping blocks", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        id: 1,
        name: "Long block",
        daysPerWeek: 2,
        plan: [
          makeDay(
            [makeExercise("Press", [makeSet(40, 8)])],
            "2025-01-01T10:00:00.000Z"
          ),
          makeDay(
            [makeExercise("Press", [makeSet(40, 12)])],
            "2025-03-01T10:00:00.000Z"
          ),
        ],
      }),
      makeMesocycle({
        id: 2,
        name: "Overlapping block",
        plan: [
          makeDay(
            [makeExercise("Press", [makeSet(40, 10)])],
            "2025-02-01T10:00:00.000Z"
          ),
        ],
      }),
    ]);

    expect(history.map(({ reps }) => reps)).toEqual([8, 10, 12]);
    expect(history.map(({ mesocycleName }) => mesocycleName)).toEqual([
      "Long block",
      "Overlapping block",
      "Long block",
    ]);
  });

  it("keeps canonical day order when a block mixes dated and undated days", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        id: 1,
        name: "Mixed block",
        plan: [
          makeDay(
            [makeExercise("March Press", [makeSet(40, 8)])],
            "2025-03-01T10:00:00.000Z"
          ),
          makeDay([
            makeExercise("Undated Press", [makeSet(40, 8)]),
          ]),
        ],
      }),
      makeMesocycle({
        id: 2,
        name: "February block",
        plan: [
          makeDay(
            [makeExercise("February Press", [makeSet(40, 8)])],
            "2025-02-01T10:00:00.000Z"
          ),
        ],
      }),
    ]);

    expect(history.map(({ exercise }) => exercise)).toEqual([
      "February Press",
      "March Press",
      "Undated Press",
    ]);
  });

  it("falls back to block id and plan order when dates are unavailable", () => {
    const history = buildPersonalRecordHistory([
      makeMesocycle({
        id: 2,
        plan: [
          makeDay([makeExercise("Curl", [makeSet(10, 10)])], "invalid"),
        ],
      }),
      makeMesocycle({
        id: 1,
        daysPerWeek: 2,
        plan: [
          makeDay([makeExercise("Curl", [makeSet(10, 8)])]),
          makeDay([makeExercise("Curl", [makeSet(10, 9)])]),
        ],
      }),
    ]);

    expect(history.map(({ reps }) => reps)).toEqual([8, 9, 10]);
    expect(history.map(({ workoutDate }) => workoutDate)).toEqual([
      null,
      null,
      null,
    ]);
  });

  it("returns only compact milestone data and does not mutate input", () => {
    const plan = [
      makeDay(
        [makeExercise("Squat", [makeSet(80, 5)])],
        "2025-05-01T12:00:00.000Z",
      ),
    ];
    const mesocycles = [makeMesocycle({ plan })];
    const snapshot = structuredClone(mesocycles);
    const history = buildPersonalRecordHistory(mesocycles);

    expect(mesocycles).toEqual(snapshot);
    expect(history[0]).toEqual({
      exercise: "Squat",
      exerciseKey: "squat",
      weight: 80,
      weightKey: "80",
      reps: 5,
      mesocycleId: 1,
      mesocycleName: "Block 1",
      week: 1,
      day: 1,
      dayIndex: 0,
      exerciseIndex: 0,
      exercisePosition: 1,
      setIndex: 0,
      setPosition: 1,
      workoutDate: "2025-05-01T12:00:00.000Z",
    });
    expect(history[0]).not.toHaveProperty("sets");
    expect(history[0]).not.toHaveProperty("plan");
  });

  it("merges a large multi-block history without rescanning every block", () => {
    const mesocycles = Array.from({ length: 5_000 }, (_, index) =>
      makeMesocycle({
        id: index + 1,
        name: `Block ${index + 1}`,
        plan: [
          makeDay([
            makeExercise("Bench Press", [makeSet(50, index + 1)]),
          ]),
        ],
      })
    );

    const history = buildPersonalRecordHistory(mesocycles);

    expect(history).toHaveLength(5_000);
    expect(history.at(-1)).toMatchObject({
      mesocycleId: 5_000,
      reps: 5_000,
    });
  });
});
