import { jest } from "@jest/globals";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { registerAndLogin } from "../testHelpers/api.js";

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
    const { agent } = await registerAndLogin(app, "alice");

    const response = await agent.get("/api/current-workout").expect(404);

    expect(response.body).toEqual({ error: "Current workout not found" });
  });

  it("rejects invalid stored plan JSON", async () => {
    const { agent } = await registerAndLogin(app, "alice");
    // noinspection SqlNoDataSourceInspection
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      "alice",
    ]);

    // noinspection SqlNoDataSourceInspection
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
    const { agent } = await registerAndLogin(app, "alice");

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
});
