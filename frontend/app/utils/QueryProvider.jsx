import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useApiFetch } from "./apiFetch";
import {
  clearCurrentWorkoutQuery,
  currentWorkoutQueryKey,
  currentWorkoutQueryOptions,
} from "./currentWorkoutQuery";

function createQueryClient() {
  return new QueryClient();
}

export function QueryProvider({ children }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export function CurrentWorkoutQueryLifecycle() {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const { pathname } = useLocation();
  const { apiFetch } = useApiFetch();
  const baseUrl = import.meta.env.VITE_API_URL;
  const isCurrentWorkoutRoute =
    pathname === "/currentworkout" || pathname.startsWith("/currentworkout/");

  useEffect(() => {
    if (isLoggedIn === false) {
      clearCurrentWorkoutQuery(queryClient);
      return;
    }

    const shouldPrefetch =
      isLoggedIn === true || (isLoggedIn === null && isCurrentWorkoutRoute);

    const hasCurrentWorkoutQuery = Boolean(
      queryClient.getQueryState(currentWorkoutQueryKey)
    );

    if (shouldPrefetch && !hasCurrentWorkoutQuery) {
      queryClient.prefetchQuery(
        currentWorkoutQueryOptions(apiFetch, baseUrl)
      );
    }
  }, [
    apiFetch,
    baseUrl,
    isCurrentWorkoutRoute,
    isLoggedIn,
    queryClient,
  ]);

  return null;
}
