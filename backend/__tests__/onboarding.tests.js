import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { createTestDb } from "../testHelpers/testDb.js";
import { createAuthenticatedUser, csrfRequest } from "../testHelpers/api.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";

describe("guided onboarding", () => {
  let app;
  let db;

  beforeEach(async () => {
    db = await createTestDb();
    app = await loadAppWithQuery(db.query);
  });

  afterEach(async () => {
    await db.close();
  });

  it("isolates drafts, rejects stale revisions, and finalizes one chosen-length plan", async () => {
    const first = await createAuthenticatedUser(app, db, { username: "onboarding-one@example.com" });
    const second = await createAuthenticatedUser(app, db, { username: "onboarding-two@example.com" });
    await db.run("UPDATE users SET onboarding_status = 'not_started' WHERE id IN (?, ?)", [first.userId, second.userId]);

    await first.agent.post("/api/onboarding/start").send({ kind: "discovery" }).expect(403);
    const started = await csrfRequest(first.agent, "post", "/api/onboarding/start")
      .send({ kind: "discovery" })
      .expect(201);
    const draftId = started.body.draft.id;

    const otherStatus = await second.agent.get("/api/onboarding").expect(200);
    expect(otherStatus.body.draft).toBeNull();

    const draftData = {
      kind: "discovery",
      days: [{
        label: "Day 1",
        finished: true,
        exercises: [{
          exercise: "High Bar Squat",
          muscleGroup: "Quads",
          type: "barbell",
          note: "Superset with calf raises",
          dropset: { enabled: true, setCount: 1, dropPercent: 20 },
          sets: [{ weight: 100, reps: 5, completed: true }],
        }],
      }],
      review: { name: "My first training block", weeks: 7, includeDeload: false, replacements: [] },
    };
    const saved = await csrfRequest(first.agent, "put", "/api/onboarding/draft")
      .send({ draftId, revision: 0, path: "review", data: draftData })
      .expect(200);
    expect(saved.body.draft.revision).toBe(1);
    expect(saved.body.draft.data.days[0].startedAt).toEqual(expect.any(String));
    expect(saved.body.draft.data.days[0].completedAt).toEqual(expect.any(String));

    await csrfRequest(first.agent, "put", "/api/onboarding/draft")
      .send({ draftId, revision: 0, path: "review", data: draftData })
      .expect(409);

    const finalized = await csrfRequest(first.agent, "post", "/api/onboarding/finalize")
      .send({ draftId })
      .expect(201);
    const planRow = await db.get("SELECT * FROM mesocycles WHERE id = ?", [finalized.body.mesocycleId]);
    const plan = JSON.parse(planRow.plan);
    expect(planRow.weeks).toBe(7);
    expect(planRow.daysPerWeek).toBe(1);
    expect(plan).toHaveLength(7);
    expect(plan[0].exercises[0].sets[0]).toMatchObject({ completed: true, weight: 100, reps: 5 });
    expect(plan[0].exercises[0]).toMatchObject({
      note: "Superset with calf raises",
      dropset: { enabled: true, setCount: 1, startWeight: 100, dropPercent: 20 },
    });
    expect(plan.slice(1).every((day) => day.exercises[0].sets[0].completed === false)).toBe(true);
    expect(plan[0].startedAt).toBe(saved.body.draft.data.days[0].startedAt);

    const retried = await csrfRequest(first.agent, "post", "/api/onboarding/finalize")
      .send({ draftId })
      .expect(200);
    expect(retried.body.mesocycleId).toBe(finalized.body.mesocycleId);
    expect(await db.get("SELECT COUNT(*) AS count FROM mesocycles WHERE user_id = ?", [first.userId])).toMatchObject({ count: 1 });
  });

  it("rejects invalid completed set values and keeps first-set time stable", async () => {
    const user = await createAuthenticatedUser(app, db, { username: "validation@example.com" });
    const started = await csrfRequest(user.agent, "post", "/api/onboarding/start")
      .send({ kind: "discovery" })
      .expect(201);
    const draftId = started.body.draft.id;
    const invalid = {
      days: [{ label: "Day 1", finished: false, exercises: [{ exercise: "Squat", muscleGroup: "Quads", type: "barbell", sets: [{ weight: -1, reps: 31, completed: true }] }] }],
    };
    await csrfRequest(user.agent, "put", "/api/onboarding/draft")
      .send({ draftId, revision: 0, path: "logging", data: invalid })
      .expect(400);

    const valid = structuredClone(invalid);
    valid.days[0].exercises[0].sets[0] = { weight: 0, reps: 10, completed: true };
    await csrfRequest(user.agent, "put", "/api/onboarding/draft")
      .send({ draftId, revision: 0, path: "logging", data: valid })
      .expect(200);
    const firstTimestamp = (await db.get("SELECT onboarding_first_set_at FROM users WHERE id = ?", [user.userId])).onboarding_first_set_at;

    valid.days[0].exercises[0].sets[0].reps = 11;
    await csrfRequest(user.agent, "put", "/api/onboarding/draft")
      .send({ draftId, revision: 1, path: "logging", data: valid })
      .expect(200);
    expect((await db.get("SELECT onboarding_first_set_at FROM users WHERE id = ?", [user.userId])).onboarding_first_set_at).toBe(firstTimestamp);
  });
});
