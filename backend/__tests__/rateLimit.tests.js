import { jest } from "@jest/globals";
import { createServer } from "node:http";
import request from "supertest";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";

const rateLimitResponse = {
  error: "Too many requests. Please try again in a minute.",
};

async function withTestClient(app, callback) {
  const server = createServer(app);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  try {
    await callback(request(server));
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

async function useAvailableRequests(client, forwardedFor) {
  let lastResponse;

  for (let requestNumber = 0; requestNumber < 300; requestNumber += 1) {
    const pendingRequest = client.get("/api/csrf-token");
    if (forwardedFor) {
      pendingRequest.set("X-Forwarded-For", forwardedFor);
    }
    lastResponse = await pendingRequest.expect(401, "Access Denied");
  }

  return lastResponse;
}

async function useAvailableAuth0Requests(client) {
  let lastResponse;

  for (let requestNumber = 0; requestNumber < 300; requestNumber += 1) {
    lastResponse = await client.get("/api/auth0/me");
    expect([401, 503]).toContain(lastResponse.status);
  }

  return lastResponse;
}

describe("API rate limiting", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("limits API requests before authentication runs", async () => {
    const app = await loadAppWithQuery(jest.fn());

    await withTestClient(app, async (client) => {
      const finalAllowedResponse = await useAvailableRequests(client);
      expect(finalAllowedResponse.headers.ratelimit).toEqual(expect.any(String));

      const blockedResponse = await client.get("/api/csrf-token").expect(429);

      expect(blockedResponse.body).toEqual(rateLimitResponse);
      expect(blockedResponse.headers.ratelimit).toEqual(expect.any(String));
      expect(blockedResponse.headers["retry-after"]).toEqual(expect.any(String));
    });
  });

  it("limits Auth0 routes before their authorization handler runs", async () => {
    const app = await loadAppWithQuery(jest.fn());

    await withTestClient(app, async (client) => {
      const finalAllowedResponse = await useAvailableAuth0Requests(client);
      expect(finalAllowedResponse.headers.ratelimit).toEqual(expect.any(String));

      const blockedResponse = await client.get("/api/auth0/me").expect(429);

      expect(blockedResponse.body).toEqual(rateLimitResponse);
      expect(blockedResponse.headers.ratelimit).toEqual(expect.any(String));
      expect(blockedResponse.headers["retry-after"]).toEqual(expect.any(String));
    });
  });

  it(
    "keeps separate quotas for forwarded client IPs behind one trusted proxy",
    async () => {
      const app = await loadAppWithQuery(jest.fn(), "test-secret", {
        TRUST_PROXY: "1",
      });
      const firstClientIp = "203.0.113.10";
      const secondClientIp = "203.0.113.11";

      await withTestClient(app, async (client) => {
        await useAvailableRequests(client, firstClientIp);

        await client
          .get("/api/csrf-token")
          .set("X-Forwarded-For", firstClientIp)
          .expect(429, rateLimitResponse);

        await client
          .get("/api/csrf-token")
          .set("X-Forwarded-For", secondClientIp)
          .expect(401, "Access Denied");
      });
    },
    15000
  );

  it("rejects an invalid TRUST_PROXY setting during startup", async () => {
    await expect(
      loadAppWithQuery(jest.fn(), "test-secret", {
        TRUST_PROXY: "not-a-number",
      })
    ).rejects.toThrow("TRUST_PROXY must be a non-negative integer");
  });
});
