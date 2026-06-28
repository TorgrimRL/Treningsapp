import { jest } from "@jest/globals";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { createAuthenticatedUser } from "../testHelpers/api.js";

function progressionPlan() {
  return [
    {
      label: "Week 1",
      exercises: [
        {
          exercise: "Bench Press",
          type: "barbell",
          sets: [
            {
              weight: "50",
              reps: "8",
              targetWeight: "50",
              targetReps: "8",
              completed: true,
            },
            {
              weight: "50",
              reps: "8",
              targetWeight: "50",
              targetReps: "8",
              completed: true,
            },
            {
              weight: "50",
              reps: "8",
              targetWeight: "50",
              targetReps: "8",
              completed: true,
            },
          ],
        },
      ],
    },
    {
      label: "Week 2",
      exercises: [
        {
          exercise: "Bench Press",
          type: "barbell",
          sets: [
            {
              weight: "50",
              reps: "8",
              targetWeight: "50",
              targetReps: "8",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      label: "Week 3",
      exercises: [
        {
          exercise: "Bench Press",
          type: "barbell",
          sets: [
            {
              weight: "0",
              reps: "0",
              targetWeight: "0",
              targetReps: "0",
              completed: false,
            },
            {
              weight: "0",
              reps: "0",
              targetWeight: "0",
              targetReps: "0",
              completed: true,
            },
            {
              weight: "0",
              reps: "0",
              targetWeight: "0",
              targetReps: "0",
              completed: false,
            },
          ],
        },
      ],
    },
  ];
}

function set({
  weight,
  reps,
  completed = false,
  progressionMode,
  weightIncrement,
}) {
  return {
    weight: String(weight),
    reps: String(reps),
    targetWeight: String(weight),
    targetReps: String(reps),
    completed,
    ...(progressionMode ? { progressionMode } : {}),
    ...(weightIncrement ? { weightIncrement } : {}),
  };
}

function exercise({ exercise, progressionMode, weightIncrement, completed }) {
  return {
    exercise,
    type: "barbell",
    progressionMode,
    weightIncrement,
    sets: [
      set({
        weight: 50,
        reps: 8,
        completed,
        progressionMode,
        weightIncrement,
      }),
    ],
  };
}

function mixedProgressionPlan() {
  const firstWeek = {
    label: "Week 1",
    exercises: [
      exercise({ exercise: "Percent Press", completed: true }),
      exercise({
        exercise: "Rep Press",
        progressionMode: "reps",
        weightIncrement: 2.5,
        completed: true,
      }),
      exercise({
        exercise: "Weight Press",
        progressionMode: "weight",
        weightIncrement: 5,
        completed: true,
      }),
    ],
  };

  const secondWeek = {
    label: "Week 2",
    exercises: firstWeek.exercises.map((item) => ({
      ...item,
      sets: [
        set({
          weight: 0,
          reps: 0,
          progressionMode: item.progressionMode,
          weightIncrement: item.weightIncrement,
        }),
      ],
    })),
  };

  const deloadWeek = {
    label: "Week 3",
    exercises: firstWeek.exercises.map((item) => ({
      ...item,
      sets: [set({ weight: 0, reps: 0 })],
    })),
  };

  return [firstWeek, secondWeek, deloadWeek];
}

function dropsetExercise({ exercise, progressionMode, weightIncrement }) {
  return {
    exercise,
    type: "barbell",
    progressionMode,
    weightIncrement,
    dropset: {
      enabled: true,
      setCount: 2,
      startWeight: 100,
      dropPercent: 20,
    },
    sets: [
      set({
        weight: 100,
        reps: 10,
        completed: true,
        progressionMode,
        weightIncrement,
      }),
      set({
        weight: 80,
        reps: 10,
        completed: true,
        progressionMode,
        weightIncrement,
      }),
    ],
  };
}

function dropsetProgressionPlan() {
  const firstWeek = {
    label: "Week 1",
    exercises: [
      dropsetExercise({ exercise: "Percent Dropset" }),
      dropsetExercise({
        exercise: "Rep Dropset",
        progressionMode: "reps",
      }),
      dropsetExercise({
        exercise: "Weight Dropset",
        progressionMode: "weight",
        weightIncrement: 5,
      }),
    ],
  };

  const secondWeek = {
    label: "Week 2",
    exercises: firstWeek.exercises.map((item) => ({
      ...item,
      sets: [
        set({ weight: 0, reps: 0 }),
        set({ weight: 0, reps: 0 }),
      ],
    })),
  };

  const deloadWeek = {
    label: "Week 3",
    exercises: firstWeek.exercises.map((item) => ({
      ...item,
      sets: [set({ weight: 0, reps: 0 })],
    })),
  };

  return [firstWeek, secondWeek, deloadWeek];
}

describe("current workout regression", () => {
  let db;
  let app;
  let logSpy;
  let errorSpy;

  beforeEach(async () => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    db = await createTestDb();
    app = await loadAppWithQuery(db.query);
  });

  afterEach(async () => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    await db?.close();
  });

  it("returns 404 when the user has no current workout", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });

    const response = await agent.get("/api/current-workout").expect(404);

    expect(response.body).toEqual({ error: "Current workout not found" });
  });

  it("rejects invalid stored plan JSON", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });
    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      "alice",
    ]);

    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    await db.run(
      `INSERT INTO mesocycles
        (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Broken plan", 1, 1, "not-json", user.id, null, 1]
    );

    const response = await agent.get("/api/current-workout").expect(500);

    expect(response.body).toEqual({ error: "Invalid plan data" });
  });

  it("computes completion state, progression targets, and deload weeks", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });

    await agent
      .post("/api/mesocycles")
      .send({
        name: "Progression plan",
        weeks: 3,
        daysPerWeek: 1,
        plan: progressionPlan(),
        completedDate: null,
        isCurrent: true,
      })
      .expect(201);

    const response = await agent.get("/api/current-workout").expect(200);

    expect(response.body).toMatchObject({
      name: "Progression plan",
      isCurrent: true,
      totalWeeks: 3,
      daysPerWeek: 1,
      firstIncompleteDayIndex: 1,
    });
    expect(response.body.plan[0].isCompleted).toBe(true);
    expect(response.body.plan[1].isCompleted).toBe(false);
    expect(response.body.plan[1].exercises[0]).toMatchObject({
      progressionMode: "percent",
      weightIncrement: 2.5,
    });
    expect(response.body.plan[1].exercises[0].sets[0]).toMatchObject({
      weight: 52.5,
      reps: 8,
      targetWeight: 52.5,
      targetReps: 8,
    });
    expect(response.body.plan[2].exercises[0].sets).toEqual([
      expect.objectContaining({
        weight: 50,
        reps: 4,
        targetWeight: 50,
        targetReps: 4,
        completed: false,
      }),
      expect.objectContaining({
        weight: 50,
        reps: 4,
        targetWeight: 50,
        targetReps: 4,
        completed: true,
      }),
    ]);
  });

  it("computes per-exercise progression modes", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });

    await agent
      .post("/api/mesocycles")
      .send({
        name: "Mixed progression plan",
        weeks: 3,
        daysPerWeek: 1,
        plan: mixedProgressionPlan(),
        completedDate: null,
        isCurrent: true,
      })
      .expect(201);

    const response = await agent.get("/api/current-workout").expect(200);
    const [percentExercise, repExercise, weightExercise] =
      response.body.plan[1].exercises;

    expect(percentExercise).toMatchObject({
      progressionMode: "percent",
      weightIncrement: 2.5,
    });
    expect(percentExercise.sets[0]).toMatchObject({
      weight: 52.5,
      reps: 8,
      targetWeight: 52.5,
      targetReps: 8,
    });
    expect(repExercise).toMatchObject({
      progressionMode: "reps",
      weightIncrement: 2.5,
    });
    expect(repExercise.sets[0]).toMatchObject({
      weight: 50,
      reps: 9,
      targetWeight: 50,
      targetReps: 9,
    });
    expect(weightExercise).toMatchObject({
      progressionMode: "weight",
      weightIncrement: 5,
    });
    expect(weightExercise.sets[0]).toMatchObject({
      weight: 55,
      reps: 8,
      targetWeight: 55,
      targetReps: 8,
    });
  });

  it("progresses dropset sets with each exercise progression mode", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });

    await agent
      .post("/api/mesocycles")
      .send({
        name: "Dropset progression plan",
        weeks: 3,
        daysPerWeek: 1,
        plan: dropsetProgressionPlan(),
        completedDate: null,
        isCurrent: true,
      })
      .expect(201);

    const response = await agent.get("/api/current-workout").expect(200);
    const [percentExercise, repExercise, weightExercise] =
      response.body.plan[1].exercises;

    expect(percentExercise.sets).toEqual([
      expect.objectContaining({ weight: 105, reps: 10, targetWeight: 105, targetReps: 10 }),
      expect.objectContaining({ weight: 85, reps: 10, targetWeight: 85, targetReps: 10 }),
    ]);
    expect(repExercise.sets).toEqual([
      expect.objectContaining({ weight: 100, reps: 11, targetWeight: 100, targetReps: 11 }),
      expect.objectContaining({ weight: 80, reps: 11, targetWeight: 80, targetReps: 11 }),
    ]);
    expect(weightExercise.sets).toEqual([
      expect.objectContaining({ weight: 105, reps: 10, targetWeight: 105, targetReps: 10 }),
      expect.objectContaining({ weight: 85, reps: 10, targetWeight: 85, targetReps: 10 }),
    ]);
  });

  it("preserves configured dropsets when fetching the active workout", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });

    await agent
      .post("/api/mesocycles")
      .send({
        name: "Configured dropset plan",
        weeks: 4,
        daysPerWeek: 1,
        plan: [
          {
            label: "Week 1",
            exercises: [
              {
                exercise: "Configured Dropset",
                type: "barbell",
                sets: [set({ weight: 82.5, reps: 8, completed: true })],
              },
            ],
          },
          {
            label: "Week 2",
            exercises: [
              {
                exercise: "Configured Dropset",
                type: "barbell",
                progressionMode: "percent",
                weightIncrement: 2.5,
                dropset: {
                  enabled: true,
                  setCount: 5,
                  startWeight: 100,
                  dropPercent: 20,
                },
                sets: [
                  set({ weight: 100, reps: 8 }),
                  set({ weight: 80, reps: 8 }),
                  set({ weight: 65, reps: 8 }),
                  set({ weight: 52.5, reps: 8 }),
                  set({ weight: 42.5, reps: 8 }),
                ],
              },
            ],
          },
        ],
        completedDate: null,
        isCurrent: true,
      })
      .expect(201);

    const response = await agent.get("/api/current-workout").expect(200);
    const configuredDropset = response.body.plan[1].exercises[0];

    expect(configuredDropset.dropset).toMatchObject({
      enabled: true,
      setCount: 5,
      startWeight: 100,
    });
    expect(configuredDropset.sets.map((item) => item.targetWeight)).toEqual([
      100,
      80,
      65,
      52.5,
      50,
    ]);
    expect(configuredDropset.sets.map((item) => item.weight)).toEqual([
      100,
      80,
      65,
      52.5,
      50,
    ]);
  });

});
