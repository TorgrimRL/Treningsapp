import OnboardingProgress from "./OnboardingProgress";

export default function OnboardingRouteHeader({ onBack, stage = "first-week" }) {
  return (
    <div className="px-4 pt-6 md:px-0">
      <OnboardingProgress stage={stage} />
      <button
        type="button"
        onClick={onBack}
        className="mt-2 inline-flex min-h-11 items-center px-2 text-sm text-gray-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
      >
        Back to setup
      </button>
    </div>
  );
}
