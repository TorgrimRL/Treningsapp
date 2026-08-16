import { jest } from "@jest/globals";
import request from "supertest";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { createAuthenticatedUser } from "../testHelpers/api.js";
import { buildPersonalRecordOverview } from "../utils/personalRecords.js";

function completedSet(weight, reps, completed = true) {
  return {
    weight: String(weight),
    reps: String(reps),
    targetWeight: String(weight),
    targetReps: String(reps),
    completed,
  };
}

function workoutDay({
  exercise = "Bench Press",
  muscleGroup = "Chest",
  sets = [completedSet(50, 8)],
  startedAt,
} = {}) {
  return {
    label: "Workout",
    exercises: [{ exercise, muscleGroup, type: "barbell", sets }],
    ...(startedAt === undefined ? {} : { startedAt }),
  };
}

function mesocycle(overrides = {}) {
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

async function insertMesocycle(
  db,
  {
    userId,
    name = "Block",
    plan = [],
    daysPerWeek = 1,
    isCurrent = false,
  }
) {
  return db.run(
    `INSERT INTO mesocycles
      (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      1,
      daysPerWeek,
      typeof plan === "string" ? plan : JSON.stringify(plan),
      userId,
      null,
      isCurrent ? 1 : 0,
    ]
  );
}

describe("personal record overview calculation", () => {
  it("summarizes records by normalized exercise and distinguishes last PR from last logged", () => {
    const firstDate = "2026-01-01T09:00:00.000Z";
    const recordDate = "2026-01-08T09:00:00.000Z";
    const loggedDate = "2026-01-15T09:00:00.000Z";
    const overview = buildPersonalRecordOverview([
      mesocycle({
        daysPerWeek: 4,
        plan: [
          workoutDay({
            exercise: "  Bench   Press ",
            muscleGroup: " Chest ",
            startedAt: firstDate,
            sets: [
              completedSet("050.0", 8),
              completedSet(50, 10),
              completedSet(60, 5),
            ],
          }),
          workoutDay({
            exercise: "BENCH PRESS",
            muscleGroup: "Chest",
            startedAt: recordDate,
            sets: [completedSet(50, 9), completedSet(60, 6)],
          }),
          workoutDay({
            exercise: "Bench Press",
            muscleGroup: "Chest",
            startedAt: loggedDate,
            sets: [completedSet(50, 7), completedSet(60, 4)],
          }),
          workoutDay({
            exercise: "Bench Press",
            muscleGroup: "",
            sets: [completedSet(50, 6)],
          }),
        ],
      }),
    ]);

    expect(overview.personalRecordHistory.map(({ weight, reps }) => [
      weight,
      reps,
    ])).toEqual([
      [50, 8],
      [50, 10],
      [60, 5],
      [60, 6],
    ]);
    expect(overview.exercises).toEqual([
      expect.objectContaining({
        exercise: "Bench Press",
        exerciseKey: "bench press",
        muscleGroup: "Chest",
        weightCount: 2,
        milestoneCount: 4,
        lastPersonalRecordAt: recordDate,
        lastLoggedAt: loggedDate,
        lastPersonalRecord: expect.objectContaining({
          weight: 60,
          reps: 6,
          workoutDate: recordDate,
        }),
      }),
    ]);
  });

  it("uses only valid completed sets and never invents dates", () => {
    const overview = buildPersonalRecordOverview([
      mesocycle({
        plan: [
          workoutDay({
            exercise: "Pull-up",
            muscleGroup: "Back",
            sets: [
              completedSet(0, 8),
              completedSet(0, 9, false),
              completedSet(-1, 20),
              completedSet(0, 0),
            ],
          }),
        ],
      }),
    ]);

    expect(overview.exercises).toEqual([
      expect.objectContaining({
        exercise: "Pull-up",
        weightCount: 1,
        milestoneCount: 1,
        lastPersonalRecordAt: null,
        lastLoggedAt: null,
      }),
    ]);
    expect(overview.personalRecordHistory).toEqual([
      expect.objectContaining({ weight: 0, reps: 8, workoutDate: null }),
    ]);
  });

  it("skips corrupt plans and returns deterministic empty collections", () => {
    expect(
      buildPersonalRecordOverview([
        mesocycle({ plan: "{broken" }),
        mesocycle({ id: 2, plan: JSON.stringify({ days: [] }) }),
      ])
    ).toEqual({ personalRecordHistory: [], exercises: [] });
    expect(buildPersonalRecordOverview(null)).toEqual({
      personalRecordHistory: [],
      exercises: [],
    });
  });
});

describe("GET /api/personal-records", () => {
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

  it("requires authentication", async () => {
    await request(app).get("/api/personal-records").expect(401);
  });

  it("works without a current mesocycle or any workout data", async () => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "empty-user",
    });

    const response = await agent.get("/api/personal-records").expect(200);

    expect(response.body).toEqual({
      personalRecordHistory: [],
      exercises: [],
    });
  });

  it("returns compact historical records when there is no current mesocycle", async () => {
    const { agent, userId } = await createAuthenticatedUser(app, db, {
      username: "history-user",
    });
    const firstDate = "2026-03-01T08:00:00.000Z";
    const loggedDate = "2026-03-08T08:00:00.000Z";
    await insertMesocycle(db, {
      userId,
      name: "Finished block",
      plan: [
        workoutDay({
          muscleGroup: "Chest",
          startedAt: firstDate,
          sets: [completedSet(80, 8)],
        }),
        workoutDay({
          muscleGroup: "Chest",
          startedAt: loggedDate,
          sets: [completedSet(80, 7)],
        }),
      ],
    });

    const response = await agent.get("/api/personal-records").expect(200);

    expect(response.body.exercises).toEqual([
      expect.objectContaining({
        exercise: "Bench Press",
        exerciseKey: "bench press",
        muscleGroup: "Chest",
        weightCount: 1,
        milestoneCount: 1,
        lastPersonalRecordAt: firstDate,
        lastLoggedAt: loggedDate,
      }),
    ]);
    expect(response.body.personalRecordHistory).toHaveLength(1);
    expect(response.body.personalRecordHistory[0]).toMatchObject({
      exercise: "Bench Press",
      weight: 80,
      reps: 8,
      workoutDate: firstDate,
    });
    expect(JSON.stringify(response.body)).not.toContain('"plan"');
    expect(JSON.stringify(response.body)).not.toContain('"sets"');
  });

  it("isolates users and skips corrupt historical plans", async () => {
    const alice = await createAuthenticatedUser(app, db, {
      username: "alice-overview",
    });
    const bob = await createAuthenticatedUser(app, db, {
      username: "bob-overview",
    });
    await insertMesocycle(db, {
      userId: alice.userId,
      name: "Broken old block",
      plan: "not-json",
    });
    await insertMesocycle(db, {
      userId: alice.userId,
      name: "Alice block",
      plan: [
        workoutDay({
          exercise: "Alice Row",
          muscleGroup: "Back",
          startedAt: "2026-04-01T09:00:00.000Z",
        }),
      ],
    });
    await insertMesocycle(db, {
      userId: bob.userId,
      name: "Bob block",
      plan: [
        workoutDay({
          exercise: "Bob Secret Curl",
          muscleGroup: "Arms",
          startedAt: "2026-04-02T09:00:00.000Z",
          sets: [completedSet(20, 99)],
        }),
      ],
    });

    const response = await alice.agent.get("/api/personal-records").expect(200);

    expect(response.body.exercises).toHaveLength(1);
    expect(response.body.exercises[0]).toMatchObject({
      exercise: "Alice Row",
      muscleGroup: "Back",
    });
    expect(JSON.stringify(response.body)).not.toContain("Bob Secret Curl");
    expect(JSON.stringify(response.body)).not.toContain("Broken old block");
  });

  it("keeps a corrupt current plan visible as an API error", async () => {
    const { agent, userId } = await createAuthenticatedUser(app, db, {
      username: "broken-current-user",
    });
    await insertMesocycle(db, {
      userId,
      name: "Broken current",
      plan: "not-json",
      isCurrent: true,
    });

    const response = await agent.get("/api/personal-records").expect(500);

    expect(response.body).toEqual({ error: "Invalid plan data" });
  });
});
