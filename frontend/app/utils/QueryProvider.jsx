import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useApiFetch } from "./apiFetch";
import {
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
      // Every cached query is per-user and authenticated, so drop the whole
      // cache however the session ended (logout, 401 from /me, token expiry).
      void queryClient.cancelQueries();
      queryClient.clear();
      return;
    }

    const shouldPrefetch = isCurrentWorkoutRoute && isLoggedIn !== false;

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
