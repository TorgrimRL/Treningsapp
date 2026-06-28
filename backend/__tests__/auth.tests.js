import { jest } from "@jest/globals";
import request from "supertest";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { createAuthenticatedUser } from "../testHelpers/api.js";
import { upsertAuth0User } from "../utils/auth0Users.js";

function expectClearedTokenCookie(response) {
  expect(response.headers["set-cookie"].join("; ")).toEqual(
    expect.stringContaining("token=;")
  );
}

describe("auth regression", () => {
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

  it("does not expose legacy password auth routes", async () => {
    await request(app).post("/api/register").send({}).expect(404);
    await request(app).post("/api/login").send({}).expect(404);
    await request(app).post("/api/logout").expect(404);
    await request(app).get("/api/check-auth").expect(404);
  });

  it("returns logged-out JSON from /api/me without a cookie", async () => {
    const response = await request(app).get("/api/me").expect(401);

    expect(response.body).toEqual({ isLoggedIn: false, user: null });
  });

  it("returns the current local user from /api/me with a valid app cookie", async () => {
    const { agent, auth0Sub } = await createAuthenticatedUser(app, db, {
      username: "newuser@example.com",
      email: "newuser@example.com",
    });

    const response = await agent.get("/api/me").expect(200);

    expect(response.body).toEqual({
      isLoggedIn: true,
      user: expect.objectContaining({
        username: "newuser@example.com",
        authProvider: "auth0",
        auth0Sub,
        email: "newuser@example.com",
        emailVerified: true,
        picture: null,
      }),
    });
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("clears invalid app cookies on /api/me", async () => {
    const response = await request(app)
      .get("/api/me")
      .set("Cookie", "token=not-a-real-token")
      .expect(401);

    expect(response.body).toEqual({ isLoggedIn: false, user: null });
    expectClearedTokenCookie(response);
  });

  it("clears app cookies for deleted users on /api/me", async () => {
    const { agent, userId } = await createAuthenticatedUser(app, db, {
      username: "deleted@example.com",
    });
    await db.run("DELETE FROM users WHERE id = ?", [userId]);

    const response = await agent.get("/api/me").expect(401);

    expect(response.body).toEqual({ isLoggedIn: false, user: null });
    expectClearedTokenCookie(response);
  });

  it("clears the local app token from the Auth0 logout route when Auth0 is disabled", async () => {
    const { agent } = await createAuthenticatedUser(app, db, {
      username: "newuser@example.com",
    });

    const response = await agent.get("/api/auth0/logout").expect(302);

    expect(response.headers.location).toBe("http://localhost:5173");
    expectClearedTokenCookie(response);
    await agent.get("/api/me").expect(401);
  });

  it("creates and updates a local user for an Auth0 identity", async () => {
    const created = await upsertAuth0User(
      {
        sub: "auth0|user-1",
        email: "auth0@example.com",
        email_verified: true,
        picture: "https://example.com/avatar.png",
      },
      db.query
    );

    expect(created).toMatchObject({
      username: "auth0@example.com",
      auth_provider: "auth0",
      auth0_sub: "auth0|user-1",
      email: "auth0@example.com",
      email_verified: 1,
      picture: "https://example.com/avatar.png",
    });

    const updated = await upsertAuth0User(
      {
        sub: "auth0|user-1",
        email: "auth0@example.com",
        email_verified: true,
        picture: "https://example.com/updated.png",
      },
      db.query
    );

    expect(updated.id).toBe(created.id);
    expect(updated.picture).toBe("https://example.com/updated.png");

    const users = await db.all("SELECT * FROM users WHERE auth0_sub = ?", [
      "auth0|user-1",
    ]);
    expect(users).toHaveLength(1);
  });

  it("links verified Auth0 email to an existing local user", async () => {
    await db.run(
      `INSERT INTO users (username, password, auth_provider, email, email_verified)
       VALUES (?, ?, ?, ?, ?)`,
      ["alice@example.com", "legacy-hash", "local", null, 0]
    );
    const existingUser = await db.get("SELECT * FROM users WHERE username = ?", [
      "alice@example.com",
    ]);

    const linkedUser = await upsertAuth0User(
      {
        sub: "auth0|alice",
        email: "alice@example.com",
        email_verified: true,
      },
      db.query
    );

    expect(linkedUser.id).toBe(existingUser.id);
    expect(linkedUser.auth_provider).toBe("local_auth0");
    expect(linkedUser.auth0_sub).toBe("auth0|alice");

    const storedUser = await db.get("SELECT * FROM users WHERE id = ?", [
      existingUser.id,
    ]);
    expect(storedUser.auth0_sub).toBe("auth0|alice");
  });

  it("does not link unverified Auth0 email to an existing local user", async () => {
    await db.run(
      `INSERT INTO users (username, password, auth_provider, email, email_verified)
       VALUES (?, ?, ?, ?, ?)`,
      ["alice@example.com", "legacy-hash", "local", null, 0]
    );
    const existingUser = await db.get("SELECT * FROM users WHERE username = ?", [
      "alice@example.com",
    ]);

    const auth0User = await upsertAuth0User(
      {
        sub: "auth0|unverified-alice",
        email: "alice@example.com",
        email_verified: false,
      },
      db.query
    );

    expect(auth0User.id).not.toBe(existingUser.id);
    expect(auth0User.username).toBe("alice@example.com-1");
    expect(auth0User.auth_provider).toBe("auth0");

    const storedExistingUser = await db.get("SELECT * FROM users WHERE id = ?", [
      existingUser.id,
    ]);
    expect(storedExistingUser.auth0_sub).toBeNull();
  });
});
