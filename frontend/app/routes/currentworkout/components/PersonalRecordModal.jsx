import { useEffect, useMemo, useState } from "react";
import AppModal from "../../../components/AppModal";
import {
  useMesocycleHistoryQuery,
} from "../../../utils/mesocycleHistoryQuery";
import {
  getWeightKey,
  normalizeExerciseName,
} from "../../../utils/personalRecords";

function identifiersMatch(first, second) {
  if (first === undefined || first === null) {
    return second === undefined || second === null;
  }

  if (second === undefined || second === null) {
    return false;
  }

  return String(first) === String(second);
}

function getExerciseKey(value) {
  if (typeof value === "string") {
    return normalizeExerciseName(value);
  }

  return normalizeExerciseName(value?.exerciseKey || value?.exercise);
}

function getRecordWeightKey(record) {
  return getWeightKey(record?.weightKey ?? record?.weight);
}

export function formatPersonalRecordDate(value) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    return null;
  }

  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPersonalRecordWeight(value) {
  const weightKey = getWeightKey(value);
  return weightKey === null ? "Unknown weight" : `${weightKey} kg`;
}

function getSetIndex(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const setIndex = Number(value);
  return Number.isInteger(setIndex) && setIndex >= 0 ? setIndex : null;
}

export function getPersonalRecordSetPosition(record) {
  const setPosition = Number(record?.setPosition);
  if (
    record?.setPosition !== null &&
    record?.setPosition !== undefined &&
    Number.isInteger(setPosition) &&
    setPosition > 0
  ) {
    return setPosition;
  }

  const setIndex = getSetIndex(record?.setIndex);
  return setIndex === null ? null : setIndex + 1;
}

function getContextToken(recordContext) {
  if (!recordContext) {
    return "";
  }

  return JSON.stringify([
    recordContext.exerciseKey,
    getExerciseKey(recordContext.exercise),
    recordContext.weightKey,
    getWeightKey(recordContext.weight),
    recordContext.dayIndex,
    recordContext.exerciseIndex,
    recordContext.workoutBestReps,
    recordContext.setIndex,
  ]);
}

function isCurrentRecord(record, currentMesocycle, recordContext) {
  const exerciseKey =
    normalizeExerciseName(recordContext?.exerciseKey) ||
    getExerciseKey(recordContext?.exercise);
  const weightKey =
    getWeightKey(recordContext?.weightKey) ??
    getWeightKey(recordContext?.weight);
  const expectedReps = Number(recordContext?.workoutBestReps);
  const expectedSetIndex = getSetIndex(recordContext?.setIndex);
  const recordSetIndex = getSetIndex(record?.setIndex);
  const setIndexMatches =
    expectedSetIndex === null ||
    recordSetIndex === null ||
    recordSetIndex === expectedSetIndex;

  return (
    identifiersMatch(
      record?.mesocycleId,
      currentMesocycle?.id ?? currentMesocycle?.mesocycleId
    ) &&
    Number(record?.dayIndex) === Number(recordContext?.dayIndex) &&
    Number(record?.exerciseIndex) ===
      Number(recordContext?.exerciseIndex) &&
    getExerciseKey(record) === exerciseKey &&
    getRecordWeightKey(record) === weightKey &&
    setIndexMatches &&
    (!Number.isFinite(expectedReps) || Number(record?.reps) === expectedReps)
  );
}

function getCurrentRecord(currentMesocycle, recordContext) {
  const history = Array.isArray(currentMesocycle?.personalRecordHistory)
    ? currentMesocycle.personalRecordHistory
    : [];

  return history.find((record) =>
    isCurrentRecord(record, currentMesocycle, recordContext)
  );
}

