import ProgressBar from "../../../components/ProgressBar.jsx";

export default function CurrentWorkoutHeader({ currentMesocycle, progress }) {
  return (
    <div className="min-w-0">
      <h1
        data-testid="current-workout-title"
        className="min-w-0 truncate border-t border-darkestGray px-4 pt-2 text-sm uppercase text-gray-400"
        title={currentMesocycle.name}
      >
        {currentMesocycle.name}
      </h1>
      <ProgressBar progress={progress} />
    </div>
  );
}
