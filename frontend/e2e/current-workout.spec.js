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

test("logging a bodyweight set keeps target reps when target weight is zero", async ({ page }) => {
  await loginAsDemoUser(page);

  await page.evaluate(async () => {
    const apiBase = "http://127.0.0.1:3001/api";
    const response = await fetch(apiBase + "/current-workout", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }

    const workout = await response.json();
    const dayIndex = workout.firstIncompleteDayIndex;
    workout.plan[dayIndex].exercises.push({
      exercise: "Pushup",
      type: "bodyweight",
      muscleGroup: "Chest",
      priority: "Chest",
      videoLink: "",
      sets: [
        {
          weight: 0,
          reps: 0,
          targetWeight: 0,
          targetReps: 11,
          completed: false,
        },
      ],
    });

    const updateResponse = await fetch(apiBase + "/mesocycles/" + workout.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(workout),
    });
    if (!updateResponse.ok) {
      throw new Error(await updateResponse.text());
    }
  });

  await page.goto("/currentworkout");

  const bodyweightExercise = page.getByTestId("workout-exercise-2");
  const bodyweightSet = page.getByTestId("workout-set-2-0");
  await expect(bodyweightExercise).toContainText("Pushup");
  await expect(bodyweightSet.getByTestId("set-weight-select")).toHaveValue("0");
  await expect(bodyweightSet.getByTestId("set-reps-select")).toHaveValue("11");

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    bodyweightSet.getByTestId("set-log-checkbox").check(),
  ]);

  await page.reload();
  const reloadedBodyweightSet = page.getByTestId("workout-set-2-0");
  await expect(
    reloadedBodyweightSet.getByTestId("set-log-checkbox")
  ).toBeChecked();
  await expect(
    reloadedBodyweightSet.getByTestId("set-weight-select")
  ).toHaveValue("0");
  await expect(
    reloadedBodyweightSet.getByTestId("set-reps-select")
  ).toHaveValue("11");
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

test("changing exercise can create and select a custom exercise", async ({ page }) => {
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  const firstExercise = page.getByTestId("workout-exercise-0");
  await page.getByTestId("exercise-menu-0").click();
  await firstExercise.getByTestId("change-exercise-0").click();
  await page.getByTestId("choose-exercise-add-custom").click();

  await page.locator("#custom-exercise-name").fill("E2E Custom Row");
  await page.locator("#custom-exercise-type").selectOption("dumbbell");
  await page.locator("#custom-exercise-muscle-group").selectOption("Back");
  await page
    .locator("#custom-exercise-video")
    .fill("https://example.com/custom-row");

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/exercises") &&
        response.request().method() === "POST" &&
        response.status() === 201
    ),
    page.getByTestId("custom-exercise-save").click(),
  ]);

  await expect(page.getByTestId("choose-exercise-muscle-group")).toHaveValue(
    "Back"
  );
  await expect(page.getByTestId("choose-exercise-name")).toHaveValue(
    "E2E Custom Row"
  );

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    page.getByTestId("choose-exercise-save").click(),
  ]);

  await expect(firstExercise).toContainText("E2E Custom Row");
  await expect(firstExercise).toContainText("Back");

  await page.reload();
  const reloadedFirstExercise = page.getByTestId("workout-exercise-0");
  await expect(reloadedFirstExercise).toContainText("E2E Custom Row");
  await expect(reloadedFirstExercise).toContainText("Back");
});
