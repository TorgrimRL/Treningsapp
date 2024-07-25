import React from "react";
import Modal from "react-modal";

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
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className="bg-gray-800 rounded shadow-lg p-0 max-w-3xl mx-auto mt-20 text-2sm"
      overlayClassName="fixed inset-0 flex items-start justify-center bg-transparent"
      style={{
        content: {
          background: "transparent",
          border: "none",
          padding: 0,
          inset: "unset",
          maxWidth: "none",
        },
        overlay: {
          background: "transparent",
        },
      }}
    >
      <div className="p-4 bg-gray-600">
        <div
          className="grid gap-0 text-center"
          style={{
            gridTemplateColumns: `repeat(${mesocycle.weeks},1fr)`,
            gridTemplateRows: `repeat(${mesocycle.daysPerWeek}, auto)`,
          }}
        >
          {Array.from({ length: mesocycle.weeks }).map((_, weekIndex) => (
            <div
              key={weekIndex}
              className="border-transparent text-center bg-black-600 text-white"
            >
              <h3 className="font-semibold mb-2 text-xs uppercase flex items-center justify-center">
                Week {weekIndex + 1}
              </h3>
              <ul className="list-none p-0 m-0 space-y-0">
                {mesocycle.plan
                  .slice(
                    weekIndex * mesocycle.daysPerWeek,
                    (weekIndex + 1) * mesocycle.daysPerWeek
                  )
                  .map((day, dayIndex) => (
                    <li
                      key={dayIndex}
                      className={`border p-0 mb-1 cursor-pointer text-xs uppercase min-w-[75px] min-h-[50px] flex items-center justify-center ${
                        currentDayIndex ===
                        weekIndex * mesocycle.daysPerWeek + dayIndex
                          ? "bg-red-500"
                          : "bg-gray-800"
                      }`}
                      onClick={() => {
                        console.log(
                          "Day item clicked:",
                          weekIndex * mesocycle.daysPerWeek + dayIndex
                        );
                        onDayClick(
                          weekIndex * mesocycle.daysPerWeek + dayIndex
                        );
                      }}
                    >
                      {day.label ? `${day.label}` : ""}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
