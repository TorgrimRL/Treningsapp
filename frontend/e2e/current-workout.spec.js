import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

test("logged-in user can open current workout and log a set", async ({ page }) => {
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  await expect(page.getByTestId("current-workout-title")).toContainText(
    "Demo Current Block"
  );

  const firstSet = page.getByTestId("workout-set-0-0");
  await expect(firstSet.getByTestId("set-log-checkbox")).not.toBeChecked();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    firstSet.getByTestId("set-log-checkbox").check(),
  ]);

  await page.reload();
  await expect(page.getByTestId("current-workout-title")).toContainText(
    "Demo Current Block"
  );
  await expect(
    page.getByTestId("workout-set-0-0").getByTestId("set-log-checkbox")
  ).toBeChecked();
});


test("changing exercise updates the muscle group display", async ({ page }) => {
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  const firstExercise = page.getByTestId("workout-exercise-0");
  await expect(firstExercise).toContainText("Paused Bench Press");
  await expect(firstExercise).toContainText("Chest");

  await page.getByTestId("exercise-menu-0").click();
  await firstExercise.getByTestId("change-exercise-0").click();
  await page
    .getByTestId("choose-exercise-muscle-group")
    .selectOption("Side Delts");
  await expect(page.getByTestId("choose-exercise-name")).toContainText(
    "Cable Lateral Raise"
  );
  await page
    .getByTestId("choose-exercise-name")
    .selectOption("Cable Lateral Raise");

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    page.getByTestId("choose-exercise-save").click(),
  ]);

  await expect(firstExercise).toContainText("Cable Lateral Raise");
  await expect(firstExercise).toContainText("Side Delts");

  await page.reload();
  const reloadedFirstExercise = page.getByTestId("workout-exercise-0");
  await expect(reloadedFirstExercise).toContainText("Cable Lateral Raise");
  await expect(reloadedFirstExercise).toContainText("Side Delts");
});
