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
        className="shrink-0 p-1 text-xl text-white"
      >
        <FaCalendarAlt aria-hidden="true" />
      </button>
    </div>
  );
}
