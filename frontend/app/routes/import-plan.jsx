import { useNavigate } from "react-router";
import ImportPlanWizard from "../features/import-plan/ImportPlanWizard";
import PageContainer from "../components/PageContainer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ImportPlan() {
  const navigate = useNavigate();
  const submit = async (plan) => navigate("/mesocycles-new", { state: { importedPlan: plan } });
  return <ProtectedRoute><div className="min-h-full bg-darkGray"><PageContainer size="wide"><ImportPlanWizard onCancel={() => navigate("/templates")} onSubmit={submit} /></PageContainer></div></ProtectedRoute>;
}
