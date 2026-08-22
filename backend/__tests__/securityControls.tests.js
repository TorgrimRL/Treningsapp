import { jest } from "@jest/globals";
import request from "supertest";
import {
  createCorsOptions,
  resolveAllowedOrigins,
} from "../utils/corsOptions.js";
import {
  MesocycleQuotaError,
  assertMesocycleQuota,
  resolveMesocycleLimits,
} from "../utils/mesocycleLimits.js";
import {
  PlanValidationError,
  validateMesocycleInput,
} from "../utils/planValidation.js";
import { loadAppWithQuery } from "../testHelpers/loadApp.js";

function validPlan() {
  return [
    {
      label: "Day 1",
      exercises: [
        {
          exercise: "Bench Press",
          sets: [{ completed: false }],
        },
      ],
    },
  ];
}

describe("security boundary utilities", () => {
  it("excludes development origins from the production CORS allowlist", () => {
    const origins = resolveAllowedOrigins({
      nodeEnv: "production",
      frontendUrl: "https://training.example.com/",
    });

    expect(origins).toContain("https://setoptimizer.com");
    expect(origins).toContain("https://training.example.com");
    expect(origins).not.toContain("http://localhost:5173");
  });

  it("rejects insecure or path-bearing production frontend URLs", () => {
    expect(() =>
      resolveAllowedOrigins({
        nodeEnv: "production",
        frontendUrl: "http://setoptimizer.com",
      })
    ).toThrow("FRONTEND_URL must be an absolute HTTP(S) origin");
    expect(() =>
      resolveAllowedOrigins({
        nodeEnv: "production",
        frontendUrl: "https://setoptimizer.com/app",
      })
    ).toThrow("FRONTEND_URL must be an absolute HTTP(S) origin");
  });

  it("rejects a non-allowlisted credentialed origin", async () => {
    const options = createCorsOptions({
      nodeEnv: "production",
      frontendUrl: "https://setoptimizer.com",
    });
    const error = await new Promise((resolve) => {
      options.origin("http://localhost:5173", (originError) => {
        resolve(originError);
      });
    });

    expect(error).toMatchObject({ code: "ECORS" });
  });

  it("validates mesocycle metadata and dropset cardinality", () => {
    const plan = validPlan();
    plan[0].exercises[0].dropset = { enabled: true, setCount: 8 };

    expect(
      validateMesocycleInput({ weeks: 6, daysPerWeek: 1, plan })
    ).toBe(plan);

    plan[0].exercises[0].dropset.setCount = 9;
    expect(() =>
      validateMesocycleInput({ weeks: 6, daysPerWeek: 1, plan })
    ).toThrow(PlanValidationError);
  });

  it("enforces aggregate plan storage and validates quota configuration", () => {
    expect(() =>
      assertMesocycleQuota({
        mesocycleCount: 2,
        currentPlanBytes: 100,
        replacedPlanBytes: 20,
        newPlanBytes: 50,
        isCreate: false,
        limits: {
          maxMesocyclesPerUser: 10,
          maxPlanBytesPerUser: 120,
        },
      })
    ).toThrow(MesocycleQuotaError);

    expect(() =>
      resolveMesocycleLimits({ MAX_MESOCYCLES_PER_USER: "unlimited" })
    ).toThrow("MAX_MESOCYCLES_PER_USER must be a positive integer");
  });
});

describe("exception responses", () => {
  it("does not return raw database errors from the public health endpoint", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const query = jest.fn(async () => {
      const error = new Error("database-password=do-not-return");
      error.code = "SQLITE_FAILURE";
      throw error;
    });

    try {
      const app = await loadAppWithQuery(query);
      const response = await request(app).get("/api/ping").expect(503);

      expect(response.body).toEqual({ message: "Service unavailable" });
      expect(JSON.stringify(response.body)).not.toContain("do-not-return");
    } finally {
      errorSpy.mockRestore();
    }
  });
});
