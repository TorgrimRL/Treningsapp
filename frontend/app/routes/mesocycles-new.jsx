import { useQueryClient } from "@tanstack/react-query";
import MesocycleForm from "../components/MesocycleForm";
import { useLocation, useNavigate } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import PageContainer from "../components/PageContainer";
import { useApiFetch } from "../utils/apiFetch";
import { clearCurrentWorkoutQuery } from "../utils/currentWorkoutQuery";
import { useAuth } from "../utils/AuthContext";
import OnboardingRouteHeader from "../features/onboarding/OnboardingRouteHeader";

export default function NewMesocycle() {
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus } = useAuth();
  const onboardingDraftId = location.state?.onboardingDraftId;
  const queryClient = useQueryClient();
  const handleFormSubmit = async (mesocycle) => {
    try {
      const { ok: postOk, data: postData } = await apiFetch(
        `${baseUrl}/mesocycles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ...mesocycle, onboardingDraftId }),
        }
      );

      if (!postOk) {
        console.error(
          "Failed to create mesocycle: " + (postData.message || "Unknown error")
        );
        return;
      }
      await clearCurrentWorkoutQuery(queryClient);
      if (onboardingDraftId) {
        await checkAuthStatus();
      }

      const mesocycleId = postData.mesocycleId || postData.id;
      if (!mesocycleId) {
        console.error("Failed to read created mesocycle id from response");
        return;
      }

      const { ok: getOk, data: getData } = await apiFetch(
        `${baseUrl}/mesocycles/${mesocycleId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!getOk) {
        console.error(
          "Failed to fetch the new mesocycle: " +
            (getData.message || "Unknown error")
        );
        return;
      }
      navigate("/currentworkout", {
        state: onboardingDraftId
          ? { onboardingTour: true, onboardingTourId: onboardingDraftId }
          : null,
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation", error);
    }
  };

  const handleSubmit = (mesocycleData) => {
    handleFormSubmit(mesocycleData);
  };

  const handleCancel = () => {
    if (onboardingDraftId) {
      navigate("/onboarding", {
        state: {
          returnToSetup: true,
          onboardingPlanChoice: location.state?.onboardingPlanChoice || "needs-plan",
        },
      });
      return;
    }
    navigate("/templates");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-darkGray text-white">
        <PageContainer size="wide" className="lg:px-6">
          {onboardingDraftId && <OnboardingRouteHeader onBack={handleCancel} stage="training-block" />}
          <MesocycleForm
            isOnboarding={Boolean(onboardingDraftId)}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </PageContainer>
      </div>
    </ProtectedRoute>
  );
}
