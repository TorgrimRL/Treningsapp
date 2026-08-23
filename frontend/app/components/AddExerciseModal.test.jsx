import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import AddExerciseModal from "./AddExerciseModal";

vi.mock("./AppModal", () => ({
  default: ({ children, contentLabel, isOpen }) =>
    isOpen ? (
      <div aria-label={contentLabel} role="dialog">
        {children}
      </div>
    ) : null,
}));

afterEach(cleanup);

async function fillExercise(user, name) {
  await user.type(screen.getByLabelText("Exercise name"), name);
  await user.selectOptions(screen.getByLabelText("Exercise type"), "dumbbell");
  await user.selectOptions(screen.getByLabelText("Muscle Group"), "Back");
  await user.type(
    screen.getByLabelText("Video Link"),
    "https://example.com/exercise"
  );
}

describe("AddExerciseModal", () => {
  it("clears the form after an exercise is saved", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue({ ok: true });

    render(
      <AddExerciseModal
        isOpen
        onRequestClose={onRequestClose}
        onSave={onSave}
      />
    );

    await fillExercise(user, "Chest Supported Row");
    await user.click(screen.getByRole("button", { name: "Save exercise" }));

    expect(onSave).toHaveBeenCalledWith({
      name: "Chest Supported Row",
      type: "dumbbell",
      muscleGroup: "Back",
      videolink: "https://example.com/exercise",
    });
    expect(onRequestClose).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Exercise name")).toHaveValue("");
    expect(screen.getByLabelText("Exercise type")).toHaveValue("");
    expect(screen.getByLabelText("Muscle Group")).toHaveValue("");
    expect(screen.getByLabelText("Video Link")).toHaveValue("");
  });

  it("keeps the entered name when saving fails", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue({
      ok: false,
      error: "Exercise could not be saved",
    });

    render(
      <AddExerciseModal
        isOpen
        onRequestClose={onRequestClose}
        onSave={onSave}
      />
    );

    await fillExercise(user, "Chest Supported Row");
    await user.click(screen.getByRole("button", { name: "Save exercise" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Exercise could not be saved"
    );
    expect(screen.getByLabelText("Exercise name")).toHaveValue(
      "Chest Supported Row"
    );
    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
