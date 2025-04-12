import { WaitModalProvider } from "../components/WaitModalContext";
import { useWaitModal } from "../components/WaitModalContext";

export function useApiFetch() {
  const { showWaitModal } = useWaitModal();

  async function apiFetch(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.message && data.message === "Database went to sleep!") {
      showWaitModal(60);
      console.log("Database was sleeping");
      return { ok: response.ok, data, hadSleep: true };
    }
    return { ok: response.ok, data, hadSleep: false };
  }

  return { apiFetch };
}
