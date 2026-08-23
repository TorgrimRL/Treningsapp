import TemplateSelector from "../components/TemplateSelector";
import { useLocation, useNavigate } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import PageContainer from "../components/PageContainer";
import { onboardingV1Enabled } from "../features/onboarding/config";
import OnboardingRouteHeader from "../features/onboarding/OnboardingRouteHeader";

export default function Templates() {
  const navigate = useNavigate();
  const location = useLocation();
  const onboardingDraftId = location.state?.onboardingDraftId;
  const isOnboarding = Boolean(onboardingDraftId);
  const returnToSetup = () => navigate("/onboarding", {
    state: { returnToSetup: true, onboardingPlanChoice: "needs-plan" },
  });

  const handleSelectTemplate = (selectedTemplate) => {
    navigate("/mesocycles-new", {
      state: {
        template: selectedTemplate.name,
        weeks: 4,
        daysPerWeek: selectedTemplate.days,
        muscleGroups: selectedTemplate.muscleGroups,
        dayLabels: selectedTemplate.dayLabels,
        onboardingDraftId,
        onboardingPlanChoice: location.state?.onboardingPlanChoice,
      },
    });
  };
  const startGuidedSetup = () => navigate("/onboarding", {
    state: { returnToSetup: true, startFresh: true },
  });
  return (
    <ProtectedRoute>
      <PageContainer size="standard" className="md:px-6">
        {isOnboarding && <OnboardingRouteHeader onBack={returnToSetup} />}
        {!isOnboarding && <div className="flex flex-wrap gap-3 px-4 pt-6 md:px-0">
          <button
            type="button"
            data-testid="import-plan-link"
            onClick={() => navigate("/import-plan")}
            className="min-h-11 border border-red-500 px-4 py-2 text-red-200 transition-colors hover:bg-red-950"
          >
            Import a plan
          </button>
          {onboardingV1Enabled && (
            <button
              type="button"
              onClick={startGuidedSetup}
              className="min-h-11 border border-gray-600 px-4 py-2 text-gray-200 transition-colors hover:border-red-500 hover:text-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              Guided setup
            </button>
          )}
        </div>}
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onBuildFromScratch={isOnboarding ? () => navigate("/mesocycles-new", { state: { onboardingDraftId, onboardingPlanChoice: "needs-plan" } }) : undefined}
        />
      </PageContainer>
    </ProtectedRoute>
  );
}
