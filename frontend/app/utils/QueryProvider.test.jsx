import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CurrentWorkoutQueryLifecycle } from "./QueryProvider";
import { useAuth } from "./AuthContext";

vi.mock("./AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("./apiFetch", () => ({ useApiFetch: () => ({ apiFetch: vi.fn() }) }));

describe("CurrentWorkoutQueryLifecycle", () => {
  afterEach(cleanup);

  it("drops every cached query once the session ends", async () => {
    useAuth.mockReturnValue({ isLoggedIn: false });

    const queryClient = new QueryClient();
    queryClient.setQueryData(["current-workout"], { id: 1 });
    queryClient.setQueryData(["personal-records"], [{ id: 2 }]);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(2);

    render(
      <MemoryRouter initialEntries={["/mesocycles"]}>
        <QueryClientProvider client={queryClient}>
          <CurrentWorkoutQueryLifecycle />
        </QueryClientProvider>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    );
  });
});
