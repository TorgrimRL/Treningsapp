import React from "react";
import MesocycleOverview from "../components/MesocycleOverview";
import ProtectedRoute from "../components/ProtectedRoute";
export default function Mesocycles() {
  return (
    <ProtectedRoute>
      <div style={{ paddingTop: "30px" }}>
        <MesocycleOverview />
      </div>
    </ProtectedRoute>
  );
}
