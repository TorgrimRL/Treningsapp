import { FaCalendarAlt } from "react-icons/fa";

export default function CurrentWorkoutDayBar({
  currentMesocycle,
  dayLabel,
  dayNumber,
  onClick,
  week,
}) {
  return (
    <div className="p-1 text-white bg-darkGray flex items-center justify-between fixed top-[4.4rem] w-full z-20">
      <div className="space-x-2 pl-3 mr-auto">
        <span className="font-semibold uppercase">
          {week === currentMesocycle.weeks
            ? "DELOAD WEEK"
            : "Week " + week + " Day " + dayNumber + " " + dayLabel}
        </span>
      </div>
      <FaCalendarAlt
        className="text-white cursor-pointer text-xl -ml-4"
        onClick={onClick}
        style={{ transform: "translateX(-10px)" }}
      />
    </div>
  );
}
