import { describe, expect, it } from "vitest";
import { exportMesocycleCsv, getExportFilename } from "./exportPlanCsv";
import { parseCsvPlan } from "./importPlanParser";

const mesocycle = {
  name: "My Spring Plan!",
  daysPerWeek: 1,
  plan: [
    { label: "Monday", exercises: [{ exercise: "Bench Press", muscleGroup: "Chest", type: "barbell", progressionMode: "percent", weightIncrement: 2.5, minimumWeight: 2.5, sets: [{ targetWeight: 60, targetReps: 8, completed: true }] }] },
    { label: "Monday", exercises: [{ exercise: "Should not export", sets: [{ targetWeight: 1 }] }] },
  ],
};

describe("plan CSV export", () => {
  it("exports the first week in the import-compatible format", () => {
    const csv = exportMesocycleCsv(mesocycle);
    expect(csv).toContain("day;exercise;sets;weight;reps");
    expect(csv).toContain("Monday;Bench Press;1;60;8;Chest;barbell");
    expect(csv).not.toContain("Should not export");
    expect(csv).not.toContain("completed");
    expect(parseCsvPlan(csv).rows[0]).toMatchObject({ exercise: "Bench Press", weight: 60, reps: 8 });
  });

  it("sanitizes the download filename", () => {
    expect(getExportFilename(mesocycle.name)).toBe("my-spring-plan.csv");
  });
});
