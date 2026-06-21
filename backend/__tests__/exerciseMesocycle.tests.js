import { jest } from "@jest/globals";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { registerAndLogin } from "../testHelpers/api.js";

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

  const response = await agent.post("/api/mesocycles").send(body).expect(201);
  return { id: response.body.mesocycleId, body, response };
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

  it("creates and lists exercises only for the authenticated user", async () => {
    const userA = await registerAndLogin(app, "alice");
    const userB = await registerAndLogin(app, "bob");

    await userA.agent
      .post("/api/exercises")
      .send({
        name: "Alice Bench",
        type: "barbell",
        muscleGroup: "Chest",
        videolink: "https://example.com/alice",
      })
      .expect(201);

    await userB.agent
      .post("/api/exercises")
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

  it("creates mesocycles, marks the newest one current, and parses list responses", async () => {
    const { agent } = await registerAndLogin(app, "alice");

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

  it("keeps private mesocycles scoped to their owner", async () => {
    const userA = await registerAndLogin(app, "alice");
    const userB = await registerAndLogin(app, "bob");
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

    const crossUserUpdate = await userB.agent
      .put(`/api/mesocycles/${id}`)
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

  it("sets completedDate when all sets are completed during update", async () => {
    const { agent } = await registerAndLogin(app, "alice");
    const { id } = await createMesocycle(agent, { name: "Plan to finish" });

    const response = await agent
      .put(`/api/mesocycles/${id}`)
      .send({
        name: "Finished plan",
        weeks: 1,
        daysPerWeek: 1,
        plan: makePlan(true),
        isCurrent: true,
        completedDate: null,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      changes: 1,
      message: "Mesocycle updated successfully",
    });

    // noinspection SqlNoDataSourceInspection
    const row = await db.get("SELECT * FROM mesocycles WHERE id = ?", [id]);
    expect(row.completedDate).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(row.completedDate))).toBe(false);
  });

  it("keeps progression mode and weight increment independent during updates", async () => {
    const { agent } = await registerAndLogin(app, "alice");
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

    await agent
      .put(`/api/mesocycles/${id}`)
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

    await agent
      .put(`/api/mesocycles/${id}`)
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
