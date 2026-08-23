import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProgressBar from "../../../components/ProgressBar.jsx";

export default function CurrentWorkoutHeader({
  currentMesocycle,
  onRename,
  progress,
  showOnboardingHint = false,
}) {
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center border-t border-darkestGray px-4">
        <div className="flex min-w-0 max-w-full items-center">
          <h1
            data-testid="current-workout-title"
            className="min-w-0 truncate py-2 text-sm uppercase text-gray-400"
            title={currentMesocycle.name}
          >
            {currentMesocycle.name}
          </h1>
          <button
            aria-label="Rename training block"
            aria-describedby={showOnboardingHint ? "current-workout-tour-description" : undefined}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-start pl-2 text-gray-400 transition-colors hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            data-testid="rename-current-mesocycle"
            onClick={onRename}
            type="button"
          >
            <span
              aria-hidden="true"
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${
                showOnboardingHint
                  ? "bg-red-600/20 text-white outline outline-2 outline-offset-1 outline-red-400"
                  : ""
              }`}
            >
              <FontAwesomeIcon className="h-3 w-3" icon={faPen} />
            </span>
          </button>
        </div>
      </div>
      <ProgressBar progress={progress} />
    </div>
  );
}
