import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCurrentWorkoutCache,
  useCurrentWorkoutQuery,
} from "../../../utils/currentWorkoutQuery";
import { buildWorkoutState } from "../utils/workoutUtils";

const mergeConfirmedWorkoutMetadata = (localWorkout, savedWorkout) => {
  if (!localWorkout || !savedWorkout) {
    return savedWorkout || localWorkout;
  }

  const localPlan = Array.isArray(localWorkout.plan)
    ? localWorkout.plan
    : [];
  const savedPlan = Array.isArray(savedWorkout.plan)
    ? savedWorkout.plan
    : [];
  const plan = localPlan.map((localDay, dayIndex) => {
    const savedDay = savedPlan[dayIndex];
    if (!savedDay) {
      return localDay;
    }

    const mergedDay = { ...localDay };
    delete mergedDay.startedAt;
    delete mergedDay.completedAt;

    if (Object.hasOwn(savedDay, "startedAt")) {
      mergedDay.startedAt = savedDay.startedAt;
    }
    if (Object.hasOwn(savedDay, "completedAt")) {
      mergedDay.completedAt = savedDay.completedAt;
    }

    if (Array.isArray(localDay?.exercises)) {
      mergedDay.exercises = localDay.exercises.map(
        (localExercise, exerciseIndex) => {
          const savedExercise = savedDay.exercises?.[exerciseIndex];
          const exerciseWithoutRecords = { ...localExercise };
          delete exerciseWithoutRecords.personalRecordsByWeight;

          if (!savedExercise) {
            return exerciseWithoutRecords;
          }

          return {
            ...exerciseWithoutRecords,
            personalRecordsByWeight:
              savedExercise.personalRecordsByWeight || {},
          };
        }
      );
    }

    return mergedDay;
  });

  return {
    ...localWorkout,
    ...savedWorkout,
    plan,
  };
};

const getDayIndex = (workout, preferredDayIndex, currentDayIndex) => {
  if (!workout?.plan?.length) {
    return null;
  }

  const requestedDayIndex = preferredDayIndex ?? currentDayIndex;
  if (
    Number.isInteger(requestedDayIndex) &&
    workout.plan[requestedDayIndex]
  ) {
    return requestedDayIndex;
  }

  if (
    Number.isInteger(workout.firstIncompleteDayIndex) &&
    workout.plan[workout.firstIncompleteDayIndex]
  ) {
    return workout.firstIncompleteDayIndex;
  }

  return 0;
};

export default function useCurrentWorkoutData(apiFetch, baseUrl) {
  const workoutQuery = useCurrentWorkoutQuery(apiFetch, baseUrl);
  const {
    fetchCurrentWorkout,
    invalidateCurrentWorkout,
    setCurrentWorkout,
  } = useCurrentWorkoutCache(apiFetch, baseUrl);
  const cachedWorkout = workoutQuery.data;
  const initialWorkout = cachedWorkout === undefined ? null : cachedWorkout;
  const initialWorkoutState = buildWorkoutState(initialWorkout);
  const [currentMesocycle, setCurrentMesocycle] = useState(initialWorkout);
  const [currentDayIndex, setCurrentDayIndex] = useState(() =>
    getDayIndex(initialWorkout, null, null)
  );
  const [sets, setSets] = useState(initialWorkoutState.sets);
  const [notes, setNotes] = useState(initialWorkoutState.notes);
  const isDirtyRef = useRef(false);
  const editRevisionRef = useRef(0);
  const committedRevisionRef = useRef(0);
  const lastAppliedWorkoutRef = useRef(cachedWorkout);

  const setWorkoutData = useCallback(
    (workout, { force = false, preferredDayIndex } = {}) => {
      if (!force && isDirtyRef.current) {
        return false;
      }

      lastAppliedWorkoutRef.current = workout;
      setCurrentMesocycle(workout);
      setCurrentDayIndex((previousDayIndex) =>
        getDayIndex(workout, preferredDayIndex, previousDayIndex)
      );

      const workoutState = buildWorkoutState(workout);
      setNotes(workoutState.notes);
      setSets(workoutState.sets);
      return true;
    },
    []
  );

  const markWorkoutDirty = useCallback(() => {
    editRevisionRef.current += 1;
    isDirtyRef.current = true;
    return editRevisionRef.current;
  }, []);

  const commitWorkoutData = useCallback(
    (workout, revision = editRevisionRef.current) => {
      if (revision < committedRevisionRef.current) {
        return false;
      }

      committedRevisionRef.current = revision;
      if (revision === editRevisionRef.current) {
        isDirtyRef.current = false;
        setWorkoutData(workout, { force: true });
      } else {
        setCurrentMesocycle((localWorkout) =>
          mergeConfirmedWorkoutMetadata(localWorkout, workout)
        );
      }

      setCurrentWorkout(workout);
      void invalidateCurrentWorkout({ refetchType: "none" });
      return true;
    },
    [invalidateCurrentWorkout, setCurrentWorkout, setWorkoutData]
  );

  const refreshWorkoutData = useCallback(
    async ({ dayIndex, force = false } = {}) => {
      try {
        const workout = await fetchCurrentWorkout();
        const applied = setWorkoutData(workout, {
          force,
          preferredDayIndex: dayIndex,
        });
        if (applied) {
          committedRevisionRef.current = editRevisionRef.current;
          isDirtyRef.current = false;
        }
        return { ok: true, data: workout, applied };
      } catch (error) {
        console.error("Error fetching workout data:", error);
        return { ok: false, data: error?.data ?? null };
      }
    },
    [fetchCurrentWorkout, setWorkoutData]
  );

  useEffect(() => {
    if (
      cachedWorkout === undefined ||
      cachedWorkout === lastAppliedWorkoutRef.current
    ) {
      return;
    }

    setWorkoutData(cachedWorkout);
  }, [cachedWorkout, setWorkoutData]);

  const hasCachedResult = cachedWorkout !== undefined;
  const isApplyingInitialWorkout =
    cachedWorkout !== undefined &&
    cachedWorkout !== null &&
    currentMesocycle === null &&
    cachedWorkout !== lastAppliedWorkoutRef.current;

  return {
    currentMesocycle,
    setCurrentMesocycle,
    loading:
      (workoutQuery.isPending && !hasCachedResult) || isApplyingInitialWorkout,
    initialError:
      workoutQuery.isError && !hasCachedResult ? workoutQuery.error : null,
    backgroundError:
      workoutQuery.isError && hasCachedResult ? workoutQuery.error : null,
    isBackgroundFetching: workoutQuery.isFetching && hasCachedResult,
    fetchStatus: workoutQuery.fetchStatus,
    currentDayIndex,
    setCurrentDayIndex,
    sets,
    setSets,
    notes,
    setNotes,
    markWorkoutDirty,
    commitWorkoutData,
    refreshWorkoutData,
  };
}
