import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

test("demo user can access authenticated pages with an app cookie", async ({ page }) => {
  await loginAsDemoUser(page);
  await expect(page).toHaveURL(/\/templates$/);
});
