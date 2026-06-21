import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

test("logged-in user can create a training plan", async ({ page }) => {
  await loginAsDemoUser(page);
  await page.goto("/mesocycles-new");

  await page.getByTestId("training-block-name").fill("E2E Training Block");
  await page.getByTestId("training-block-weeks").selectOption("4");
  await page.getByTestId("training-block-details-save").click();

  await page.getByTestId("day-label-0").selectOption("Monday");
  await page.getByTestId("muscle-group-0-0").selectOption("Chest");
  await page.getByTestId("exercise-0-0").selectOption("Medium Grip Bench Press");
  await page.getByTestId("progression-mode-0-0").selectOption("percent");
  await page.getByTestId("weight-increment-0-0").selectOption("2.5");

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/mesocycles") &&
        response.request().method() === "POST" &&
        response.status() === 201
    ),
    page.waitForURL("**/currentworkout"),
    page.getByTestId("save-training-plan").click(),
  ]);

  await expect(page.getByTestId("current-workout-title")).toContainText(
    "E2E Training Block"
  );
});
