import Modal from "react-modal";
import {
  weightIncrementOptions,
  normalizeProgressionSettings,
} from "../constants/constants";

Modal.setAppElement("#root");

const WeightIncrementModal = ({
  isOpen,
  onRequestClose,
  exercise,
  weightIncrement,
  applyToFutureWeeks,
  onWeightIncrementChange,
  onApplyToFutureWeeksChange,
  onSave,
}) => {
  if (!exercise) {
    return null;
  }

  const currentSettings = normalizeProgressionSettings(exercise);
  const selectedIncrement = weightIncrement ?? currentSettings.weightIncrement;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit weight increment"
      className="relative mx-auto bg-darkGray text-white rounded focus:outline-none shadow-lg p-0 max-w-3xl mt-20 text-2sm"
      overlayClassName="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-0 right-2 text-3xl hover:text-gray-800"
      >
        &times;
      </button>
      <div className="flex flex-col p-4">
        <header className="bold text-2xl mb-4 mt-2 border-b border-inputBGGray">
          Weight increment
        </header>
        <div className="mb-4 text-sm text-gray-400 uppercase">
          {exercise.exercise}
        </div>
        <label className="flex flex-col gap-2">
          <span>Weight increment</span>
          <select
            value={selectedIncrement}
            onChange={(event) => onWeightIncrementChange(Number(event.target.value))}
            className="bg-inputBGGray text-center w-full p-2"
          >
            {weightIncrementOptions.map((increment) => (
              <option key={increment} value={increment}>
                {increment} kg
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={applyToFutureWeeks}
            onChange={(event) => onApplyToFutureWeeksChange(event.target.checked)}
            className="scale-125"
          />
          <span>Apply to rest of mesocycle</span>
        </label>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onSave}
            className="flex items-center justify-center bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
          >
            Save
          </button>
          <button
            onClick={onRequestClose}
            className="flex items-center justify-center bg-inputNRGrey text-white border-none py-2 px-4 cursor-pointer text-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WeightIncrementModal;
