import { useCallback } from "react";
import { useWaitModal } from "../components/WaitModalContext";

export function useApiFetch() {
  const { showWaitModal } = useWaitModal();

  const apiFetch = useCallback(
    async (url, options = {}) => {
      const { suppressWaitModal = false, ...fetchOptions } = options;
      const response = await fetch(url, fetchOptions);
      const responseText = await response.text();
      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = responseText;
        }
      }

      if (!suppressWaitModal && data?.message === "Database went to sleep!") {
        showWaitModal(60);
      }

      return { ok: response.ok, status: response.status, data };
    },
    [showWaitModal]
  );

  return { apiFetch };
}
