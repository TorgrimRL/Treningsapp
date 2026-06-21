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
import Modal from "react-modal";
import { useLocation } from "@remix-run/react";
import AddExerciseModal from "./AddExerciseModal";
import MesocycleDetailsModal from "./MesocycleDetailsModal";
import { useApiFetch } from "../utils/apiFetch";

Modal.setAppElement("#root");

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
          exercises: day.exercises.map((currentExercise, currentExerciseIndex) => {
            if (currentExerciseIndex !== exerciseIndex) {
              return currentExercise;
            }

            const nextValue = field === "weightIncrement" ? Number(value) : value;
            const nextMuscleGroup =
              field === "muscleGroup" ? nextValue : currentExercise.muscleGroup;
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
              currentIncrement === getDefaultWeightIncrement(currentExercise.type);
            const nextExercise = {
              ...currentExercise,
              [field]: nextValue,
              muscleGroup: nextMuscleGroup,
              exercise: nextExerciseName,
              type: nextType,
              videoLink: selectedExercise?.videoLink || currentExercise.videoLink,
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
          }),
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="text-center mb-10 p-4">
            <button
              data-testid="save-training-plan"
              type="submit"
              style={{ marginTop: "20px" }}
              className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg mr-4"
            >
              Save Plan
            </button>
            <button
              data-testid="autofill-exercises"
              type="button"
              style={{ marginTop: "20px" }}
              className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
              onClick={handleAutofillExercises}
            >
              Auto Fill Exercises
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              width: "100%",
              overflow: "auto",
            }}
          >
            {plan.map((day, dayIndex) => (
              <div
                key={dayIndex}
                style={{ margin: "0 5px", flex: 1 }}
                className="bg-darkestGray border-gray-700 shadow-lg p-1 mb-6 max-w-sm"
              >
                <label className="flex items-center justify-between mb-2">
                  <select
                    data-testid={`day-label-${dayIndex}`}
                    value={day.label}
                    onChange={(event) =>
                      handleLabelChange(dayIndex, event.target.value)
                    }
                    required
                    className="bg-darkestGray text-center border border-gray-400 w-40 p-1 flex flex-col"
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
                      className="flex justify-between flex-col bg-darkGray border border-gray-700 max-w p-3 mb-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex flex-col">
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
                            className="bg-darkestGray text-center border border-gray-400 w-50 rounded p-1 flex flex-col"
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
                          className="text-white hover:text-red-800 ml-2"
                          style={{ position: "relative", top: "-1.1rem" }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>

                      <div className="flex mb-2">
                        <label className="flex flex-col w-full" htmlFor={exerciseId}>
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
                          className="bg-darkestGray text-center border border-gray-400 w-full rounded p-1 flex flex-grow"
                        >
                          <option value="" disabled hidden>
                            Select an exercise
                          </option>

                          {sortExercisesByName(exercises[exercise.muscleGroup]).map(
                            (exerciseOption) => (
                              <option
                                key={exerciseOption.name}
                                value={exerciseOption.name}
                              >
                                {exerciseOption.name}
                              </option>
                            )
                          )}
                          <option disabled className="block w-full border-t border-black-300 my-2" />
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

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-2">
                        <div className="flex flex-col">
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
                            className="bg-darkestGray text-center border border-gray-400 rounded p-1"
                          >
                            {progressionModes.map((mode) => (
                              <option key={mode.value} value={mode.value}>
                                {mode.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col">
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
                            className="bg-darkestGray text-center border border-gray-400 rounded p-1"
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
                  className="flex w-full justify-between items-center bg-darkGray border border-gray-700 w-55 p-3 mb-3"
                >
                  + ADD MUSCLE GROUP
                </button>
              </div>
            ))}
            <div style={{ flex: "0 0 200px", alignSelf: "flex-start" }}>
              <button
                type="button"
                onClick={handleAddDay}
                className="flex w-full justify-between items-center h-10 bg-darkestGray border border-gray-700 w-55 p-3 mb-3"
              >
                + Add a day
              </button>
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
