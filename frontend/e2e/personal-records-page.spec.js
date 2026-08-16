import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

const apiBase = "http://127.0.0.1:3001/api";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

function isApiRequest(request, pathname, method = "GET") {
  return (
    new URL(request.url()).pathname === `/api${pathname}` &&
    request.method() === method
  );
}

async function openPersonalRecords(page) {
  await loginAsDemoUser(page);
  await page.goto("/personal-records");
  await expect(
    page.getByRole("heading", { name: "Personal records", exact: true })
  ).toBeVisible();
}

function exerciseCard(page, exerciseName) {
  return page
    .getByTestId("personal-record-exercise-card")
    .filter({ hasText: exerciseName });
}

async function expectNoHorizontalOverflow(page, locator, label) {
  await expect(locator).toBeVisible();
  const metrics = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const offenders = [element, ...element.querySelectorAll("*")]
      .filter((candidate) => {
        const style = getComputedStyle(candidate);
        const candidateRect = candidate.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          candidateRect.width > 0 &&
          (candidateRect.left < -1 || candidateRect.right > viewportWidth + 1)
        );
      })
      .slice(0, 5)
      .map((candidate) => ({
        tag: candidate.tagName,
        testId: candidate.getAttribute("data-testid"),
        left: candidate.getBoundingClientRect().left,
        right: candidate.getBoundingClientRect().right,
      }));

    return {
      viewportWidth,
      left: rect.left,
      right: rect.right,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      offenders,
    };
  });

  expect(metrics.left, `${label} starts outside viewport`).toBeGreaterThanOrEqual(
    -1
  );
  expect(metrics.right, `${label} ends outside viewport`).toBeLessThanOrEqual(
    metrics.viewportWidth + 1
  );
  expect(
    metrics.scrollWidth,
    `${label} has horizontal overflow`
  ).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.offenders, `${label} has children outside viewport`).toEqual(
    []
  );
}

test("lists seeded exercises and supports search, muscle group, and date sorting", async ({
  page,
}) => {
  await openPersonalRecords(page);

  const cards = page.getByTestId("personal-record-exercise-card");
  await expect(cards).toHaveCount(12);
  await expect(page.getByTestId("personal-records-count")).toHaveText(
    "12 of 12 exercises"
  );

  const benchCard = exerciseCard(page, "Paused Bench Press");
  await expect(benchCard).toContainText("Chest");
  await expect(benchCard).toContainText("82.5 kg × 8 reps");
  await expect(benchCard).toContainText("2 weights · 6 milestones");
  await expect(
    benchCard.getByTestId("personal-record-exercise-last-pr")
  ).toContainText("2026");
  await expect(
    benchCard.getByTestId("personal-record-exercise-last-logged")
  ).toContainText("2026");

  await page.getByTestId("personal-records-search").fill("paused");
  await expect(cards).toHaveCount(1);
  await expect(cards).toContainText("Paused Bench Press");

  await page.getByTestId("personal-records-search").fill("");
  await page
    .getByTestId("personal-records-muscle-group-filter")
    .selectOption("Back");
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Chest Supported Row");
  await expect(cards.nth(1)).toContainText("Lat Pulldown");

  await page
    .getByTestId("personal-records-muscle-group-filter")
    .selectOption("all");
  await page.getByTestId("personal-records-sort").selectOption("muscle-group");
  await expect(
    cards.nth(1).getByTestId("personal-record-exercise-name")
  ).toHaveText("Chest Supported Row");

  await page.getByTestId("personal-records-sort").selectOption("last-logged");
  await expect(
    cards.nth(1).getByTestId("personal-record-exercise-name")
  ).toHaveText("Hack Squat");
});

