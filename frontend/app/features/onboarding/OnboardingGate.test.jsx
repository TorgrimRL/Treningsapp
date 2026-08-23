import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingGate from "./OnboardingGate";
import { useAuth } from "../../utils/AuthContext";

vi.mock("../../utils/AuthContext", () => ({ useAuth: vi.fn() }));

function CurrentPath() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

function ExitFixture() {
  const location = useLocation();
  return <><div data-testid="path">{location.pathname}</div><Link to="/currentworkout">Exit setup</Link></>;
}

function renderGate(initialEntry = "/currentworkout") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="*" element={<OnboardingGate><CurrentPath /></OnboardingGate>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("OnboardingGate", () => {
  afterEach(cleanup);

  beforeEach(() => {
    sessionStorage.clear();
    useAuth.mockReturnValue({
      currentUser: { onboardingStatus: "not_started" },
      isLoggedIn: true,
      authCheckInProgress: false,
    });
  });

  it("sends new users to guided setup", async () => {
    renderGate();
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/onboarding"));
  });

  it("does not send completed users back to onboarding", () => {
    useAuth.mockReturnValue({
      currentUser: { onboardingStatus: "completed" },
      isLoggedIn: true,
      authCheckInProgress: false,
    });
    renderGate();
    expect(screen.getByTestId("path")).toHaveTextContent("/currentworkout");
  });

  it("allows onboarding routes without a redirect loop", () => {
    renderGate("/import-plan");
    expect(screen.getByTestId("path")).toHaveTextContent("/import-plan");
  });

  it("allows an in-progress draft to be left and resumed later", async () => {
    useAuth.mockReturnValue({
      currentUser: { id: 7, onboardingStatus: "in_progress", onboardingStartedAt: "2026-08-23T10:00:00.000Z" },
      isLoggedIn: true,
      authCheckInProgress: false,
    });
    render(
      <MemoryRouter initialEntries={["/onboarding"]}>
        <Routes>
          <Route path="*" element={<OnboardingGate><ExitFixture /></OnboardingGate>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("link", { name: "Exit setup" }));
    await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/currentworkout"));
  });
});
