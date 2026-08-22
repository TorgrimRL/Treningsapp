import { describe, expect, it } from "vitest";
import {
  DROPSET_REP_TARGET_POLICY,
  buildDropsetSets,
} from "./dropsets";

const buildSets = (overrides = {}) =>
  buildDropsetSets({
    existingSets: [
      { reps: 8, targetReps: 8, targetWeight: 100 },
      { reps: 10, targetReps: 10, targetWeight: 80 },
      { reps: 12, targetReps: 12, targetWeight: 65 },
    ],
    startWeight: 100,
    setCount: 3,
    increment: 2.5,
    minimumWeight: 2.5,
    ...overrides,
  });

describe("buildDropsetSets", () => {
  it("keeps a target only on the first set when initializing a dropset", () => {
    const result = buildSets({
      targetRepPolicy: DROPSET_REP_TARGET_POLICY.initialize,
    });

    expect(result.error).toBeNull();
    expect(result.sets.map((set) => set.targetReps)).toEqual([8, 0, 0]);
    expect(result.sets.map((set) => set.reps)).toEqual([8, 0, 0]);
  });

  it("preserves established per-set targets when editing a dropset", () => {
    const result = buildSets();

    expect(result.error).toBeNull();
    expect(result.sets.map((set) => set.targetReps)).toEqual([8, 10, 12]);
    expect(result.sets.map((set) => set.reps)).toEqual([8, 10, 12]);
  });

  it("does not fall back to the first set when a previous set has no log", () => {
    const result = buildSets({
      targetRepsBySet: [9, undefined, 13],
      targetRepPolicy: DROPSET_REP_TARGET_POLICY.fromPrevious,
    });

    expect(result.error).toBeNull();
    expect(result.sets.map((set) => set.targetReps)).toEqual([9, 0, 13]);
    expect(result.sets.map((set) => set.reps)).toEqual([9, 0, 13]);
  });
});
