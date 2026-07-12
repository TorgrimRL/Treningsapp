import {
  progressionModes,
  normalizeProgressionSettings,
} from "../constants/constants";
import AppModal from "./AppModal";

const ProgressionModeModal = ({
  isOpen,
  onRequestClose,
  exercise,
  progressionMode,
  applyToFutureWeeks,
  onProgressionModeChange,
  onApplyToFutureWeeksChange,
  onSave,
}) => {
  if (!exercise) {
    return null;
  }

  const currentSettings = normalizeProgressionSettings(exercise);
  const selectedMode = progressionMode || currentSettings.progressionMode;

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit progression mode"
      title="Progression mode"
    >
      <div className="mb-4 text-sm text-gray-400 uppercase">
        {exercise.exercise}
      </div>
      <label className="flex flex-col gap-2">
        <span>Progression mode</span>
        <select
          value={selectedMode}
          onChange={(event) => onProgressionModeChange(event.target.value)}
          className="bg-inputBGGray text-center w-full p-2"
        >
          {progressionModes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
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
    </AppModal>
  );
};

export default ProgressionModeModal;
