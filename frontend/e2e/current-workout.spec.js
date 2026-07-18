import { expect, test } from "@playwright/test";
import { loginAsDemoUser, resetE2eDatabase } from "./helpers";

test.beforeEach(async () => {
  await resetE2eDatabase();
});

async function openDropsetModal(page, exerciseIndex = 0) {
  await page.getByTestId(`exercise-menu-${exerciseIndex}`).click();
  await page.getByTestId(`dropset-exercise-${exerciseIndex}`).click();
}

async function expectSetWeights(page, exerciseIndex, weights) {
  for (const [setIndex, weight] of weights.entries()) {
    await expect(
      page
        .getByTestId(`workout-set-${exerciseIndex}-${setIndex}`)
        .getByTestId("set-weight-select")
    ).toHaveValue(String(weight));
  }
}

function isCurrentWorkoutGet(request) {
  return (
    new URL(request.url()).pathname === "/api/current-workout" &&
    request.method() === "GET"
  );
}

async function clickNavbarLink(page, name) {
  const link = page.getByRole("link", { name, exact: true });

  if (!(await link.isVisible())) {
    await page.getByTestId("navbar-menu-button").click();
    await expect(link).toBeVisible();
  }

  await link.click();
}

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

test("return navigation uses cached current workout without blocking or refetching", async ({
  page,
}) => {
  let currentWorkoutGetCount = 0;
  page.on("request", (request) => {
    if (isCurrentWorkoutGet(request)) {
      currentWorkoutGetCount += 1;
    }
  });

  await loginAsDemoUser(page);
  await clickNavbarLink(page, "Current workout");
  await expect(page.getByTestId("current-workout-title")).toContainText(
    "Demo Current Block"
  );

  const requestCountAfterFirstLoad = currentWorkoutGetCount;
  expect(requestCountAfterFirstLoad).toBeGreaterThan(0);

  await clickNavbarLink(page, "History");
  await expect(page.getByRole("heading", { name: "Mesocycles" })).toBeVisible();

  await page.evaluate(() => {
    window.__sawCurrentWorkoutLoading = false;
    window.__currentWorkoutLoadingObserver?.disconnect();

    const main = document.querySelector("main");
    const observeLoading = () => {
      if (main?.textContent?.includes("Loading...")) {
        window.__sawCurrentWorkoutLoading = true;
      }
    };
    const observer = new MutationObserver(observeLoading);
    observer.observe(main, { childList: true, subtree: true });
    window.__currentWorkoutLoadingObserver = observer;
  });

  await clickNavbarLink(page, "Current workout");
  await expect(page.getByTestId("current-workout-title")).toContainText(
    "Demo Current Block"
  );
  await page.waitForTimeout(250);

  expect(currentWorkoutGetCount).toBe(requestCountAfterFirstLoad);
  expect(
    await page.evaluate(() => {
      window.__currentWorkoutLoadingObserver?.disconnect();
      return window.__sawCurrentWorkoutLoading;
    })
  ).toBe(false);
});

