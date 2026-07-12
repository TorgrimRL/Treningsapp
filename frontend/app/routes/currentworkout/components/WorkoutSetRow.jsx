import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import SetMenu from "./SetMenu";
import PerformanceStatusIcon from "./PerformanceStatusIcon";
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
  onToggleSetMenu,
  onWeightChange,
  set,
  setIndex,
  setMenuRef,
  week,
}) {
  const setMenuId = exerciseIndex + "-" + setIndex;
  const status = getPerformanceStatus(set, exercise, week);

  return (
    <div
      data-testid={"workout-set-" + exerciseIndex + "-" + setIndex}
      className="flex flex-row items-center space-y-0 mb-4 border-b border-gray-600 pb-2"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => onToggleSetMenu(setMenuId)}
          className="text-white focus:outline-none mt-8"
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
      <div className="flex flex-col items-center space-y-1 flex-grow">
        <div className="text-center h-6 flex items-center justify-center">
          WEIGHT
        </div>
        <select
          data-testid="set-weight-select"
          value={getSetLogWeight(set)}
          onChange={(event) => onWeightChange(setIndex, event.target.value)}
          className="bg-inputBGGray text-center border-black w-20 rounded p-1"
        >
          <option value="">Choose weight</option>
          {getWeightOptions(exercise, getSetLogWeight(set)).map((weight) => (
            <option key={weight} value={weight}>
              {weight}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col items-center space-y-1 flex-grow relative">
        <div className="text-center h-6 flex items-center justify-center">
          REPS
        </div>
        <select
          data-testid="set-reps-select"
          value={getSetRepsSelectValue(set)}
          onChange={(event) => onRepsChange(setIndex, event.target.value)}
          className="bg-inputBGGray text-center border-black w-full rounded p-1"
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
      <div className="flex items-center justify-center ml-2 relative">
        <PerformanceStatusIcon status={status} />
      </div>
      <div className="flex flex-col items-center space-y-1 flex-grow">
        <div className="text-center h-6 flex items-center justify-center">
          LOG
        </div>
        <input
          data-testid="set-log-checkbox"
          type="checkbox"
          checked={set.completed || false}
          onChange={(event) => onSetCompletionChange(setIndex, event.target.checked)}
          className="scale-125"
          style={{
            width: "20px",
            height: "20px",
            marginTop: "10px",
          }}
        />
      </div>
    </div>
  );
}
