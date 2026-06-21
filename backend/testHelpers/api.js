import request from "supertest";

export async function registerAndLogin(
  app,
  username = `user-${Date.now()}-${Math.random()}`,
  password = "password123"
) {
  const agent = request.agent(app);

  await agent.post("/api/register").send({ username, password }).expect(201);
  const loginResponse = await agent
    .post("/api/login")
    .send({ username, password })
    .expect(200);

  return {
    agent,
    username,
    password,
    token: loginResponse.body.token,
  };
}

export async function getCsrfToken(agent) {
  const response = await agent.get("/csrf-token").expect(200);
  return response.body.csrfToken;
}
