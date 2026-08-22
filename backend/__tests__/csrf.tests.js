import { jest } from "@jest/globals";
import request from "supertest";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { createAuthenticatedUser } from "../testHelpers/api.js";

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
    ["delete", "/api/users/csrfuser"],
  ])("rejects %s %s without a CSRF token", async (method, path) => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "csrfuser",
    });

    await agent[method](path).send({}).expect(403, {
      error: "Invalid CSRF token",
    });
  });

  it("accepts CSRF-protected delete requests with the issued token", async () => {
    const { agent, username, csrfToken } = await createAuthenticatedUser(
      app,
      db,
      { username: "csrfuser" }
    );

    const response = await agent
      .delete(`/api/users/${username}`)
      .set("X-CSRF-Token", csrfToken)
      .expect(200);

    expect(response.body).toEqual({});
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
