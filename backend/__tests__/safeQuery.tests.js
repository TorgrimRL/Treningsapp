import { jest } from "@jest/globals";

async function loadSafeQueryWithDb(db) {
  jest.resetModules();
  jest.unstable_mockModule("../remoteDatabase.js", () => ({
    default: db,
  }));
  return import("../utils/safeQuery.js");
}

function connectionResetError() {
  const error = new Error("connection reset");
  error.code = "ECONNRESET";
  return error;
}

describe("safeQuery regression", () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    errorSpy.mockRestore();
  });

  it("returns query results without marking retries on first success", async () => {
    const db = { sql: jest.fn().mockResolvedValue([{ ok: 1 }]) };
    const { safeQuery } = await loadSafeQueryWithDb(db);

    //noinspection SqlNoDataSourceInspection
    await expect(safeQuery`SELECT 1`).resolves.toEqual({
      result: [{ ok: 1 }],
      hadRetry: false,
    });
    expect(db.sql).toHaveBeenCalledTimes(1);
  });

  it("retries ECONNRESET and marks hadRetry after recovery", async () => {
    jest.useFakeTimers();
    const db = {
      sql: jest
        .fn()
        .mockRejectedValueOnce(connectionResetError())
        .mockResolvedValueOnce([{ ok: 1 }]),
    };
    const { safeQuery } = await loadSafeQueryWithDb(db);

    //noinspection SqlNoDataSourceInspection
    const promise = safeQuery`SELECT 1`;
    const expectation = expect(promise).resolves.toEqual({
      result: [{ ok: 1 }],
      hadRetry: true,
    });

    await jest.advanceTimersByTimeAsync(1000);
    await expectation;
    expect(db.sql).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-connection errors", async () => {
    const error = new Error("syntax error");
    error.code = "SQLITE_ERROR";
    const db = { sql: jest.fn().mockRejectedValue(error) };
    const { safeQuery } = await loadSafeQueryWithDb(db);

    //noinspection SqlNoDataSourceInspection
    await expect(safeQuery`SELECT broken`).rejects.toBe(error);
    expect(db.sql).toHaveBeenCalledTimes(1);
  });

  it("stops after the configured maximum retry attempts", async () => {
    jest.useFakeTimers();
    const db = { sql: jest.fn().mockRejectedValue(connectionResetError()) };
    const { safeQuery } = await loadSafeQueryWithDb(db);

    //noinspection SqlNoDataSourceInspection
    const promise = safeQuery`SELECT 1`;
    const expectation = expect(promise).rejects.toThrow(/Max antall/);

    for (const delay of [1000, 2000, 4000, 8000, 16000, 32000, 64000]) {
      await jest.advanceTimersByTimeAsync(delay);
    }

    await expectation;
    expect(db.sql).toHaveBeenCalledTimes(7);
  });
});
