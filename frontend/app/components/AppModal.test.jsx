import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let AppModal;
let appRoot;

beforeAll(async () => {
  appRoot = document.createElement("div");
  appRoot.id = "root";
  document.body.append(appRoot);
  ({ default: AppModal } = await import("./AppModal"));
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  appRoot.remove();
});

describe("AppModal", () => {
  it("locks document scrolling until the last modal closes", async () => {
    const onRequestClose = vi.fn();
    const renderModals = (parentOpen, childOpen) => (
      <>
        <AppModal
          isOpen={parentOpen}
          onRequestClose={onRequestClose}
          contentLabel="Parent modal"
        >
          Parent content
        </AppModal>
        <AppModal
          isOpen={childOpen}
          onRequestClose={onRequestClose}
          contentLabel="Child modal"
        >
          Child content
        </AppModal>
      </>
    );
    const { rerender } = render(renderModals(true, true));

    await waitFor(() => {
      expect(document.documentElement).toHaveClass("ReactModal__Html--open");
      expect(document.body).toHaveClass("ReactModal__Body--open");
    });

    const parentDialog = screen.getByRole("dialog", { name: "Parent modal" });
    expect(parentDialog.parentElement).toHaveClass(
      "overflow-hidden",
      "overscroll-none",
      "bg-black/50"
    );
    expect(parentDialog.querySelector(":scope > div")).toHaveClass(
      "overflow-y-auto",
      "overscroll-contain"
    );

    rerender(renderModals(true, false));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Child modal" })).not.toBeInTheDocument();
    });
    expect(document.documentElement).toHaveClass("ReactModal__Html--open");
    expect(document.body).toHaveClass("ReactModal__Body--open");

    rerender(renderModals(false, false));
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass("ReactModal__Html--open");
      expect(document.body).not.toHaveClass("ReactModal__Body--open");
    });
  });
});
