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
      bodyClassName="overflow-x-auto"
    >
      <div className="p-0 bg-darkGray">
        <div
          className="grid min-w-full w-max gap-0 text-center"
          style={{
            gridTemplateColumns: "repeat(" + numCols + ", 1fr)",
            gridTemplateRows: "repeat(" + numRows + ", auto)",
          }}
        >
          {Array.from({ length: numCols }).map((_, weekIndex) => (
            <div
              key={weekIndex}
              className="border-transparent text-center bg-black-600 text-white"
            >
              <h3 className="font-semibold mb-2 text-xs uppercase flex items-center justify-center">
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
                        "border p-0 mb-1 cursor-pointer text-xs uppercase min-w-[75px] min-h-[50px] flex items-center justify-center " +
                        dayClass
                      }
                    >
                      <button
                        type="button"
                        className={
                          "flex min-h-[50px] w-full self-stretch items-center justify-center bg-transparent text-white transition-colors " +
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
