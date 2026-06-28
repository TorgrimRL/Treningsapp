import request from "supertest";
import { signAuthToken } from "../utils/authCookies.js";

let authUserCounter = 0;

function nextAuth0Sub(username) {
  authUserCounter += 1;
  return `google-oauth2|test-${username}-${authUserCounter}`;
}

function addTokenCookie(agent, token) {
  const cookie = `token=${token}; Path=/; HttpOnly`;
  agent.jar.setCookies([cookie], "127.0.0.1", "/");
  agent.jar.setCookies([cookie], "localhost", "/");
}

export async function createAuthenticatedUser(
  app,
  db,
  {
    username = `user-${Date.now()}-${Math.random()}@example.com`,
    auth0Sub = nextAuth0Sub(username),
    email = username,
    emailVerified = true,
    picture = null,
  } = {}
) {
  const insertResult = await db.run(
    `INSERT INTO users
      (username, password, auth_provider, auth0_sub, email, email_verified, picture)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, null, "auth0", auth0Sub, email, emailVerified ? 1 : 0, picture]
  );
  const user = await db.get("SELECT * FROM users WHERE id = ?", [
    insertResult.lastID,
  ]);
  const token = signAuthToken(user.id);
  const agent = request.agent(app);
  addTokenCookie(agent, token);

  return {
    agent,
    user,
    userId: user.id,
    username,
    auth0Sub,
    token,
  };
}

export async function getCsrfToken(agent) {
  const response = await agent.get("/csrf-token").expect(200);
  return response.body.csrfToken;
}
