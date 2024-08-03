import React from "react";
import TemplateSelector from "../components/TemplateSelector";
import { useNavigate } from "@remix-run/react";

export default function Templates() {
  const navigate = useNavigate();

  // Funksjon for å håndtere når en mal velges
  const handleSelectTemplate = (selectedTemplate) => {
    console.log("Valgt template:", selectedTemplate);

    // Naviger til MesocycleForm med state fra den valgte templaten
    navigate("/mesocycles-new", {
      state: {
        template: selectedTemplate.name,
        weeks: 4, // Default verdi; kan oppdateres basert på brukerinput
        daysPerWeek: selectedTemplate.days,
        muscleGroups: selectedTemplate.muscleGroups,
      },
    });
  };
  return (
    <div style={{ paddingTop: "30px" }}>
      <TemplateSelector
        onSelectTemplate={handleSelectTemplate}
      ></TemplateSelector>
      <div id="root"></div>
    </div>
  );
}
