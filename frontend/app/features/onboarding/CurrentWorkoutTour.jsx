import OnboardingProgress from "./OnboardingProgress";

const content = {
  name: {
    eyebrow: "Training block name",
    title: "You can rename your block at any time.",
    description: "Use the highlighted pencil beside the name above the workout progress bar.",
    action: "Next: navigation",
  },
  navigation: {
    eyebrow: "Main navigation",
    title: "The navbar is always at the top.",
    description: "It takes you to Current workout, personal records, new training blocks, templates, and history. On mobile, open it with the highlighted menu button.",
    action: "Next: workout targets",
  },
  targets: {
    eyebrow: "Weight and reps",
    title: "These values are your targets for today.",
    description: "Target Weight and Reps are calculated from what you logged for the same exercise in the previous week. Treat them as suggestions: adjust them to what you actually perform, then check Log.",
    action: "Next: exercise options",
  },
  exercise: {
    eyebrow: "Exercise options",
    title: "Exercise tools are behind these dots.",
    description: "Use the highlighted ⋮ beside an exercise to add notes, change the exercise, create dropsets, or adjust progression.",
    action: "Next: set options",
  },
  set: {
    eyebrow: "Set options",
    title: "Each set has its own menu too.",
    description: "Use the highlighted ⋮ beside a set to add or remove sets and apply structural changes to future weeks.",
    action: "Finish onboarding",
  },
};

export default function CurrentWorkoutTour({ step, onNext, onDismiss }) {
  if (!step) return null;

  const isComplete = step === "complete";
  const stepContent = content[step];

  return (
    <div data-onboarding-tour-step={step} className="mx-3 mb-4 mt-3 rounded-2xl border border-red-500/60 bg-red-950/25 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.3)] sm:mx-4 sm:p-5">
      <OnboardingProgress stage={isComplete ? "completed" : "current-workout"} />
      <div id="current-workout-tour-description" className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-300">
          {isComplete ? "Setup complete" : stepContent.eyebrow}
        </p>
        <h2 className="mt-1 text-balance text-xl font-bold text-white">
          {isComplete ? "You’re ready to train." : stepContent.title}
        </h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-gray-300">
          {isComplete ? "Your first training block is active, and you know where to find exercise and set tools." : stepContent.description}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={isComplete ? onDismiss : onNext}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-500 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
        >
          {isComplete ? "Start workout" : stepContent.action}
        </button>
        {!isComplete && (
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-11 px-3 text-sm text-gray-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
          >
            Skip tips
          </button>
        )}
      </div>
    </div>
  );
}
