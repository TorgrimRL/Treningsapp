import { jest } from "@jest/globals";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import {
  createAuthenticatedUser,
  csrfRequest,
} from "../testHelpers/api.js";

function makePlan(completed = false) {
  return [
    {
      label: "Day 1",
      exercises: [
        {
          exercise: "Bench Press",
          type: "barbell",
          muscleGroup: "Chest",
          sets: [
            {
              weight: "50",
              reps: "8",
              targetWeight: "50",
              targetReps: "8",
              completed,
            },
          ],
        },
      ],
    },
  ];
}

function makeDropsetPlan(setCount) {
  const plan = makePlan(false);
  plan[0].exercises[0].dropset = {
    enabled: true,
    startWeight: 50,
    setCount,
  };
  return plan;
}

function makeWorkoutDay({
  completedSets = [false, false],
  reps = ["8", "10"],
  transientRecords = false,
} = {}) {
  return {
    label: "Day 1",
    exercises: [
      {
        exercise: "Bench Press",
        type: "barbell",
        muscleGroup: "Chest",
        ...(transientRecords
          ? {
              personalRecordsByWeight: {
                50: {
                  previousRecord: 8,
                  workoutBestReps: 10,
                  isNewRecord: true,
                  recordSetIndex: 1,
                },
              },
            }
          : {}),
        sets: completedSets.map((completed, index) => ({
          weight: "50",
          reps: reps[index],
          targetWeight: "50",
          targetReps: reps[index],
          completed,
        })),
      },
    ],
  };
}

async function createMesocycle(agent, overrides = {}) {
  const body = {
    name: "Hypertrophy",
    weeks: 1,
    daysPerWeek: 1,
    plan: makePlan(false),
    completedDate: null,
    isCurrent: true,
    ...overrides,
  };

  const response = await csrfRequest(agent, "post", "/api/mesocycles")
    .send(body)
    .expect(201);
  return { id: response.body.mesocycleId, body, response };
}

async function updateMesocycle(agent, id, plan, overrides = {}) {
  return csrfRequest(agent, "put", `/api/mesocycles/${id}`)
    .send({
      name: "Updated plan",
      weeks: 1,
      daysPerWeek: 1,
      plan,
      isCurrent: true,
      completedDate: null,
      ...overrides,
    })
    .expect(200);
}

