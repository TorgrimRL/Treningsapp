export default function PlanBuilderGuide({
  missingExerciseCount,
  missingLabelCount,
  onFindNext,
}) {
  const isComplete = missingExerciseCount === 0 && missingLabelCount === 0;
  const remainingParts = [
    missingExerciseCount > 0
      ? `${missingExerciseCount} exercise${missingExerciseCount === 1 ? "" : "s"}`
      : null,
    missingLabelCount > 0
      ? `${missingLabelCount} day label${missingLabelCount === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  return (
    <section
      aria-labelledby="plan-builder-guide-title"
      className="mx-4 mt-5 rounded-2xl border border-red-500/40 bg-red-950/20 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)] sm:p-5"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
        Set up your template
      </p>
      <h1
        id="plan-builder-guide-title"
        className="mt-2 text-balance text-2xl font-bold"
      >
        {isComplete
          ? "Your plan is ready to save."
          : "Choose an exercise for every slot."}
      </h1>
      <p className="mt-2 max-w-3xl text-pretty text-gray-300">
        Each template slot already has a muscle group. Choose the exercise you
        want, use Auto Fill Exercises for suggestions, or add your own exercise.
        Save Plan becomes available when every required choice is complete.
      </p>
      <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <li className="rounded-lg bg-darkestGray p-3 text-gray-200">
          <span className="font-semibold text-white">1. Choose exercises</span>
          <span className="mt-1 block text-pretty text-gray-400">
            Pick each exercise yourself or use Auto Fill, then change any suggestion.
          </span>
        </li>
        <li className="rounded-lg bg-darkestGray p-3 text-gray-200">
          <span className="font-semibold text-white">2. Review progression</span>
          <span className="mt-1 block text-pretty text-gray-400">
            Progression mode builds next week’s target. Increment rounds the weight,
            and lowest available weight matches your equipment.
          </span>
        </li>
        <li className="rounded-lg bg-darkestGray p-3 text-gray-200">
          <span className="font-semibold text-white">3. Save the plan</span>
          <span className="mt-1 block text-pretty text-gray-400">
            Saving activates the block and continues to your Current Workout tips.
          </span>
        </li>
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p
          className={`min-h-11 rounded-lg px-4 py-3 text-sm font-semibold tabular-nums ${
            isComplete
              ? "bg-green-950/50 text-green-200"
              : "bg-darkestGray text-gray-200"
          }`}
          role="status"
        >
          {isComplete
            ? "✓ All required choices are complete"
            : `${remainingParts.join(" and ")} remaining`}
        </p>
        {!isComplete && (
          <button
            type="button"
            onClick={onFindNext}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-red-500 px-4 py-2 font-semibold text-red-100 transition-colors hover:bg-red-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 active:scale-[0.96]"
          >
            Show next missing choice
          </button>
        )}
      </div>
    </section>
  );
}
