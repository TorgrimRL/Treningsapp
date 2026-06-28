import { jest } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { registerAndLogin } from "../testHelpers/api.js";
import { upsertAuth0User } from "../utils/auth0Users.js";

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

  it("registers a new user with a hashed password and rejects duplicates", async () => {
    const response = await request(app)
      .post("/api/register")
      .send({ username: "newuser", password: "newpassword" })
      .expect(201);

    expect(response.body).toEqual({ message: "User registered" });

    // noinspection SqlNoDataSourceInspection
    const storedUser = await db.get("SELECT * FROM users WHERE username = ?", [
      "newuser",
    ]);
    expect(storedUser.password).not.toBe("newpassword");
    expect(storedUser.auth_provider).toBe("local");
    expect(storedUser.auth0_sub).toBeNull();
    await expect(
      bcrypt.compare("newpassword", storedUser.password)
    ).resolves.toBe(true);

    const duplicate = await request(app)
      .post("/api/register")
      .send({ username: "newuser", password: "newpassword" })
      .expect(400);

    expect(duplicate.body).toEqual({ message: "Username already exists" });
  });

  it("logs in valid users, sets an httpOnly token cookie, and rejects bad credentials", async () => {
    await request(app)
      .post("/api/register")
      .send({ username: "newuser", password: "newpassword" })
      .expect(201);

    const login = await request(app)
      .post("/api/login")
      .send({ username: "newuser", password: "newpassword" })
      .expect(200);

    expect(login.body.token).toEqual(expect.any(String));
    expect(login.headers["set-cookie"].join("; ")).toEqual(
      expect.stringContaining("token=")
    );
    expect(login.headers["set-cookie"].join("; ")).toEqual(
      expect.stringContaining("HttpOnly")
    );

    await request(app)
      .post("/api/login")
      .send({ username: "newuser", password: "wrongpassword" })
      .expect(400, "Username or password is incorrect");

    await request(app)
      .post("/api/login")
      .send({ username: "missing", password: "newpassword" })
      .expect(400, "Username or password is incorrect");
  });

  it("checks auth using the current cookie-based middleware behavior", async () => {
    const { agent } = await registerAndLogin(app, "newuser", "newpassword");

    const authenticated = await agent.get("/api/check-auth").expect(200);
    expect(authenticated.body).toEqual({ isLoggedIn: true });

    const currentUser = await agent.get("/api/me").expect(200);
    expect(currentUser.body.user).toMatchObject({
      username: "newuser",
      authProvider: "local",
      auth0Sub: null,
      email: null,
      emailVerified: false,
      picture: null,
    });
    expect(currentUser.body.user).not.toHaveProperty("password");

    await request(app).get("/api/check-auth").expect(401, "Access Denied");

    await request(app)
      .get("/api/check-auth")
      .set("Cookie", "token=not-a-real-token")
      .expect(403, "Invalid Token");
  });

  it("logs out authenticated users and clears the token cookie", async () => {
    const { agent } = await registerAndLogin(app, "newuser", "newpassword");

    const response = await agent
      .post("/api/logout")
      .expect(200, "Logged out successfully");

    expect(response.headers["set-cookie"].join("; ")).toEqual(
      expect.stringContaining("token=;")
    );

    await request(app).post("/api/logout").expect(401, "Access Denied");
  });

  it("clears the legacy token from the Auth0 logout route when Auth0 is disabled", async () => {
    const { agent } = await registerAndLogin(app, "newuser", "newpassword");

    const response = await agent.get("/api/auth0/logout").expect(302);

    expect(response.headers.location).toBe("http://localhost:5173");
    expect(response.headers["set-cookie"].join("; ")).toEqual(
      expect.stringContaining("token=;")
    );
    await agent.get("/api/check-auth").expect(401, "Access Denied");
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

  it("links verified Auth0 email to an existing local user without breaking password login", async () => {
    await request(app)
      .post("/api/register")
      .send({ username: "alice@example.com", password: "newpassword" })
      .expect(201);

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

    await request(app)
      .post("/api/login")
      .send({ username: "alice@example.com", password: "newpassword" })
      .expect(200);
  });
});
