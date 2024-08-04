import React, { useState } from "react";

import Modal from "react-modal";

Modal.setAppElement("#root");

export default function TemplateOverviewModal({
  isOpen,
  onRequestClose,
  template,
  onSave,
}) {
  const [selectedDay, setSelectedDay] = useState(0);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };
  const handleSave = () => {
    if (onSave && typeof onSave === "function") {
      onSave(template);
    }
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Template Overview"
      className=" relative bg-darkGray text-white rounded focus:outline-none shadow-lg p-0 max-w-3xl mx-auto mt-20 text-2sm "
      overlayClassName="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 "
    >
      <button
        onClick={onRequestClose}
        className=" absolute top-0 right-2 m-0 text-3xl text-white-600 hover:text-gray-800"
      >
        &times;
      </button>
      {template ? (
        <div className="bg-darkGray text-white p-2 ">
          <header className="bold text-2xl mb-4 mt-2 border-b-1 border-inputBGGray">
            {template.name}
          </header>
          <div>
            <ul
              style={{ display: "flex", flexWrap: "wrap" }}
              className="bg-inputNRGray max-w-lg mx-auto justify-center"
            >
              {template.dayLabels.map((dayLabel, dayIndex) => (
                <li
                  key={dayIndex}
                  className={`cursor-pointer text-xs uppercase min-w-[50px] min-h-[40px] max-w-sm flex justify-center items-center ${
                    selectedDay === dayIndex
                      ? "bg-darkestGray"
                      : "bg-inputBGGray"
                  } ${
                    dayIndex < template.dayLabels.length - 1
                      ? "border-r-1 border-darkestGray"
                      : ""
                  }`}
                  onClick={() => {
                    handleDayClick(dayIndex);
                  }}
                >
                  <h3 className="font-semibbold mb-2 text-xs text-center uppercase ">
                    {dayLabel.slice(0, 3)}
                  </h3>
                </li>
              ))}
            </ul>
          </div>
          {selectedDay !== null && (
            <div className="mt-4">
              <div className="flex flex-col space-y-2 bg-inputNRGray">
                {template.muscleGroups[selectedDay].map(
                  (muscleGroup, index) => (
                    <div
                      key={index}
                      className={`text-white p-2 ${
                        index > 0 ? "border-t border-inputBGGray" : ""
                      }`}
                    >
                      {muscleGroup}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
          <div className="flex justify-center mt-60 mb-2">
            <button
              className=" flex items-center justify-center bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
              onClick={handleSave}
            >
              PLAN A NEW MESOCYCLE
            </button>
          </div>
        </div>
      ) : (
        <div>NO TEMPLATE SELECTED</div>
      )}
    </Modal>
  );
}
