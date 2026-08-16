import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

const apiBase = "http://127.0.0.1:3001/api";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

function isMesocycleRequest(request, id, method = "GET") {
  return (
    new URL(request.url()).pathname === `/api/mesocycles/${id}` &&
    request.method() === method
  );
}

async function preparePersonalRecordFixture(
  page,
  { completeCurrentSet = true } = {}
) {
  return page.evaluate(
    async ({ apiBase: baseUrl, completeCurrentSet: shouldCompleteCurrentSet }) => {
      async function apiRequest(path, options = {}) {
        const response = await fetch(baseUrl + path, {
          credentials: "include",
          ...options,
        });

        if (!response.ok) {
          throw new Error(
            `${options.method || "GET"} ${path} failed: ${await response.text()}`
          );
        }

        return response.json();
      }

      async function putMesocycle(mesocycle) {
        return apiRequest(`/mesocycles/${mesocycle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: mesocycle.name,
            weeks: mesocycle.weeks,
            daysPerWeek: mesocycle.daysPerWeek,
            plan: mesocycle.plan,
            completedDate: mesocycle.completedDate,
            isCurrent: mesocycle.isCurrent,
          }),
        });
      }

      const mesocyclePayload = await apiRequest("/mesocycles");
      const mesocycles = Array.isArray(mesocyclePayload)
        ? mesocyclePayload
        : mesocyclePayload.data;
      const current = mesocycles.find((mesocycle) => mesocycle.isCurrent);
      const historical = mesocycles.find(
        (mesocycle) => mesocycle.name === "Completed Demo Block"
      );

      if (!current || !historical) {
        throw new Error("Expected seeded current and historical mesocycles");
      }

      const historicalBenchSets =
        historical.plan[0].exercises[0].sets;
      Object.assign(historicalBenchSets[0], {
        weight: "85",
        reps: "5",
        targetWeight: "85",
        targetReps: "5",
        completed: true,
      });
      Object.assign(historicalBenchSets[1], {
        weight: "85",
        reps: "4",
        targetWeight: "85",
        targetReps: "4",
        completed: true,
      });
      Object.assign(historicalBenchSets[2], {
        weight: "85",
        reps: "3",
        targetWeight: "85",
        targetReps: "3",
        completed: true,
      });
      await putMesocycle(historical);

      const currentDayIndex = current.plan.findIndex((day) =>
        day.exercises.some((exercise) =>
          exercise.sets.some((set) => set.completed !== true)
        )
      );
      const currentSet =
        current.plan[currentDayIndex].exercises[0].sets[0];
      Object.assign(currentSet, {
        weight: "85",
        reps: "8",
        targetWeight: "85",
        targetReps: "8",
        completed: shouldCompleteCurrentSet,
      });

      if (shouldCompleteCurrentSet) {
        await putMesocycle(current);
      }

      return {
        currentDayIndex,
        currentId: current.id,
        historicalId: historical.id,
      };
    },
    { apiBase, completeCurrentSet }
  );
}

function boxesOverlap(first, second) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
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

function getRecordIcon(page) {
  return page
    .getByTestId("workout-set-0-0")
    .getByTestId("personal-record-icon");
}

async function runWithHeldMesocyclePut(
  page,
  mesocycleId,
  action,
  assertWhilePending
) {
  const urlPattern = `**/api/mesocycles/${mesocycleId}`;
  let markPutStarted;
  let releasePut;
  const putStarted = new Promise((resolve) => {
    markPutStarted = resolve;
  });
  const putGate = new Promise((resolve) => {
    releasePut = resolve;
  });
  const routeHandler = async (route) => {
    if (!isMesocycleRequest(route.request(), mesocycleId, "PUT")) {
      await route.continue();
      return;
    }

    markPutStarted();
    await putGate;
    await route.continue();
  };

  await page.route(urlPattern, routeHandler);
  const putResponse = page.waitForResponse(
    (response) =>
      isMesocycleRequest(response.request(), mesocycleId, "PUT") &&
      response.status() === 200
  );

  try {
    await action();
    await putStarted;
    await assertWhilePending();
    releasePut();
    await putResponse;
  } finally {
    releasePut();
    await page.unroute(urlPattern, routeHandler);
  }
}

test("stored current-workout PR opens from compact history without a historical GET", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const fixture = await preparePersonalRecordFixture(page);
  let historicalGetCount = 0;

  page.on("request", (request) => {
    if (isMesocycleRequest(request, fixture.historicalId)) {
      historicalGetCount += 1;
    }
  });

  await page.goto("/currentworkout");

  const recordIcon = getRecordIcon(page);
  await expect(recordIcon).toBeVisible();

  const unsavedReps = page
    .getByTestId("workout-set-0-1")
    .getByTestId("set-reps-select");
  await unsavedReps.selectOption("12");
  await expect(unsavedReps).toHaveValue("12");

  await recordIcon.click();

  const modal = page.getByRole("dialog", { name: "Personal records for Paused Bench Press" });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText("Personal record history");
  const currentSummary = modal.getByTestId(
    "personal-record-current-summary"
  );
  await expect(currentSummary).toContainText("New personal record");
  await expect(currentSummary).toContainText("85 kg");
  await expect(currentSummary).toContainText("8 reps");
  await expect(currentSummary).toContainText("Set 1");
  await expect(currentSummary).toContainText("Previous best: 5 reps");
  await expect(
    currentSummary.getByTestId("personal-record-current-date")
  ).toHaveAttribute(
    "datetime",
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  );
  const previousRecord = modal.getByTestId(
    "personal-record-history-entry-0"
  );
  await expect(previousRecord).toContainText("5 reps");
  await expect(previousRecord).toContainText("12.01.2026");
  await page.waitForTimeout(200);
  expect(historicalGetCount).toBe(0);

  await modal.getByRole("button", { name: "Close modal" }).click();
  await expect(modal).toBeHidden();
  await expect(unsavedReps).toHaveValue("12");
});

test("PR modal stays inside a 393 px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await loginAsDemoUser(page);
  await preparePersonalRecordFixture(page);
  await page.goto("/currentworkout");
  await getRecordIcon(page).click();

  const modal = page.getByRole("dialog", {
    name: "Personal records for Paused Bench Press",
  });
  await expectNoHorizontalOverflow(page, modal, "PR modal");
  await expectNoHorizontalOverflow(
    page,
    modal.getByTestId("personal-record-current-summary"),
    "PR summary"
  );
  await expectNoHorizontalOverflow(
    page,
    modal.getByTestId("personal-record-history-list"),
    "PR history list"
  );

  await modal.getByTestId("personal-record-history-entry-0").click();
  const workout = modal.getByTestId("personal-record-workout");
  await expect(workout).toBeVisible();
  await expectNoHorizontalOverflow(page, modal, "historical workout modal");
  await expectNoHorizontalOverflow(page, workout, "historical workout");
});

test("old record lazy-loads once, shows the full workout, and reuses the cache", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const fixture = await preparePersonalRecordFixture(page);
  let historicalGetCount = 0;

  page.on("request", (request) => {
    if (isMesocycleRequest(request, fixture.historicalId)) {
      historicalGetCount += 1;
    }
  });

  await page.goto("/currentworkout");
  await getRecordIcon(page).click();

  const modal = page.getByRole("dialog", { name: "Personal records for Paused Bench Press" });
  const historyEntry = modal.getByTestId("personal-record-history-entry-0");
  await expect(historyEntry).toHaveAttribute(
    "data-mesocycle-id",
    String(fixture.historicalId)
  );
  expect(historicalGetCount).toBe(0);

  const historicalResponse = page.waitForResponse(
    (response) =>
      isMesocycleRequest(response.request(), fixture.historicalId) &&
      response.status() === 200
  );
  await historyEntry.click();
  await historicalResponse;

  await expect(modal).toContainText("Historical workout");
  const workout = modal.getByTestId("personal-record-workout");
  await expect(workout).toBeVisible();
  await expect(
    workout.getByTestId("personal-record-workout-exercise-0")
  ).toContainText("1. Paused Bench Press");
  await expect(
    workout.getByTestId("personal-record-workout-muscle-group-0")
  ).toHaveText("Muscle group: Chest");
  await expect(
    workout.getByTestId("personal-record-workout-exercise-0")
  ).toContainText("85 kg");
  await expect(
    workout.getByTestId("personal-record-workout-exercise-0")
  ).toContainText("5 reps");
  await expect(
    workout.getByTestId("personal-record-workout-exercise-0")
  ).toContainText("4 reps");
  const historicalBenchSetRects = await workout
    .getByTestId("personal-record-workout-exercise-0")
    .getByTestId("personal-record-workout-set")
    .evaluateAll((sets) =>
      sets.map((set) => {
        const rect = set.getBoundingClientRect();
        return { left: rect.left, top: rect.top, bottom: rect.bottom };
      })
    );
  expect(historicalBenchSetRects).toHaveLength(3);
  expect(historicalBenchSetRects[1].top).toBeGreaterThanOrEqual(
    historicalBenchSetRects[0].bottom - 1
  );
  expect(historicalBenchSetRects[2].top).toBeGreaterThanOrEqual(
    historicalBenchSetRects[1].bottom - 1
  );
  expect(Math.abs(historicalBenchSetRects[1].left - historicalBenchSetRects[0].left)).toBeLessThanOrEqual(1);
  await expect(
    workout.getByTestId("personal-record-workout-exercise-1")
  ).toContainText("2. Chest Supported Row");
  await expect(
    workout.getByTestId("personal-record-workout-muscle-group-1")
  ).toHaveText("Muscle group: Back");
  await expect(
    workout.getByTestId("personal-record-workout-exercise-1")
  ).toContainText("60 kg");
  expect(historicalGetCount).toBe(1);

  await modal.getByTestId("personal-record-history-back").click();
  await expect(modal.getByTestId("personal-record-history-list")).toBeVisible();
  await modal.getByTestId("personal-record-history-entry-0").click();
  await expect(modal.getByTestId("personal-record-workout")).toBeVisible();
  await page.waitForTimeout(200);
  expect(historicalGetCount).toBe(1);

  await modal.getByTestId("personal-record-history-back").click();
  await expect(modal.getByTestId("personal-record-history-list")).toBeVisible();
});

test("new PR icon waits for the mesocycle PUT confirmation", async ({ page }) => {
  await loginAsDemoUser(page);
  const fixture = await preparePersonalRecordFixture(page, {
    completeCurrentSet: false,
  });
  await page.goto("/currentworkout");

  const recordIcon = getRecordIcon(page);
  await expect(recordIcon).toHaveCount(0);

  let putStarted = false;
  let releasePut;
  const putGate = new Promise((resolve) => {
    releasePut = resolve;
  });

  await page.route(`**/api/mesocycles/${fixture.currentId}`, async (route) => {
    if (!isMesocycleRequest(route.request(), fixture.currentId, "PUT")) {
      await route.continue();
      return;
    }

    putStarted = true;
    await putGate;
    await route.continue();
  });

  const putResponse = page.waitForResponse(
    (response) =>
      isMesocycleRequest(response.request(), fixture.currentId, "PUT") &&
      response.status() === 200
  );

  try {
    await page
      .getByTestId("workout-set-0-0")
      .getByTestId("set-log-checkbox")
      .check();
    await expect.poll(() => putStarted).toBe(true);
    await expect(recordIcon).toHaveCount(0);

    releasePut();
    await putResponse;
    await expect(recordIcon).toBeVisible();
  } finally {
    releasePut();
  }
});


test("each sequential PR keeps its icon and opens its own milestone", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const fixture = await preparePersonalRecordFixture(page);
  await page.goto("/currentworkout");

  const firstSet = page.getByTestId("workout-set-0-0");
  const secondSet = page.getByTestId("workout-set-0-1");
  const firstRecordIcon = firstSet.getByTestId("personal-record-icon");
  const secondRecordIcon = secondSet.getByTestId("personal-record-icon");
  const secondSetReps = secondSet.getByTestId("set-reps-select");
  const secondSetCheckbox = secondSet.getByTestId("set-log-checkbox");

  await expect(firstRecordIcon).toBeVisible();
  await expect(secondRecordIcon).toHaveCount(0);

  await secondSetReps.selectOption("10");
  await runWithHeldMesocyclePut(
    page,
    fixture.currentId,
    () => secondSetCheckbox.check(),
    async () => {
      await expect(firstRecordIcon).toBeVisible();
      await expect(secondRecordIcon).toHaveCount(0);
    }
  );

  await expect(firstRecordIcon).toBeVisible();
  await expect(secondRecordIcon).toBeVisible();

  await firstRecordIcon.click();
  const modal = page.getByRole("dialog", {
    name: "Personal records for Paused Bench Press",
  });
  await expect(
    modal.getByTestId("personal-record-current-summary")
  ).toContainText("8 reps");
  await expect(
    modal.getByTestId("personal-record-current-summary")
  ).toContainText("Set 1");
  await modal.getByRole("button", { name: "Close modal" }).click();

  await secondRecordIcon.click();
  const secondSetSummary = modal.getByTestId(
    "personal-record-current-summary"
  );
  await expect(secondSetSummary).toContainText("10 reps");
  await expect(secondSetSummary).toContainText("Set 2");
  const firstSetMilestone = modal.getByTestId(
    "personal-record-history-entry-0"
  );
  await expect(firstSetMilestone).toContainText("8 reps");
  await expect(firstSetMilestone).toContainText("Set 1");
  await modal.getByRole("button", { name: "Close modal" }).click();

  await secondSetReps.selectOption("8");
  await expect(secondSetCheckbox).not.toBeChecked();
  await runWithHeldMesocyclePut(
    page,
    fixture.currentId,
    () => secondSetCheckbox.check(),
    async () => {
      await expect(firstRecordIcon).toBeVisible();
      await expect(secondRecordIcon).toBeVisible();
    }
  );

  await expect(firstRecordIcon).toBeVisible();
  await expect(secondRecordIcon).toHaveCount(0);
});

test("historical workout shows loading and error before retry succeeds", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const fixture = await preparePersonalRecordFixture(page);
  await page.goto("/currentworkout");

  let historicalGetCount = 0;
  let markFirstGetStarted;
  let releaseFirstGet;
  const firstGetStarted = new Promise((resolve) => {
    markFirstGetStarted = resolve;
  });
  const firstGetGate = new Promise((resolve) => {
    releaseFirstGet = resolve;
  });
  const urlPattern = `**/api/mesocycles/${fixture.historicalId}`;
  const errorResponse = {
    status: 500,
    headers: {
      "access-control-allow-origin": "http://127.0.0.1:5174",
      "access-control-allow-credentials": "true",
    },
    json: { message: "Temporary history failure" },
  };
  const routeHandler = async (route) => {
    if (!isMesocycleRequest(route.request(), fixture.historicalId)) {
      await route.continue();
      return;
    }

    historicalGetCount += 1;
    if (historicalGetCount === 1) {
      markFirstGetStarted();
      await firstGetGate;
      await route.fulfill(errorResponse);
      return;
    }

    if (historicalGetCount === 2) {
      await route.fulfill(errorResponse);
      return;
    }

    await route.continue();
  };

  await page.route(urlPattern, routeHandler);
  await getRecordIcon(page).click();

  const modal = page.getByRole("dialog", {
    name: "Personal records for Paused Bench Press",
  });

  try {
    await modal.getByTestId("personal-record-history-entry-0").click();
    await firstGetStarted;
    await expect(
      modal.getByTestId("personal-record-history-loading")
    ).toBeVisible();

    releaseFirstGet();
    const historyError = modal.getByTestId("personal-record-history-error");
    await expect(historyError).toBeVisible();
    await expect(historyError).toContainText("Unable to load this workout.");
    expect(historicalGetCount).toBe(2);

    const successfulResponse = page.waitForResponse(
      (response) =>
        isMesocycleRequest(response.request(), fixture.historicalId) &&
        response.status() === 200
    );
    await historyError
      .getByRole("button", { name: "Retry", exact: true })
      .click();
    await successfulResponse;

    await expect(modal.getByTestId("personal-record-workout")).toBeVisible();
    await expect(
      modal.getByTestId("personal-record-workout-exercise-0")
    ).toContainText("1. Paused Bench Press");
    expect(historicalGetCount).toBe(3);
  } finally {
    releaseFirstGet();
    await page.unroute(urlPattern, routeHandler);
  }
});


test("confirmed PR metadata merges while preserving a newer unsaved reps draft", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const fixture = await preparePersonalRecordFixture(page, {
    completeCurrentSet: false,
  });
  await page.goto("/currentworkout");

  const firstSet = page.getByTestId("workout-set-0-0");
  const unsavedReps = page
    .getByTestId("workout-set-0-1")
    .getByTestId("set-reps-select");
  const recordIcon = firstSet.getByTestId("personal-record-icon");

  await expect(recordIcon).toHaveCount(0);
  await runWithHeldMesocyclePut(
    page,
    fixture.currentId,
    () => firstSet.getByTestId("set-log-checkbox").check(),
    async () => {
      await unsavedReps.selectOption("12");
      await expect(unsavedReps).toHaveValue("12");
      await expect(recordIcon).toHaveCount(0);
    }
  );

  await expect(recordIcon).toBeVisible();
  await expect(unsavedReps).toHaveValue("12");
});

test("correction below the previous record removes the icon only after PUT", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const fixture = await preparePersonalRecordFixture(page);
  await page.goto("/currentworkout");

  const firstSet = page.getByTestId("workout-set-0-0");
  const reps = firstSet.getByTestId("set-reps-select");
  const checkbox = firstSet.getByTestId("set-log-checkbox");
  const recordIcon = firstSet.getByTestId("personal-record-icon");

  await expect(recordIcon).toBeVisible();
  await reps.selectOption("4");
  await expect(checkbox).not.toBeChecked();
  await expect(recordIcon).toBeVisible();

  await runWithHeldMesocyclePut(
    page,
    fixture.currentId,
    () => checkbox.check(),
    async () => {
      await expect(recordIcon).toBeVisible();
    }
  );

  await expect(recordIcon).toHaveCount(0);
});


test("week 3 at the previous week's weight uses the earlier PR", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  const currentSet = page.getByTestId("workout-set-0-0");
  const recordIcon = currentSet.getByTestId("personal-record-icon");
  const weight = currentSet.getByTestId("set-weight-select");
  const reps = currentSet.getByTestId("set-reps-select");
  const checkbox = currentSet.getByTestId("set-log-checkbox");
  const isSuccessfulMesocyclePut = (response) =>
    response.request().method() === "PUT" &&
    new URL(response.url()).pathname.startsWith("/api/mesocycles/") &&
    response.status() === 200;

  await expect(weight).toHaveValue("85");
  await weight.selectOption("82.5");
  await reps.selectOption("7");
  const lowerResultPut = page.waitForResponse(isSuccessfulMesocyclePut);
  await checkbox.check();
  await lowerResultPut;

  await expect(recordIcon).toHaveCount(0);

  await reps.selectOption("9");
  const recordPut = page.waitForResponse(isSuccessfulMesocyclePut);
  await checkbox.check();
  await recordPut;
  await expect(recordIcon).toBeVisible();

  await recordIcon.click();
  const modal = page.getByRole("dialog", {
    name: "Personal records for Paused Bench Press",
  });
  const currentSummary = modal.getByTestId(
    "personal-record-current-summary"
  );
  await expect(currentSummary).toContainText("82.5 kg");
  await expect(currentSummary).toContainText("9 reps");
  const previousRecord = modal.getByTestId(
    "personal-record-history-entry-0"
  );
  await expect(previousRecord).toContainText("8 reps");
  await expect(previousRecord).toContainText("27.07.2026");
});

test("PR badge does not move target or overlap LOG at 393 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 700 });
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  const row = page.getByTestId("workout-set-0-0");
  const targetIcon = row.locator('svg[data-icon="bullseye"]');
  const checkbox = row.getByTestId("set-log-checkbox");
  const targetBefore = await targetIcon.boundingBox();

  expect(targetBefore).not.toBeNull();
  await checkbox.check();

  const trophyButton = row.getByTestId("personal-record-icon");
  await expect(trophyButton).toBeVisible();
  const targetAfter = await targetIcon.boundingBox();
  const trophyBox = await trophyButton.boundingBox();
  const trophyGlyphBox = await trophyButton.locator("svg").boundingBox();
  const checkboxBox = await checkbox.boundingBox();
  const logTextBox = await row
    .getByText("LOG", { exact: true })
    .boundingBox();

  expect(targetAfter).not.toBeNull();
  expect(trophyBox).not.toBeNull();
  expect(trophyGlyphBox).not.toBeNull();
  expect(checkboxBox).not.toBeNull();
  expect(targetAfter.x).toBeCloseTo(targetBefore.x, 4);
  expect(targetAfter.y).toBeCloseTo(targetBefore.y, 4);
  expect(trophyBox.x + trophyBox.width / 2).toBeGreaterThan(
    targetAfter.x + targetAfter.width / 2
  );
  expect(boxesOverlap(trophyBox, checkboxBox)).toBe(false);
  expect(boxesOverlap(trophyGlyphBox, logTextBox)).toBe(false);
});
