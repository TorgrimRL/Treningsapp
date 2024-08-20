import React from "react";
import TemplateSelector from "../components/TemplateSelector";
import { useNavigate } from "@remix-run/react";
import ProtectedRoute from "../components/ProtectedRoute";

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
      <div style={{ paddingTop: "30px" }}>
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
        ></TemplateSelector>
        <div id="root"></div>
      </div>
    </ProtectedRoute>
  );
}
