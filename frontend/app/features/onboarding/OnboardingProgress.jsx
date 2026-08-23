const steps = ["Account", "First week", "Training block", "Current workout"];

const completedByStage = {
  "first-week": 1,
  "training-block": 2,
  "current-workout": 3,
  completed: 4,
};

export default function OnboardingProgress({ stage, className = "" }) {
  const completed = completedByStage[stage] ?? 1;
  const currentStep = Math.min(completed + 1, steps.length);

  return (
    <section
      aria-label="Onboarding progress"
      className={`rounded-xl border border-gray-700 bg-darkGray p-4 text-white ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">Getting started</span>
        <span className="shrink-0 tabular-nums text-gray-300">
          {completed === steps.length ? "4 of 4 complete" : `Step ${currentStep} of 4`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${completed} of ${steps.length} onboarding steps complete`}
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={completed}
        className="mt-3 h-2 overflow-hidden rounded-full bg-gray-700"
      >
        <div
          className="h-full rounded-full bg-red-600 transition-[width] duration-150"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-1 text-center text-[0.6875rem] leading-tight text-gray-400 sm:text-xs">
        {steps.map((step, index) => {
          const isComplete = index < completed;
          const isCurrent = index === completed;
          return (
            <li
              key={step}
              className={isComplete ? "font-semibold text-white" : isCurrent ? "font-semibold text-red-300" : ""}
            >
              <span aria-hidden="true">{isComplete ? "✓ " : ""}</span>{step}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
