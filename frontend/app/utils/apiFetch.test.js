import { renderHook } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { useApiFetch } from "./apiFetch";

beforeAll(() => {
  vi.stubEnv("VITE_API_URL", "https://api.example.com/api");
});

afterAll(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("adds an issued CSRF token to state-changing requests", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: "test-csrf-token" }),
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ updated: true }),
    });
  vi.stubGlobal("fetch", fetchMock);

  const { result } = renderHook(() => useApiFetch());
  const response = await result.current.apiFetch(
    "https://api.example.com/api/mesocycles/1/name",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New name" }),
    }
  );

  expect(response).toEqual({
    ok: true,
    status: 200,
    data: { updated: true },
  });
  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    "https://api.example.com/api/csrf-token",
    {
      method: "GET",
      credentials: "include",
    }
  );

  const [, requestOptions] = fetchMock.mock.calls[1];
  expect(requestOptions.credentials).toBe("include");
  expect(requestOptions.headers.get("Content-Type")).toBe("application/json");
  expect(requestOptions.headers.get("X-CSRF-Token")).toBe("test-csrf-token");
});
