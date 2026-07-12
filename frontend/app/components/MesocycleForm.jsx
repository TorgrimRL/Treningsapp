import { useEffect, useState } from "react";
import {
  muscleGroups as allMuscleGroups,
  exercises,
  days,
  progressionModes,
  weightIncrementOptions,
  getDefaultWeightIncrement,
  normalizeProgressionSettings,
} from "../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "@remix-run/react";
import AddExerciseModal from "./AddExerciseModal";
import MesocycleDetailsModal from "./MesocycleDetailsModal";
import { useApiFetch } from "../utils/apiFetch";

const emptySet = () => ({
  completed: false,
  targetWeight: 0,
  targetReps: 0,
});

const createEmptyExercise = (overrides = {}) => {
  const exercise = {
    muscleGroup: "",
    exercise: "",
    type: "",
    videoLink: "",
    sets: [emptySet(), emptySet()],
    ...overrides,
  };

  return {
    ...exercise,
    ...normalizeProgressionSettings(exercise),
  };
};

const sortExercisesByName = (exerciseList = []) =>
  [...exerciseList].sort((a, b) => a.name.localeCompare(b.name));

const MesocycleForm = ({ onSubmit }) => {
  const [plan, setPlan] = useState([
    {
      label: "",
      exercises: [createEmptyExercise()],
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [mesocycleName, setMesocycleName] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState("");
  const location = useLocation();
  const { template, weeks, daysPerWeek, muscleGroups, dayLabels } =
    location.state || {};
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
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

  const handleSaveMesocycleDetails = (name, weeksValue) => {
    setMesocycleName(name);
    setNumberOfWeeks(weeksValue);
    setIsModalOpen(false);
  };

  const handleOpenAddExerciseModal = () => {
    setIsExerciseModalOpen(true);
  };

  const handleSaveCustomExercise = async (newExercise) => {
    if (!newExercise) {
      return;
    }

    const exerciseToSave = {
      name: newExercise.name,
      muscleGroup: newExercise.muscleGroup,
      type: newExercise.type,
      videoLink: newExercise.videoLink || newExercise.videolink || "",
      videolink: newExercise.videoLink || newExercise.videolink || "",
    };

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

    try {
      const { ok, data } = await apiFetch(`${baseUrl}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(exerciseToSave),
      });

      if (!ok) {
        console.error(
          `Failed to update custom exercises: ${
            data.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error trying to send exercise to backend", error);
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
                field === "weightIncrement" ? Number(value) : value;
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
    handleModalSave();
  };

  const handleModalSave = () => {
    const weekCount = Number(numberOfWeeks);
    const firstWeekPlan = plan.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        ...normalizeProgressionSettings(exercise),
      })),
    }));
    const filledPlan = [];

    for (let i = 0; i < weekCount; i += 1) {
      filledPlan.push(
        ...firstWeekPlan.map((day) => ({
          ...day,
          exercises: day.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => ({ ...set })),
          })),
        }))
      );
    }

    const mesocycleData = {
      name: mesocycleName,
      weeks: weekCount,
      daysPerWeek: firstWeekPlan.length,
      plan: filledPlan,
      completedDate: null,
      isCurrent: true,
    };

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

  return (
    <div>
      <MesocycleDetailsModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSave={handleSaveMesocycleDetails}
        mesocycleName={mesocycleName}
        setMesocycleName={setMesocycleName}
        numberOfWeeks={numberOfWeeks}
        setNumberOfWeeks={setNumberOfWeeks}
      />
      <form data-testid="mesocycle-form" onSubmit={handleSubmit}>
        <div className="flex min-w-0 flex-col items-center">
          <div className="flex w-full flex-wrap justify-center gap-3 px-4 py-6">
            <button
              data-testid="save-training-plan"
              type="submit"
              className="w-full cursor-pointer bg-red-600 px-4 py-2 text-lg text-white sm:w-auto md:rounded"
            >
              Save Plan
            </button>
            <button
              data-testid="autofill-exercises"
              type="button"
              className="w-full cursor-pointer bg-red-600 px-4 py-2 text-lg text-white sm:w-auto md:rounded"
              onClick={handleAutofillExercises}
            >
              Auto Fill Exercises
            </button>
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
                  className="w-full min-w-0 flex-none bg-darkestGray p-3 shadow-lg lg:w-80 lg:border lg:border-gray-700 lg:rounded-lg xl:w-96"
                >
                  <label className="mb-3 flex min-w-0 items-center justify-between gap-3">
                    <select
                      data-testid={`day-label-${dayIndex}`}
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

                    return (
                      <div
                        key={exerciseIndex}
                        className="mb-3 flex min-w-0 flex-col justify-between border border-gray-700 bg-darkGray p-3"
                      >
                        <div className="mb-2 flex min-w-0 items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-1 flex-col">
                            <label htmlFor={muscleGroupId}>Muscle Group:</label>
                            <select
                              data-testid={`muscle-group-${dayIndex}-${exerciseIndex}`}
                              id={muscleGroupId}
                              value={exercise.muscleGroup}
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
                            onClick={() =>
                              handleRemoveExercise(dayIndex, exerciseIndex)
                            }
                            className="shrink-0 p-2 text-white hover:text-red-800"
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
                        </div>

                        <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
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
                                  {increment} kg
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleOpenAddExerciseModal}
                          className="text-sm"
                        >
                          Add custom exercise
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
                  className="flex min-h-10 w-full items-center justify-between border border-gray-700 bg-darkestGray p-3 lg:rounded-lg"
                >
                  + Add a day
                </button>
              </div>
            </div>
          </div>
        </div>
        <AddExerciseModal
          isOpen={isExerciseModalOpen}
          onRequestClose={() => setIsExerciseModalOpen(false)}
          onSave={handleSaveCustomExercise}
        />
      </form>
    </div>
  );
};

export default MesocycleForm;
