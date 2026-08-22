import { describe, expect, it } from "vitest";
import { exercises, muscleGroups } from "./constants";

describe("exercise catalog", () => {
  it("classifies wrist exercises under Forearms", () => {
    expect(muscleGroups).toContain("Forearms");
    expect(exercises.Forearms).toEqual([
      { name: "Barbell Wrist Curl", type: "barbell" },
      { name: "Dumbbell Wrist Curl", type: "dumbbell" },
      { name: "Cable Wrist Curl", type: "cable" },
      { name: "Barbell Wrist Extension", type: "barbell" },
      { name: "Dumbbell Wrist Extension", type: "dumbbell" },
      { name: "Cable Wrist Extension", type: "cable" },
    ]);

    const wristExercisesOutsideForearms = Object.entries(exercises)
      .filter(([muscleGroup]) => muscleGroup !== "Forearms")
      .flatMap(([, exerciseList]) => exerciseList)
      .filter(
        ({ name }) =>
          name.includes("Wrist Curl") || name.includes("Wrist Extension")
      );

    expect(wristExercisesOutsideForearms).toEqual([]);
  });
});
