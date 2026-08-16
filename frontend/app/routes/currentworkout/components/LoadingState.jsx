import { useEffect, useState } from "react";
import PageContainer from "../../../components/PageContainer";

export default function LoadingState() {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowStatus(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <PageContainer size="narrow" className="min-w-0 md:px-6">
      <div data-testid="current-workout-loading" aria-busy="true" className="min-w-0">
        <div className="sticky top-12 z-20 border-b border-darkestGray bg-darkGray shadow-md">
          <div className="flex h-12 items-center justify-between px-4">
            <div className="h-4 w-28 rounded bg-gray-700 motion-safe:animate-pulse" />
            <div className="h-4 w-16 rounded bg-gray-700 motion-safe:animate-pulse" />
          </div>
          <div className="px-4 pb-4">
            <div className="h-6 w-48 rounded bg-gray-700 motion-safe:animate-pulse" />
          </div>
        </div>
        <div className="space-y-px">
          {[0, 1, 2].map((row) => (
            <div key={row} className="border-b border-gray-800 bg-darkGray px-4 py-5">
              <div className="h-5 w-40 rounded bg-gray-700 motion-safe:animate-pulse" />
              <div className="mt-4 flex gap-3">
                <div className="h-10 flex-1 rounded bg-gray-800 motion-safe:animate-pulse" />
                <div className="h-10 w-20 rounded bg-gray-800 motion-safe:animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <p role="status" className="min-h-6 px-4 py-4 text-sm text-gray-400" aria-live="polite">
          {showStatus ? "Loading your workout…" : ""}
        </p>
      </div>
    </PageContainer>
  );
}
