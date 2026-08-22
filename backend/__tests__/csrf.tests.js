import { jest } from "@jest/globals";
import request from "supertest";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import {
  createAuthenticatedUser,
  csrfRequest,
} from "../testHelpers/api.js";

describe("CSRF protection", () => {
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

  it("requires auth before issuing a CSRF token", async () => {
    await request(app).get("/api/csrf-token").expect(401, "Access Denied");

    const { csrfToken } = await createAuthenticatedUser(app, db, {
      username: "csrfuser",
    });

    expect(csrfToken).toEqual(expect.any(String));
  });

  it.each([
    ["post", "/api/exercises"],
    ["post", "/api/mesocycles"],
    ["put", "/api/mesocycles/1"],
    ["patch", "/api/mesocycles/1/name"],
    ["delete", "/api/users/me"],
    ["post", "/api/auth0/logout"],
  ])("rejects %s %s without a CSRF token", async (method, path) => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "csrfuser",
    });

    await agent[method](path).send({}).expect(403, {
      error: "Invalid CSRF token",
    });
  });

  it("accepts CSRF-protected delete requests with the issued token", async () => {
    const { agent, userId, csrfToken } = await createAuthenticatedUser(
      app,
      db,
      { username: "csrfuser" }
    );
    await db.run(
      `INSERT INTO exercises (name, type, muscleGroup, videolink, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      ["Bench Press", "barbell", "Chest", "", userId]
    );
    await db.run(
      `INSERT INTO mesocycles
        (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Owned plan", 1, 1, "[]", userId, null, 1]
    );

    const response = await agent
      .delete("/api/users/me")
      .set("X-CSRF-Token", csrfToken)
      .expect(200);

    expect(response.body).toEqual({});
    expect(response.headers["set-cookie"].join("; ")).toContain("token=;");
    expect(await db.get("SELECT id FROM users WHERE id = ?", [userId])).toBeUndefined();
    expect(await db.all("SELECT id FROM exercises WHERE user_id = ?", [userId])).toEqual([]);
    expect(await db.all("SELECT id FROM mesocycles WHERE user_id = ?", [userId])).toEqual([]);
    await agent.get("/api/me").expect(401);
  });

  it("cannot delete another account by supplying its username", async () => {
    const victim = await createAuthenticatedUser(app, db, {
      username: "victim@example.com",
    });
    const attacker = await createAuthenticatedUser(app, db, {
      username: "attacker@example.com",
    });

    await csrfRequest(
      attacker.agent,
      "delete",
      `/api/users/${encodeURIComponent(victim.username)}`
    ).expect(404);

    expect(await db.get("SELECT id FROM users WHERE id = ?", [victim.userId]))
      .toMatchObject({ id: victim.userId });
    expect(await db.get("SELECT id FROM users WHERE id = ?", [attacker.userId]))
      .toMatchObject({ id: attacker.userId });
  });

  it("accepts exercise creation with an issued CSRF token", async () => {
    const { agent, csrfToken } = await createAuthenticatedUser(app, db, {
      username: "exerciseuser",
    });

    const response = await agent
      .post("/api/exercises")
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "Bench Press",
        type: "barbell",
        muscleGroup: "Chest",
        videolink: "https://example.com/bench",
      })
      .expect(201);

    expect(response.body).toEqual({
      message: "Exercise created successfully",
      exerciseID: 1,
    });
  });
});
