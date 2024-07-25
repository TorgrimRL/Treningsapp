import React from "react";
import Modal from "react-modal";

export default function CalendarModal({
  isOpen,
  onRequestClose,
  mesocycle,
  currentDayIndex,
  onDayClick,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Mesocycle Overview</h2>
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: mesocycle.weeks }).map((_, weekIndex) => (
            <div key={weekIndex} className="border p-2">
              <h3 className="font-semibold mb-2">Week {weekIndex + 1}</h3>
              <ul>
                {mesocycle.plan
                  .slice(
                    weekIndex * mesocycle.daysPerWeek,
                    (weekIndex + 1) * mesocycle.daysPerWeek
                  )
                  .map((day, dayIndex) => (
                    <li
                      key={dayIndex}
                      className={`border p-1 mb-1 cursor-pointer ${
                        currentDayIndex ===
                        weekIndex * mesocycle.daysPerWeek + dayIndex
                          ? "bg-yellow-200"
                          : ""
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
                      Day {dayIndex + 1} {day.label ? `(${day.label})` : ""}
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
