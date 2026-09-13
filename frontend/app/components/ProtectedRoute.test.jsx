import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../utils/AuthContext";

vi.mock("../utils/AuthContext", () => ({ useAuth: vi.fn() }));

function CurrentPath() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={["/currentworkout"]}>
      <CurrentPath />
      <Routes>
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <div data-testid="protected">Secret</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  afterEach(cleanup);

  it("renders children while logged in", () => {
    useAuth.mockReturnValue({ isLoggedIn: true, authCheckInProgress: false });
    renderRoute();
    expect(screen.getByTestId("protected")).toBeInTheDocument();
  });

  it("shows the fallback while the auth check is running", () => {
    useAuth.mockReturnValue({ isLoggedIn: null, authCheckInProgress: true });
    render(
      <MemoryRouter initialEntries={["/currentworkout"]}>
        <ProtectedRoute loadingFallback={<div data-testid="fallback" />}>
          <div data-testid="protected">Secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("stays put while a logout navigation is in flight", async () => {
    useAuth.mockReturnValue({
      isLoggedIn: false,
      authCheckInProgress: false,
      isLoggingOut: true,
    });
    renderRoute();

    await waitFor(() =>
      expect(screen.getByTestId("path").textContent).toBe("/currentworkout")
    );
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("replaces the protected entry with /login when logged out", async () => {
    useAuth.mockReturnValue({ isLoggedIn: false, authCheckInProgress: false });
    renderRoute();

    await waitFor(() =>
      expect(screen.getByTestId("path").textContent).toBe("/login")
    );
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });
});