test("saved set stays visible from cache while return refetch is pending", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  await clickNavbarLink(page, "Current workout");
  await expect(page.getByTestId("current-workout-title")).toContainText(
    "Demo Current Block"
  );

  const firstSetCheckbox = page
    .getByTestId("workout-set-0-0")
    .getByTestId("set-log-checkbox");
  await expect(firstSetCheckbox).not.toBeChecked();
  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    firstSetCheckbox.check(),
  ]);
  await expect(firstSetCheckbox).toBeChecked();
  await page.waitForTimeout(50);

  await clickNavbarLink(page, "History");
  await expect(page.getByRole("heading", { name: "Mesocycles" })).toBeVisible();

  let returnGetStarted = false;
  let releaseReturnGet;
  const holdReturnGet = new Promise((resolve) => {
    releaseReturnGet = resolve;
  });
  await page.route("**/api/current-workout", async (route) => {
    if (!isCurrentWorkoutGet(route.request())) {
      await route.continue();
      return;
    }

    returnGetStarted = true;
    await holdReturnGet;
    await route.continue();
  });

  await page.evaluate(() => {
    window.__sawCurrentWorkoutLoading = false;
    const main = document.querySelector("main");
    const observer = new MutationObserver(() => {
      if (main?.textContent?.includes("Loading...")) {
        window.__sawCurrentWorkoutLoading = true;
      }
    });
    observer.observe(main, { childList: true, subtree: true });
    window.__currentWorkoutLoadingObserver = observer;
  });

  try {
    await clickNavbarLink(page, "Current workout");
    await expect.poll(() => returnGetStarted, { timeout: 3_000 }).toBe(true);
    await expect(page.getByTestId("current-workout-title")).toContainText(
      "Demo Current Block"
    );
    await expect(
      page
        .getByTestId("workout-set-0-0")
        .getByTestId("set-log-checkbox")
    ).toBeChecked();
    expect(await page.evaluate(() => window.__sawCurrentWorkoutLoading)).toBe(
      false
    );
  } finally {
    releaseReturnGet();
  }

  await expect(page.getByTestId("current-workout-title")).toContainText(
    "Demo Current Block"
  );
  await page.evaluate(
    () => window.__currentWorkoutLoadingObserver?.disconnect()
  );
});

test("direct current workout starts loading while the auth check is pending", async ({
  page,
}) => {
  await loginAsDemoUser(page);

  let markMeStarted;
  const meStarted = new Promise((resolve) => {
    markMeStarted = resolve;
  });
  let releaseMe;
  const holdMe = new Promise((resolve) => {
    releaseMe = resolve;
  });
  let currentWorkoutStarted = false;

  await page.route("**/api/me", async (route) => {
    markMeStarted();
    await holdMe;
    await route.continue();
  });
  page.on("request", (request) => {
    if (isCurrentWorkoutGet(request)) {
      currentWorkoutStarted = true;
    }
  });

  try {
    await page.goto("/currentworkout");
    await meStarted;
    await expect
      .poll(() => currentWorkoutStarted, { timeout: 3_000 })
      .toBe(true);
  } finally {
    releaseMe();
  }

  await expect(page.getByTestId("current-workout-title")).toContainText(
    "Demo Current Block"
  );
});

test("calendar day switch uses the loaded workout without another GET", async ({
  page,
}) => {
  let currentWorkoutGetCount = 0;
  page.on("request", (request) => {
    if (isCurrentWorkoutGet(request)) {
      currentWorkoutGetCount += 1;
    }
  });

  await loginAsDemoUser(page);
  await page.goto("/currentworkout");
  await expect(page.getByTestId("current-workout-title")).toContainText(
    "Demo Current Block"
  );
  const requestCountBeforeDaySwitch = currentWorkoutGetCount;

  await page.getByRole("button", { name: "Open workout calendar" }).click();
  const calendar = page.getByRole("dialog", { name: "Calendar Modal" });
  await expect(calendar).toBeVisible();
  await calendar.getByRole("button", { name: "Wednesday" }).nth(2).click();

  await expect(calendar).toBeHidden();
  await expect(page.getByTestId("current-workout-sticky-header")).toContainText(
    "Week 3 Day 2 Wednesday"
  );
  await page.waitForTimeout(250);

  expect(currentWorkoutGetCount).toBe(requestCountBeforeDaySwitch);
});

test("404 current workout shows the empty state without retrying", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const coldPage = await page.context().newPage();
  let currentWorkoutGetCount = 0;

  await coldPage.route("**/api/current-workout", async (route) => {
    if (isCurrentWorkoutGet(route.request())) {
      currentWorkoutGetCount += 1;
    }
    await route.fulfill({
      status: 404,
      headers: {
        "access-control-allow-origin": "http://127.0.0.1:5174",
        "access-control-allow-credentials": "true",
      },
      json: { message: "No current workout" },
    });
  });

  await coldPage.goto("/currentworkout");
  await expect(
    coldPage.getByText("No current workout found", { exact: true })
  ).toBeVisible();
  await coldPage.waitForTimeout(500);

  expect(currentWorkoutGetCount).toBe(1);
  await expect(coldPage.getByTestId("current-workout-error")).toHaveCount(0);
  await coldPage.close();
});

