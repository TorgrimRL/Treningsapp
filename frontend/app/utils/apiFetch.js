import { useCallback } from "react";
import { useWaitModal } from "../components/WaitModalContext";

export function useApiFetch() {
  const { showWaitModal } = useWaitModal();

  const apiFetch = useCallback(async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.message && data.message === "Database went to sleep!") {
      showWaitModal(60);
      return { ok: response.ok, data };
    }
    return { ok: response.ok, data };
  }, [showWaitModal]);

  return { apiFetch };
}
