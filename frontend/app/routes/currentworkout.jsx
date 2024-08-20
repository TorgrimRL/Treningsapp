import React, { useEffect } from "react";
import CurrentWorkout from "../components/CurrentWorkout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Mesocycles() {
  useEffect(() => {
    console.log("Mesocycles component rendered");
  }, []);

  return (
    <ProtectedRoute>
      <div style={{ paddingTop: "30px" }}>
        <CurrentWorkout />
        <div id="root"></div>
      </div>
    </ProtectedRoute>
  );
}
