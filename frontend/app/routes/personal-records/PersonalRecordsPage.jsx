import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faMagnifyingGlass,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import { useApiFetch } from "../../utils/apiFetch";
import { normalizeExerciseName } from "../../utils/personalRecords";
import { usePersonalRecordsQuery } from "../../utils/personalRecordsQuery";
import PersonalRecordsExerciseModal from "./components/PersonalRecordsExerciseModal";

const UNKNOWN_MUSCLE_GROUP = "Uncategorized";
const EMPTY_PERSONAL_RECORD_HISTORY = [];

const sortOptions = [
  { value: "name", label: "Exercise name" },
  { value: "muscle-group", label: "Muscle group" },
  { value: "last-pr", label: "Latest PR" },
  { value: "last-logged", label: "Latest logged set" },
];

function getExerciseName(value) {
  if (typeof value?.exercise === "string" && value.exercise.trim()) {
    return value.exercise.trim();
  }

  return "Unknown exercise";
}

function getExerciseKey(value) {
  return normalizeExerciseName(value?.exerciseKey || value?.exercise);
}

function getMuscleGroup(value) {
  return typeof value?.muscleGroup === "string" && value.muscleGroup.trim()
    ? value.muscleGroup.trim()
    : UNKNOWN_MUSCLE_GROUP;
}

