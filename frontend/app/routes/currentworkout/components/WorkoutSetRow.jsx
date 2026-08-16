import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import SetMenu from "./SetMenu";
import PerformanceStatusIcon from "./PerformanceStatusIcon";
import PersonalRecordIcon from "./PersonalRecordIcon";
import {
  getPerformanceStatus,
  getSetLogWeight,
  getSetRepsSelectValue,
  getWeightOptions,
  REP_RANGE,
} from "../utils/workoutUtils";

export default function WorkoutSetRow({
  applyToFutureWeeks,
  exercise,
  exerciseIndex,
  isSetMenuOpen,
  onAddSet,
  onApplyToFutureWeeksChange,
  onRemoveSet,
  onRepsChange,
  onSetCompletionChange,
  onOpenPersonalRecords,
  onToggleSetMenu,
  onWeightChange,
  set,
  setIndex,
  setMenuRef,
  week,
}) {
  const setMenuId = exerciseIndex + "-" + setIndex;
  const status = getPerformanceStatus(set, exercise, week);
  const personalRecord = Object.values(
    exercise.personalRecordsByWeight || {}
  )
    .map((record) => {
      const recordForSet = record?.recordsBySetIndex?.[setIndex];

      if (recordForSet?.isNewRecord) {
        return recordForSet;
      }

      return record?.isNewRecord && record.recordSetIndex === setIndex
        ? record
        : null;
    })
    .find(Boolean);

  return (
    <div
      data-testid={"workout-set-" + exerciseIndex + "-" + setIndex}
      className="mb-4 grid grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem_2.75rem_2.75rem] items-end gap-x-2 border-b border-gray-600 pb-2"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => onToggleSetMenu(setMenuId)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
        >
          <FontAwesomeIcon icon={faEllipsisV} />
        </button>

        {isSetMenuOpen && (
          <SetMenu
            menuRef={setMenuRef}
            exerciseIndex={exerciseIndex}
            setIndex={setIndex}
            applyToFutureWeeks={applyToFutureWeeks}
            onApplyToFutureWeeksChange={(event) =>
              onApplyToFutureWeeksChange(event.target.checked)
            }
            onAddSet={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAddSet(applyToFutureWeeks);
            }}
            onRemoveSet={(event) => {
              event.stopPropagation();
              onRemoveSet(setIndex, applyToFutureWeeks);
            }}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col items-center space-y-1">
        <div className="text-center h-6 flex items-center justify-center">
          WEIGHT
        </div>
        <select
          data-testid="set-weight-select"
          value={getSetLogWeight(set)}
          onChange={(event) => onWeightChange(setIndex, event.target.value)}
          className="min-h-11 min-w-0 w-full rounded border-black bg-inputBGGray p-1 text-center"
        >
          <option value="">Choose weight</option>
          {getWeightOptions(exercise, getSetLogWeight(set)).map((weight) => (
            <option key={weight} value={weight}>
              {weight}
            </option>
          ))}
        </select>
      </div>
      <div className="relative flex min-w-0 flex-col items-center space-y-1">
        <div className="text-center h-6 flex items-center justify-center">
          REPS
        </div>
        <select
          data-testid="set-reps-select"
          value={getSetRepsSelectValue(set)}
          onChange={(event) => onRepsChange(setIndex, event.target.value)}
          className="min-h-11 min-w-0 w-full rounded border-black bg-inputBGGray p-1 text-center"
        >
          <option value="">Choose reps</option>
          {week <= 2 && (
            <option value="3 RIR" disabled>
              3 RIR
            </option>
          )}
          {week === 3 && (
            <option value="2 RIR" disabled>
              2 RIR
            </option>
          )}
          {week >= 4 && (
            <option value="0/1 RIR" disabled>
              0/1 RIR
            </option>
          )}
          {REP_RANGE.map((reps) => (
            <option key={reps} value={reps}>
              {reps}
            </option>
          ))}
        </select>
      </div>
      <div className="relative h-11 min-w-11">
        <PerformanceStatusIcon status={status} />
      </div>
      <div className="relative h-11 min-w-11">
        {personalRecord && (
          <PersonalRecordIcon
            className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
            title={
              `Open personal record history for ${personalRecord.weight} kg`
            }
            onClick={() => onOpenPersonalRecords(personalRecord)}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col items-center space-y-1">
        <div className="flex h-6 items-center justify-center text-center">
          LOG
        </div>
        <label className="flex min-h-11 min-w-11 -translate-x-1 items-center justify-center">
          <span className="sr-only">Log set</span>
          <input
            id={"set-log-" + exerciseIndex + "-" + setIndex}
            data-testid="set-log-checkbox"
            type="checkbox"
            checked={set.completed || false}
            onChange={(event) => onSetCompletionChange(setIndex, event.target.checked)}
            className="h-5 w-5"
          />
        </label>
      </div>
    </div>
  );
}
