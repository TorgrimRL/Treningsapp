import ProtectedRoute from "../../components/ProtectedRoute";
import CurrentWorkoutPage from "./CurrentWorkoutPage";
import LoadingState from "./components/LoadingState";

export default function CurrentWorkoutRoute() {
  return (
    <ProtectedRoute loadingFallback={<LoadingState />}>
      <CurrentWorkoutPage />
    </ProtectedRoute>
  );
}
