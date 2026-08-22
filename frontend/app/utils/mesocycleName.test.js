import { describe, expect, it } from "vitest";
import { mergeMesocycleName } from "./mesocycleName";

describe("mergeMesocycleName", () => {
  it("updates the mesocycle and its embedded personal record history", () => {
    const mesocycle = {
      id: 12,
      name: "Old name",
      personalRecordHistory: [
        { id: 1, mesocycleId: 12, mesocycleName: "Old name" },
        { id: 2, mesocycleId: 13, mesocycleName: "Another block" },
      ],
    };

    expect(mergeMesocycleName(mesocycle, { id: "12", name: "New name" })).toEqual({
      ...mesocycle,
      name: "New name",
      personalRecordHistory: [
        { id: 1, mesocycleId: 12, mesocycleName: "New name" },
        { id: 2, mesocycleId: 13, mesocycleName: "Another block" },
      ],
    });
  });
});