test("401 current workout shows retry UI without automatically retrying", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const coldPage = await page.context().newPage();
  let currentWorkoutGetCount = 0;

  await coldPage.route("**/api/current-workout", async (route) => {
    if (isCurrentWorkoutGet(route.request())) {
      currentWorkoutGetCount += 1;
    }
    await route.fulfill({
      status: 401,
      headers: {
        "access-control-allow-origin": "http://127.0.0.1:5174",
        "access-control-allow-credentials": "true",
      },
      json: { message: "Unauthorized" },
    });
  });

  await coldPage.goto("/currentworkout");
  const error = coldPage.getByTestId("current-workout-error");
  await expect(error).toHaveAttribute("role", "alert");
  await expect(error).toContainText("Unable to load current workout.");
  await expect(
    error.getByRole("button", { name: "Retry", exact: true })
  ).toBeVisible();
  await coldPage.waitForTimeout(500);

  expect(currentWorkoutGetCount).toBe(1);
  await coldPage.close();
});

test("500 current workout retries once before showing the error UI", async ({
  page,
}) => {
  await loginAsDemoUser(page);
  const coldPage = await page.context().newPage();
  let currentWorkoutGetCount = 0;

  await coldPage.route("**/api/current-workout", async (route) => {
    if (isCurrentWorkoutGet(route.request())) {
      currentWorkoutGetCount += 1;
    }
    await route.fulfill({
      status: 500,
      headers: {
        "access-control-allow-origin": "http://127.0.0.1:5174",
        "access-control-allow-credentials": "true",
      },
      json: { message: "Temporary server error" },
    });
  });

  await coldPage.goto("/currentworkout");
  const error = coldPage.getByTestId("current-workout-error");
  await expect(error).toHaveAttribute("role", "alert");
  await expect(error).toContainText("Unable to load current workout.");
  await expect(
    error.getByRole("button", { name: "Retry", exact: true })
  ).toBeVisible();
  await coldPage.waitForTimeout(500);

  expect(currentWorkoutGetCount).toBe(2);
  await coldPage.close();
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


test("can configure dropsets and update targets from the first set", async ({ page }) => {
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  await openDropsetModal(page);
  await page.getByTestId("dropset-start-weight").fill("100");
  await expect(page.getByTestId("dropset-preview")).toContainText(
    "100 / 80 / 65"
  );

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    page.getByTestId("dropset-save").click(),
  ]);

  await expectSetWeights(page, 0, [100, 80, 65, 52.5, 50]);

  await page.reload();
  await expectSetWeights(page, 0, [100, 80, 65, 52.5, 50]);

  await page
    .getByTestId("workout-set-0-0")
    .getByTestId("set-weight-select")
    .selectOption("90");
  await expectSetWeights(page, 0, [90, 72.5, 57.5, 47.5, 45]);

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    page
      .getByTestId("workout-set-0-0")
      .getByTestId("set-log-checkbox")
      .check(),
  ]);

  await page.reload();
  await expectSetWeights(page, 0, [90, 72.5, 57.5, 47.5, 45]);
});

test("dropsets can apply to the rest of the mesocycle", async ({ page }) => {
  await loginAsDemoUser(page);
  await page.goto("/currentworkout");

  await openDropsetModal(page);
  await page.getByTestId("dropset-start-weight").fill("100");
  await page.getByTestId("dropset-apply-future").check();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    page.getByTestId("dropset-save").click(),
  ]);

  const rawPlan = await page.evaluate(async () => {
    const apiBase = "http://127.0.0.1:3001/api";
    const workoutResponse = await fetch(apiBase + "/current-workout", {
      credentials: "include",
    });
    const workout = await workoutResponse.json();
    const mesocycleResponse = await fetch(
      apiBase + "/mesocycles/" + workout.id,
      { credentials: "include" }
    );
    const mesocycle = await mesocycleResponse.json();
    return JSON.parse(mesocycle.plan);
  });

  expect(rawPlan[6].exercises[0].dropset).toMatchObject({
    enabled: true,
    setCount: 5,
    dropPercent: 20,
  });
  expect(rawPlan[6].exercises[0].sets).toHaveLength(5);
  expect(rawPlan[6].exercises[0].sets[0].targetWeight).toBe(102.5);
  expect(rawPlan[6].exercises[0].sets[4].targetWeight).toBe(52.5);
});