test("exercise records load each selected workout once and reuse cached history", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const currentWorkoutResponse = page.waitForResponse(
    (response) =>
      isApiRequest(response.request(), "/current-workout") &&
      response.status() === 200
  );
  await page.goto("/currentworkout");
  await currentWorkoutResponse;
  await page.goto("/personal-records");

  let currentMesocycleGetCount = 0;
  let historicalMesocycleGetCount = 0;
  page.on("request", (request) => {
    if (isApiRequest(request, "/mesocycles/1")) {
      currentMesocycleGetCount += 1;
    }
    if (isApiRequest(request, "/mesocycles/2")) {
      historicalMesocycleGetCount += 1;
    }
  });

  await exerciseCard(page, "Paused Bench Press").click();
  const modal = page.getByRole("dialog", {
    name: "Personal records for Paused Bench Press",
  });
  await expect(modal).toBeVisible();
  const weightGroups = modal.getByTestId("personal-records-weight-group");
  await expect(weightGroups).toHaveCount(2);
  await expect(weightGroups.nth(0)).toHaveAttribute("data-weight", "82.5");
  await expect(weightGroups.nth(1)).toHaveAttribute("data-weight", "80");

  const currentWeightGroup = modal.locator(
    '[data-testid="personal-records-weight-group"][data-weight="82.5"]'
  );
  const currentBest = currentWeightGroup.locator(
    '[data-testid="personal-records-record-entry"][data-current-best="true"]'
  );
  await expect(currentWeightGroup).toHaveCount(1);
  await currentBest.click();
  await expect(modal.getByTestId("personal-record-workout")).toBeVisible();
  await expect(
    modal.getByTestId("personal-record-workout-exercise-0")
  ).toContainText("Paused Bench Press");
  expect(currentMesocycleGetCount).toBe(1);

  await modal.getByTestId("personal-record-history-back").click();
  const historicalWeightGroup = modal.locator(
    '[data-testid="personal-records-weight-group"][data-weight="80"]'
  );
  const historicalBest = historicalWeightGroup.locator(
    '[data-testid="personal-records-record-entry"][data-current-best="true"]'
  );
  const historicalResponse = page.waitForResponse(
    (response) =>
      isApiRequest(response.request(), "/mesocycles/2") &&
      response.status() === 200
  );
  await historicalBest.click();
  await historicalResponse;

  const workout = modal.getByTestId("personal-record-workout");
  await expect(workout).toBeVisible();
  await expect(
    workout.getByTestId("personal-record-workout-muscle-group-0")
  ).toHaveText("Muscle group: Chest");
  await expect(
    workout.getByTestId("personal-record-workout-exercise-5")
  ).toContainText("Incline Dumbbell Curl");
  const setRects = await workout
    .getByTestId("personal-record-workout-exercise-0")
    .getByTestId("personal-record-workout-set")
    .evaluateAll((sets) =>
      sets.map((set) => {
        const rect = set.getBoundingClientRect();
        return { left: rect.left, top: rect.top, bottom: rect.bottom };
      })
    );
  expect(setRects).toHaveLength(3);
  expect(setRects[1].top).toBeGreaterThanOrEqual(setRects[0].bottom - 1);
  expect(setRects[2].top).toBeGreaterThanOrEqual(setRects[1].bottom - 1);
  expect(historicalMesocycleGetCount).toBe(1);

  await modal.getByTestId("personal-record-history-back").click();
  await historicalBest.click();
  await expect(modal.getByTestId("personal-record-workout")).toBeVisible();
  await page.waitForTimeout(150);
  expect(historicalMesocycleGetCount).toBe(1);
});

test("page and exercise modal stay inside a 393 px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await openPersonalRecords(page);

  await expectNoHorizontalOverflow(
    page,
    page.getByTestId("personal-records-page"),
    "personal records page"
  );
  await exerciseCard(page, "Paused Bench Press").click();
  const modal = page.getByRole("dialog", {
    name: "Personal records for Paused Bench Press",
  });
  await expectNoHorizontalOverflow(page, modal, "exercise records modal");
  await expectNoHorizontalOverflow(
    page,
    modal.getByTestId("personal-records-weight-groups"),
    "weight groups"
  );
});

test("shows the empty state when no completed sets exist", async ({ page }) => {
  await loginAsDemoUser(page);
  await page.route(`${apiBase}/personal-records`, async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "access-control-allow-origin": "http://127.0.0.1:5174",
        "access-control-allow-credentials": "true",
      },
      json: { personalRecordHistory: [], exercises: [] },
    });
  });

  await page.goto("/personal-records");
  const emptyState = page.getByTestId("personal-records-empty");
  await expect(emptyState).toBeVisible();
  await expect(emptyState).toContainText(
    "Complete your first valid set to establish a personal record"
  );
});

test("shows an error and retries the overview request", async ({ page }) => {
  await loginAsDemoUser(page);
  let requestCount = 0;
  let shouldFail = true;
  await page.route(`${apiBase}/personal-records`, async (route) => {
    requestCount += 1;
    if (shouldFail) {
      await route.fulfill({
        status: 500,
        headers: {
          "access-control-allow-origin": "http://127.0.0.1:5174",
          "access-control-allow-credentials": "true",
        },
        json: { error: "Temporary overview failure" },
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/personal-records");
  const errorState = page.getByTestId("personal-records-error");
  await expect(errorState).toBeVisible();
  expect(requestCount).toBeGreaterThanOrEqual(2);

  shouldFail = false;
  const successfulResponse = page.waitForResponse(
    (response) =>
      isApiRequest(response.request(), "/personal-records") &&
      response.status() === 200
  );
  await errorState.getByRole("button", { name: "Retry", exact: true }).click();
  await successfulResponse;
  await expect(page.getByTestId("personal-records-list")).toBeVisible();
  expect(requestCount).toBeGreaterThanOrEqual(3);
});
