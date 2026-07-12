import { useEffect, useMemo, useState } from "react";
import { normalizeProgressionSettings } from "../constants/constants";
import {
  DEFAULT_DROPSET_SET_COUNT,
  DROPSET_DROP_PERCENT,
  MAX_DROPSET_SET_COUNT,
  MIN_DROPSET_SET_COUNT,
  generateDropsetWeights,
} from "../utils/dropsets";
import AppModal from "./AppModal";

const getInitialStartWeight = (exercise) => {
  const firstSet = exercise?.sets?.[0] || {};
  const candidate =
    exercise?.dropset?.startWeight ?? firstSet.targetWeight ?? firstSet.weight;
  const parsedCandidate = Number(candidate);

  return Number.isFinite(parsedCandidate) && parsedCandidate > 0
    ? parsedCandidate
    : "";
};

const getInitialSetCount = (exercise) => {
  const configuredCount = Number(exercise?.dropset?.setCount);

  if (
    Number.isInteger(configuredCount) &&
    configuredCount >= MIN_DROPSET_SET_COUNT &&
    configuredCount <= MAX_DROPSET_SET_COUNT
  ) {
    return configuredCount;
  }

  return DEFAULT_DROPSET_SET_COUNT;
};

export default function DropsetModal({
  isOpen,
  onRequestClose,
  exercise,
  onSave,
}) {
  const [startWeight, setStartWeight] = useState("");
  const [setCount, setSetCount] = useState(DEFAULT_DROPSET_SET_COUNT);
  const [applyToFutureWeeks, setApplyToFutureWeeks] = useState(false);

  const weightIncrement = normalizeProgressionSettings(exercise || {}).weightIncrement;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStartWeight(getInitialStartWeight(exercise));
    setSetCount(getInitialSetCount(exercise));
    setApplyToFutureWeeks(false);
  }, [exercise, isOpen]);

  const preview = useMemo(
    () =>
      generateDropsetWeights({
        startWeight,
        setCount,
        increment: weightIncrement,
        dropPercent: DROPSET_DROP_PERCENT,
      }),
    [setCount, startWeight, weightIncrement]
  );

  if (!exercise) {
    return null;
  }

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Dropsets"
      title="Dropsets"
    >
      <div className="mb-4 text-sm text-gray-400 uppercase">
        {exercise.exercise}
      </div>
      <label className="flex flex-col gap-2">
        <span>Start weight</span>
        <input
          data-testid="dropset-start-weight"
          type="number"
          min={weightIncrement}
          step={weightIncrement}
          value={startWeight}
          onChange={(event) => setStartWeight(event.target.value)}
          className="bg-inputBGGray text-center w-full p-2"
        />
      </label>
      <label className="mt-4 flex flex-col gap-2">
        <span>Total sets</span>
        <select
          data-testid="dropset-set-count"
          value={setCount}
          onChange={(event) => setSetCount(Number(event.target.value))}
          className="bg-inputBGGray text-center w-full p-2"
        >
          {Array.from(
            {
              length: MAX_DROPSET_SET_COUNT - MIN_DROPSET_SET_COUNT + 1,
            },
            (_, index) => MIN_DROPSET_SET_COUNT + index
          ).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 flex items-center gap-3">
        <input
          data-testid="dropset-apply-future"
          type="checkbox"
          checked={applyToFutureWeeks}
          onChange={(event) => setApplyToFutureWeeks(event.target.checked)}
          className="scale-125"
        />
        <span>Apply to rest of mesocycle</span>
      </label>
      <div className="mt-4 text-sm text-gray-300">
        {preview.error ? (
          <div className="text-red-400 break-words">{preview.error}</div>
        ) : (
          <div data-testid="dropset-preview">{preview.weights.join(" / ")}</div>
        )}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          data-testid="dropset-save"
          onClick={() =>
            onSave({
              startWeight: Number(startWeight),
              setCount,
              applyToFutureWeeks,
            })
          }
          disabled={!!preview.error}
          className="flex items-center justify-center bg-red-600 disabled:bg-inputNRGrey text-white border-none py-2 px-4 cursor-pointer text-lg"
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
}
