import { FaCalendarAlt } from "react-icons/fa";

export default function CurrentWorkoutDayBar({
  currentMesocycle,
  dayLabel,
  dayNumber,
  onClick,
  week,
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 bg-darkGray px-4 py-1 text-white">
      <div className="min-w-0 flex-1">
        <span className="block truncate font-semibold uppercase">
          {week === currentMesocycle.weeks
            ? "DELOAD WEEK"
            : "Week " + week + " Day " + dayNumber + " " + dayLabel}
        </span>
      </div>
      <button
        type="button"
        aria-label="Open workout calendar"
        onClick={onClick}
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-xl text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
      >
        <FaCalendarAlt aria-hidden="true" />
      </button>
    </div>
  );
}
