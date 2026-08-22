import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

function isRenameResponse(response, status) {
  return (
    /\/api\/mesocycles\/\d+\/name$/.test(response.url()) &&
    response.request().method() === "PATCH" &&
    response.status() === status
  );
}

test("@e2e user can rename a completed mesocycle from history", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  await page.goto("/mesocycles");

  const completedBlock = page
    .locator("[data-testid^=history-card-]")
    .filter({ hasText: "Completed Demo Block" });
  const completedBlockTestId = await completedBlock.getAttribute("data-testid");
  await completedBlock
    .getByRole("button", { name: "Open actions for Completed Demo Block" })
    .click();
  await completedBlock
    .getByRole("button", { name: "Rename Completed Demo Block" })
    .click();

  const dialog = page.getByRole("dialog", { name: "Rename training block" });
  const nameInput = dialog.getByLabel("Training block name");
  await expect(nameInput).toHaveValue("Completed Demo Block");
  await nameInput.fill("  Renamed Completed Block  ");

  await Promise.all([
    page.waitForResponse((response) => isRenameResponse(response, 200)),
    dialog.getByRole("button", { name: "Save" }).click(),
  ]);

  await expect(dialog).not.toBeVisible();
  await expect(page.getByTestId(completedBlockTestId)).toContainText(
    "Renamed Completed Block"
  );

  await page.reload();
  await expect(page.getByText("Renamed Completed Block", { exact: true })).toBeVisible();
});

test("@e2e user can rename the current mesocycle beside its title", async ({
  page,
}) => {
  const renamedBlock =
    "A deliberately long renamed training block that should truncate cleanly";

  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  const title = page.getByTestId("current-workout-title");
  const renameButton = page.getByTestId("rename-current-mesocycle");
  const buttonBox = await renameButton.boundingBox();
  const titleBox = await title.boundingBox();
  const iconBox = await renameButton.locator("svg").boundingBox();

  expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
  expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  expect(iconBox?.width).toBeLessThanOrEqual(16);
  expect((iconBox?.x || 0) - ((titleBox?.x || 0) + (titleBox?.width || 0))).toBeLessThanOrEqual(12);

  await renameButton.click();
  const dialog = page.getByRole("dialog", { name: "Rename training block" });
  await dialog.getByLabel("Training block name").fill(renamedBlock);

  await Promise.all([
    page.waitForResponse((response) => isRenameResponse(response, 200)),
    dialog.getByRole("button", { name: "Save" }).click(),
  ]);

  await expect(title).toHaveText(renamedBlock);
  await expect(title).toHaveAttribute("title", renamedBlock);
  await expect(title).toHaveClass(/truncate/);

  await page.reload();
  await expect(page.getByTestId("current-workout-title")).toHaveText(
    renamedBlock
  );
});

test("@e2e duplicate mesocycle names show an inline error", async ({ page }) => {
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  await page.getByTestId("rename-current-mesocycle").click();
  const dialog = page.getByRole("dialog", { name: "Rename training block" });
  await dialog.getByLabel("Training block name").fill("completed demo block");

  await Promise.all([
    page.waitForResponse((response) => isRenameResponse(response, 409)),
    dialog.getByRole("button", { name: "Save" }).click(),
  ]);

  await expect(dialog.getByRole("alert")).toHaveText(
    "Mesocycle name is already in use"
  );
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("current-workout-title")).toHaveText(
    "Demo Current Block"
  );
});
