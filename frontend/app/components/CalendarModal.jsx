import AppModal from "./AppModal";

export default function CalendarModal({
  isOpen,
  onRequestClose,
  mesocycle,
  currentDayIndex,
  onDayClick,
}) {
  const numCols = mesocycle.weeks;
  const numRows = mesocycle.daysPerWeek;

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Calendar Modal"
      title="Mesocycle Overview"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      bodyClassName="!overflow-x-hidden !p-3 sm:!p-4"
    >
      <div className="p-0 bg-darkGray">
        <div
          className="grid w-full gap-0 text-center"
          style={{
            gridTemplateColumns: "repeat(" + numCols + ", minmax(0, 1fr))",
            gridTemplateRows: "repeat(" + numRows + ", auto)",
          }}
        >
          {Array.from({ length: numCols }).map((_, weekIndex) => (
            <div
              key={weekIndex}
              className="border-transparent text-center bg-black-600 text-white"
            >
              <h3 className="mb-2 flex items-center justify-center px-0.5 text-[10px] font-semibold uppercase leading-4">
                Week {weekIndex + 1}
              </h3>
              <ul className="list-none p-0 m-0 space-y-0">
                {Array.from({ length: numRows }).map((_, dayIndex) => {
                  const day = mesocycle.plan[weekIndex * numRows + dayIndex];
                  if (!day) return null;
                  const dayClass = day.isCompleted
                    ? "bg-green-700"
                    : currentDayIndex === weekIndex * numRows + dayIndex
                    ? "bg-red-500"
                    : "bg-darkestGray";
                  const dayHoverClass = day.isCompleted
                    ? "hover:bg-green-600"
                    : currentDayIndex === weekIndex * numRows + dayIndex
                    ? "hover:bg-red-400"
                    : "hover:bg-gray-800";

                  return (
                    <li
                      key={dayIndex}
                      className={
                        "mb-1 flex min-h-11 min-w-0 items-center justify-center border p-0 text-[10px] uppercase leading-tight " +
                        dayClass
                      }
                    >
                      <button
                        type="button"
                        className={
                          "flex min-h-11 w-full items-center justify-center break-words px-0.5 text-center bg-transparent text-white transition-colors " +
                          dayHoverClass +
                          " focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                        }
                        onClick={() => onDayClick(weekIndex * numRows + dayIndex)}
                      >
                        {day.label ? day.label : "Day " + (dayIndex + 1)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AppModal>
  );
}
