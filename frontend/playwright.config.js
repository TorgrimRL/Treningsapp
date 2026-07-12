import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5174",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command:
        "cd ../backend && DB_MODE=local LOCAL_DB_PATH=database.e2e.sqlite node scripts/seedLocalDb.js && DB_MODE=local LOCAL_DB_PATH=database.e2e.sqlite JWT_SECRET_KEY=e2e-secret PORT=3001 node index.js",
      url: "http://127.0.0.1:3001/api/ping",
      timeout: 120_000,
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "VITE_API_URL=http://127.0.0.1:3001/api npm run dev:e2e",
      url: "http://127.0.0.1:5174/login",
      timeout: 120_000,
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
