import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../utils/AuthContext";
import { onboardingV1Enabled } from "./config";

const allowedPrefixes = [
  "/login",
  "/register",
  "/onboarding",
  "/import-plan",
  "/mesocycles-new",
];

export default function OnboardingGate({ children }) {
  const { currentUser, isLoggedIn, authCheckInProgress } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const previousPathRef = useRef(location.pathname);
  const onboardingStatus = currentUser?.onboardingStatus;
  const needsOnboarding = ["not_started", "in_progress"].includes(onboardingStatus);
  const dismissalKey = currentUser?.id
    ? `onboarding-gate-dismissed-${currentUser.id}-${currentUser.onboardingStartedAt || onboardingStatus}`
    : null;
  const gateIsDismissed = Boolean(
    dismissalKey && typeof window !== "undefined" && sessionStorage.getItem(dismissalKey)
  );
  const routeIsAllowed =
    allowedPrefixes.some((path) => location.pathname.startsWith(path)) ||
    (location.pathname.startsWith("/templates") &&
      Boolean(location.state?.onboardingDraftId));

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = location.pathname;
    const leavingOnboarding =
      previousPath.startsWith("/onboarding") &&
      !location.pathname.startsWith("/onboarding");

    if (leavingOnboarding && needsOnboarding && dismissalKey) {
      sessionStorage.setItem(dismissalKey, "true");
      return;
    }

    if (
      onboardingV1Enabled &&
      !authCheckInProgress &&
      isLoggedIn &&
      needsOnboarding &&
      !gateIsDismissed &&
      !routeIsAllowed
    ) {
      navigate("/onboarding", { replace: true });
    }
  }, [authCheckInProgress, dismissalKey, gateIsDismissed, isLoggedIn, location.pathname, navigate, needsOnboarding, routeIsAllowed]);

  return children;
}
