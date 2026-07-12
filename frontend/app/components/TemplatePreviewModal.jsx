import { useState } from "react";
import AppModal from "./AppModal";

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
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Template Overview"
      title={template ? template.name : "Template Overview"}
      bodyClassName="flex flex-col"
    >
      {template ? (
        <>
          <div className="overflow-y-auto">
            <ul
              style={{ display: "flex", flexWrap: "wrap" }}
              className="bg-inputBGGray flex justify-center items-center space-x-2 max-w-lg mx-auto justify-content align-items"
            >
              {template.dayLabels.map((dayLabel, dayIndex) => (
                <li
                  key={dayIndex}
                  className={
                    "cursor-pointer text-xs uppercase min-w-[50px] min-h-[40px] max-w-sm flex justify-center items-center " +
                    (selectedDay === dayIndex ? "bg-darkestGray" : "bg-inputBGGray") +
                    (dayIndex < template.dayLabels.length - 1
                      ? " border-r-1 border-darkestGray"
                      : "")
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleDayClick(dayIndex)}
                    className="w-full h-full flex justify-center items-center"
                  >
                    <h3 className="font-semibold mb-2 text-xs text-center uppercase">
                      {dayLabel.slice(0, 3)}
                    </h3>
                  </button>
                </li>
              ))}
            </ul>
            {selectedDay !== null && (
              <div className="mt-4">
                <div className="flex flex-col space-y-2 bg-inputBGray">
                  {template.muscleGroups[selectedDay].map(
                    (muscleGroup, index) => (
                      <div
                        key={index}
                        className={
                          "text-white p-2 " +
                          (index > 0 ? "border-t border-inputBGGray" : "")
                        }
                      >
                        {muscleGroup}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="pt-4 flex justify-center">
            <button
              className="flex items-center justify-center bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
              onClick={handleSave}
            >
              PLAN A NEW TRAINING BLOCK
            </button>
          </div>
        </>
      ) : (
        <div>NO TEMPLATE SELECTED</div>
      )}
    </AppModal>
  );
}
