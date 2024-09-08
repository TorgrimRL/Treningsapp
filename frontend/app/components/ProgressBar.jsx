import React from "react";

const ProgressBar = ({ progress }) => {
  return (
    <div
      className="w-full bg-transparent"
      style={{ height: "1px", margin: 0, padding: 0 }}
    >
      {" "}
      {/* 3px høyde */}
      <div
        className="bg-green-500"
        style={{ width: `${progress}%`, height: "3px", margin: 0, padding: 0 }}
      ></div>
    </div>
  );
};

export default ProgressBar;