function getPreviousRecords(currentMesocycle, recordContext) {
  const history = Array.isArray(currentMesocycle?.personalRecordHistory)
    ? currentMesocycle.personalRecordHistory
    : [];
  const exerciseKey =
    normalizeExerciseName(recordContext?.exerciseKey) ||
    getExerciseKey(recordContext?.exercise);
  const weightKey =
    getWeightKey(recordContext?.weightKey) ??
    getWeightKey(recordContext?.weight);
  const matchingRecords = history
    .map((record, historyIndex) => ({ historyIndex, record }))
    .filter(
      ({ record }) =>
        getExerciseKey(record) === exerciseKey &&
        getRecordWeightKey(record) === weightKey
    );
  const currentHistoryIndex = history.findIndex((record) =>
    isCurrentRecord(record, currentMesocycle, recordContext)
  );

  return matchingRecords
    .filter(({ historyIndex, record }) => {
      if (currentHistoryIndex >= 0) {
        return historyIndex < currentHistoryIndex;
      }

      if (
        identifiersMatch(
          record?.mesocycleId,
          currentMesocycle?.id ?? currentMesocycle?.mesocycleId
        )
      ) {
        return Number(record?.dayIndex) < Number(recordContext?.dayIndex);
      }

      return true;
    })
    .sort((first, second) => second.historyIndex - first.historyIndex)
    .map(({ record }) => record);
}

export function PersonalRecordMetadata({ record }) {
  const formattedDate = formatPersonalRecordDate(record?.workoutDate);
  const setPosition = getPersonalRecordSetPosition(record);

  return (
    <div className="mt-1 space-y-0.5 text-xs text-gray-300">
      <div>
        {record?.mesocycleName || "Training block"} · Week{" "}
        {record?.week ?? "—"}, day {record?.day ?? "—"}
      </div>
      <div>
        Exercise {record?.exercisePosition ?? "—"} in the workout
        {setPosition === null ? "" : ` · Set ${setPosition}`}
      </div>
      {formattedDate && (
        <time dateTime={record.workoutDate}>{formattedDate}</time>
      )}
    </div>
  );
}

function CurrentRecordSummary({ currentMesocycle, recordContext }) {
  const record = getCurrentRecord(currentMesocycle, recordContext);

  if (!record) {
    return null;
  }

  const formattedDate = formatPersonalRecordDate(record.workoutDate);
  const hasPreviousRecord =
    recordContext?.previousRecord !== null &&
    recordContext?.previousRecord !== undefined &&
    Number.isFinite(Number(recordContext.previousRecord));
  const previousRecord = hasPreviousRecord
    ? Number(recordContext.previousRecord)
    : null;

  return (
    <section
      data-testid="personal-record-current-summary"
      aria-labelledby="personal-record-current-summary-title"
      className="mb-4 border border-amber-400 bg-amber-950/30 p-4"
    >
      <div
        id="personal-record-current-summary-title"
        className="text-xs font-semibold uppercase tracking-wide text-amber-300"
      >
        New personal record
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-2xl font-bold text-white">
        <span>{formatPersonalRecordWeight(record.weight)}</span>
        <span aria-hidden="true">×</span>
        <span>{record.reps} reps</span>
      </div>
      {getPersonalRecordSetPosition(record) !== null && (
        <div className="mt-1 text-sm font-semibold text-amber-200">
          Set {getPersonalRecordSetPosition(record)}
        </div>
      )}
      <div className="mt-2 space-y-1 text-sm text-gray-200">
        {formattedDate ? (
          <div>
            Set on{" "}
            <time
              data-testid="personal-record-current-date"
              dateTime={record.workoutDate}
            >
              {formattedDate}
            </time>
          </div>
        ) : (
          <div data-testid="personal-record-current-date-unavailable">
            Record date unavailable
          </div>
        )}
        <div>
          {hasPreviousRecord
            ? "Previous best: " + previousRecord + " reps"
            : "First recorded PR at this weight"}
        </div>
      </div>
    </section>
  );
}

