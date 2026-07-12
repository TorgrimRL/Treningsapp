import TemplateSelector from "../components/TemplateSelector";
import { useNavigate } from "@remix-run/react";
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
        <TemplateSelector onSelectTemplate={handleSelectTemplate} />
      </PageContainer>
    </ProtectedRoute>
  );
}
