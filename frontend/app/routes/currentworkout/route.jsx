import ProtectedRoute from "../../components/ProtectedRoute";
import CurrentWorkoutPage from "./CurrentWorkoutPage";

export default function CurrentWorkoutRoute() {
  return (
    <ProtectedRoute>
      <div style={{ paddingTop: "30px" }}>
        <CurrentWorkoutPage />
        <div id="root"></div>
      </div>
    </ProtectedRoute>
  );
}
