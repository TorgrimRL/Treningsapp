import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AppModal from "../../../components/AppModal";
import { useApiFetch } from "../../../utils/apiFetch";
import { currentWorkoutQueryKey } from "../../../utils/currentWorkoutQuery";
import { useMesocycleHistoryQuery } from "../../../utils/mesocycleHistoryQuery";
import {
  getWeightKey,
  normalizeExerciseName,
} from "../../../utils/personalRecords";
import {
  formatPersonalRecordWeight,
  PersonalRecordHistoricalWorkout,
  PersonalRecordMetadata,
} from "../../currentworkout/components/PersonalRecordModal";

function identifiersMatch(first, second) {
  if (first === undefined || first === null || first === "") {
    return second === undefined || second === null || second === "";
  }

  if (second === undefined || second === null || second === "") {
    return false;
  }

  return String(first) === String(second);
}

function getExerciseName(exercise) {
  if (typeof exercise === "string") {
    return exercise.trim() || "Exercise";
  }

  const name =
    exercise?.exercise || exercise?.exerciseName || exercise?.name;
  return typeof name === "string" && name.trim()
    ? name.trim()
    : "Exercise";
}

function getExerciseKey(exercise) {
  if (typeof exercise === "string") {
    return normalizeExerciseName(exercise);
  }

  return normalizeExerciseName(
    exercise?.exerciseKey ||
      exercise?.exercise ||
      exercise?.exerciseName ||
      exercise?.name
  );
}

function getMuscleGroup(exercise) {
  const muscleGroup = exercise?.muscleGroup || exercise?.muscle_group;
  return typeof muscleGroup === "string" && muscleGroup.trim()
    ? muscleGroup.trim()
    : null;
}

function getRecordWeightKey(record) {
  return getWeightKey(record?.weightKey ?? record?.weight);
}

function getCurrentMesocycleId(currentWorkout) {
  return currentWorkout?.id ?? currentWorkout?.mesocycleId;
}

function getExerciseToken(exercise) {
  return JSON.stringify([
    getExerciseKey(exercise),
    getExerciseName(exercise),
  ]);
}

function getRecordKey(record, sourceIndex) {
  return [
    record?.mesocycleId,
    record?.dayIndex,
    record?.exerciseIndex,
    record?.setIndex,
    getRecordWeightKey(record),
    record?.reps,
    sourceIndex,
  ].join("-");
}

function groupRecordsByWeight(records, selectedExercise) {
  const exerciseKey = getExerciseKey(selectedExercise);
  const groups = new Map();

  records.forEach((record, sourceIndex) => {
    if (exerciseKey && getExerciseKey(record) !== exerciseKey) {
      return;
    }

    const weightKey = getRecordWeightKey(record);
    const reps = Number(record?.reps);
    if (weightKey === null || !Number.isInteger(reps) || reps <= 0) {
      return;
    }

    const entry = { record, reps, sourceIndex };
    const group = groups.get(weightKey);
    if (!group) {
      groups.set(weightKey, {
        bestEntry: entry,
        entries: [entry],
        weight: Number(weightKey),
        weightKey,
      });
      return;
    }

    group.entries.push(entry);
    if (
      reps > group.bestEntry.reps ||
      (reps === group.bestEntry.reps &&
        sourceIndex > group.bestEntry.sourceIndex)
    ) {
      group.bestEntry = entry;
    }
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      entries: [...group.entries].sort(
        (first, second) => second.sourceIndex - first.sourceIndex
      ),
    }))
    .sort((first, second) => second.weight - first.weight);
}

