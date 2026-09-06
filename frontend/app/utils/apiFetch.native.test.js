import { renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const getAccessToken = vi.fn(async () => "native-access-token");

vi.mock("./AuthContext", () => ({
  useOptionalAuth: () => ({
    getAccessToken,
    usesBearerAuth: true,
  }),
}));

const { useApiFetch } = await import("./apiFetch");

afterEach(() => {
  vi.unstubAllGlobals();
  getAccessToken.mockClear();
});

it("uses a Bearer token and skips cookie CSRF for native requests", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ updated: true }),
  });
  vi.stubGlobal("fetch", fetchMock);

  const { result } = renderHook(() => useApiFetch());
  await result.current.apiFetch("https://api.example.com/api/mesocycles/1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Native plan" }),
  });

  const [, requestOptions] = fetchMock.mock.calls[0];
  expect(getAccessToken).toHaveBeenCalledOnce();
  expect(requestOptions.credentials).toBe("omit");
  expect(requestOptions.headers.get("Authorization")).toBe(
    "Bearer native-access-token"
  );
  expect(requestOptions.headers.has("X-CSRF-Token")).toBe(false);
});
