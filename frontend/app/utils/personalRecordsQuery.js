import { queryOptions, useQuery } from "@tanstack/react-query";

export const personalRecordsQueryKey = ["personal-record-overview"];

export class PersonalRecordsQueryError extends Error {
  constructor(status, data, message) {
    const details = data?.message || data?.error;

    super(
      message ||
        (typeof details === "string"
          ? details
          : `Failed to fetch personal records (${status})`)
    );
    this.name = "PersonalRecordsQueryError";
    this.status = status;
    this.data = data;
  }
}

function parsePersonalRecords(data) {
  const payload =
    data?.data && typeof data.data === "object" && !Array.isArray(data.data)
      ? data.data
      : data;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new PersonalRecordsQueryError(
      500,
      data,
      "Personal records response was invalid"
    );
  }

  if (
    !Array.isArray(payload.personalRecordHistory) ||
    !Array.isArray(payload.exercises)
  ) {
    throw new PersonalRecordsQueryError(
      500,
      data,
      "Personal records response was invalid"
    );
  }

  return {
    personalRecordHistory: payload.personalRecordHistory,
    exercises: payload.exercises,
  };
}

export async function fetchPersonalRecords(
  apiFetch,
  baseUrl,
  signal,
  requestOptions = {}
) {
  const response = await apiFetch(`${baseUrl}/personal-records`, {
    method: "GET",
    credentials: "include",
    signal,
    ...requestOptions,
  });

  if (!response.ok) {
    throw new PersonalRecordsQueryError(response.status, response.data);
  }

  return parsePersonalRecords(response.data);
}

function shouldRetryPersonalRecords(failureCount, error) {
  if (failureCount >= 1) {
    return false;
  }

  if (error instanceof PersonalRecordsQueryError) {
    return error.status >= 500;
  }

  return true;
}

export function personalRecordsQueryOptions(
  apiFetch,
  baseUrl,
  overrides = {}
) {
  return queryOptions({
    queryKey: personalRecordsQueryKey,
    // Avoid cancelling and restarting the initial request during the
    // development StrictMode observer cleanup.
    queryFn: () => fetchPersonalRecords(apiFetch, baseUrl),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: shouldRetryPersonalRecords,
    retryOnMount: false,
    ...overrides,
  });
}

export function usePersonalRecordsQuery(apiFetch, baseUrl, options = {}) {
  return useQuery(personalRecordsQueryOptions(apiFetch, baseUrl, options));
}