function ExerciseRecordList({ groups, onSelect }) {
  if (groups.length === 0) {
    return (
      <p
        data-testid="personal-records-exercise-empty"
        className="py-8 text-center text-gray-300"
      >
        No personal records have been logged for this exercise yet.
      </p>
    );
  }

  return (
    <div
      data-testid="personal-records-weight-groups"
      className="min-w-0 space-y-4"
    >
      {groups.map((group) => (
        <section
          key={group.weightKey}
          data-testid="personal-records-weight-group"
          data-weight={group.weightKey}
          className="min-w-0 border border-gray-600 bg-darkestGray p-3"
        >
          <div className="mb-3 flex min-w-0 flex-col gap-1 border-b border-gray-700 pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <h3 className="min-w-0 text-lg font-semibold text-white">
              {formatPersonalRecordWeight(group.weight)}
            </h3>
            <div className="text-sm font-semibold text-amber-300">
              Current best: {group.bestEntry.reps} reps
            </div>
          </div>

          <ol className="min-w-0 space-y-2">
            {group.entries.map(({ record, sourceIndex }) => {
              const isCurrentBest =
                sourceIndex === group.bestEntry.sourceIndex;

              return (
                <li
                  key={getRecordKey(record, sourceIndex)}
                  className="min-w-0"
                >
                  <button
                    type="button"
                    data-testid="personal-records-record-entry"
                    data-current-best={isCurrentBest ? "true" : "false"}
                    data-mesocycle-id={record?.mesocycleId}
                    onClick={() => onSelect(record)}
                    className={
                      "grid min-h-11 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] " +
                      "items-center gap-3 border p-3 text-left transition-colors " +
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 " +
                      (isCurrentBest
                        ? "border-amber-400 bg-amber-950/30 hover:bg-amber-950/50"
                        : "border-gray-700 bg-inputBGGray hover:border-amber-400 hover:bg-gray-800")
                    }
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="font-semibold text-amber-300">
                          {record.reps} reps
                        </span>
                        {isCurrentBest && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                            Current best
                          </span>
                        )}
                      </div>
                      <PersonalRecordMetadata record={record} />
                    </div>
                    <span aria-hidden="true" className="shrink-0 text-xl">
                      ›
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function PersonalRecordsExerciseModal({
  selectedExercise,
  records = [],
  open,
  onClose,
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const queryClient = useQueryClient();
  const { apiFetch } = useApiFetch();
  const baseUrl = import.meta.env.VITE_API_URL;
  const exerciseToken = getExerciseToken(selectedExercise);
  const exerciseName = getExerciseName(selectedExercise);
  const muscleGroup = getMuscleGroup(selectedExercise);
  const recordGroups = useMemo(
    () =>
      groupRecordsByWeight(
        Array.isArray(records) ? records : [],
        selectedExercise
      ),
    [records, selectedExercise]
  );
  const cachedCurrentWorkout = queryClient.getQueryData(
    currentWorkoutQueryKey
  );
  const selectedRecordIsCurrent =
    Boolean(selectedRecord) &&
    identifiersMatch(
      selectedRecord?.mesocycleId,
      getCurrentMesocycleId(cachedCurrentWorkout)
    );
  const historicalMesocycleQuery = useMesocycleHistoryQuery(
    apiFetch,
    baseUrl,
    selectedRecord?.mesocycleId,
    {
      enabled:
        open && Boolean(selectedRecord) && !selectedRecordIsCurrent,
    }
  );

  useEffect(() => {
    setSelectedRecord(null);
  }, [exerciseToken, open]);

  const handleClose = () => {
    setSelectedRecord(null);
    onClose?.();
  };
  const displayedMesocycle = selectedRecordIsCurrent
    ? cachedCurrentWorkout
    : historicalMesocycleQuery.data;
  const hasHistoricalId =
    selectedRecord?.mesocycleId !== undefined &&
    selectedRecord?.mesocycleId !== null &&
    selectedRecord?.mesocycleId !== "";

  return (
    <AppModal
      data-testid="personal-records-exercise-modal"
      isOpen={Boolean(open)}
      onRequestClose={handleClose}
      contentLabel={`Personal records for ${exerciseName}`}
      title={selectedRecord ? "Historical workout" : "Personal records"}
      size="wide"
      bodyClassName="min-w-0 overflow-x-hidden"
    >
      {selectedRecord ? (
        <div className="min-w-0">
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
            ← Back to {exerciseName} records
          </button>

          {!hasHistoricalId ? (
            <div
              data-testid="personal-record-history-error"
              role="alert"
              className="border border-red-700 bg-red-950/40 p-4 text-red-200"
            >
              This record does not point to an available workout.
            </div>
          ) : !selectedRecordIsCurrent &&
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
        </div>
      ) : (
        <div className="min-w-0">
          <header
            data-testid="personal-records-exercise-summary"
            className="mb-4 min-w-0 border-b border-gray-600 pb-4"
          >
            <h2 className="break-words text-xl font-semibold text-white">
              {exerciseName}
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              Muscle group: {muscleGroup || "Not specified"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {recordGroups.length} recorded weight
              {recordGroups.length === 1 ? "" : "s"}
            </p>
          </header>
          <ExerciseRecordList
            groups={recordGroups}
            onSelect={setSelectedRecord}
          />
        </div>
      )}
    </AppModal>
  );
}

export default PersonalRecordsExerciseModal;
