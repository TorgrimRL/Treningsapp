const defaultMaxMesocyclesPerUser = 250;
const defaultMaxPlanBytesPerUser = 10 * 1024 * 1024;

export class MesocycleQuotaError extends Error {
  constructor(message) {
    super(message);
    this.name = "MesocycleQuotaError";
  }
}

function parseLimit(value, fallback, name) {
  if (value === undefined || value === "") {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be a positive integer`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

export function resolveMesocycleLimits(environment = process.env) {
  return {
    maxMesocyclesPerUser: parseLimit(
      environment.MAX_MESOCYCLES_PER_USER,
      defaultMaxMesocyclesPerUser,
      "MAX_MESOCYCLES_PER_USER"
    ),
    maxPlanBytesPerUser: parseLimit(
      environment.MAX_MESOCYCLE_PLAN_BYTES_PER_USER,
      defaultMaxPlanBytesPerUser,
      "MAX_MESOCYCLE_PLAN_BYTES_PER_USER"
    ),
  };
}

export const mesocycleLimits = resolveMesocycleLimits();

export function assertMesocycleQuota({
  mesocycleCount,
  currentPlanBytes,
  replacedPlanBytes = 0,
  newPlanBytes,
  isCreate,
  limits = mesocycleLimits,
}) {
  const normalizedCount = Number(mesocycleCount) || 0;
  const normalizedCurrentBytes = Number(currentPlanBytes) || 0;
  const normalizedReplacedBytes = Number(replacedPlanBytes) || 0;
  const resultingBytes =
    normalizedCurrentBytes - normalizedReplacedBytes + newPlanBytes;

  if (isCreate && normalizedCount >= limits.maxMesocyclesPerUser) {
    throw new MesocycleQuotaError("Mesocycle count limit reached");
  }

  if (resultingBytes > limits.maxPlanBytesPerUser) {
    throw new MesocycleQuotaError("Mesocycle plan storage limit reached");
  }
}
