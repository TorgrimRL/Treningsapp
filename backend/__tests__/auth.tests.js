import { jest } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createTestDb } from "../testHelpers/testDb.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";
import { registerAndLogin } from "../testHelpers/api.js";

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

    //noinspection SqlNoDataSourceInspection
    const storedUser = await db.get("SELECT * FROM users WHERE username = ?", [
      "newuser",
    ]);
    expect(storedUser.password).not.toBe("newpassword");
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
});
