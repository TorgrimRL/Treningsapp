import { describe, expect, it } from "vitest";
import { parseCsvPlan, parseTextPlan, rowsToWeeklyPlan } from "./importPlanParser";

describe("import plan parser", () => {
  it("parses CSV rows and retains optional weight", () => {
    const result = parseCsvPlan("day,exercise,sets,reps,weight_kg\nMonday,Bench Press,3,8,60");
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ day: "Monday", exercise: "Bench Press", sets: 3, reps: 8, weight: 60 });
  });

  it("parses spreadsheet-friendly semicolon CSV with comma decimals", () => {
    const result = parseCsvPlan("day;exercise;sets;weight\nMonday;Bench Press;3;82,5");
    expect(result.rows[0]).toMatchObject({ sets: 3, weight: 82.5, reps: 0 });
  });

  it("reports missing CSV columns and malformed pasted lines", () => {
    expect(parseCsvPlan("day,exercise\nMonday,Bench Press").errors[0]).toContain("sets");
    expect(parseTextPlan("Bench Press 3x8").errors[0]).toContain("Line 1");
  });

  it("turns accepted pasted text into sets for a weekly plan", () => {
    const parsed = parseTextPlan("Monday: Bench Press — 3 × 8 @ 60 kg");
    const plan = rowsToWeeklyPlan(parsed.rows);
    expect(plan[0]).toMatchObject({ label: "Monday" });
    expect(plan[0].exercises[0].sets).toHaveLength(3);
    expect(plan[0].exercises[0].sets[0]).toMatchObject({ targetWeight: 60, targetReps: 8, completed: false });
  });
});
