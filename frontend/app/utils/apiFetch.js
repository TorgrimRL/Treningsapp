import { useCallback } from "react";

export function useApiFetch() {
  const apiFetch = useCallback(
    async (url, options = {}) => {
      const response = await fetch(url, options);
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
    []
  );

  return { apiFetch };
}
