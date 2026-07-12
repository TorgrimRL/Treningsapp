import { normalizeProgressionSettings } from "../../../constants/constants";
import { DROPSET_DROP_PERCENT, buildDropsetSets } from "../../../utils/dropsets";
import {
  buildMesocycleWithSets,
  calculateProgressedTarget,
  getCurrentExerciseAtSlot,
  getDropsetStartWeight,
  getProgressionKey,
  getSetLogReps,
  getSetLogWeight,
  getSetProgressionReps,
  getWeekAndDay,
  updateDropsetSetsFromStartWeight,
} from "../utils/workoutUtils";

export default function useCurrentWorkoutActions({
  apiFetch,
  baseUrl,
  currentDayIndex,
  currentMesocycle,
  menus,
  refreshWorkoutData,
  selectedExercise,
  setApplyToFutureWeeks,
  setCurrentMesocycle,
  setNotes,
  setSets,
  sets,
  workoutModals,
}) {
  const saveMesocycle = async (updatedMesocycle, failureMessage) => {
    try {
      const { ok, data } = await apiFetch(
        baseUrl + "/mesocycles/" + updatedMesocycle.id,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedMesocycle),
        }
      );

      if (!ok) {
        const errorText = data.message || "Unknown error";
        console.error(failureMessage + ": " + errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error(failureMessage + ":", error);
      return false;
    }
  };

  const handleSetCompletionChange = (dayIndex, exerciseIndex, setIndex, value) => {
    setSets((prev) => {
      const updatedSets = {
        ...prev,
        [dayIndex]: {
          ...prev[dayIndex],
          [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) => {
            if (sIndex === setIndex) {
              return {
                ...set,
                completed: value,
                weight: value ? getSetLogWeight(set) : set.targetWeight,
                reps: value ? getSetLogReps(set) : set.targetReps,
              };
            }

            return set;
          }),
        },
      };
      const updatedMesocycle = buildMesocycleWithSets(
        currentMesocycle,
        updatedSets
      );

      setCurrentMesocycle(updatedMesocycle);
      saveMesocycle(updatedMesocycle, "Failed to update mesocycle");

      return updatedSets;
    });
  };

  const handleNoteChange = (newNote) => {
    workoutModals.setCurrentNote(newNote);
  };

  const handleSaveNote = async (shouldApplyToFutureWeeks) => {
    if (!workoutModals.currentExercise || !currentMesocycle) {
      return;
    }

    const { dayIndex, exerciseIndex } = workoutModals.currentExercise;
    const daysPerWeek = currentMesocycle.daysPerWeek;
    const currentNote = workoutModals.currentNote;

    setNotes((prevNotes) => {
      const updatedNotes = { ...prevNotes };

      if (shouldApplyToFutureWeeks) {
        const currentWeekDay = dayIndex % daysPerWeek;
        for (let index = dayIndex; index < currentMesocycle.plan.length; index += daysPerWeek) {
          if (index % daysPerWeek === currentWeekDay) {
            updatedNotes[index] = updatedNotes[index] || {};
            updatedNotes[index][exerciseIndex] = currentNote;
          }
        }
      } else {
        updatedNotes[dayIndex] = {
          ...updatedNotes[dayIndex],
          [exerciseIndex]: currentNote,
        };
      }

      return updatedNotes;
    });

    const updatedMesocycle = {
      ...currentMesocycle,
      plan: currentMesocycle.plan.map((day, dIndex) =>
        shouldApplyToFutureWeeks
          ? dIndex % daysPerWeek === dayIndex % daysPerWeek
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIndex) =>
                  eIndex === exerciseIndex
                    ? {
                        ...exercise,
                        note: currentNote,
                      }
                    : exercise
                ),
              }
            : day
          : dIndex === dayIndex
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIndex) =>
                  eIndex === exerciseIndex
                    ? {
                        ...exercise,
                        note: currentNote,
                      }
                    : exercise
                ),
              }
            : day
      ),
    };

    const saved = await saveMesocycle(
      updatedMesocycle,
      "Failed to update mesocycle"
    );

    if (saved) {
      setCurrentMesocycle(updatedMesocycle);
    }

    workoutModals.setIsNoteModalOpen(false);
  };

  const handleSaveExercise = (selectedExerciseValue, shouldApplyToFutureWeeks) => {
    if (!workoutModals.currentExercise || !currentMesocycle) {
      return;
    }

    const { dayIndex, exerciseIndex } = workoutModals.currentExercise;
    const selectedExerciseDetails =
      typeof selectedExerciseValue === "string"
        ? { exercise: selectedExerciseValue, name: selectedExerciseValue }
        : selectedExerciseValue;
    const selectedExerciseName =
      selectedExerciseDetails.exercise || selectedExerciseDetails.name;

    const applySelectedExercise = (exercise) => ({
      ...exercise,
      exercise: selectedExerciseName,
      muscleGroup: selectedExerciseDetails.muscleGroup || exercise.muscleGroup,
      priority:
        selectedExerciseDetails.priority ||
        selectedExerciseDetails.muscleGroup ||
        exercise.priority,
      type: selectedExerciseDetails.type || exercise.type,
      videoLink:
        selectedExerciseDetails.videoLink ||
        selectedExerciseDetails.videolink ||
        exercise.videoLink,
    });

    const updatedMesocycle = {
      ...currentMesocycle,
      plan: currentMesocycle.plan.map((day, dIndex) => {
        if (
          shouldApplyToFutureWeeks &&
          dIndex % currentMesocycle.daysPerWeek === dayIndex % currentMesocycle.daysPerWeek
        ) {
          return {
            ...day,
            exercises: day.exercises.map((exercise, eIndex) =>
              eIndex === exerciseIndex ? applySelectedExercise(exercise) : exercise
            ),
          };
        }

        if (dIndex === dayIndex) {
          return {
            ...day,
            exercises: day.exercises.map((exercise, eIndex) =>
              eIndex === exerciseIndex ? applySelectedExercise(exercise) : exercise
            ),
          };
        }

        return day;
      }),
    };

    setCurrentMesocycle(updatedMesocycle);
    saveMesocycle(updatedMesocycle, "Failed to update mesocycle");
    workoutModals.setIsChooseExerciseModalOpen(false);
  };

  const handleSaveDropset = async ({
    startWeight,
    setCount,
    applyToFutureWeeks: shouldApplyToFutureWeeks,
  }) => {
    if (!workoutModals.currentExercise || !currentMesocycle) {
      return;
    }

    const { dayIndex, exerciseIndex } = workoutModals.currentExercise;
    const daysPerWeek = currentMesocycle.daysPerWeek;
    let dropsetError = null;
    const updatedSets = Object.fromEntries(
      Object.entries(sets).map(([setsDayIndex, exercisesForDay]) => [
        setsDayIndex,
        { ...exercisesForDay },
      ])
    );

    const updatedMesocycle = {
      ...currentMesocycle,
      plan: currentMesocycle.plan.map((day, dIndex) => {
        const shouldUpdateDay = shouldApplyToFutureWeeks
          ? dIndex >= dayIndex && dIndex % daysPerWeek === dayIndex % daysPerWeek
          : dIndex === dayIndex;

        if (!shouldUpdateDay) {
          return day;
        }

        return {
          ...day,
          exercises: day.exercises.map((exercise, eIndex) => {
            if (eIndex !== exerciseIndex) {
              return exercise;
            }

            const existingSets = updatedSets[dIndex]?.[eIndex] || exercise.sets || [];
            const previousWeekSets = updatedSets[dIndex - daysPerWeek]?.[eIndex];
            const currentWeek = Math.floor(dIndex / daysPerWeek) + 1;
            const previousStartWeight = getDropsetStartWeight(
              previousWeekSets,
              startWeight
            );
            const previousTargetReps = getSetProgressionReps(previousWeekSets?.[0]);
            const progressedTarget =
              shouldApplyToFutureWeeks && dIndex > dayIndex
                ? calculateProgressedTarget({
                    weight: previousStartWeight,
                    reps: previousTargetReps,
                    exercise,
                    currentWeek,
                  })
                : { weight: startWeight, reps: undefined };
            const dropsetStartWeight = progressedTarget.weight;
            const increment = normalizeProgressionSettings(exercise).weightIncrement;
            const { sets: dropsetSets, error } = buildDropsetSets({
              existingSets,
              startWeight: dropsetStartWeight,
              setCount,
              increment,
              dropPercent: DROPSET_DROP_PERCENT,
              targetReps: progressedTarget.reps,
            });

            if (error) {
              dropsetError = error;
              return exercise;
            }

            updatedSets[dIndex] = {
              ...(updatedSets[dIndex] || {}),
              [eIndex]: dropsetSets,
            };

            return {
              ...exercise,
              dropset: {
                enabled: true,
                setCount,
                startWeight: dropsetStartWeight,
                dropPercent: DROPSET_DROP_PERCENT,
              },
              sets: dropsetSets,
            };
          }),
        };
      }),
    };

    if (dropsetError) {
      console.error("Failed to create dropsets: " + dropsetError);
      return;
    }

    setSets(updatedSets);
    setCurrentMesocycle(updatedMesocycle);

    const saved = await saveMesocycle(
      updatedMesocycle,
      "Failed to update dropsets"
    );

    if (saved) {
      workoutModals.setIsDropsetModalOpen(false);
      menus.setOpenMenus((prev) => ({ ...prev, [exerciseIndex]: false }));
    }
  };

  const saveProgressionSetting = async ({
    field,
    value,
    applyToFutureWeeks: shouldApplyToFutureWeeks,
    onClose,
  }) => {
    if (!workoutModals.currentExercise || !currentMesocycle) {
      return;
    }

    const { dayIndex, exerciseIndex } = workoutModals.currentExercise;
    const currentExercise = getCurrentExerciseAtSlot(
      currentMesocycle,
      dayIndex,
      exerciseIndex
    );

    if (!currentExercise) {
      return;
    }

    const daysPerWeek = currentMesocycle.daysPerWeek;
    const normalizedValue = field === "weightIncrement" ? Number(value) : value;
    const updatedMesocycle = {
      ...currentMesocycle,
      plan: currentMesocycle.plan.map((day, dIndex) => {
        const shouldUpdateDay = shouldApplyToFutureWeeks
          ? dIndex >= dayIndex && dIndex % daysPerWeek === dayIndex % daysPerWeek
          : dIndex === dayIndex;

        if (!shouldUpdateDay) {
          return day;
        }

        return {
          ...day,
          exercises: day.exercises.map((exercise, eIndex) =>
            eIndex === exerciseIndex
              ? {
                  ...exercise,
                  [field]: normalizedValue,
                }
              : exercise
          ),
        };
      }),
    };

    const saved = await saveMesocycle(
      updatedMesocycle,
      "Failed to update " + field
    );

    if (!saved) {
      return;
    }

    const refreshed = await refreshWorkoutData({ dayIndex: currentDayIndex });
    if (!refreshed.ok) {
      setCurrentMesocycle(updatedMesocycle);
    }

    if (field === "progressionMode") {
      workoutModals.resetProgressionModeDraft(dayIndex, exerciseIndex);
    } else if (field === "weightIncrement") {
      workoutModals.resetWeightIncrementDraft(dayIndex, exerciseIndex);
    }

    onClose();
    menus.setOpenMenus((prev) => ({ ...prev, [exerciseIndex]: false }));
  };

  const handleRepsChange = (dayIndex, exerciseIndex, setIndex, value) => {
    setSets((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) =>
          sIndex === setIndex ? { ...set, reps: value, completed: false } : set
        ),
      },
    }));
  };

  const handleWeightChange = (dayIndex, exerciseIndex, setIndex, value, exercise) => {
    const currentWeight = parseFloat(value);

    if (exercise.dropset?.enabled && setIndex === 0) {
      setSets((prev) => {
        const exerciseSets = prev[dayIndex][exerciseIndex];
        const { sets: dropsetSets, error } = updateDropsetSetsFromStartWeight({
          exerciseSets,
          exercise,
          startWeight: currentWeight,
        });

        if (error) {
          console.error("Failed to update dropset weights: " + error);
          return prev;
        }

        return {
          ...prev,
          [dayIndex]: {
            ...prev[dayIndex],
            [exerciseIndex]: dropsetSets,
          },
        };
      });

      setCurrentMesocycle((prevMesocycle) => ({
        ...prevMesocycle,
        plan: prevMesocycle.plan.map((day, dIndex) =>
          dIndex === dayIndex
            ? {
                ...day,
                exercises: day.exercises.map((currentExercise, eIndex) =>
                  eIndex === exerciseIndex
                    ? {
                        ...currentExercise,
                        dropset: {
                          ...currentExercise.dropset,
                          enabled: true,
                          startWeight: currentWeight,
                        },
                      }
                    : currentExercise
                ),
              }
            : day
        ),
      }));
      return;
    }

    const incrementSize = normalizeProgressionSettings(exercise).weightIncrement;
    const { week: currentWeek } = getWeekAndDay(
      dayIndex,
      currentMesocycle.daysPerWeek
    );

    setSets((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) => {
          const applyCurrentWeight =
            sIndex === setIndex || (setIndex === 0 && !set.completed);

          if (applyCurrentWeight) {
            const targetWeight = parseFloat(set.targetWeight);
            const targetReps = parseInt(set.targetReps, 10);
            const incrementDifference = (currentWeight - targetWeight) / incrementSize;
            let newReps = targetReps - incrementDifference * 2;

            if (Math.abs(incrementDifference) > 3) {
              if (currentWeek <= 2) {
                newReps = "3 RIR";
              } else if (currentWeek === 3) {
                newReps = "2 RIR";
              } else if (currentWeek >= 4) {
                newReps = "0/1 RIR";
              }
            } else {
              newReps = Math.round(newReps);
            }

            return {
              ...set,
              weight: currentWeight,
              reps: newReps,
              completed: false,
            };
          }

          return set;
        }),
      },
    }));
  };

  const addSet = (dayIndex, exerciseIndex, shouldApplyToFutureWeeks) => {
    const daysPerWeek = currentMesocycle.daysPerWeek;
    let updatedSets = {};

    setSets((prev) => {
      updatedSets = { ...prev };

      if (!updatedSets[dayIndex]) {
        updatedSets[dayIndex] = {};
      }

      if (!updatedSets[dayIndex][exerciseIndex]) {
        updatedSets[dayIndex][exerciseIndex] = [];
      }

      const newSet = {
        completed: false,
        targetWeight: 0,
        targetReps: 0,
      };

      updatedSets[dayIndex][exerciseIndex] = [
        ...updatedSets[dayIndex][exerciseIndex],
        newSet,
      ];

      if (shouldApplyToFutureWeeks) {
        const currentWeekDay = dayIndex % daysPerWeek;
        for (
          let index = dayIndex + daysPerWeek;
          index < currentMesocycle.plan.length;
          index += daysPerWeek
        ) {
          if (index % daysPerWeek === currentWeekDay) {
            if (!updatedSets[index]) {
              updatedSets[index] = {};
            }
            if (!updatedSets[index][exerciseIndex]) {
              updatedSets[index][exerciseIndex] = [];
            }
            updatedSets[index][exerciseIndex] = [
              ...updatedSets[index][exerciseIndex],
              newSet,
            ];
          }
        }
      }

      return updatedSets;
    });

    setTimeout(() => {
      const updatedMesocycle = buildMesocycleWithSets(
        currentMesocycle,
        updatedSets
      );
      saveMesocycle(updatedMesocycle, "Error response from server");
    }, 100);
    setApplyToFutureWeeks(false);
  };

  const removeSet = (dayIndex, exerciseIndex, setIndex, shouldApplyToFutureWeeks) => {
    const daysPerWeek = currentMesocycle.daysPerWeek;
    let updatedSets = {};

    setSets((prev) => {
      updatedSets = { ...prev };

      if (updatedSets[dayIndex] && updatedSets[dayIndex][exerciseIndex]) {
        updatedSets[dayIndex][exerciseIndex] = updatedSets[dayIndex][
          exerciseIndex
        ].filter((_, index) => index !== setIndex);
      }

      if (shouldApplyToFutureWeeks) {
        const currentWeekDay = dayIndex % daysPerWeek;
        for (
          let index = dayIndex + daysPerWeek;
          index < currentMesocycle.plan.length;
          index += daysPerWeek
        ) {
          if (index % daysPerWeek === currentWeekDay) {
            if (updatedSets[index] && updatedSets[index][exerciseIndex]) {
              updatedSets[index][exerciseIndex] = updatedSets[index][
                exerciseIndex
              ].filter((_, currentIndex) => currentIndex !== setIndex);
            }
          }
        }
      }

      return updatedSets;
    });

    setTimeout(() => {
      const updatedMesocycle = buildMesocycleWithSets(
        currentMesocycle,
        updatedSets
      );
      saveMesocycle(
        updatedMesocycle,
        "Error updating mesocycle after removing set"
      );
    }, 100);
    setApplyToFutureWeeks(false);
  };

  const handleDayClick = async (index) => {
    const refreshed = await refreshWorkoutData({ dayIndex: index });
    if (refreshed.ok) {
      workoutModals.setIsCalendarModalOpen(false);
    }
  };

  const handleProgressionModeChange = (value) => {
    if (!workoutModals.currentExercise || !selectedExercise) {
      return;
    }

    workoutModals.handleProgressionModeDraftChange(
      workoutModals.currentExercise.dayIndex,
      workoutModals.currentExercise.exerciseIndex,
      selectedExercise,
      value
    );
  };

  const handleWeightIncrementChange = (value) => {
    if (!workoutModals.currentExercise || !selectedExercise) {
      return;
    }

    workoutModals.handleWeightIncrementDraftChange(
      workoutModals.currentExercise.dayIndex,
      workoutModals.currentExercise.exerciseIndex,
      selectedExercise,
      value
    );
  };

  const handleApplyProgressionModeToFutureWeeksChange = (checked) => {
    if (!workoutModals.currentExercise) {
      return;
    }

    workoutModals.setApplyProgressionModeToFutureWeeks((prev) => ({
      ...prev,
      [getProgressionKey(
        workoutModals.currentExercise.dayIndex,
        workoutModals.currentExercise.exerciseIndex
      )]: checked,
    }));
  };

  const handleApplyWeightIncrementToFutureWeeksChange = (checked) => {
    if (!workoutModals.currentExercise) {
      return;
    }

    workoutModals.setApplyWeightIncrementToFutureWeeks((prev) => ({
      ...prev,
      [getProgressionKey(
        workoutModals.currentExercise.dayIndex,
        workoutModals.currentExercise.exerciseIndex
      )]: checked,
    }));
  };

  const handleProgressionModeSave = () => {
    if (!workoutModals.currentExercise || !selectedExercise) {
      return;
    }

    const { dayIndex, exerciseIndex } = workoutModals.currentExercise;
    const key = getProgressionKey(dayIndex, exerciseIndex);
    saveProgressionSetting({
      field: "progressionMode",
      value: workoutModals.getProgressionModeDraft(
        dayIndex,
        exerciseIndex,
        selectedExercise
      ),
      applyToFutureWeeks: !!workoutModals.applyProgressionModeToFutureWeeks[key],
      onClose: () => workoutModals.setIsProgressionModeModalOpen(false),
    });
  };

  const handleWeightIncrementSave = () => {
    if (!workoutModals.currentExercise || !selectedExercise) {
      return;
    }

    const { dayIndex, exerciseIndex } = workoutModals.currentExercise;
    const key = getProgressionKey(dayIndex, exerciseIndex);
    saveProgressionSetting({
      field: "weightIncrement",
      value: workoutModals.getWeightIncrementDraft(
        dayIndex,
        exerciseIndex,
        selectedExercise
      ),
      applyToFutureWeeks: !!workoutModals.applyWeightIncrementToFutureWeeks[key],
      onClose: () => workoutModals.setIsWeightIncrementModalOpen(false),
    });
  };

  return {
    addSet,
    handleApplyProgressionModeToFutureWeeksChange,
    handleApplyWeightIncrementToFutureWeeksChange,
    handleDayClick,
    handleNoteChange,
    handleProgressionModeChange,
    handleProgressionModeSave,
    handleRepsChange,
    handleSaveDropset,
    handleSaveExercise,
    handleSaveNote,
    handleSetCompletionChange,
    handleWeightChange,
    handleWeightIncrementChange,
    handleWeightIncrementSave,
    removeSet,
  };
}
