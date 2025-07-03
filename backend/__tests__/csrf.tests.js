import { jest } from "@jest/globals";
import request from "supertest";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { getCsrfToken, registerAndLogin } from "../testHelpers/api.js";

describe("CSRF current behavior regression", () => {
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
    await request(app).get("/csrf-token").expect(401, "Access Denied");

    const { agent } = await registerAndLogin(app, "csrfuser");
    const csrfToken = await getCsrfToken(agent);

    expect(csrfToken).toEqual(expect.any(String));
  });

  it("rejects CSRF-protected delete requests without a token", async () => {
    const { agent, username } = await registerAndLogin(app, "csrfuser");

    await agent.delete(`/api/users/${username}`).expect(403);
  });

  it("accepts CSRF-protected delete requests with the issued token", async () => {
    const { agent, username } = await registerAndLogin(app, "csrfuser");
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .delete(`/api/users/${username}`)
      .set("X-CSRF-Token", csrfToken)
      .expect(200);

    expect(response.body).toEqual({});
  });

  it("documents that exercise creation is currently auth-only and not CSRF-protected", async () => {
    const { agent } = await registerAndLogin(app, "exerciseuser");

    const response = await agent
      .post("/api/exercises")
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
