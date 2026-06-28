import { expect } from "@playwright/test";
import { execFile } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const backendDir = path.join(repoRoot, "backend");
const e2eJwtSecret = "e2e-secret";

export const demoUser = {
  id: 1,
  username: "demo@example.com",
  auth0Sub: "google-oauth2|demo-user",
};

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signE2eJwt(userId) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { id: userId, iat: now, exp: now + 60 * 60 };
  const unsignedToken = `${encodeJwtPart(header)}.${encodeJwtPart(payload)}`;
  const signature = crypto
    .createHmac("sha256", e2eJwtSecret)
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
}

export async function resetE2eDatabase() {
  await execFileAsync(process.execPath, ["scripts/seedLocalDb.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      DB_MODE: "local",
      LOCAL_DB_PATH: "database.e2e.sqlite",
    },
    timeout: 30_000,
  });
}

export async function loginAsDemoUser(page) {
  await page.context().addCookies([
    {
      name: "token",
      value: signE2eJwt(demoUser.id),
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/templates");
  await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible();
}
