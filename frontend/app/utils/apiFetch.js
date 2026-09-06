import { useCallback } from "react";
import { useOptionalAuth } from "./AuthContext";

const csrfProtectedMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
let csrfTokenPromise;

export async function getCsrfToken() {
  if (!csrfTokenPromise) {
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
    csrfTokenPromise = fetch(`${baseUrl}/csrf-token`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to get a CSRF token");
        }

        const data = await response.json();
        if (!data.csrfToken) {
          throw new Error("CSRF token response was invalid");
        }

        return data.csrfToken;
      })
      .catch((error) => {
        csrfTokenPromise = undefined;
        throw error;
      });
  }

  return csrfTokenPromise;
}

export function useApiFetch() {
  const auth = useOptionalAuth();
  const apiFetch = useCallback(
    async (url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();
      const requestOptions = {
        credentials: auth?.usesBearerAuth ? "omit" : "include",
        ...options,
      };
      const headers = new Headers(options.headers);

      if (auth?.usesBearerAuth) {
        headers.set("Authorization", `Bearer ${await auth.getAccessToken()}`);
        requestOptions.headers = headers;
      } else if (csrfProtectedMethods.has(method)) {
        headers.set("X-CSRF-Token", await getCsrfToken());
        requestOptions.headers = headers;
      }

      const response = await fetch(url, requestOptions);
      const responseText = await response.text();
      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = responseText;
        }
      }

      return { ok: response.ok, status: response.status, data };
    },
    [auth]
  );

  return { apiFetch };
}
