import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { normalizeProgressionSettings } from "../../../constants/constants";
import { currentWorkoutQueryKey } from "../../../utils/currentWorkoutQuery";
import { DROPSET_DROP_PERCENT, buildDropsetSets } from "../../../utils/dropsets";
import {
  mergeMesocycleName,
  requestMesocycleRename,
} from "../../../utils/mesocycleName";
import { enrichWorkoutWithPersonalRecords } from "../../../utils/personalRecords";
import { personalRecordsQueryKey } from "../../../utils/personalRecordsQuery";
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

function getFirstIncompleteDayIndex(plan) {
  if (!Array.isArray(plan)) {
    return -1;
  }

  return plan.findIndex(
    (day) =>
      !Array.isArray(day?.exercises) ||
      !day.exercises.every(
        (exercise) =>
          Array.isArray(exercise?.sets) &&
          exercise.sets.every((set) => set?.completed === true)
      )
  );
}

function buildMesocycleUpdatePayload(mesocycle) {
  return {
    name: mesocycle.name,
    weeks: mesocycle.weeks,
    daysPerWeek: mesocycle.daysPerWeek,
    plan: Array.isArray(mesocycle.plan)
      ? mesocycle.plan.map((day) => ({
          ...day,
          exercises: Array.isArray(day?.exercises)
            ? day.exercises.map((exercise) => {
                const persistedExercise = { ...exercise };
                delete persistedExercise.personalRecordsByWeight;
                return persistedExercise;
              })
            : day?.exercises,
        }))
      : mesocycle.plan,
    isCurrent: mesocycle.isCurrent,
    completedDate: mesocycle.completedDate,
    includeDeload: mesocycle.includeDeload,
  };
}

