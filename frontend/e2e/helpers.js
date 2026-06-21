import { expect } from "@playwright/test";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const backendDir = path.join(repoRoot, "backend");

export const demoUser = {
  username: "demo@example.com",
  password: "demo1234",
};

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
  await page.goto("/login");
  await page.getByTestId("login-username").fill(demoUser.username);
  await page.getByTestId("login-password").fill(demoUser.password);
  await Promise.all([
    page.waitForURL("**/templates"),
    page.getByTestId("login-submit").click(),
  ]);
  await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible();
}
