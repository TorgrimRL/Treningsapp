import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import RedoExerciseBlockModal from "../../../components/RedoExerciseBlockModal";

function getMostRecentCompletedMesocycle(mesocycles) {
  return (
    [...mesocycles]
      .filter((mesocycle) => mesocycle?.completedDate)
      .sort(
        (first, second) =>
          new Date(second.completedDate).getTime() -
          new Date(first.completedDate).getTime()
      )[0] || null
  );
}

export default function CompletedWorkoutState({
  apiFetch,
  baseUrl,
  completedMesocycle,
}) {
  const [latestCompletedMesocycle, setLatestCompletedMesocycle] = useState(
    completedMesocycle || null
  );
  const [isRedoModalOpen, setIsRedoModalOpen] = useState(false);

  useEffect(() => {
    if (completedMesocycle) {
      setLatestCompletedMesocycle(completedMesocycle);
      return undefined;
    }

    let cancelled = false;
    void apiFetch(`${baseUrl}/mesocycles`, {
      method: "GET",
      credentials: "include",
      suppressWaitModal: true,
    })
      .then(({ ok, data }) => {
        if (!ok || cancelled) {
          return;
        }

        const mesocycles = data?.data ?? data;
        if (Array.isArray(mesocycles)) {
          setLatestCompletedMesocycle(
            getMostRecentCompletedMesocycle(mesocycles)
          );
        }
      })
      .catch(() => {
        // Creating a new plan remains available if history cannot be loaded.
      });

    return () => {
      cancelled = true;
    };
  }, [apiFetch, baseUrl, completedMesocycle]);

  return (
    <>
      <section
        data-testid="current-workout-complete"
        className="mx-4 my-8 border border-green-700 bg-green-950/30 p-6 text-center text-green-100"
      >
        <h1 className="text-balance text-2xl font-semibold">
          {completedMesocycle ? "Training block complete" : "No active training block"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-gray-300">
          {latestCompletedMesocycle
            ? `You finished ${latestCompletedMesocycle.name}. Start a fresh plan or use that block again.`
            : "Create a training block to start logging workouts."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/mesocycles-new"
            data-testid="current-workout-new-plan"
            className="inline-flex min-h-11 items-center justify-center bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            Create new plan
          </Link>
          {latestCompletedMesocycle && (
            <button
              type="button"
              data-testid="current-workout-redo-plan"
              onClick={() => setIsRedoModalOpen(true)}
              className="inline-flex min-h-11 items-center justify-center border border-gray-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              Repeat this plan
            </button>
          )}
        </div>
      </section>
      {latestCompletedMesocycle && (
        <RedoExerciseBlockModal
          isOpen={isRedoModalOpen}
          onRequestClose={() => setIsRedoModalOpen(false)}
          exerciseBlock={latestCompletedMesocycle}
        />
      )}
    </>
  );
}
