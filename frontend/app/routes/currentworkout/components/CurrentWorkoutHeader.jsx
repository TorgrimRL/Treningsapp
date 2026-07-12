import ProgressBar from "../../../components/ProgressBar.jsx";

export default function CurrentWorkoutHeader({ currentMesocycle, progress }) {
  return (
    <>
      <h1
        data-testid="current-workout-title"
        className="text-sm text-gray-500 bg-darkGray fixed top-10 w-full z-20 pl-4 mt-1 pt-2 uppercase border-t border-darkestGray"
      >
        {currentMesocycle.name}
      </h1>
      <div style={{ marginTop: "-0px", marginBottom: "-1px" }}>
        <ProgressBar progress={progress} />
      </div>
    </>
  );
}
