import { describe, expect, it } from "vitest";
import { getLastCompletedWorkoutTime, sortMesocyclesByActivity } from "./mesocycleSort";

describe("mesocycle activity sorting", () => {
  it("uses the latest completed workout-day timestamp", () => {
    const plan = { plan: [{ startedAt: "2026-08-01T10:00:00.000Z" }, { completedAt: "2026-08-05T11:00:00.000Z" }] };
    expect(getLastCompletedWorkoutTime(plan)).toBe(Date.parse("2026-08-05T11:00:00.000Z"));
  });

  it("sorts each status group by latest completed workout", () => {
    const plans = [
      { id: 1, isCurrent: false, completedDate: null, plan: [{ completedAt: "2026-08-01T10:00:00.000Z" }] },
      { id: 2, isCurrent: false, completedDate: null, plan: [{ completedAt: "2026-08-03T10:00:00.000Z" }] },
      { id: 3, isCurrent: true, completedDate: null, plan: [] },
      { id: 4, isCurrent: false, completedDate: "2026-08-02T10:00:00.000Z", plan: [] },
    ];
    expect(sortMesocyclesByActivity(plans).map((plan) => plan.id)).toEqual([3, 2, 1, 4]);
  });
});
