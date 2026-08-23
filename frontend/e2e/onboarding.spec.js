import { expect, test } from "@playwright/test";
import {
  loginAsDemoUser,
  resetDemoOnboarding,
  resetE2eDatabase,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetE2eDatabase();
  await loginAsDemoUser(page);
  await resetDemoOnboarding();
});

test("@responsive new user can log a first week and open week 2", async ({ page }) => {
  let draftSaveCount = 0;
  page.on("request", (request) => {
    if (request.method() === "PUT" && request.url().endsWith("/api/onboarding/draft")) {
      draftSaveCount += 1;
    }
  });
  await page.goto("/currentworkout");
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("progressbar", { name: "1 of 4 onboarding steps complete" })).toBeVisible();
  await expect(page.getByText("Step 2 of 4")).toBeVisible();

  const initialAutosave = page.waitForResponse((response) =>
    response.request().method() === "PUT" && response.url().endsWith("/api/onboarding/draft")
  );
  await page.getByRole("button", { name: "Yes, I have a plan" }).click();
  await expect(page.getByText("Use the plan you already have")).toBeVisible();
  await page.getByRole("button", { name: "Log it as I train" }).click();
  await expect(page.getByRole("heading", { name: "What exercise are you doing first?" })).toBeVisible();
  await initialAutosave;
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  const settledSaveCount = draftSaveCount;
  await page.waitForTimeout(1_000);
  expect(draftSaveCount).toBe(settledSaveCount);
  await page.getByRole("textbox", { name: "Exercise" }).fill("High Bar Squat");
  await page.getByRole("button", { name: /High Bar Squat/ }).click();

  await page.getByRole("button", { name: "Add exercise" }).click();
  await expect(page.getByRole("heading", { name: "Add another exercise" })).toBeVisible();
  await page.getByRole("textbox", { name: "Exercise" }).fill("Tempo Goblet Squat");
  await expect(page.getByText(/Can’t find the right exercise/)).toBeVisible();
  await page.getByRole("radio", { name: "Quads" }).check();
  await page.getByRole("radio", { name: "dumbbell" }).check();
  await page.getByRole("button", { name: "Add custom exercise" }).click();

  await expect(page.getByLabel("Weight").first()).toBeEditable();
  await page.getByRole("button", { name: "Configure dropset" }).first().click();
  await page.getByTestId("dropset-start-weight").selectOption("100");
  await page.getByTestId("dropset-set-count").selectOption("3");
  await expect(page.getByTestId("dropset-preview")).toContainText("100 / 80 / 65");
  await page.getByTestId("dropset-save").click();
  await expect(page.getByText(/20% drops · 3 sets/)).toBeVisible();
  await expect(page.getByText("Each row is a real dropset. Enter the reps you perform and mark every row Done.")).toBeVisible();
  await expect(page.getByLabel("Weight")).toHaveCount(4);
  await page.getByLabel("Done").nth(1).click();
  await expect(page.getByText("Enter Weight and Reps from 1 to 30 before marking this set Done.")).toBeVisible();
  await expect(page.getByLabel("Done").nth(1)).not.toBeChecked();
  for (let setIndex = 0; setIndex < 3; setIndex += 1) {
    await page.getByLabel("Reps").nth(setIndex).fill(String(5 + setIndex));
    await page.getByLabel("Done").nth(setIndex).check();
  }
  await page.getByLabel(/Note/).first().fill("Superset with Tempo Goblet Squat");
  await page.getByLabel("Weight").nth(3).fill("24");
  await page.getByLabel("Reps").nth(3).fill("10");
  await page.getByLabel("Done").nth(3).check();
  await page.getByRole("button", { name: "Finish training day" }).click();
  await page.getByRole("button", { name: "Finish first week" }).click();

  await expect(page.getByRole("heading", { name: "Turn your logs into a training block." })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "2 of 4 onboarding steps complete" })).toBeVisible();
  await page.getByLabel("Number of weeks").selectOption("7");
  await page.getByRole("button", { name: "Search replacement" }).first().click();
  await page.getByRole("textbox", { name: "Exercise" }).fill("Tempo Goblet Squat");
  await page.getByRole("button", { name: /Tempo Goblet Squat/ }).click();
  await Promise.all([
    page.waitForURL("**/currentworkout"),
    page.getByRole("button", { name: "Activate plan and start week 2" }).click(),
  ]);

  await expect(page.getByTestId("current-workout-title")).toContainText("My first training block");
  await expect(page.getByText("Week 2", { exact: false }).first()).toBeVisible();
  await expect(page.getByTestId("workout-exercise-0")).toContainText("Tempo Goblet Squat");
  await expect(page.getByRole("heading", { name: "You can rename your block at any time." })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "3 of 4 onboarding steps complete" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Rename training block" })).toHaveAttribute("aria-describedby", "current-workout-tour-description");
  await page.getByRole("button", { name: "Next: navigation" }).click();
  await expect(page.getByRole("heading", { name: "The navbar is always at the top." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("button", { name: "Next: workout calendar" }).click();
  await expect(page.getByRole("heading", { name: "Use the calendar to move between workouts." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open workout calendar" })).toHaveAttribute("aria-describedby", "current-workout-tour-description");
  await page.getByRole("button", { name: "Next: workout targets" }).click();
  await expect(page.getByRole("heading", { name: "These values are your targets for today." })).toBeVisible();
  await expect(page.getByLabel("Set 1 weight").first()).toHaveAttribute("aria-describedby", "current-workout-tour-description");
  await expect(page.getByLabel("Set 1 reps").first()).toHaveAttribute("aria-describedby", "current-workout-tour-description");
  await page.getByRole("button", { name: "Next: workout symbols" }).click();
  await expect(page.getByRole("heading", { name: "These symbols compare the set with its target." })).toBeVisible();
  await expect(page.getByText("Bullseye", { exact: true })).toBeVisible();
  await expect(page.getByText("Arrow up", { exact: true })).toBeVisible();
  await expect(page.getByText("Arrow down", { exact: true })).toBeVisible();
  await expect(page.getByText("Trophy", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next: exercise options" }).click();
  await expect(page.getByRole("heading", { name: "Exercise tools are behind these dots." })).toBeVisible();
  await expect(page.getByTestId("exercise-menu-0")).toHaveAttribute("aria-describedby", "current-workout-tour-description");
  await page.getByRole("button", { name: "Next: set options" }).click();
  await expect(page.getByRole("heading", { name: "Each set has its own menu too." })).toBeVisible();
  await expect(page.getByTestId("set-menu-0-0")).toHaveAttribute("aria-describedby", "current-workout-tour-description");
  await page.getByRole("button", { name: "Finish onboarding" }).click();
  await expect(page.getByRole("progressbar", { name: "4 of 4 onboarding steps complete" })).toBeVisible();
  await page.getByRole("button", { name: "Start workout" }).click();
  await expect(page.getByRole("heading", { name: "You’re ready to train." })).not.toBeVisible();
});

test("@responsive user without a plan is sent to templates", async ({ page }) => {
  await page.goto("/currentworkout");
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("heading", { name: "Do you already have a training plan?" })).toBeVisible();
  await page.getByRole("button", { name: "No, I need a plan" }).click();
  await expect(page.getByText("Start from a proven structure")).toBeVisible();
  await page.getByRole("button", { name: "Choose a template" }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "1 of 4 onboarding steps complete" })).toBeVisible();
  await page.getByRole("button", { name: "Back to setup" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByText("Start from a proven structure")).toBeVisible();
  await expect(page.getByRole("button", { name: "No, I need a plan" })).toHaveAttribute("aria-pressed", "true");
});

test("@responsive template onboarding shows Current Workout tips after save", async ({ page }) => {
  await page.goto("/currentworkout");
  await page.evaluate(() => {
    localStorage.setItem("current-workout-onboarding-tour-1", "completed");
  });
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("button", { name: "No, I need a plan" }).click();
  await page.getByRole("button", { name: "Choose a template" }).click();
  await page.getByTestId("template-card-0").getByRole("button").click();
  await page.getByRole("button", { name: "PLAN A NEW TRAINING BLOCK" }).click();
  await expect(page).toHaveURL(/\/mesocycles-new$/);
  await expect(page.getByRole("progressbar", { name: "2 of 4 onboarding steps complete" })).toBeVisible();

  await page.getByTestId("training-block-name").fill("Template onboarding block");
  await page.getByTestId("training-block-weeks").selectOption("4");
  await page.getByTestId("training-block-details-save").click();

  await expect(page.getByRole("heading", { name: "Choose an exercise for every slot." })).toBeVisible();
  await expect(page.getByTestId("save-training-plan")).toBeDisabled();
  await expect(page.getByText(/Save Plan unlocks after every day/)).toBeVisible();
  await page.getByRole("button", { name: "Show next missing choice" }).click();
  await expect(page.getByTestId("exercise-0-0")).toBeFocused();
  await page.getByTestId("exercise-0-0").selectOption({ index: 1 });
  await expect(page.getByTestId("exercise-0-0")).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByTestId("save-training-plan")).toBeDisabled();
  await page.getByTestId("autofill-exercises").click();
  await expect(page.getByRole("heading", { name: "Your plan is ready to save." })).toBeVisible();
  await expect(page.getByTestId("save-training-plan")).toBeEnabled();

  await Promise.all([
    page.waitForURL("**/currentworkout"),
    page.getByTestId("save-training-plan").click(),
  ]);
  await expect(page.getByTestId("current-workout-title")).toContainText("Template onboarding block");
  await expect(page.getByRole("heading", { name: "You can rename your block at any time." })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "3 of 4 onboarding steps complete" })).toBeVisible();
});

test("@responsive Guided setup restarts at the plan choice", async ({ page }) => {
  await page.goto("/currentworkout");
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("button", { name: "Skip for now" }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await page.getByRole("button", { name: "Guided setup" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("heading", { name: "Do you already have a training plan?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Yes, I have a plan" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "No, I need a plan" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("progressbar", { name: "1 of 4 onboarding steps complete" })).toBeVisible();
});
