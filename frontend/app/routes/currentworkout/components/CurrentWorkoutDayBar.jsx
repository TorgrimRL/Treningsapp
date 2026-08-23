import { FaCalendarAlt } from "react-icons/fa";

export default function CurrentWorkoutDayBar({
  currentMesocycle,
  dayLabel,
  dayNumber,
  onClick,
  showOnboardingHint = false,
  week,
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 bg-darkGray px-4 py-1 text-white">
      <div className="min-w-0 flex-1">
        <span className="block truncate font-semibold uppercase">
          {currentMesocycle.includeDeload && week === currentMesocycle.weeks
            ? "DELOAD WEEK"
            : "Week " + week + " Day " + dayNumber + " " + dayLabel}
        </span>
      </div>
      <button
        type="button"
        aria-label="Open workout calendar"
        aria-describedby={showOnboardingHint ? "current-workout-tour-description" : undefined}
        onClick={onClick}
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-xl text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
      >
        <span
          aria-hidden="true"
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
            showOnboardingHint
              ? "bg-red-600/20 outline outline-2 outline-offset-1 outline-red-400"
              : ""
          }`}
        >
          <FaCalendarAlt />
        </span>
      </button>
    </div>
  );
}
