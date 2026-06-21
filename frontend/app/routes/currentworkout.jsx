import CurrentWorkout from "../components/CurrentWorkout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Mesocycles() {
  return (
    <ProtectedRoute>
      <div style={{ paddingTop: "30px" }}>
        <CurrentWorkout />
        <div id="root"></div>
      </div>
    </ProtectedRoute>
  );
}
