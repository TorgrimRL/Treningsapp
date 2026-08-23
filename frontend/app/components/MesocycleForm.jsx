import { useEffect, useState } from "react";
import {
  muscleGroups as allMuscleGroups,
  exercises,
  days,
  progressionModes,
  weightIncrementOptions,
  minimumWeightOptions,
  getDefaultWeightIncrement,
  normalizeProgressionSettings,
  formatWeightSetting,
} from "../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router";
import AddExerciseModal from "./AddExerciseModal";
import MesocycleDetailsModal from "./MesocycleDetailsModal";
import { useApiFetch } from "../utils/apiFetch";
import { buildMesocyclePayload, createEmptyExercise } from "../utils/mesocyclePlan";
import PlanBuilderGuide from "../features/onboarding/PlanBuilderGuide";

const sortExercisesByName = (exerciseList = []) =>
  [...exerciseList].sort((a, b) => a.name.localeCompare(b.name));

const MesocycleForm = ({ isOnboarding = false, onCancel, onSubmit }) => {
  const location = useLocation();
  const { template, weeks, daysPerWeek, muscleGroups, dayLabels, importedPlan } =
    location.state || {};
  const [plan, setPlan] = useState([
    ...(importedPlan?.plan?.slice(0, importedPlan.daysPerWeek) || [{
      label: "",
      exercises: [createEmptyExercise()],
    }]),
  ]);
  const [isModalOpen, setIsModalOpen] = useState(!importedPlan);
  const [mesocycleName, setMesocycleName] = useState(importedPlan?.name || "");
  const [numberOfWeeks, setNumberOfWeeks] = useState(importedPlan?.weeks || "");
  const [includeDeload, setIncludeDeload] = useState(importedPlan?.includeDeload || false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [customExerciseTarget, setCustomExerciseTarget] = useState(null);
  const [customExercises, setCustomExercises] = useState({});
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const fetchCustomExercises = async () => {
      try {
        const { ok, data } = await apiFetch(`${baseUrl}/exercises`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!ok) {
          console.error(
            `Failed to fetch exercises: ${data.message || "Unknown error"}`
          );
          return;
        }

        const groupedExercises = data.reduce((acc, exercise) => {
          if (!acc[exercise.muscleGroup]) {
            acc[exercise.muscleGroup] = [];
          }
          acc[exercise.muscleGroup].push({
            name: exercise.name,
            type: exercise.type,
            videoLink: exercise.videoLink || exercise.videolink || "",
          });
          return acc;
        }, {});
        setCustomExercises(groupedExercises);
      } catch (error) {
        console.error("Error fetching exercises", error);
      }
    };

    fetchCustomExercises();
  }, [apiFetch, baseUrl]);

  useEffect(() => {
    if (!template) {
      return;
    }

    setNumberOfWeeks((currentWeeks) => weeks || currentWeeks);
    const initialPlan = Array.from({ length: daysPerWeek }, (_, dayIndex) => ({
      label: dayLabels[dayIndex],
      exercises:
        muscleGroups[dayIndex]?.map((group) =>
          createEmptyExercise({ muscleGroup: group })
        ) || [],
    }));
    setPlan(initialPlan);
  }, [template, weeks, daysPerWeek, muscleGroups, dayLabels]);

  const getSelectedExercise = (muscleGroup, exerciseName) => {
    const builtInExercise = exercises[muscleGroup]?.find(
      (exercise) => exercise.name === exerciseName
    );

    if (builtInExercise) {
      return builtInExercise;
    }

    return customExercises[muscleGroup]?.find(
      (exercise) => exercise.name === exerciseName
    );
  };

  const handleSaveMesocycleDetails = (name, weeksValue, includeDeloadValue) => {
    setMesocycleName(name);
    setNumberOfWeeks(weeksValue);
    setIncludeDeload(includeDeloadValue);
    setIsModalOpen(false);
  };

  const handleOpenAddExerciseModal = (dayIndex, exerciseIndex) => {
    setCustomExerciseTarget({ dayIndex, exerciseIndex });
    setIsExerciseModalOpen(true);
  };

  const handleSaveCustomExercise = async (newExercise) => {
    if (!newExercise) {
      return { ok: false, error: "Exercise details are missing." };
    }

    const exerciseToSave = {
      name: newExercise.name,
      muscleGroup: newExercise.muscleGroup,
      type: newExercise.type,
      videoLink: newExercise.videoLink || newExercise.videolink || "",
      videolink: newExercise.videoLink || newExercise.videolink || "",
    };

    try {
      const { ok, data } = await apiFetch(`${baseUrl}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(exerciseToSave),
      });

      if (!ok) {
        const error = data?.message || data?.error || "Unknown error";
        console.error(`Failed to update custom exercises: ${error}`);
        return { ok: false, error };
      }

      setCustomExercises((prevCustomExercises) => ({
        ...prevCustomExercises,
        [exerciseToSave.muscleGroup]: [
          ...(prevCustomExercises[exerciseToSave.muscleGroup] || []),
          {
            name: exerciseToSave.name,
            type: exerciseToSave.type,
            videoLink: exerciseToSave.videoLink,
          },
        ],
      }));

      if (customExerciseTarget) {
        setPlan((currentPlan) => currentPlan.map((day, dayIndex) =>
          dayIndex === customExerciseTarget.dayIndex
            ? {
                ...day,
                exercises: day.exercises.map((exercise, exerciseIndex) => {
                  if (exerciseIndex !== customExerciseTarget.exerciseIndex) {
                    return exercise;
                  }
                  const nextExercise = {
                    ...exercise,
                    muscleGroup: exerciseToSave.muscleGroup,
                    exercise: exerciseToSave.name,
                    type: exerciseToSave.type,
                    videoLink: exerciseToSave.videoLink,
                  };
                  return {
                    ...nextExercise,
                    ...normalizeProgressionSettings(nextExercise),
                  };
                }),
              }
            : day
        ));
      }

      return { ok: true };
    } catch (error) {
      console.error("Error trying to send exercise to backend", error);
      return {
        ok: false,
        error: "Unable to save this exercise. Please try again.",
      };
    }
  };

  const handleChange = (dayIndex, exerciseIndex, field, value) => {
    setPlan((currentPlan) =>
      currentPlan.map((day, currentDayIndex) => {
        if (currentDayIndex !== dayIndex) {
          return day;
        }

        return {
          ...day,
          exercises: day.exercises.map(
            (currentExercise, currentExerciseIndex) => {
              if (currentExerciseIndex !== exerciseIndex) {
                return currentExercise;
              }

              const nextValue =
                (field === "weightIncrement" || field === "minimumWeight")
                  ? Number(value)
                  : value;
              const nextMuscleGroup =
                field === "muscleGroup"
                  ? nextValue
                  : currentExercise.muscleGroup;
              const nextExerciseName =
                field === "exercise" ? nextValue : currentExercise.exercise;
              const selectedExercise = getSelectedExercise(
                nextMuscleGroup,
                nextExerciseName
              );
              const nextType = selectedExercise?.type || currentExercise.type;
              const currentIncrement =
                normalizeProgressionSettings(currentExercise).weightIncrement;
              const shouldUseTypeDefaultIncrement =
                field === "exercise" &&
                nextType !== currentExercise.type &&
                currentIncrement ===
                  getDefaultWeightIncrement(currentExercise.type);
              const nextExercise = {
                ...currentExercise,
                [field]: nextValue,
                muscleGroup: nextMuscleGroup,
                exercise: nextExerciseName,
                type: nextType,
                videoLink:
                  selectedExercise?.videoLink || currentExercise.videoLink,
                weightIncrement:
                  field === "weightIncrement"
                    ? nextValue
                    : shouldUseTypeDefaultIncrement
                    ? getDefaultWeightIncrement(nextType)
                    : currentIncrement,
              };

              return {
                ...nextExercise,
                ...normalizeProgressionSettings(nextExercise),
              };
            }
          ),
        };
      })
    );
  };

  const handleAddExercise = (dayIndex) => {
    setPlan((currentPlan) =>
      currentPlan.map((day, currentDayIndex) =>
        currentDayIndex === dayIndex
          ? {
              ...day,
              exercises: [...day.exercises, createEmptyExercise()],
            }
          : day
      )
    );
  };

  const handleRemoveExercise = (dayIndex, exerciseIndex) => {
    setPlan((currentPlan) =>
      currentPlan.map((day, currentDayIndex) =>
        currentDayIndex === dayIndex
          ? {
              ...day,
              exercises: day.exercises.filter(
                (_, currentExerciseIndex) =>
                  currentExerciseIndex !== exerciseIndex
              ),
            }
          : day
      )
    );
  };

  const handleAddDay = () => {
    setPlan((currentPlan) => [
      ...currentPlan,
      { label: "", exercises: [createEmptyExercise()] },
    ]);
  };

  const handleRemoveDay = (dayIndex) => {
    setPlan((currentPlan) =>
      currentPlan.filter((_, currentDayIndex) => currentDayIndex !== dayIndex)
    );
  };

  const handleLabelChange = (dayIndex, value) => {
    setPlan((currentPlan) =>
      currentPlan.map((day, currentDayIndex) =>
        currentDayIndex === dayIndex ? { ...day, label: value } : day
      )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!planIsComplete) {
      focusNextMissingChoice();
      return;
    }
    handleModalSave();
  };

  const handleModalSave = () => {
    const mesocycleData = buildMesocyclePayload({
      name: mesocycleName,
      weeks: numberOfWeeks,
      includeDeload,
      plan,
    });

    onSubmit(mesocycleData);
    setIsModalOpen(false);
  };

  const handleAutofillExercises = (event) => {
    event.preventDefault();

    setPlan((currentPlan) =>
      currentPlan.map((day) => ({
        ...day,
        exercises: day.exercises.map((exercise) => {
          const randomExercise =
            exercise.exercise || getRandomExercise(exercise.muscleGroup);
          const selectedExercise = getSelectedExercise(
            exercise.muscleGroup,
            randomExercise
          );
          const nextExercise = {
            ...exercise,
            exercise: randomExercise,
            type: selectedExercise?.type || exercise.type,
            videoLink: selectedExercise?.videoLink || exercise.videoLink,
          };

          return {
            ...nextExercise,
            ...normalizeProgressionSettings(nextExercise),
          };
        }),
      }))
    );
  };

  const getRandomExercise = (muscleGroup) => {
    const exerciseList = exercises[muscleGroup];
    return exerciseList && exerciseList.length > 0
      ? exerciseList[Math.floor(Math.random() * exerciseList.length)].name
      : "";
  };

  const missingExercises = plan.flatMap((day, dayIndex) =>
    day.exercises.flatMap((exercise, exerciseIndex) =>
      exercise.muscleGroup && exercise.exercise
        ? []
        : [{ dayIndex, exerciseIndex }]
    )
  );
  const missingLabelCount = plan.filter((day) => !day.label?.trim()).length;
  const planIsComplete =
    plan.length > 0 &&
    missingExercises.length === 0 &&
    missingLabelCount === 0;
  const focusNextMissingChoice = () => {
    const firstMissingExercise = missingExercises[0];
    let elementId = null;
    if (firstMissingExercise) {
      const exercise = plan[firstMissingExercise.dayIndex]
        .exercises[firstMissingExercise.exerciseIndex];
      const field = exercise.muscleGroup ? "exercise" : "muscle-group";
      elementId = `${field}-${firstMissingExercise.dayIndex}-${firstMissingExercise.exerciseIndex}`;
    } else if (missingLabelCount > 0) {
      elementId = `day-label-${plan.findIndex((day) => !day.label?.trim())}`;
    }
    const element = elementId ? document.getElementById(elementId) : null;
    element?.scrollIntoView({ block: "center" });
    element?.focus({ preventScroll: true });
  };

  if (isModalOpen) {
    return (
      <MesocycleDetailsModal
        isOpen={isModalOpen}
        onRequestClose={onCancel}
        onSave={handleSaveMesocycleDetails}
        mesocycleName={mesocycleName}
        setMesocycleName={setMesocycleName}
        numberOfWeeks={numberOfWeeks}
        setNumberOfWeeks={setNumberOfWeeks}
        includeDeload={includeDeload}
        setIncludeDeload={setIncludeDeload}
        variant="inline"
      />
    );
  }

  return (
    <div>
      {isOnboarding && (
        <PlanBuilderGuide
          missingExerciseCount={missingExercises.length}
          missingLabelCount={missingLabelCount}
          onFindNext={focusNextMissingChoice}
        />
      )}
      <form data-testid="mesocycle-form" onSubmit={handleSubmit}>
        <div className="flex min-w-0 flex-col items-center">
          <div className="flex w-full flex-wrap justify-center gap-3 px-4 py-6">
            <button
              data-testid="save-training-plan"
              type="submit"
              disabled={!planIsComplete}
              aria-describedby={!planIsComplete ? "save-plan-requirements" : undefined}
              className="min-h-11 w-full rounded-lg bg-red-600 px-5 py-2 text-lg font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400 disabled:opacity-70 sm:w-auto"
            >
              Save Plan
            </button>
            <button
              data-testid="autofill-exercises"
              type="button"
              className="min-h-11 w-full rounded-lg border border-red-500 bg-transparent px-5 py-2 text-lg font-semibold text-red-100 transition-colors hover:bg-red-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 active:scale-[0.96] sm:w-auto"
              onClick={handleAutofillExercises}
            >
              Auto Fill Exercises
            </button>
            {!planIsComplete && (
              <p
                id="save-plan-requirements"
                className="w-full text-center text-sm font-semibold text-amber-200"
              >
                Save Plan unlocks after every day has a label, muscle group, and exercise.
              </p>
            )}
          </div>
          <div className="w-full min-w-0 lg:overflow-x-auto lg:pb-4">
            <div
              data-testid="planner-days"
              className="flex w-full min-w-0 flex-col gap-3 lg:w-max lg:min-w-full lg:flex-row lg:items-start lg:justify-center lg:gap-4 lg:px-4"
            >
              {plan.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  data-testid={"planner-day-" + dayIndex}
                  className="w-full min-w-0 flex-none bg-darkestGray p-3 shadow-lg lg:w-80 lg:border lg:border-gray-700 xl:w-96"
                >
                  <label className="mb-3 flex min-w-0 items-center justify-between gap-3">
                    <select
                      data-testid={`day-label-${dayIndex}`}
                      id={`day-label-${dayIndex}`}
                      value={day.label}
                      onChange={(event) =>
                        handleLabelChange(dayIndex, event.target.value)
                      }
                      required
                      className="min-w-0 max-w-full flex-1 border border-gray-400 bg-darkestGray p-1 text-center"
                    >
                      <option value="">Add a Label</option>
                      {days.map((dayLabel) => (
                        <option key={dayLabel} value={dayLabel}>
                          {dayLabel}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(dayIndex)}
                      className="shrink-0 p-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </label>

                  {day.exercises.map((exercise, exerciseIndex) => {
                    const progressionSettings =
                      normalizeProgressionSettings(exercise);
                    const muscleGroupId = `muscle-group-${dayIndex}-${exerciseIndex}`;
                    const exerciseId = `exercise-${dayIndex}-${exerciseIndex}`;
                    const progressionModeId = `progression-mode-${dayIndex}-${exerciseIndex}`;
                    const weightIncrementId = `weight-increment-${dayIndex}-${exerciseIndex}`;
                    const minimumWeightId = `minimum-weight-${dayIndex}-${exerciseIndex}`;

                    return (
                      <div
                        key={exerciseIndex}
                        className={`mb-3 flex min-w-0 flex-col justify-between rounded-lg border bg-darkGray p-3 ${
                          isOnboarding && (!exercise.muscleGroup || !exercise.exercise)
                            ? "border-red-500/70"
                            : "border-gray-700"
                        }`}
                      >
                        <div className="mb-2 flex min-w-0 items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-1 flex-col">
                            <label htmlFor={muscleGroupId}>Muscle Group:</label>
                            <select
                              data-testid={`muscle-group-${dayIndex}-${exerciseIndex}`}
                              id={muscleGroupId}
                              value={exercise.muscleGroup}
                              aria-invalid={!exercise.muscleGroup}
                              onChange={(event) =>
                                handleChange(
                                  dayIndex,
                                  exerciseIndex,
                                  "muscleGroup",
                                  event.target.value
                                )
                              }
                              className="w-full min-w-0 max-w-full rounded border border-gray-400 bg-darkestGray p-1 text-center"
                              required
                            >
                              <option value="">Select a muscle group</option>
                              {allMuscleGroups.map((group) => (
                                <option key={group} value={group}>
                                  {group}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            aria-label={`Remove exercise ${exerciseIndex + 1} from day ${dayIndex + 1}`}
                            disabled={day.exercises.length === 1}
                            onClick={() =>
                              handleRemoveExercise(dayIndex, exerciseIndex)
                            }
                            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-white transition-colors hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:text-gray-600"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>

                        <div className="mb-2 flex min-w-0 flex-col">
                          <label className="w-full" htmlFor={exerciseId}>
                            Exercise:
                          </label>
                          <select
                            data-testid={`exercise-${dayIndex}-${exerciseIndex}`}
                            id={exerciseId}
                            value={exercise.exercise}
                            aria-invalid={!exercise.exercise}
                            aria-describedby={
                              isOnboarding && !exercise.exercise
                                ? `exercise-help-${dayIndex}-${exerciseIndex}`
                                : undefined
                            }
                            onChange={(event) =>
                              handleChange(
                                dayIndex,
                                exerciseIndex,
                                "exercise",
                                event.target.value
                              )
                            }
                            required
                            className="w-full min-w-0 max-w-full rounded border border-gray-400 bg-darkestGray p-1 text-center"
                          >
                            <option value="" disabled hidden>
                              Select an exercise
                            </option>

                            {sortExercisesByName(
                              exercises[exercise.muscleGroup]
                            ).map((exerciseOption) => (
                              <option
                                key={exerciseOption.name}
                                value={exerciseOption.name}
                              >
                                {exerciseOption.name}
                              </option>
                            ))}
                            <option
                              disabled
                              className="block w-full border-t border-black-300 my-2"
                            />
                            <option
                              disabled
                              className="block w-full border-t border-black-300 font-bold text-gray-700"
                            >
                              Custom Exercises
                            </option>

                            {sortExercisesByName(
                              customExercises[exercise.muscleGroup]
                            ).map((exerciseOption) => (
                              <option
                                key={exerciseOption.name}
                                value={exerciseOption.name}
                              >
                                {exerciseOption.name}
                              </option>
                            ))}
                          </select>
                          {isOnboarding && !exercise.exercise && (
                            <p
                              id={`exercise-help-${dayIndex}-${exerciseIndex}`}
                              className="mt-2 text-sm font-semibold text-red-200"
                            >
                              Choose an exercise for {exercise.muscleGroup || "this muscle group"}.
                            </p>
                          )}
                        </div>

                        <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                          <div className="flex min-w-0 flex-col">
                            <label htmlFor={progressionModeId}>
                              Progression mode:
                            </label>
                            <select
                              data-testid={`progression-mode-${dayIndex}-${exerciseIndex}`}
                              id={progressionModeId}
                              value={progressionSettings.progressionMode}
                              onChange={(event) =>
                                handleChange(
                                  dayIndex,
                                  exerciseIndex,
                                  "progressionMode",
                                  event.target.value
                                )
                              }
                              className="w-full min-w-0 rounded border border-gray-400 bg-darkestGray p-1 text-center"
                            >
                              {progressionModes.map((mode) => (
                                <option key={mode.value} value={mode.value}>
                                  {mode.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex min-w-0 flex-col">
                            <label htmlFor={weightIncrementId}>
                              Weight increment:
                            </label>
                            <select
                              data-testid={`weight-increment-${dayIndex}-${exerciseIndex}`}
                              id={weightIncrementId}
                              value={progressionSettings.weightIncrement}
                              onChange={(event) =>
                                handleChange(
                                  dayIndex,
                                  exerciseIndex,
                                  "weightIncrement",
                                  event.target.value
                                )
                              }
                              className="w-full min-w-0 rounded border border-gray-400 bg-darkestGray p-1 text-center"
                            >
                              {weightIncrementOptions.map((increment) => (
                                <option key={increment} value={increment}>
                                  {formatWeightSetting(increment)} kg
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex min-w-0 flex-col">
                            <label htmlFor={minimumWeightId}>
                              Lowest available weight:
                            </label>
                            <select
                              data-testid={`minimum-weight-${dayIndex}-${exerciseIndex}`}
                              id={minimumWeightId}
                              value={progressionSettings.minimumWeight}
                              onChange={(event) =>
                                handleChange(
                                  dayIndex,
                                  exerciseIndex,
                                  "minimumWeight",
                                  event.target.value
                                )
                              }
                              className="w-full min-w-0 rounded border border-gray-400 bg-darkestGray p-1 text-center"
                            >
                              {minimumWeightOptions.map((weight) => (
                                <option key={weight} value={weight}>
                                  {formatWeightSetting(weight)} kg
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenAddExerciseModal(dayIndex, exerciseIndex)}
                          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-gray-600 bg-inputBGGray px-4 py-2 text-sm font-semibold text-gray-100 transition-colors hover:border-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 active:scale-[0.96]"
                        >
                          + Add custom exercise
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleAddExercise(dayIndex)}
                    className="mb-3 flex w-full items-center justify-between border border-gray-700 bg-darkGray p-3"
                  >
                    + ADD MUSCLE GROUP
                  </button>
                </div>
              ))}
              <div className="w-full flex-none lg:w-52">
                <button
                  data-testid="add-planner-day"
                  type="button"
                  onClick={handleAddDay}
                  className="flex min-h-10 w-full items-center justify-between border border-gray-700 bg-darkestGray p-3"
                >
                  + Add a day
                </button>
              </div>
            </div>
          </div>
        </div>
        <AddExerciseModal
          isOpen={isExerciseModalOpen}
          onRequestClose={() => {
            setIsExerciseModalOpen(false);
            setCustomExerciseTarget(null);
          }}
          onSave={handleSaveCustomExercise}
        />
      </form>
    </div>
  );
};

export default MesocycleForm;
