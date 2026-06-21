import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

test("demo user can log in", async ({ page }) => {
  await loginAsDemoUser(page);
  await expect(page).toHaveURL(/\/templates$/);
});
