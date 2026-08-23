export const onboardingV1Enabled =
  String(import.meta.env.VITE_ONBOARDING_V1_ENABLED ?? "true").toLowerCase() !== "false";
