import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./login";
import { useAuth } from "../utils/AuthContext";

vi.mock("../utils/AuthContext", () => ({ useAuth: vi.fn() }));

function CurrentPath() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <CurrentPath />
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows a status instead of a blank page and starts login once", async () => {
    const startLogin = vi.fn().mockResolvedValue(undefined);
    useAuth.mockReturnValue({
      authCheckInProgress: false,
      isLoggedIn: false,
      isLoggingOut: false,
      startLogin,
    });

    renderPage();

    expect(screen.getByTestId("login-redirect-status")).toBeInTheDocument();
    await waitFor(() => expect(startLogin).toHaveBeenCalledOnce());
  });

  it("does not start login while a logout is in flight", async () => {
    const startLogin = vi.fn();
    useAuth.mockReturnValue({
      authCheckInProgress: false,
      isLoggedIn: false,
      isLoggingOut: true,
      startLogin,
    });

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("login-redirect-status")).toBeInTheDocument()
    );
    expect(startLogin).not.toHaveBeenCalled();
  });

  it("sends already authenticated users to the front page", async () => {
    useAuth.mockReturnValue({
      authCheckInProgress: false,
      isLoggedIn: true,
      isLoggingOut: false,
      startLogin: vi.fn(),
    });

    renderPage();

    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/"));
  });

  it("offers a retry when login cannot be opened", async () => {
    const startLogin = vi
      .fn()
      .mockRejectedValueOnce(new Error("no config"))
      .mockResolvedValueOnce(undefined);
    useAuth.mockReturnValue({
      authCheckInProgress: false,
      isLoggedIn: false,
      isLoggingOut: false,
      startLogin,
    });

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("login-redirect-error")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("login-retry-button"));

    await waitFor(() => expect(startLogin).toHaveBeenCalledTimes(2));
    expect(screen.queryByTestId("login-redirect-error")).not.toBeInTheDocument();
  });
});