describe("exercise and mesocycle regression", () => {
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

  it("persists an opted-in deload when a plan is reused or updated", async () => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "alice",
    });
    const { id } = await createMesocycle(agent, { includeDeload: true });

    const initialWorkout = await agent.get("/api/current-workout").expect(200);
    expect(initialWorkout.body.includeDeload).toBe(true);

    await updateMesocycle(agent, id, makePlan(false));

    const updatedWorkout = await agent.get("/api/current-workout").expect(200);
    expect(updatedWorkout.body.includeDeload).toBe(true);
  });

  it("creates and lists exercises only for the authenticated user", async () => {
    const userA = await createAuthenticatedUser(app, db, { username: "alice" });
    const userB = await createAuthenticatedUser(app, db, { username: "bob" });

    await csrfRequest(userA.agent, "post", "/api/exercises")
      .send({
        name: "Alice Bench",
        type: "barbell",
        muscleGroup: "Chest",
        videolink: "https://example.com/alice",
      })
      .expect(201);

    await csrfRequest(userB.agent, "post", "/api/exercises")
      .send({
        name: "Bob Row",
        type: "dumbbell",
        muscleGroup: "Back",
        videolink: "https://example.com/bob",
      })
      .expect(201);

    const aliceExercises = await userA.agent.get("/api/exercises").expect(200);
    const bobExercises = await userB.agent.get("/api/exercises").expect(200);

    expect(aliceExercises.body).toHaveLength(1);
    expect(aliceExercises.body[0]).toMatchObject({
      name: "Alice Bench",
      user_id: 1,
    });
    expect(bobExercises.body).toHaveLength(1);
    expect(bobExercises.body[0]).toMatchObject({
      name: "Bob Row",
      user_id: 2,
    });
  });

  it("validates custom exercises and treats normalized duplicates as idempotent", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });
    const invalid = await csrfRequest(agent, "post", "/api/exercises")
      .send({ name: "", type: "invalid", muscleGroup: "Unknown" })
      .expect(400);
    expect(invalid.body.error).toContain("invalid");

    await csrfRequest(agent, "post", "/api/exercises")
      .send({ name: "  Cable   Fly  ", type: "cable", muscleGroup: "Chest" })
      .expect(201);
    const duplicate = await csrfRequest(agent, "post", "/api/exercises")
      .send({ name: "cable fly", type: "cable", muscleGroup: "Chest" })
      .expect(200);
    expect(duplicate.body.message).toBe("Exercise already exists");
    expect((await agent.get("/api/exercises").expect(200)).body).toHaveLength(1);
  });

  it("creates mesocycles, marks the newest one current, and parses list responses", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });

    await createMesocycle(agent, { name: "First plan" });
    await createMesocycle(agent, { name: "Second plan" });

    const response = await agent.get("/api/mesocycles").expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      name: "First plan",
      isCurrent: false,
      completedDate: null,
    });
    expect(response.body[0].plan).toEqual(makePlan(false));
    expect(response.body[1]).toMatchObject({
      name: "Second plan",
      isCurrent: true,
    });
  });

  it("renames an owned mesocycle without changing its workout data", async () => {
    const userA = await createAuthenticatedUser(app, db, { username: "alice" });
    const userB = await createAuthenticatedUser(app, db, { username: "bob" });
    const { id } = await createMesocycle(userA.agent, {
      name: "Original plan",
      includeDeload: true,
    });
    await createMesocycle(userB.agent, { name: "Renamed plan" });
    const before = await db.get("SELECT * FROM mesocycles WHERE id = ?", [id]);

    const response = await csrfRequest(
      userA.agent,
      "patch",
      `/api/mesocycles/${id}/name`
    )
      .send({ name: "  Renamed plan  " })
      .expect(200);

    expect(response.body).toEqual({
      message: "Mesocycle renamed successfully",
      mesocycle: { id, name: "Renamed plan" },
    });
    const after = await db.get("SELECT * FROM mesocycles WHERE id = ?", [id]);
    expect({ ...after, name: before.name }).toEqual(before);
    expect(after.name).toBe("Renamed plan");

    await csrfRequest(
      userB.agent,
      "patch",
      `/api/mesocycles/${id}/name`
    )
      .send({ name: "Stolen plan" })
      .expect(404, { error: "Mesocycle not found" });
  });

  it("rejects blank and duplicate mesocycle names for the same user", async () => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "alice",
    });
    const { id } = await createMesocycle(agent, { name: "First plan" });
    await createMesocycle(agent, { name: "Second plan" });

    await csrfRequest(agent, "patch", `/api/mesocycles/${id}/name`)
      .send({ name: "   " })
      .expect(400, { error: "Mesocycle name is required" });
    await csrfRequest(agent, "patch", `/api/mesocycles/${id}/name`)
      .send({ name: "  SECOND PLAN " })
      .expect(409, { error: "Mesocycle name is already in use" });

    const row = await db.get("SELECT name FROM mesocycles WHERE id = ?", [id]);
    expect(row.name).toBe("First plan");
  });

  it("rate limits repeated rename attempts per authenticated user", async () => {
    const userA = await createAuthenticatedUser(app, db, { username: "alice" });
    const userB = await createAuthenticatedUser(app, db, { username: "bob" });
    const userAPlan = await createMesocycle(userA.agent, {
      name: "Alice plan",
    });
    const userBPlan = await createMesocycle(userB.agent, {
      name: "Bob plan",
    });

    for (let attempt = 1; attempt <= 10; attempt += 1) {
      await csrfRequest(
        userA.agent,
        "patch",
        `/api/mesocycles/${userAPlan.id}/name`
      )
        .send({ name: `Alice plan ${attempt}` })
        .expect(200);
    }

    await csrfRequest(
      userA.agent,
      "patch",
      `/api/mesocycles/${userAPlan.id}/name`
    )
      .send({ name: "Alice blocked plan" })
      .expect(429, {
        error: "Too many rename attempts. Please try again in a minute.",
      });

    await csrfRequest(
      userB.agent,
      "patch",
      `/api/mesocycles/${userBPlan.id}/name`
    )
      .send({ name: "Bob renamed plan" })
      .expect(200);
  });

  it("keeps private mesocycles scoped to their owner", async () => {
    const userA = await createAuthenticatedUser(app, db, { username: "alice" });
    const userB = await createAuthenticatedUser(app, db, { username: "bob" });
    const { id } = await createMesocycle(userA.agent, { name: "Private plan" });

    const ownerResponse = await userA.agent
      .get(`/api/mesocycles/${id}`)
      .expect(200);
    expect(ownerResponse.body).toMatchObject({
      id,
      name: "Private plan",
      user_id: 1,
    });
    expect(typeof ownerResponse.body.plan).toBe("string");

    await userB.agent.get(`/api/mesocycles/${id}`).expect(404);

    const crossUserUpdate = await csrfRequest(
      userB.agent,
      "put",
      `/api/mesocycles/${id}`
    )
      .send({
        name: "Stolen plan",
        weeks: 1,
        daysPerWeek: 1,
        plan: makePlan(false),
        isCurrent: true,
        completedDate: null,
      })
      .expect(200);

    expect(crossUserUpdate.body.changes).toBe(0);
  });

  it("does not treat legacy NULL-owned mesocycles as shared data", async () => {
    const userA = await createAuthenticatedUser(app, db, { username: "alice" });
    const userB = await createAuthenticatedUser(app, db, { username: "bob" });
    const result = await db.run(
      `INSERT INTO mesocycles
        (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Unowned legacy plan", 1, 1, JSON.stringify(makePlan(false)), null, null, 0]
    );

    await userA.agent.get(`/api/mesocycles/${result.lastID}`).expect(404);
    await userB.agent.get(`/api/mesocycles/${result.lastID}`).expect(404);
  });

  it("rejects oversized dropsets before persistence or workout processing", async () => {
    const { agent, userId } = await createAuthenticatedUser(app, db, {
      username: "alice",
    });
    const maliciousPlan = makeDropsetPlan(100_000_000);

    await csrfRequest(agent, "post", "/api/mesocycles")
      .send({
        name: "Oversized dropset",
        weeks: 1,
        daysPerWeek: 1,
        plan: maliciousPlan,
        isCurrent: true,
      })
      .expect(400, { error: "Invalid plan data" });

    expect(
      await db.all("SELECT id FROM mesocycles WHERE user_id = ?", [userId])
    ).toEqual([]);

    await db.run(
      `INSERT INTO mesocycles
        (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Legacy oversized dropset", 1, 1, JSON.stringify(maliciousPlan), userId, null, 1]
    );

    await agent
      .get("/api/current-workout?includePersonalRecords=false")
      .expect(500, { error: "Invalid plan data" });
  });

  it("derives completedDate from persisted completion state", async () => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "alice",
    });
    const forgedCreateDate = "2000-01-01T00:00:00.000Z";
    const { id } = await createMesocycle(agent, {
      name: "Already complete",
      plan: makePlan(true),
      completedDate: forgedCreateDate,
    });
    const createdRow = await db.get(
      "SELECT completedDate FROM mesocycles WHERE id = ?",
      [id]
    );

    expect(createdRow.completedDate).not.toBe(forgedCreateDate);
    expect(Number.isNaN(Date.parse(createdRow.completedDate))).toBe(false);

    await updateMesocycle(agent, id, makePlan(false), {
      completedDate: "2099-01-01T00:00:00.000Z",
    });
    const reopenedRow = await db.get(
      "SELECT completedDate FROM mesocycles WHERE id = ?",
      [id]
    );
    expect(reopenedRow.completedDate).toBeNull();

    const recompleted = await updateMesocycle(agent, id, makePlan(true), {
      completedDate: "1999-01-01T00:00:00.000Z",
    });
    expect(recompleted.body.mesocycle.completedDate).not.toBe(
      "1999-01-01T00:00:00.000Z"
    );
    expect(Number.isNaN(Date.parse(recompleted.body.mesocycle.completedDate)))
      .toBe(false);
  });

  it("enforces the configured per-user mesocycle count limit", async () => {
    const limitedApp = await loadAppWithQuery(db.query, "test-secret", {
      MAX_MESOCYCLES_PER_USER: "2",
    });
    const { agent, userId } = await createAuthenticatedUser(limitedApp, db, {
      username: "limited@example.com",
    });

    await createMesocycle(agent, { name: "First plan" });
    await createMesocycle(agent, { name: "Second plan" });
    await csrfRequest(agent, "post", "/api/mesocycles")
      .send({
        name: "Third plan",
        weeks: 1,
        daysPerWeek: 1,
        plan: makePlan(false),
        isCurrent: true,
      })
      .expect(422, { error: "Mesocycle limit reached" });

    const rows = await db.all(
      "SELECT name, isCurrent FROM mesocycles WHERE user_id = ? ORDER BY id",
      [userId]
    );
    expect(rows).toEqual([
      { name: "First plan", isCurrent: 0 },
      { name: "Second plan", isCurrent: 1 },
    ]);
  });

  it("sets completedDate when all sets are completed during update", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });
    const { id } = await createMesocycle(agent, { name: "Plan to finish" });

    const response = await csrfRequest(
      agent,
      "put",
      `/api/mesocycles/${id}`
    )
      .send({
        name: "Finished plan",
        weeks: 1,
        daysPerWeek: 1,
        plan: makePlan(true),
        isCurrent: true,
        completedDate: null,
      })
      .expect(200);

    expect(Object.keys(response.body).sort()).toEqual(
      ["changes", "mesocycle", "message", "personalRecordHistory"].sort()
    );
    expect(response.body).toMatchObject({
      changes: 1,
      message: "Mesocycle updated successfully",
      mesocycle: {
        id,
        name: "Finished plan",
        isCurrent: true,
        completedDate: expect.any(String),
        plan: expect.any(Array),
      },
      personalRecordHistory: expect.any(Array),
    });

    const returnedDay = response.body.mesocycle.plan[0];
    expect(returnedDay.startedAt).toEqual(expect.any(String));
    expect(returnedDay.completedAt).toEqual(expect.any(String));
    expect(returnedDay.startedAt).toBe(returnedDay.completedAt);

    // noinspection SqlNoDataSourceInspection
    const row = await db.get("SELECT * FROM mesocycles WHERE id = ?", [id]);
    expect(row.completedDate).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(row.completedDate))).toBe(false);
    expect(JSON.parse(row.plan)).toEqual(response.body.mesocycle.plan);
  });

  it("manages workout-day timestamps across completion and corrections", async () => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "alice",
    });
    const { id } = await createMesocycle(agent, {
      name: "Timestamp plan",
      plan: [makeWorkoutDay()],
    });

    const partialResponse = await updateMesocycle(agent, id, [
      makeWorkoutDay({ completedSets: [true, false] }),
    ]);
    const partiallyCompletedDay = partialResponse.body.mesocycle.plan[0];

    expect(partiallyCompletedDay.startedAt).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(partiallyCompletedDay.startedAt))).toBe(false);
    expect(partiallyCompletedDay).not.toHaveProperty("completedAt");

    const preservedStartedAt = "2024-01-02T10:00:00.000Z";
    const partialRow = await db.get(
      "SELECT plan FROM mesocycles WHERE id = ?",
      [id]
    );
    const storedPartialPlan = JSON.parse(partialRow.plan);
    storedPartialPlan[0].startedAt = preservedStartedAt;
    await db.run("UPDATE mesocycles SET plan = ? WHERE id = ?", [
      JSON.stringify(storedPartialPlan),
      id,
    ]);

    const correctedPartialResponse = await updateMesocycle(agent, id, [
      makeWorkoutDay({
        completedSets: [true, false],
        reps: ["9", "10"],
      }),
    ]);
    expect(correctedPartialResponse.body.mesocycle.plan[0]).toMatchObject({
      startedAt: preservedStartedAt,
    });
    expect(
      correctedPartialResponse.body.mesocycle.plan[0]
    ).not.toHaveProperty("completedAt");

    const completedResponse = await updateMesocycle(agent, id, [
      makeWorkoutDay({
        completedSets: [true, true],
        reps: ["9", "10"],
      }),
    ]);
    const completedDay = completedResponse.body.mesocycle.plan[0];
    expect(completedDay.startedAt).toBe(preservedStartedAt);
    expect(completedDay.completedAt).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(completedDay.completedAt))).toBe(false);

    const preservedCompletedAt = "2024-01-02T11:00:00.000Z";
    const completedRow = await db.get(
      "SELECT plan FROM mesocycles WHERE id = ?",
      [id]
    );
    const storedCompletedPlan = JSON.parse(completedRow.plan);
    storedCompletedPlan[0].completedAt = preservedCompletedAt;
    await db.run("UPDATE mesocycles SET plan = ? WHERE id = ?", [
      JSON.stringify(storedCompletedPlan),
      id,
    ]);

    const correctedCompleteResponse = await updateMesocycle(agent, id, [
      makeWorkoutDay({
        completedSets: [true, true],
        reps: ["9", "11"],
      }),
    ]);
    expect(correctedCompleteResponse.body.mesocycle.plan[0]).toMatchObject({
      startedAt: preservedStartedAt,
      completedAt: preservedCompletedAt,
    });

    const reopenedResponse = await updateMesocycle(agent, id, [
      makeWorkoutDay({
        completedSets: [true, false],
        reps: ["9", "11"],
      }),
    ]);
    const reopenedDay = reopenedResponse.body.mesocycle.plan[0];
    expect(reopenedDay.startedAt).toBe(preservedStartedAt);
    expect(reopenedDay).not.toHaveProperty("completedAt");

    const finalRow = await db.get("SELECT plan FROM mesocycles WHERE id = ?", [
      id,
    ]);
    expect(JSON.parse(finalRow.plan)[0]).toEqual(reopenedDay);
  });

  it("does not fabricate timestamps for an already completed legacy day", async () => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "alice",
    });
    const { id } = await createMesocycle(agent, { name: "Legacy plan" });
    const legacyPlan = [
      makeWorkoutDay({
        completedSets: [true, true],
        reps: ["8", "10"],
      }),
    ];

    await db.run("UPDATE mesocycles SET plan = ? WHERE id = ?", [
      JSON.stringify(legacyPlan),
      id,
    ]);

    const response = await updateMesocycle(agent, id, legacyPlan);
    const returnedDay = response.body.mesocycle.plan[0];

    expect(returnedDay).not.toHaveProperty("startedAt");
    expect(returnedDay).not.toHaveProperty("completedAt");

    const row = await db.get("SELECT plan FROM mesocycles WHERE id = ?", [id]);
    expect(JSON.parse(row.plan)[0]).not.toHaveProperty("startedAt");
    expect(JSON.parse(row.plan)[0]).not.toHaveProperty("completedAt");
  });

  it("strips transient personal-record data on create and update", async () => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "alice",
    });
    const transientPlan = [
      makeWorkoutDay({
        completedSets: [false, false],
        transientRecords: true,
      }),
    ];
    const { id } = await createMesocycle(agent, { plan: transientPlan });

    const createdRow = await db.get(
      "SELECT plan FROM mesocycles WHERE id = ?",
      [id]
    );
    expect(
      JSON.parse(createdRow.plan)[0].exercises[0]
    ).not.toHaveProperty("personalRecordsByWeight");

    const response = await updateMesocycle(agent, id, [
      makeWorkoutDay({
        completedSets: [true, false],
        transientRecords: true,
      }),
    ]);
    expect(
      response.body.mesocycle.plan[0].exercises[0]
    ).not.toHaveProperty("personalRecordsByWeight");

    const updatedRow = await db.get(
      "SELECT plan FROM mesocycles WHERE id = ?",
      [id]
    );
    expect(
      JSON.parse(updatedRow.plan)[0].exercises[0]
    ).not.toHaveProperty("personalRecordsByWeight");
  });

  it("keeps progression mode and weight increment independent during updates", async () => {
    const { agent } = await createAuthenticatedUser(app, db, { username: "alice" });
    const { id } = await createMesocycle(agent, {
      name: "Settings plan",
      weeks: 1,
      plan: [
        {
          label: "Week 1",
          exercises: [
            {
              exercise: "Bench Press",
              type: "barbell",
              progressionMode: "reps",
              weightIncrement: 5,
              sets: [
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
      ],
    });

    await csrfRequest(agent, "put", `/api/mesocycles/${id}`)
      .send({
        name: "Settings plan",
        weeks: 1,
        daysPerWeek: 1,
        plan: [
          {
            label: "Week 1",
            exercises: [
              {
                exercise: "Bench Press",
                type: "barbell",
                progressionMode: "weight",
                weightIncrement: 5,
                sets: [
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
        ],
        isCurrent: true,
        completedDate: null,
      })
      .expect(200);

    // noinspection SqlNoDataSourceInspection
    const updatedRow = await db.get("SELECT plan FROM mesocycles WHERE id = ?", [id]);
    const updatedPlan = JSON.parse(updatedRow.plan);
    expect(updatedPlan[0].exercises[0]).toMatchObject({
      progressionMode: "weight",
      weightIncrement: 5,
    });

    await csrfRequest(agent, "put", `/api/mesocycles/${id}`)
      .send({
        name: "Settings plan",
        weeks: 1,
        daysPerWeek: 1,
        plan: [
          {
            label: "Week 1",
            exercises: [
              {
                exercise: "Bench Press",
                type: "barbell",
                progressionMode: "weight",
                weightIncrement: 2.5,
                sets: [
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
        ],
        isCurrent: true,
        completedDate: null,
      })
      .expect(200);

    // noinspection SqlNoDataSourceInspection
    const reupdatedRow = await db.get("SELECT plan FROM mesocycles WHERE id = ?", [id]);
    const reupdatedPlan = JSON.parse(reupdatedRow.plan);
    expect(reupdatedPlan[0].exercises[0]).toMatchObject({
      progressionMode: "weight",
      weightIncrement: 2.5,
    });
  });
});
