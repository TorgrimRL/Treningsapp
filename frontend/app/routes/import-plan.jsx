import { useLocation, useNavigate } from "react-router";
import ImportPlanWizard from "../features/import-plan/ImportPlanWizard";
import PageContainer from "../components/PageContainer";
import ProtectedRoute from "../components/ProtectedRoute";
import OnboardingRouteHeader from "../features/onboarding/OnboardingRouteHeader";

export default function ImportPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const onboardingDraftId = location.state?.onboardingDraftId;
  const submit = async (plan) => navigate("/mesocycles-new", {
    state: { importedPlan: plan, onboardingDraftId, onboardingPlanChoice: "has-plan" },
  });
  const returnToSetup = () => navigate("/onboarding", {
    state: { returnToSetup: true, onboardingPlanChoice: "has-plan" },
  });
  return <ProtectedRoute><div className="min-h-full bg-darkGray"><PageContainer size="wide">{onboardingDraftId && <OnboardingRouteHeader onBack={returnToSetup} />}<ImportPlanWizard onCancel={onboardingDraftId ? returnToSetup : () => navigate("/templates")} onSubmit={submit} /></PageContainer></div></ProtectedRoute>;
}