function getTimestamp(value) {
  if (typeof value !== "string") {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function formatDate(value) {
  if (getTimestamp(value) === null) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatWeight(value) {
  const weight = Number(value);

  if (!Number.isFinite(weight) || weight < 0) {
    return "Unknown weight";
  }

  return `${weight} kg`;
}

function compareText(first, second) {
  return first.localeCompare(second, "nb-NO", { sensitivity: "base" });
}

function compareLatest(first, second, getValue) {
  const firstTimestamp = getTimestamp(getValue(first));
  const secondTimestamp = getTimestamp(getValue(second));

  if (firstTimestamp === null && secondTimestamp === null) {
    return compareText(getExerciseName(first), getExerciseName(second));
  }

  if (firstTimestamp === null) {
    return 1;
  }

  if (secondTimestamp === null) {
    return -1;
  }

  return (
    secondTimestamp - firstTimestamp ||
    compareText(getExerciseName(first), getExerciseName(second))
  );
}

function getRecordsForExercise(history, exercise) {
  const exerciseKey = getExerciseKey(exercise);

  return history.filter((record) => getExerciseKey(record) === exerciseKey);
}

function normalizeExerciseSummary(exercise, history) {
  const records = getRecordsForExercise(history, exercise);
  const lastPersonalRecord =
    exercise?.lastPersonalRecord || records[records.length - 1] || null;
  const parsedWeightCount = Number(exercise?.weightCount);
  const parsedMilestoneCount = Number(exercise?.milestoneCount);

  return {
    ...exercise,
    exercise: getExerciseName(exercise),
    exerciseKey: getExerciseKey(exercise),
    muscleGroup: getMuscleGroup(exercise),
    lastPersonalRecord,
    lastPersonalRecordAt:
      exercise?.lastPersonalRecordAt || lastPersonalRecord?.workoutDate || null,
    lastLoggedAt: exercise?.lastLoggedAt || null,
    weightCount:
      Number.isInteger(parsedWeightCount) && parsedWeightCount >= 0
        ? parsedWeightCount
        : new Set(records.map((record) => String(record?.weightKey ?? record?.weight)))
            .size,
    milestoneCount:
      Number.isInteger(parsedMilestoneCount) && parsedMilestoneCount >= 0
        ? parsedMilestoneCount
        : records.length,
  };
}

function PersonalRecordsLoading() {
  return (
    <PageContainer size="standard" className="min-w-0 px-4 py-8 md:px-6">
      <div
        data-testid="personal-records-loading"
        role="status"
        className="animate-pulse"
      >
        <span className="sr-only">Loading personal records...</span>
        <div className="h-9 w-56 bg-gray-700" />
        <div className="mt-3 h-5 max-w-xl bg-gray-800" />
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-20 bg-gray-800" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-44 border border-gray-800 bg-darkGray" />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

function PersonalRecordCard({ exercise, onOpen }) {
  const latestRecord = exercise.lastPersonalRecord;
  const weightLabel = exercise.weightCount === 1 ? "weight" : "weights";
  const recordLabel = exercise.milestoneCount === 1 ? "milestone" : "milestones";

  return (
    <li className="min-w-0">
      <button
        type="button"
        data-testid="personal-record-exercise-card"
        data-exercise-key={exercise.exerciseKey}
        aria-label={`View personal records for ${exercise.exercise}`}
        onClick={() => onOpen(exercise)}
        className="group flex h-full w-full min-w-0 flex-col border border-gray-700 bg-darkGray p-4 text-left shadow-sm transition-colors hover:border-amber-500 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
      >
        <div className="flex w-full min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              data-testid="personal-record-exercise-name"
              className="truncate text-lg font-bold text-white"
            >
              {exercise.exercise}
            </h2>
            <p
              data-testid="personal-record-exercise-muscle-group"
              className="mt-0.5 text-sm text-gray-400"
            >
              {exercise.muscleGroup}
            </p>
          </div>
          <FontAwesomeIcon
            icon={faChevronRight}
            aria-hidden="true"
            className="mt-1 shrink-0 text-gray-500 transition-colors group-hover:text-amber-400"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-amber-300">
          <FontAwesomeIcon icon={faTrophy} aria-hidden="true" />
          {latestRecord ? (
            <span data-testid="personal-record-exercise-best" className="font-semibold">
              {formatWeight(latestRecord.weight)} × {latestRecord.reps} reps
            </span>
          ) : (
            <span className="font-semibold">No personal record yet</span>
          )}
        </div>

        <dl className="mt-4 grid w-full grid-cols-2 gap-x-4 gap-y-3 border-t border-gray-700 pt-3 text-sm">
          <div className="min-w-0">
            <dt className="text-xs uppercase tracking-wide text-gray-500">Last PR</dt>
            <dd data-testid="personal-record-exercise-last-pr" className="mt-1 text-gray-200">
              {formatDate(exercise.lastPersonalRecordAt)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs uppercase tracking-wide text-gray-500">Last logged</dt>
            <dd data-testid="personal-record-exercise-last-logged" className="mt-1 text-gray-200">
              {formatDate(exercise.lastLoggedAt)}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-xs text-gray-500">
          {exercise.weightCount} {weightLabel} · {exercise.milestoneCount} {recordLabel}
        </p>
      </button>
    </li>
  );
}

export default function PersonalRecordsPage() {
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const query = usePersonalRecordsQuery(apiFetch, baseUrl);
  const personalRecordHistory =
    query.data?.personalRecordHistory ?? EMPTY_PERSONAL_RECORD_HISTORY;
  const exercises = useMemo(
    () =>
      (query.data?.exercises || []).map((exercise) =>
        normalizeExerciseSummary(exercise, personalRecordHistory)
      ),
    [personalRecordHistory, query.data?.exercises]
  );
  const muscleGroups = useMemo(
    () =>
      Array.from(new Set(exercises.map(getMuscleGroup))).sort(compareText),
    [exercises]
  );
  const visibleExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("nb-NO");
    const matchingExercises = exercises.filter((exercise) => {
      const matchesSearch =
        !normalizedSearch ||
        exercise.exercise.toLocaleLowerCase("nb-NO").includes(normalizedSearch) ||
        exercise.muscleGroup
          .toLocaleLowerCase("nb-NO")
          .includes(normalizedSearch);
      const matchesMuscleGroup =
        muscleGroup === "all" || exercise.muscleGroup === muscleGroup;

      return matchesSearch && matchesMuscleGroup;
    });

    return [...matchingExercises].sort((first, second) => {
      if (sortBy === "muscle-group") {
        return (
          compareText(first.muscleGroup, second.muscleGroup) ||
          compareText(first.exercise, second.exercise)
        );
      }

      if (sortBy === "last-pr") {
        return compareLatest(first, second, (exercise) =>
          exercise.lastPersonalRecordAt
        );
      }

      if (sortBy === "last-logged") {
        return compareLatest(first, second, (exercise) => exercise.lastLoggedAt);
      }

      return compareText(first.exercise, second.exercise);
    });
  }, [exercises, muscleGroup, search, sortBy]);
  const selectedExerciseRecords = useMemo(
    () =>
      selectedExercise
        ? getRecordsForExercise(personalRecordHistory, selectedExercise)
        : [],
    [personalRecordHistory, selectedExercise]
  );

  if (query.isPending) {
    return <PersonalRecordsLoading />;
  }

  if (query.isError) {
    return (
      <PageContainer size="narrow" className="min-w-0 px-4 py-8 md:px-6">
        <div
          data-testid="personal-records-error"
          role="alert"
          className="border border-red-700 bg-red-950/40 p-5 text-center text-red-100"
        >
          <h1 className="text-xl font-bold">Unable to load personal records</h1>
          <p className="mt-2 text-sm text-red-200">
            Your records could not be loaded right now.
          </p>
          <button
            type="button"
            data-testid="personal-records-retry"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className="mt-4 min-h-11 border border-red-500 px-5 py-2 font-semibold transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            {query.isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="standard" className="min-w-0 px-4 py-8 md:px-6">
      <div data-testid="personal-records-page" className="min-w-0">
        <header className="flex flex-col gap-3 border-b border-gray-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faTrophy}
                aria-hidden="true"
                className="text-2xl text-amber-400"
              />
              <h1 className="text-3xl font-bold text-white">Personal records</h1>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
              Your best completed sets for each exercise and exact weight. Open
              an exercise to revisit every record and its original workout.
            </p>
          </div>
          <p
            data-testid="personal-records-count"
            aria-live="polite"
            className="shrink-0 text-sm text-gray-400"
          >
            {visibleExercises.length} of {exercises.length} exercises
          </p>
        </header>

        {exercises.length === 0 ? (
          <section
            data-testid="personal-records-empty"
            className="mt-8 border border-gray-700 bg-darkGray px-5 py-12 text-center"
          >
            <FontAwesomeIcon
              icon={faTrophy}
              aria-hidden="true"
              className="text-4xl text-gray-600"
            />
            <h2 className="mt-4 text-xl font-bold">No personal records yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
              Complete your first valid set to establish a personal record for
              that exercise and weight.
            </p>
          </section>
        ) : (
          <>
            <section
              aria-label="Filter and sort personal records"
              className="mt-6 grid min-w-0 gap-3 border border-gray-700 bg-darkGray p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]"
            >
              <label className="min-w-0 text-sm font-semibold text-gray-200" htmlFor="personal-records-search">
                Search
                <span className="relative mt-1 block min-w-0">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    id="personal-records-search"
                    data-testid="personal-records-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Exercise or muscle group"
                    className="min-h-11 w-full min-w-0 border border-gray-600 bg-darkestGray py-2 pl-10 pr-3 text-base text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                  />
                </span>
              </label>

              <label className="min-w-0 text-sm font-semibold text-gray-200" htmlFor="personal-records-muscle-group">
                Muscle group
                <select
                  id="personal-records-muscle-group"
                  data-testid="personal-records-muscle-group-filter"
                  value={muscleGroup}
                  onChange={(event) => setMuscleGroup(event.target.value)}
                  className="mt-1 min-h-11 w-full min-w-0 border border-gray-600 bg-darkestGray px-3 py-2 text-base text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="all">All muscle groups</option>
                  {muscleGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>

              <label className="min-w-0 text-sm font-semibold text-gray-200" htmlFor="personal-records-sort">
                Sort by
                <select
                  id="personal-records-sort"
                  data-testid="personal-records-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="mt-1 min-h-11 w-full min-w-0 border border-gray-600 bg-darkestGray px-3 py-2 text-base text-white focus:border-amber-400 focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            {visibleExercises.length > 0 ? (
              <ul
                data-testid="personal-records-list"
                className="mt-6 grid min-w-0 list-none gap-4 sm:grid-cols-2"
              >
                {visibleExercises.map((exercise) => (
                  <PersonalRecordCard
                    key={exercise.exerciseKey}
                    exercise={exercise}
                    onOpen={setSelectedExercise}
                  />
                ))}
              </ul>
            ) : (
              <section
                data-testid="personal-records-no-results"
                className="mt-6 border border-gray-700 bg-darkGray px-5 py-10 text-center"
              >
                <h2 className="text-lg font-bold">No matching exercises</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Try another search or muscle group.
                </p>
                <button
                  type="button"
                  data-testid="personal-records-clear-filters"
                  onClick={() => {
                    setSearch("");
                    setMuscleGroup("all");
                  }}
                  className="mt-4 min-h-11 border border-gray-500 px-4 py-2 font-semibold text-gray-100 transition-colors hover:border-amber-400 hover:text-amber-300"
                >
                  Clear filters
                </button>
              </section>
            )}
          </>
        )}

        <PersonalRecordsExerciseModal
          selectedExercise={selectedExercise}
          records={selectedExerciseRecords}
          open={Boolean(selectedExercise)}
          onClose={() => setSelectedExercise(null)}
        />
      </div>
    </PageContainer>
  );
}