test("future dropsets progress reps from each matching set", async ({ page }) => {
  await loginAsDemoUser(page);

  await page.evaluate(async () => {
    const apiBase = "http://127.0.0.1:3001/api";
    const workoutResponse = await fetch(apiBase + "/current-workout", {
      credentials: "include",
    });
    if (!workoutResponse.ok) {
      throw new Error(await workoutResponse.text());
    }

    const workout = await workoutResponse.json();
    const mesocycleResponse = await fetch(
      apiBase + "/mesocycles/" + workout.id,
      { credentials: "include" }
    );
    if (!mesocycleResponse.ok) {
      throw new Error(await mesocycleResponse.text());
    }

    const storedMesocycle = await mesocycleResponse.json();
    const plan = JSON.parse(storedMesocycle.plan);
    const previousDayIndex =
      workout.firstIncompleteDayIndex - workout.daysPerWeek;
    const previousSecondSet =
      plan[previousDayIndex].exercises[0].sets[1];
    previousSecondSet.reps = "10";
    previousSecondSet.targetReps = "10";
    previousSecondSet.completed = true;

    const updateResponse = await fetch(
      apiBase + "/mesocycles/" + workout.id,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...storedMesocycle, plan }),
      }
    );
    if (!updateResponse.ok) {
      throw new Error(await updateResponse.text());
    }
  });

  await page.goto("/currentworkout");
  await page.getByTestId("exercise-menu-0").click();
  await page
    .getByRole("button", { name: "Progression mode", exact: true })
    .click();

  const progressionModal = page.getByRole("dialog", {
    name: "Edit progression mode",
  });
  await progressionModal.getByLabel("Progression mode").selectOption("reps");
  await progressionModal.getByLabel("Apply to rest of mesocycle").check();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    progressionModal.getByRole("button", { name: "Save" }).click(),
  ]);
  await expect(progressionModal).toBeHidden();

  await expect(
    page
      .getByTestId("workout-set-0-0")
      .getByTestId("set-reps-select")
  ).toHaveValue("9");
  await expect(
    page
      .getByTestId("workout-set-0-1")
      .getByTestId("set-reps-select")
  ).toHaveValue("11");

  await openDropsetModal(page);
  await page.getByTestId("dropset-start-weight").fill("100");
  await page.getByTestId("dropset-apply-future").check();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/mesocycles\/\d+$/.test(response.url()) &&
        response.request().method() === "PUT" &&
        response.status() === 200
    ),
    page.getByTestId("dropset-save").click(),
  ]);

  const futureSets = await page.evaluate(async () => {
    const apiBase = "http://127.0.0.1:3001/api";
    const workoutResponse = await fetch(apiBase + "/current-workout", {
      credentials: "include",
    });
    const workout = await workoutResponse.json();
    const mesocycleResponse = await fetch(
      apiBase + "/mesocycles/" + workout.id,
      { credentials: "include" }
    );
    const storedMesocycle = await mesocycleResponse.json();
    const plan = JSON.parse(storedMesocycle.plan);
    const futureDayIndex =
      workout.firstIncompleteDayIndex + workout.daysPerWeek;
    return plan[futureDayIndex].exercises[0].sets;
  });

  expect(futureSets.map((set) => Number(set.reps))).toEqual([
    10, 12, 10, 10, 10,
  ]);
  expect(futureSets.map((set) => Number(set.targetReps))).toEqual([
    10, 12, 10, 10, 10,
  ]);
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
