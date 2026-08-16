import ProtectedRoute from "../../components/ProtectedRoute";
import PersonalRecordsPage from "./PersonalRecordsPage";

export default function PersonalRecordsRoute() {
  return (
    <ProtectedRoute>
      <PersonalRecordsPage />
    </ProtectedRoute>
  );
}
