import {
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

export const currentWorkoutQueryKey = ["current-workout"];

export class CurrentWorkoutQueryError extends Error {
  constructor(status, data) {
    const details = data?.message || data?.error;
    const message =
      typeof details === "string"
        ? details
        : `Failed to fetch current workout (${status})`;

    super(message);
    this.name = "CurrentWorkoutQueryError";
    this.status = status;
    this.data = data;
  }
}

function shouldRetryCurrentWorkout(failureCount, error) {
  if (failureCount >= 1) {
    return false;
  }

  if (error instanceof CurrentWorkoutQueryError) {
    return error.status >= 500;
  }

  return true;
}

export async function fetchCurrentWorkout(apiFetch, baseUrl, signal) {
  const response = await apiFetch(`${baseUrl}/current-workout`, {
    method: "GET",
    credentials: "include",
    signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new CurrentWorkoutQueryError(response.status, response.data);
  }

  return response.data?.data ?? response.data;
}

export function currentWorkoutQueryOptions(
  apiFetch,
  baseUrl,
  overrides = {}
) {
  return queryOptions({
    queryKey: currentWorkoutQueryKey,
    // Consuming TanStack's signal makes the StrictMode observer cleanup cancel
    // and restart an in-flight prefetch, which duplicates its retry sequence.
    queryFn: () => fetchCurrentWorkout(apiFetch, baseUrl),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: shouldRetryCurrentWorkout,
    retryOnMount: false,
    ...overrides,
  });
}

export function useCurrentWorkoutQuery(apiFetch, baseUrl, options = {}) {
  return useQuery(currentWorkoutQueryOptions(apiFetch, baseUrl, options));
}

export async function clearCurrentWorkoutQuery(queryClient) {
  await queryClient.cancelQueries({
    queryKey: currentWorkoutQueryKey,
    exact: true,
  });
  queryClient.removeQueries({
    queryKey: currentWorkoutQueryKey,
    exact: true,
  });
}

export function useCurrentWorkoutCache(apiFetch, baseUrl) {
  const queryClient = useQueryClient();

  const setCurrentWorkout = useCallback(
    (workout) => {
      queryClient.setQueryData(currentWorkoutQueryKey, workout);
    },
    [queryClient]
  );

  const invalidateCurrentWorkout = useCallback(
    ({ refetchType = "none" } = {}) =>
      queryClient.invalidateQueries({
        queryKey: currentWorkoutQueryKey,
        exact: true,
        refetchType,
      }),
    [queryClient]
  );

  const fetchLatestCurrentWorkout = useCallback(
    () =>
      queryClient.fetchQuery(
        currentWorkoutQueryOptions(apiFetch, baseUrl, { staleTime: 0 })
      ),
    [apiFetch, baseUrl, queryClient]
  );

  const clearCurrentWorkout = useCallback(
    () => clearCurrentWorkoutQuery(queryClient),
    [queryClient]
  );

  return {
    setCurrentWorkout,
    invalidateCurrentWorkout,
    fetchCurrentWorkout: fetchLatestCurrentWorkout,
    clearCurrentWorkout,
  };
}
