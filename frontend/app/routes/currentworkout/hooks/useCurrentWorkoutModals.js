import { useCallback, useState } from "react";
import { normalizeProgressionSettings } from "../../../constants/constants";
import { getProgressionKey } from "../utils/workoutUtils";

export default function useCurrentWorkoutModals() {
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isChooseExerciseModalOpen, setIsChooseExerciseModalOpen] =
    useState(false);
  const [isProgressionModeModalOpen, setIsProgressionModeModalOpen] =
    useState(false);
  const [isWeightIncrementModalOpen, setIsWeightIncrementModalOpen] =
    useState(false);
  const [isDropsetModalOpen, setIsDropsetModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentExercise, setCurrentExercise] = useState(null);
  const [progressionModeDrafts, setProgressionModeDrafts] = useState({});
  const [weightIncrementDrafts, setWeightIncrementDrafts] = useState({});
  const [minimumWeightDrafts, setMinimumWeightDrafts] = useState({});
  const [applyProgressionModeToFutureWeeks, setApplyProgressionModeToFutureWeeks] =
    useState({});
  const [applyWeightIncrementToFutureWeeks, setApplyWeightIncrementToFutureWeeks] =
    useState({});

  const openCalendarModal = useCallback(() => setIsCalendarModalOpen(true), []);
  const closeCalendarModal = useCallback(() => setIsCalendarModalOpen(false), []);

  const openNoteModal = useCallback(({ dayIndex, exerciseIndex, note }) => {
    setCurrentExercise({ dayIndex, exerciseIndex });
    setCurrentNote(note || "");
    setIsNoteModalOpen(true);
  }, []);

  const openChooseExerciseModal = useCallback(({ dayIndex, exerciseIndex }) => {
    setCurrentExercise({ dayIndex, exerciseIndex });
    setIsChooseExerciseModalOpen(true);
  }, []);

  const openDropsetModal = useCallback(({ dayIndex, exerciseIndex }) => {
    setCurrentExercise({ dayIndex, exerciseIndex });
    setIsDropsetModalOpen(true);
  }, []);

  const openProgressionModeModal = useCallback(({ dayIndex, exerciseIndex }) => {
    const key = getProgressionKey(dayIndex, exerciseIndex);
    setCurrentExercise({ dayIndex, exerciseIndex });
    setApplyProgressionModeToFutureWeeks((prev) => ({
      ...prev,
      [key]: false,
    }));
    setIsProgressionModeModalOpen(true);
  }, []);

  const openWeightIncrementModal = useCallback(({ dayIndex, exerciseIndex }) => {
    const key = getProgressionKey(dayIndex, exerciseIndex);
    setCurrentExercise({ dayIndex, exerciseIndex });
    setMinimumWeightDrafts((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setApplyWeightIncrementToFutureWeeks((prev) => ({
      ...prev,
      [key]: false,
    }));
    setIsWeightIncrementModalOpen(true);
  }, []);

  const getProgressionModeDraft = useCallback(
    (dayIndex, exerciseIndex, exercise) => {
      const key = getProgressionKey(dayIndex, exerciseIndex);
      return (
        progressionModeDrafts[key] ||
        normalizeProgressionSettings(exercise).progressionMode
      );
    },
    [progressionModeDrafts]
  );

  const getWeightIncrementDraft = useCallback(
    (dayIndex, exerciseIndex, exercise) => {
      const key = getProgressionKey(dayIndex, exerciseIndex);
      return (
        weightIncrementDrafts[key] ||
        normalizeProgressionSettings(exercise).weightIncrement
      );
    },
    [weightIncrementDrafts]
  );

  const getMinimumWeightDraft = useCallback(
    (dayIndex, exerciseIndex, exercise) => {
      const key = getProgressionKey(dayIndex, exerciseIndex);
      return minimumWeightDrafts[key] ?? normalizeProgressionSettings(exercise).minimumWeight;
    },
    [minimumWeightDrafts]
  );

  const handleProgressionModeDraftChange = useCallback(
    (dayIndex, exerciseIndex, exercise, value) => {
      const key = getProgressionKey(dayIndex, exerciseIndex);
      const currentSettings = normalizeProgressionSettings(exercise);
      setProgressionModeDrafts((prev) => ({
        ...prev,
        [key]: value || currentSettings.progressionMode,
      }));
    },
    []
  );

  const handleWeightIncrementDraftChange = useCallback(
    (dayIndex, exerciseIndex, exercise, value) => {
      const key = getProgressionKey(dayIndex, exerciseIndex);
      const currentSettings = normalizeProgressionSettings(exercise);
      setWeightIncrementDrafts((prev) => ({
        ...prev,
        [key]: Number.isFinite(Number(value))
          ? Number(value)
          : currentSettings.weightIncrement,
      }));
    },
    []
  );

  const handleMinimumWeightDraftChange = useCallback(
    (dayIndex, exerciseIndex, exercise, value) => {
      const key = getProgressionKey(dayIndex, exerciseIndex);
      const currentSettings = normalizeProgressionSettings(exercise);
      setMinimumWeightDrafts((prev) => ({
        ...prev,
        [key]: Number.isFinite(Number(value)) ? Number(value) : currentSettings.minimumWeight,
      }));
    },
    []
  );

  const resetProgressionModeDraft = useCallback((dayIndex, exerciseIndex) => {
    const key = getProgressionKey(dayIndex, exerciseIndex);
    setProgressionModeDrafts((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setApplyProgressionModeToFutureWeeks((prev) => ({
      ...prev,
      [key]: false,
    }));
  }, []);

  const resetWeightIncrementDraft = useCallback((dayIndex, exerciseIndex) => {
    const key = getProgressionKey(dayIndex, exerciseIndex);
    setWeightIncrementDrafts((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setMinimumWeightDrafts((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setApplyWeightIncrementToFutureWeeks((prev) => ({
      ...prev,
      [key]: false,
    }));
  }, []);

  return {
    isCalendarModalOpen,
    setIsCalendarModalOpen,
    openCalendarModal,
    closeCalendarModal,
    isNoteModalOpen,
    setIsNoteModalOpen,
    isChooseExerciseModalOpen,
    setIsChooseExerciseModalOpen,
    isProgressionModeModalOpen,
    setIsProgressionModeModalOpen,
    isWeightIncrementModalOpen,
    setIsWeightIncrementModalOpen,
    isDropsetModalOpen,
    setIsDropsetModalOpen,
    currentNote,
    setCurrentNote,
    currentExercise,
    setCurrentExercise,
    applyProgressionModeToFutureWeeks,
    setApplyProgressionModeToFutureWeeks,
    applyWeightIncrementToFutureWeeks,
    setApplyWeightIncrementToFutureWeeks,
    openNoteModal,
    openChooseExerciseModal,
    openDropsetModal,
    openProgressionModeModal,
    openWeightIncrementModal,
    getProgressionModeDraft,
    getWeightIncrementDraft,
    getMinimumWeightDraft,
    handleProgressionModeDraftChange,
    handleWeightIncrementDraftChange,
    handleMinimumWeightDraftChange,
    resetProgressionModeDraft,
    resetWeightIncrementDraft,
  };
}
