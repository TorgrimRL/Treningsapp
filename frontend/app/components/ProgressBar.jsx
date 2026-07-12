const ProgressBar = ({ progress }) => {
  return (
    <div className="h-1 w-full bg-darkestGray">
      <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default ProgressBar;
