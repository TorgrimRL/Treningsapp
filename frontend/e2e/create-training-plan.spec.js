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
  await page
    .getByTestId("exercise-0-0")
    .selectOption("Medium Grip Bench Press");
  await page.getByTestId("progression-mode-0-0").selectOption("percent");
  await page.getByTestId("weight-increment-0-0").selectOption("4.25");
  await page.getByTestId("minimum-weight-0-0").selectOption("13");

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

test("user can leave the planner while the details panel is open", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  await page.goto("/mesocycles-new");

  await expect(page.getByTestId("training-block-details-panel")).toBeVisible();
  await expect(page.getByTestId("training-block-name")).toBeVisible();
  await expect(page.getByTestId("training-block-details-save")).toBeDisabled();
  await expect(page.locator("#root")).not.toHaveAttribute(
    "aria-hidden",
    "true"
  );

  if (page.viewportSize().width < 768) {
    await page.getByTestId("navbar-menu-button").click();
  }

  await page.getByRole("link", { name: "Templates", exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible();

  await page.goto("/mesocycles-new");
  await expect(page.getByTestId("training-block-name")).toBeVisible();
  await page.getByTestId("training-block-details-cancel").click();
  await expect(page).toHaveURL(/\/templates$/);
});

test("redoing a mesocycle shows the chosen previous week values in week one", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  await page.goto("/mesocycles");

  const completedBlock = page
    .locator("[data-testid^=history-card-]")
    .filter({ hasText: "Completed Demo Block" });
  await completedBlock.locator("button").first().click();
  await page.getByRole("button", { name: "Redo Exercise Block" }).click();

  const redoDialog = page.getByRole("dialog", {
    name: "Redo Exerciseblock",
  });
  await redoDialog
    .getByLabel(/Use a previous done week to get target reps and weights/i)
    .check();
  await redoDialog.getByLabel(/Select week to use as target/i).selectOption("0");
  await redoDialog.getByRole("button", { name: "Save" }).click();

  await page.getByTestId("training-block-name").fill("Redo values block");
  await page.getByTestId("training-block-weeks").selectOption("4");
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/mesocycles") &&
        response.request().method() === "POST" &&
        response.status() === 201
    ),
    page.waitForURL("**/currentworkout"),
    page.getByTestId("training-block-details-save").click(),
  ]);

  const firstSet = page.getByTestId("workout-set-0-0");
  await expect(firstSet.getByTestId("set-weight-select")).toHaveValue("80");
  await expect(firstSet.getByTestId("set-reps-select")).toHaveValue("6");
});
