import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProgressBar from "../../../components/ProgressBar.jsx";

export default function CurrentWorkoutHeader({
  currentMesocycle,
  onRename,
  progress,
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
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-start pl-2 text-gray-400 transition-colors hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            data-testid="rename-current-mesocycle"
            onClick={onRename}
            type="button"
          >
            <FontAwesomeIcon
              aria-hidden="true"
              className="h-3 w-3"
              icon={faPen}
            />
          </button>
        </div>
      </div>
      <ProgressBar progress={progress} />
    </div>
  );
}
