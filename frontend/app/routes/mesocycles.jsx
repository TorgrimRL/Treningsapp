import MesocycleOverview from "../components/MesocycleOverview";
import PageContainer from "../components/PageContainer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Mesocycles() {
  return (
    <ProtectedRoute>
      <PageContainer size="standard" className="md:px-6">
        <MesocycleOverview />
      </PageContainer>
    </ProtectedRoute>
  );
}
