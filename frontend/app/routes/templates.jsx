import TemplateSelector from "../components/TemplateSelector";
import { useNavigate } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import PageContainer from "../components/PageContainer";

export default function Templates() {
  const navigate = useNavigate();

  const handleSelectTemplate = (selectedTemplate) => {
    navigate("/mesocycles-new", {
      state: {
        template: selectedTemplate.name,
        weeks: 4,
        daysPerWeek: selectedTemplate.days,
        muscleGroups: selectedTemplate.muscleGroups,
        dayLabels: selectedTemplate.dayLabels,
      },
    });
  };
  return (
    <ProtectedRoute>
      <PageContainer size="standard" className="md:px-6">
        <div className="px-4 pt-6 md:px-0">
          <button
            type="button"
            data-testid="import-plan-link"
            onClick={() => navigate("/import-plan")}
            className="min-h-11 border border-red-500 px-4 py-2 text-red-200 transition-colors hover:bg-red-950"
          >
            Import a plan
          </button>
        </div>
        <TemplateSelector onSelectTemplate={handleSelectTemplate} />
      </PageContainer>
    </ProtectedRoute>
  );
}
