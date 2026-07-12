import { useCallback, useEffect, useState } from "react";
import { buildWorkoutState } from "../utils/workoutUtils";

export default function useCurrentWorkoutData(apiFetch, baseUrl) {
  const [currentMesocycle, setCurrentMesocycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);
  const [sets, setSets] = useState({});
  const [notes, setNotes] = useState({});

  const setWorkoutData = useCallback((workout, preferredDayIndex) => {
    setCurrentMesocycle(workout);

    const nextDayIndex = preferredDayIndex ?? workout.firstIncompleteDayIndex;
    if (nextDayIndex !== undefined) {
      setCurrentDayIndex(nextDayIndex);
    } else {
      console.warn("firstIncompleteDayIndex is undefined");
    }

    const workoutState = buildWorkoutState(workout);
    setNotes(workoutState.notes);
    setSets(workoutState.sets);
  }, []);

  const refreshWorkoutData = useCallback(
    async ({ dayIndex } = {}) => {
      try {
        const { ok, data } = await apiFetch(baseUrl + "/current-workout", {
          method: "GET",
          credentials: "include",
        });

        if (!ok) {
          console.error("Failed to fetch current workout");
          return { ok: false, data };
        }

        setWorkoutData(data, dayIndex);
        return { ok: true, data };
      } catch (error) {
        console.error("Error fetching workout data:", error);
        return { ok: false, data: null };
      }
    },
    [apiFetch, baseUrl, setWorkoutData]
  );

  useEffect(() => {
    const fetchWorkout = async () => {
      await refreshWorkoutData();
      setLoading(false);
    };

    fetchWorkout();
  }, [refreshWorkoutData]);

  return {
    currentMesocycle,
    setCurrentMesocycle,
    loading,
    currentDayIndex,
    setCurrentDayIndex,
    sets,
    setSets,
    notes,
    setNotes,
    refreshWorkoutData,
  };
}
