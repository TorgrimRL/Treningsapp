import React from "react";

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-transparent h-2 m-0 p-0 relative">
      <div
        className="bg-green-500 h-1"
        style={{ width: `${progress}%`, marginTop: "-6px" }}
      ></div>
    </div>
  );
};

export default ProgressBar;
