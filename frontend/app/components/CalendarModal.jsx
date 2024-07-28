import React from "react";
import Modal from "react-modal";
import { useEffect, useRef } from "react";

Modal.setAppElement("#root");

export default function CalendarModal({
  isOpen,
  onRequestClose,
  mesocycle,
  currentDayIndex,
  onDayClick,
  calendarIconRef,
}) {
  const calendarRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Sjekk om klikket er utenfor modalen
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        onRequestClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onRequestClose]);

  const numCols = mesocycle.weeks;
  const numRows = mesocycle.daysPerWeek;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Calendar Modal"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className="bg-gray-800 rounded focus:outline-none shadow-lg p-0 max-w-3xl mx-auto mt-20 text-2sm "
      overlayClassName="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 "
      style={{
        content: {
          background: "transparent",
          border: "none",
          padding: 0,
          inset: "unset",
          maxWidth: "none",
        },
      }}
    >
      <div className="  max-height: vh p-4 bg-darkGray">
        <div
          className="grid gap-0 text-center transform scale-75"
          style={{
            gridTemplateColumns: `repeat(${numCols}, 1fr)`,
            gridTemplateRows: `repeat(${numRows}, auto)`,
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
                  return (
                    <li
                      key={dayIndex}
                      className={`border p-0 mb-1 cursor-pointer text-xs uppercase min-w-[75px] min-h-[50px] flex items-center justify-center ${
                        currentDayIndex === weekIndex * numRows + dayIndex
                          ? "bg-red-500"
                          : "bg-gray-800"
                      }`}
                      onClick={() => {
                        console.log(
                          "Day item clicked:",
                          weekIndex * numRows + dayIndex
                        );
                        onDayClick(weekIndex * numRows + dayIndex);
                      }}
                    >
                      {day.label ? `${day.label}` : `Day ${dayIndex + 1}`}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