export default function useCurrentWorkoutActions({
  apiFetch,
  baseUrl,
  currentDayIndex,
  currentMesocycle,
  commitWorkoutData,
  markWorkoutDirty,
  menus,
  refreshWorkoutData,
  selectedExercise,
  setApplyToFutureWeeks,
  setCurrentDayIndex,
  setCurrentMesocycle,
  setNotes,
  setSets,
  sets,
  workoutModals,
}) {
  const queryClient = useQueryClient();
  const saveQueueRef = useRef(Promise.resolve());
  const setsRef = useRef(sets);
  setsRef.current = sets;

  const replaceSetsState = (updatedSets) => {
    setsRef.current = updatedSets;
    setSets(updatedSets);
    return updatedSets;
  };

  const updateSetsState = (updater) =>
    replaceSetsState(updater(setsRef.current));

  const enqueueMesocycleMutation = (executeMutation) => {
    const queuedMutation = saveQueueRef.current.then(
      executeMutation,
      executeMutation
    );
    saveQueueRef.current = queuedMutation.then(
      () => undefined,
      () => undefined
    );
    return queuedMutation;
  };

  const saveMesocycle = (
    updatedMesocycle,
    failureMessage,
    revision
  ) => {
    const executeSave = async () => {
      try {
        const { ok, data } = await apiFetch(
          baseUrl + "/mesocycles/" + updatedMesocycle.id,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(
              buildMesocycleUpdatePayload(updatedMesocycle)
            ),
          }
        );

        if (!ok) {
          const errorText = data?.message || data?.error || "Unknown error";
          console.error(failureMessage + ": " + errorText);
          return false;
        }

        if (!data?.mesocycle) {
          console.error(failureMessage + ": Missing saved mesocycle");
          return false;
        }

        const savedMesocycle = data.mesocycle;
        void queryClient.invalidateQueries({
          queryKey: personalRecordsQueryKey,
          exact: true,
          refetchType: "none",
        });
        const savedWorkout = enrichWorkoutWithPersonalRecords({
          ...updatedMesocycle,
          ...savedMesocycle,
          totalWeeks: savedMesocycle.weeks ?? updatedMesocycle.totalWeeks,
          firstIncompleteDayIndex: getFirstIncompleteDayIndex(
            savedMesocycle.plan
          ),
          personalRecordHistory: Array.isArray(data.personalRecordHistory)
            ? data.personalRecordHistory
            : updatedMesocycle.personalRecordHistory || [],
        });
        const committed = commitWorkoutData(savedWorkout, revision);
        return committed ? savedWorkout : false;
      } catch (error) {
        console.error(failureMessage + ":", error);
        return false;
      }
    };
    return enqueueMesocycleMutation(executeSave);
  };

  const handleRenameMesocycle = (name) => {
    if (!currentMesocycle) {
      return Promise.resolve({
        ok: false,
        error: "No current training block found",
      });
    }

    const mesocycleId = currentMesocycle.id;

    return enqueueMesocycleMutation(async () => {
      const result = await requestMesocycleRename(
        apiFetch,
        baseUrl,
        mesocycleId,
        name
      );

      if (!result.ok) {
        return result;
      }

      setCurrentMesocycle((previousMesocycle) =>
        mergeMesocycleName(previousMesocycle, result.mesocycle)
      );
      queryClient.setQueryData(currentWorkoutQueryKey, (previousMesocycle) =>
        mergeMesocycleName(previousMesocycle, result.mesocycle)
      );
      void queryClient.invalidateQueries({
        queryKey: personalRecordsQueryKey,
        exact: true,
        refetchType: "none",
      });

      return result;
    });
  };

  const handleSetCompletionChange = (
    dayIndex,
    exerciseIndex,
    setIndex,
    value
  ) => {
    const revision = markWorkoutDirty();
    const updatedSets = updateSetsState((previousSets) => ({
      ...previousSets,
      [dayIndex]: {
        ...previousSets[dayIndex],
        [exerciseIndex]: previousSets[dayIndex][exerciseIndex].map(
          (set, currentSetIndex) =>
            currentSetIndex === setIndex
              ? {
                  ...set,
                  completed: value,
                  weight: value
                    ? getSetLogWeight(set)
                    : set.targetWeight,
                  reps: value ? getSetLogReps(set) : set.targetReps,
                }
              : set
        ),
      },
    }));
    const updatedMesocycle = buildMesocycleWithSets(
      currentMesocycle,
      updatedSets
    );

    setCurrentMesocycle(updatedMesocycle);
    void saveMesocycle(
      updatedMesocycle,
      "Failed to update mesocycle",
      revision
    );
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
    const revision = markWorkoutDirty();

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

    await saveMesocycle(
      updatedMesocycle,
      "Failed to update mesocycle",
      revision
    );

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
    const revision = markWorkoutDirty();

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
    saveMesocycle(
      updatedMesocycle,
      "Failed to update mesocycle",
      revision
    );
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
            const progressionSettings = normalizeProgressionSettings(exercise);
            const progressedTarget =
              shouldApplyToFutureWeeks && dIndex > dayIndex
                ? calculateProgressedTarget({
                    weight: previousStartWeight,
                    reps: previousTargetReps,
                    exercise,
                    currentWeek,
                  })
                : { weight: startWeight, reps: undefined };
            const targetRepsBySet =
              progressedTarget.reps === undefined
                ? []
                : progressionSettings.progressionMode === "reps"
                  ? Array.from({ length: setCount }, (_, setIndex) =>
                      calculateProgressedTarget({
                        weight: previousStartWeight,
                        reps: getSetProgressionReps(
                          previousWeekSets?.[setIndex]
                        ),
                        exercise,
                        currentWeek,
                      }).reps
                    )
                  : Array(setCount).fill(progressedTarget.reps);
            const dropsetStartWeight = progressedTarget.weight;
            const { sets: dropsetSets, error } = buildDropsetSets({
              existingSets,
              startWeight: dropsetStartWeight,
              setCount,
              increment: progressionSettings.weightIncrement,
              minimumWeight: progressionSettings.minimumWeight,
              dropPercent: DROPSET_DROP_PERCENT,
              targetRepsBySet,
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

    const revision = markWorkoutDirty();
    replaceSetsState(updatedSets);
    setCurrentMesocycle(updatedMesocycle);

    const saved = await saveMesocycle(
      updatedMesocycle,
      "Failed to update dropsets",
      revision
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
    const normalizedValue =
      field === "weightIncrement" || field === "minimumWeight"
        ? Number(value)
        : value;
    const settingUpdates =
      field === "weightSettings" ? value : { [field]: normalizedValue };
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
                  ...settingUpdates,
                }
              : exercise
          ),
        };
      }),
    };

    const revision = markWorkoutDirty();
    const saved = await saveMesocycle(
      updatedMesocycle,
      "Failed to update " + field,
      revision
    );

    if (!saved) {
      return;
    }

    await refreshWorkoutData({
      dayIndex: currentDayIndex,
      force: false,
    });

    if (field === "progressionMode") {
      workoutModals.resetProgressionModeDraft(dayIndex, exerciseIndex);
    } else if (field === "weightIncrement" || field === "weightSettings") {
      workoutModals.resetWeightIncrementDraft(dayIndex, exerciseIndex);
    }

    onClose();
    menus.setOpenMenus((prev) => ({ ...prev, [exerciseIndex]: false }));
  };

  const handleRepsChange = (dayIndex, exerciseIndex, setIndex, value) => {
    markWorkoutDirty();
    updateSetsState((prev) => ({
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
    markWorkoutDirty();
    const currentWeight = parseFloat(value);

    if (exercise.dropset?.enabled && setIndex === 0) {
      updateSetsState((prev) => {
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

    updateSetsState((prev) => ({
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

  const addSet = (
    dayIndex,
    exerciseIndex,
    shouldApplyToFutureWeeks
  ) => {
    const revision = markWorkoutDirty();
    const daysPerWeek = currentMesocycle.daysPerWeek;
    const updatedSets = updateSetsState((previousSets) => {
      const nextSets = Object.fromEntries(
        Object.entries(previousSets).map(
          ([setsDayIndex, exercisesForDay]) => [
            setsDayIndex,
            { ...exercisesForDay },
          ]
        )
      );
      const newSet = {
        completed: false,
        targetWeight: 0,
        targetReps: 0,
      };

      nextSets[dayIndex] = {
        ...(nextSets[dayIndex] || {}),
        [exerciseIndex]: [
          ...(nextSets[dayIndex]?.[exerciseIndex] || []),
          newSet,
        ],
      };

      if (shouldApplyToFutureWeeks) {
        for (
          let index = dayIndex + daysPerWeek;
          index < currentMesocycle.plan.length;
          index += daysPerWeek
        ) {
          nextSets[index] = {
            ...(nextSets[index] || {}),
            [exerciseIndex]: [
              ...(nextSets[index]?.[exerciseIndex] || []),
              newSet,
            ],
          };
        }
      }

      return nextSets;
    });
    const updatedMesocycle = buildMesocycleWithSets(
      currentMesocycle,
      updatedSets
    );

    setCurrentMesocycle(updatedMesocycle);
    void saveMesocycle(
      updatedMesocycle,
      "Error response from server",
      revision
    );
    setApplyToFutureWeeks(false);
  };

  const removeSet = (
    dayIndex,
    exerciseIndex,
    setIndex,
    shouldApplyToFutureWeeks
  ) => {
    const revision = markWorkoutDirty();
    const daysPerWeek = currentMesocycle.daysPerWeek;
    const updatedSets = updateSetsState((previousSets) => {
      const nextSets = Object.fromEntries(
        Object.entries(previousSets).map(
          ([setsDayIndex, exercisesForDay]) => [
            setsDayIndex,
            { ...exercisesForDay },
          ]
        )
      );
      const removeAtIndex = (exerciseSets = []) =>
        exerciseSets.filter(
          (_, currentSetIndex) => currentSetIndex !== setIndex
        );

      if (nextSets[dayIndex]?.[exerciseIndex]) {
        nextSets[dayIndex][exerciseIndex] = removeAtIndex(
          nextSets[dayIndex][exerciseIndex]
        );
      }

      if (shouldApplyToFutureWeeks) {
        for (
          let index = dayIndex + daysPerWeek;
          index < currentMesocycle.plan.length;
          index += daysPerWeek
        ) {
          if (nextSets[index]?.[exerciseIndex]) {
            nextSets[index][exerciseIndex] = removeAtIndex(
              nextSets[index][exerciseIndex]
            );
          }
        }
      }

      return nextSets;
    });
    const updatedMesocycle = buildMesocycleWithSets(
      currentMesocycle,
      updatedSets
    );

    setCurrentMesocycle(updatedMesocycle);
    void saveMesocycle(
      updatedMesocycle,
      "Error updating mesocycle after removing set",
      revision
    );
    setApplyToFutureWeeks(false);
  };

  const handleDayClick = (index) => {
    setCurrentDayIndex(index);
    workoutModals.setIsCalendarModalOpen(false);
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

  const handleMinimumWeightChange = (value) => {
    if (!workoutModals.currentExercise || !selectedExercise) {
      return;
    }

    workoutModals.handleMinimumWeightDraftChange(
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
      field: "weightSettings",
      value: {
        weightIncrement: workoutModals.getWeightIncrementDraft(
          dayIndex,
          exerciseIndex,
          selectedExercise
        ),
        minimumWeight: workoutModals.getMinimumWeightDraft(
          dayIndex,
          exerciseIndex,
          selectedExercise
        ),
      },
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
    handleMinimumWeightChange,
    handleProgressionModeChange,
    handleProgressionModeSave,
    handleRenameMesocycle,
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
