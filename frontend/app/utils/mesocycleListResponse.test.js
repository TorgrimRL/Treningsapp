import { describe, expect, it } from "vitest";
import { parseMesocycleListResponse } from "./mesocycleListResponse";

describe("mesocycle list response", () => {
  it("accepts the direct list returned by a normal database query", () => {
    expect(parseMesocycleListResponse([{ id: 1 }])).toEqual([{ id: 1 }]);
  });

  it("accepts the wrapped list returned after a database retry", () => {
    expect(
      parseMesocycleListResponse({
        data: [{ id: 1 }],
        message: "Database went to sleep!",
      })
    ).toEqual([{ id: 1 }]);
  });

  it("returns an empty list for an invalid response", () => {
    expect(parseMesocycleListResponse({ message: "unexpected" })).toEqual([]);
  });
});
