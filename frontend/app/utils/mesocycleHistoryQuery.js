import { queryOptions, useQuery } from "@tanstack/react-query";

export const mesocycleHistoryQueryKey = (id) => [
  "mesocycle-history",
  id,
];

export class MesocycleHistoryQueryError extends Error {
  constructor(status, data, message) {
    const details = data?.message || data?.error;

    super(
      message ||
        (typeof details === "string"
          ? details
          : `Failed to fetch workout history (${status})`)
    );
    this.name = "MesocycleHistoryQueryError";
    this.status = status;
    this.data = data;
  }
}

function unwrapMesocycle(data) {
  if (
    data?.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data) &&
    data.plan === undefined
  ) {
    return data.data;
  }

  return data;
}

export function parseMesocycleHistory(data) {
  const mesocycle = unwrapMesocycle(data);
  if (!mesocycle || typeof mesocycle !== "object") {
    throw new MesocycleHistoryQueryError(
      500,
      data,
      "Workout history response was invalid"
    );
  }

  let plan = mesocycle.plan;
  if (typeof plan === "string") {
    try {
      plan = JSON.parse(plan);
    } catch {
      throw new MesocycleHistoryQueryError(
        500,
        data,
        "Stored workout history has invalid plan data"
      );
    }
  }

  if (!Array.isArray(plan)) {
    throw new MesocycleHistoryQueryError(
      500,
      data,
      "Stored workout history has invalid plan data"
    );
  }

  return {
    ...mesocycle,
    plan,
  };
}

export async function fetchMesocycleHistory(
  apiFetch,
  baseUrl,
  id,
  signal
) {
  const response = await apiFetch(
    `${baseUrl}/mesocycles/${encodeURIComponent(id)}`,
    {
      method: "GET",
      credentials: "include",
      signal,
    }
  );

  if (!response.ok) {
    throw new MesocycleHistoryQueryError(
      response.status,
      response.data
    );
  }

  return parseMesocycleHistory(response.data);
}

function shouldRetryMesocycleHistory(failureCount, error) {
  if (failureCount >= 1) {
    return false;
  }

  if (error instanceof MesocycleHistoryQueryError) {
    return error.status >= 500;
  }

  return true;
}

export function mesocycleHistoryQueryOptions(
  apiFetch,
  baseUrl,
  id,
  overrides = {}
) {
  return queryOptions({
    queryKey: mesocycleHistoryQueryKey(id),
    queryFn: ({ signal }) =>
      fetchMesocycleHistory(apiFetch, baseUrl, id, signal),
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: shouldRetryMesocycleHistory,
    retryOnMount: false,
    ...overrides,
  });
}

export function useMesocycleHistoryQuery(
  apiFetch,
  baseUrl,
  id,
  options = {}
) {
  const { enabled = true, ...queryOverrides } = options;
  const hasId = id !== undefined && id !== null && id !== "";

  return useQuery(
    mesocycleHistoryQueryOptions(apiFetch, baseUrl, id, {
      ...queryOverrides,
      enabled: hasId && enabled,
    })
  );
}
