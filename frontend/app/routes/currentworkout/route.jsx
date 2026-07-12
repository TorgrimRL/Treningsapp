import ProtectedRoute from "../../components/ProtectedRoute";
import CurrentWorkoutPage from "./CurrentWorkoutPage";

export default function CurrentWorkoutRoute() {
  return (
    <ProtectedRoute>
      <CurrentWorkoutPage />
    </ProtectedRoute>
  );
}