function RecordList({ currentMesocycle, onSelect, recordContext }) {
  const records = useMemo(
    () => getPreviousRecords(currentMesocycle, recordContext),
    [currentMesocycle, recordContext]
  );

  if (records.length === 0) {
    return (
      <p
        data-testid="personal-record-history-empty"
        className="py-8 text-center text-gray-300"
      >
        No earlier records at this weight.
      </p>
    );
  }

  return (
    <ol
      data-testid="personal-record-history-list"
      className="space-y-2"
    >
      {records.map((record, index) => (
        <li
          key={[
            record.mesocycleId,
            record.dayIndex,
            record.exerciseIndex,
            record.setIndex,
            record.weightKey,
            record.reps,
            index,
          ].join("-")}
        >
          <button
            type="button"
            data-testid={`personal-record-history-entry-${index}`}
            data-mesocycle-id={record.mesocycleId}
            onClick={() => onSelect(record)}
            className={
              "flex min-h-11 w-full items-center justify-between gap-4 " +
              "border border-gray-600 bg-darkestGray p-3 text-left " +
              "transition-colors hover:border-amber-400 hover:bg-gray-800 " +
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            }
          >
            <div className="min-w-0">
              <div className="font-semibold text-amber-300">
                {record.reps} reps
              </div>
              <PersonalRecordMetadata record={record} />
            </div>
            <span aria-hidden="true" className="shrink-0 text-xl">
              ›
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function CompletedSets({ exercise, selectedRecord }) {
  const completedSets = Array.isArray(exercise?.sets)
    ? exercise.sets.filter((set) => set?.completed === true)
    : [];
  const selectedWeightKey = getRecordWeightKey(selectedRecord);

  if (completedSets.length === 0) {
    return <p className="mt-2 text-xs text-gray-400">No completed sets.</p>;
  }

  return (
    <ol className="mt-2 grid grid-cols-1 gap-1">
      {completedSets.map((set, setIndex) => {
        const isMatchingWeight =
          Boolean(selectedRecord) &&
          selectedWeightKey !== null &&
          getWeightKey(set.weight) === selectedWeightKey;

        return (
          <li
            key={setIndex}
            data-testid="personal-record-workout-set"
            className={
              "flex items-center justify-between gap-3 border px-3 py-2 " +
              (isMatchingWeight
                ? "border-amber-400 bg-amber-950/40 text-amber-100"
                : "border-gray-700 bg-inputBGGray")
            }
          >
            <span>{formatPersonalRecordWeight(set.weight)}</span>
            <span>{set.reps ?? "—"} reps</span>
          </li>
        );
      })}
    </ol>
  );
}

export function PersonalRecordHistoricalWorkout({ mesocycle, record }) {
  const day = mesocycle?.plan?.[Number(record?.dayIndex)];

  if (!day || !Array.isArray(day.exercises)) {
    return (
      <div
        data-testid="personal-record-history-error"
        role="alert"
        className="border border-red-700 bg-red-950/40 p-4 text-red-200"
      >
        This historical workout could not be displayed.
      </div>
    );
  }

  return (
    <section data-testid="personal-record-workout">
      <div className="mb-4 border-b border-gray-600 pb-3">
        <div className="font-semibold">
          {record?.mesocycleName || mesocycle?.name || "Training block"}
        </div>
        <PersonalRecordMetadata record={record} />
      </div>
      <ol className="space-y-3">
        {day.exercises.map((exercise, exerciseIndex) => {
          const isMatchingExercise =
            Number(record?.exerciseIndex) === exerciseIndex ||
            (!Number.isInteger(Number(record?.exerciseIndex)) &&
              getExerciseKey(exercise) === getExerciseKey(record));

          return (
            <li
              key={exerciseIndex}
              data-testid={`personal-record-workout-exercise-${exerciseIndex}`}
              className={
                "border p-3 " +
                (isMatchingExercise
                  ? "border-amber-400 bg-amber-950/20"
                  : "border-gray-700 bg-darkestGray")
              }
            >
              <h3
                className={
                  "font-semibold " +
                  (isMatchingExercise ? "text-amber-300" : "text-white")
                }
              >
                {exerciseIndex + 1}. {exercise?.exercise || "Exercise"}
              </h3>
              <p
                data-testid={"personal-record-workout-muscle-group-" + exerciseIndex}
                className="mt-1 text-xs text-gray-300"
              >
                Muscle group:{" "}
                {typeof exercise?.muscleGroup === "string" &&
                exercise.muscleGroup.trim()
                  ? exercise.muscleGroup
                  : "Not specified"}
              </p>
              <CompletedSets
                exercise={exercise}
                selectedRecord={isMatchingExercise ? record : null}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function PersonalRecordModal({
  apiFetch,
  baseUrl,
  currentMesocycle,
  isOpen,
  onRequestClose,
  recordContext,
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const contextToken = getContextToken(recordContext);
  const selectedRecordIsCurrent = identifiersMatch(
    selectedRecord?.mesocycleId,
    currentMesocycle?.id ?? currentMesocycle?.mesocycleId
  );
  const historicalMesocycleQuery = useMesocycleHistoryQuery(
    apiFetch,
    baseUrl,
    selectedRecord?.mesocycleId,
    {
      enabled:
        isOpen && Boolean(selectedRecord) && !selectedRecordIsCurrent,
    }
  );

  useEffect(() => {
    setSelectedRecord(null);
  }, [contextToken, isOpen]);

  const handleClose = () => {
    setSelectedRecord(null);
    onRequestClose();
  };
  const exerciseName =
    recordContext?.exercise?.exercise ||
    recordContext?.exercise ||
    "Exercise";
  const modalTitle = selectedRecord
    ? "Historical workout"
    : "Personal record history";
  const displayedMesocycle = selectedRecordIsCurrent
    ? currentMesocycle
    : historicalMesocycleQuery.data;

  return (
    <AppModal
      data-testid="personal-record-modal"
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel={`Personal records for ${exerciseName}`}
      title={modalTitle}
      size="wide"
    >
      {selectedRecord ? (
        <>
          <button
            type="button"
            data-testid="personal-record-history-back"
            onClick={() => setSelectedRecord(null)}
            className={
              "mb-4 min-h-11 border border-gray-500 px-4 py-2 " +
              "font-semibold text-gray-100 hover:bg-gray-700 " +
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            }
          >
            ← Back to records
          </button>

          {!selectedRecordIsCurrent &&
          historicalMesocycleQuery.isPending ? (
            <div
              data-testid="personal-record-history-loading"
              role="status"
              className="py-10 text-center text-gray-300"
            >
              Loading workout…
            </div>
          ) : !selectedRecordIsCurrent &&
            historicalMesocycleQuery.isError ? (
            <div
              data-testid="personal-record-history-error"
              role="alert"
              className="border border-red-700 bg-red-950/40 p-4 text-red-200"
            >
              <p className="mb-3">Unable to load this workout.</p>
              <button
                type="button"
                data-testid="personal-record-history-retry"
                onClick={() => void historicalMesocycleQuery.refetch()}
                disabled={historicalMesocycleQuery.isFetching}
                className={
                  "min-h-11 border border-red-500 px-4 py-2 font-semibold " +
                  "hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
                }
              >
                Retry
              </button>
            </div>
          ) : (
            <PersonalRecordHistoricalWorkout
              mesocycle={displayedMesocycle}
              record={selectedRecord}
            />
          )}
        </>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-300">
            <span className="font-semibold text-white">{exerciseName}</span>
            {" · "}
            {formatPersonalRecordWeight(
              recordContext?.weightKey ?? recordContext?.weight
            )}
          </div>
          <CurrentRecordSummary
            currentMesocycle={currentMesocycle}
            recordContext={recordContext}
          />
          <RecordList
            currentMesocycle={currentMesocycle}
            onSelect={setSelectedRecord}
            recordContext={recordContext}
          />
        </>
      )}
    </AppModal>
  );
}

export default PersonalRecordModal;
