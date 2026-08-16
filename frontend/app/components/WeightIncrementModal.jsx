import {
  weightIncrementOptions,
  minimumWeightOptions,
  normalizeProgressionSettings,
  formatWeightSetting,
} from "../constants/constants";
import AppModal from "./AppModal";

const WeightIncrementModal = ({
  isOpen,
  onRequestClose,
  exercise,
  weightIncrement,
  minimumWeight,
  applyToFutureWeeks,
  onWeightIncrementChange,
  onMinimumWeightChange,
  onApplyToFutureWeeksChange,
  onSave,
}) => {
  if (!exercise) {
    return null;
  }

  const currentSettings = normalizeProgressionSettings(exercise);
  const selectedIncrement = weightIncrement ?? currentSettings.weightIncrement;
  const selectedMinimumWeight = minimumWeight ?? currentSettings.minimumWeight;

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit weight increment"
      title="Weight increment"
    >
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
              {formatWeightSetting(increment)} kg
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 flex flex-col gap-2">
        <span>Lowest available weight</span>
        <select
          data-testid="minimum-weight-input"
          value={selectedMinimumWeight}
          onChange={(event) => onMinimumWeightChange(Number(event.target.value))}
          className="bg-inputBGGray text-center w-full p-2"
        >
          {minimumWeightOptions.map((weight) => (
            <option key={weight} value={weight}>
              {formatWeightSetting(weight)} kg
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-400">
          {formatWeightSetting(selectedMinimumWeight)} → {formatWeightSetting(
            Number(selectedMinimumWeight) + Number(selectedIncrement)
          )} kg
        </span>
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
    </AppModal>
  );
};

export default WeightIncrementModal;
