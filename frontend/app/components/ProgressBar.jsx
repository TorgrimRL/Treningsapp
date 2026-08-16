const ProgressBar = ({ progress }) => {
  return (
    <div
      role="progressbar"
      aria-label="Workout completion"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-valuetext={`${Math.round(progress)}% complete`}
      className="h-2 w-full bg-darkestGray"
    >
      <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default ProgressBar;
