import { describe, expect, it, vi } from "vitest";
import {
  CurrentWorkoutQueryError,
  currentWorkoutQueryOptions,
  fetchCurrentWorkout,
} from "./currentWorkoutQuery";
import {
  PersonalRecordsQueryError,
  fetchPersonalRecords,
  personalRecordsQueryOptions,
} from "./personalRecordsQuery";
import {
  MesocycleHistoryQueryError,
  fetchMesocycleHistory,
  parseMesocycleHistory,
} from "./mesocycleHistoryQuery";

const apiFetch = vi.fn();

describe("frontend query contracts", () => {
  it("maps a missing current workout to the empty state", async () => {
    apiFetch.mockResolvedValue({ ok: false, status: 404, data: {} });
    await expect(fetchCurrentWorkout(apiFetch, "/api")).resolves.toBeNull();
  });

  it("retries only server failures for the current workout", () => {
    const retry = currentWorkoutQueryOptions(apiFetch, "/api").retry;
    expect(retry(0, new CurrentWorkoutQueryError(500, {}))).toBe(true);
    expect(retry(0, new CurrentWorkoutQueryError(401, {}))).toBe(false);
    expect(retry(1, new CurrentWorkoutQueryError(500, {}))).toBe(false);
  });

  it("validates personal-record responses and retry policy", async () => {
    apiFetch.mockResolvedValue({ ok: true, status: 200, data: { exercises: [] } });
    await expect(fetchPersonalRecords(apiFetch, "/api")).rejects.toBeInstanceOf(PersonalRecordsQueryError);
    const retry = personalRecordsQueryOptions(apiFetch, "/api").retry;
    expect(retry(0, new PersonalRecordsQueryError(500, {}))).toBe(true);
    expect(retry(0, new PersonalRecordsQueryError(401, {}))).toBe(false);
  });

  it("unwraps stored workout plans and rejects invalid history", async () => {
    expect(parseMesocycleHistory({ data: { id: 3, plan: "[]" } })).toMatchObject({ id: 3, plan: [] });
    expect(() => parseMesocycleHistory({ data: { id: 3, plan: "not-json" } })).toThrow(MesocycleHistoryQueryError);
    apiFetch.mockResolvedValue({ ok: false, status: 500, data: { error: "temporary" } });
    await expect(fetchMesocycleHistory(apiFetch, "/api", 3)).rejects.toBeInstanceOf(MesocycleHistoryQueryError);
  });
});

