import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkoutExerciseCard from "./WorkoutExerciseCard";

vi.mock("./ExerciseNote", () => ({ default: () => null }));
vi.mock("./WorkoutExerciseMenu", () => ({ default: () => null }));
vi.mock("./WorkoutSetRow", () => ({
  default: ({ setIndex }) => <div data-testid={`set-row-${setIndex}`} />,
}));

afterEach(cleanup);

const renderCard = (exerciseSets) =>
  render(
    <WorkoutExerciseCard
      exercise={{ exercise: "Bench Press", muscleGroup: "Chest" }}
      exerciseIndex={0}
      exerciseSets={exerciseSets}
      openSetMenus={{}}
      setMenuRefs={{ current: {} }}
    />
  );

describe("WorkoutExerciseCard RIR explanation", () => {
  it("shows one contextual explanation when reps or targets use RIR", () => {
    renderCard([
      { reps: "3 RIR", targetReps: 8 },
      { reps: 0, targetReps: "2 RIR" },
    ]);

    expect(screen.getAllByTestId("rir-explanation-0")).toHaveLength(1);
    expect(screen.getByTestId("rir-explanation-0")).toHaveTextContent(
      "RIR means “reps in reserve”"
    );
    expect(screen.getByTestId("rir-explanation-0")).toHaveTextContent(
      "3 RIR means stopping with about 3 reps left."
    );
  });

  it("does not show the explanation for numeric reps", () => {
    renderCard([{ reps: 8, targetReps: 8 }]);

    expect(screen.queryByTestId("rir-explanation-0")).not.toBeInTheDocument();
  });
});
