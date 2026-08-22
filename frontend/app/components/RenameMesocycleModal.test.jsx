import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import RenameMesocycleModal from "./RenameMesocycleModal";

vi.mock("./AppModal", () => ({
  default: ({ children, contentLabel, isOpen }) =>
    isOpen ? (
      <div aria-label={contentLabel} role="dialog">
        {children}
      </div>
    ) : null,
}));

afterEach(cleanup);

describe("RenameMesocycleModal", () => {
  it("prefills the name and saves a changed, trimmed value", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue({ ok: true });

    render(
      <RenameMesocycleModal
        isOpen
        mesocycle={{ id: 7, name: "Current block" }}
        onRequestClose={onRequestClose}
        onSave={onSave}
      />
    );

    const nameInput = screen.getByLabelText("Training block name");
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(nameInput).toHaveValue("Current block");
    expect(saveButton).toBeDisabled();

    await user.clear(nameInput);
    await user.type(nameInput, "   ");
    expect(saveButton).toBeDisabled();

    await user.type(nameInput, "Renamed block   ");
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith("Renamed block");
    expect(onRequestClose).toHaveBeenCalledOnce();
  });

  it("keeps the modal open and displays an API error", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue({
      ok: false,
      error: "Mesocycle name is already in use",
    });

    render(
      <RenameMesocycleModal
        isOpen
        mesocycle={{ id: 8, name: "Current block" }}
        onRequestClose={onRequestClose}
        onSave={onSave}
      />
    );

    const nameInput = screen.getByLabelText("Training block name");
    await user.clear(nameInput);
    await user.type(nameInput, "Existing block");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Mesocycle name is already in use"
    );
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});
