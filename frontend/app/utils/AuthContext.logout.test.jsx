import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

const auth0Logout = vi.fn().mockResolvedValue(undefined);
const loginWithRedirect = vi.fn().mockResolvedValue(undefined);
const getAccessTokenSilently = vi.fn().mockResolvedValue("access-token");

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => true },
}));
vi.mock("@capacitor/browser", () => ({
  Browser: { open: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
    getLaunchUrl: vi.fn().mockResolvedValue(null),
  },
}));
vi.mock("@auth0/auth0-react", () => ({
  Auth0Provider: ({ children }) => children,
  useAuth0: () => ({
    getAccessTokenSilently,
    handleRedirectCallback: vi.fn(),
    isLoading: false,
    loginWithRedirect,
    logout: auth0Logout,
  }),
}));

const CALLBACK_URL =
  "com.setoptimizer.app://example.eu.auth0.com/capacitor/com.setoptimizer.app/callback";

function LogoutFixture() {
  const { performLogout } = useAuth();
  return (
    <button type="button" onClick={() => void performLogout()}>
      Logout
    </button>
  );
}

function CurrentPath() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

describe("native performLogout", () => {
  afterEach(cleanup);

  beforeEach(() => {
    auth0Logout.mockClear();
    loginWithRedirect.mockClear();
    vi.stubEnv("VITE_API_URL", "https://api.example.com/api");
    vi.stubEnv("VITE_AUTH0_DOMAIN", "example.eu.auth0.com");
    vi.stubEnv("VITE_AUTH0_IOS_CLIENT_ID", "client-id");
    vi.stubEnv("VITE_AUTH0_AUDIENCE", "https://api.example.com");
    vi.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ isLoggedIn: true, user: { id: 1, onboardingStatus: "completed" } }),
    });
  });

  it("returns to the front page instead of the blank login shim", async () => {
    render(
      <MemoryRouter initialEntries={["/currentworkout"]}>
        <AuthProvider>
          <CurrentPath />
          <Routes>
            <Route
              path="/currentworkout"
              element={
                <ProtectedRoute>
                  <LogoutFixture />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<div data-testid="landing">Landing</div>} />
            <Route path="/login" element={<div data-testid="login-shim" />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const logoutButton = await screen.findByRole("button", { name: "Logout" });
    fireEvent.click(logoutButton);

    await waitFor(() => expect(screen.getByTestId("landing")).toBeInTheDocument());
    expect(screen.getByTestId("path").textContent).toBe("/");
    expect(screen.queryByTestId("login-shim")).not.toBeInTheDocument();
    expect(loginWithRedirect).not.toHaveBeenCalled();
    expect(auth0Logout).toHaveBeenCalledWith(
      expect.objectContaining({ logoutParams: { returnTo: CALLBACK_URL } })
    );
  });
});
