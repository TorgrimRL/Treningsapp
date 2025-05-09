import React, { useState, useEffect } from "react";
import {
  muscleGroups as AllMuscleGroups,
  exercises,
  days,
} from "../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import { useLocation } from "@remix-run/react";
import AddExerciseModal from "./AddExerciseModal";
import MesocycleDetailsModal from "./MesocycleDetailsModal";
import { useApiFetch } from "../utils/apiFetch";

Modal.setAppElement("#root");

const MesocycleForm = ({ onSubmit }) => {
  const [plan, setPlan] = useState(
    Array(1)
      .fill()
      .map(() => ({
        label: "",
        exercises: [
          {
            muscleGroup: "",
            exercise: "",
            sets: [{}, {}],
          },
        ],
      }))
  );
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [mesocycleName, setMesocycleName] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState("");
  const [selectedGroups, setSelectedGroups] = useState({});
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
        const { ok, data, hadSleep } = await apiFetch(`${baseUrl}/exercises`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (ok) {
          const groupedExercises = data.reduce((acc, exercise) => {
            if (!acc[exercise.muscleGroup]) {
              acc[exercise.muscleGroup] = [];
            }
            acc[exercise.muscleGroup].push({
              name: exercise.name,
              type: exercise.type,
              videoLink: exercise.videoLink,
            });
            return acc;
          }, {});
          setCustomExercises(groupedExercises);
        } else {
          throw new Error(
            `Failed to fetch exercises: ${data.message || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error fetching exercises", error);
      }
    };
    fetchCustomExercises();
  }, []);
  const handleSaveMesocycleDetails = (name, weeks) => {
    console.log(name);
    console.log(weeks);

    setMesocycleName(name);
    setNumberOfWeeks(weeks);
    setIsModalOpen(false);
  };

  const handleOpenAddExerciseModal = () => {
    setIsExerciseModalOpen(true);
  };
  const handleSaveCustomExercise = async (newExercise) => {
    if (newExercise) {
      const { name, muscleGroup, type, videoLink } = newExercise;
      console.log("New exercise to add:", newExercise);
      setCustomExercises((prevCustomExercises) => {
        console.log("Previous custom exercises:", prevCustomExercises);
        const updatedCustomExercises = { ...prevCustomExercises };
        if (updatedCustomExercises[muscleGroup]) {
          updatedCustomExercises[muscleGroup] = [
            ...updatedCustomExercises[muscleGroup],
            { name, type, videoLink },
          ];
        } else {
          updatedCustomExercises[muscleGroup] = [name];
        }
        console.log("Updated custom exercises:", updatedCustomExercises);
        return updatedCustomExercises;
      });

      try {
        const { ok, data, hadSleep } = await apiFetch(`${baseUrl}/exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(newExercise),
        });
        if (!ok) {
          const errorText = data.message || "Unknown error";
          throw new Error(`Failed to update customexercises: ${errorText}`);
        }
      } catch (error) {
        console.error("Error trying to send exercise to backend", error);
      }
    }
  };

  useEffect(() => {
    if (template) {
      setNumberOfWeeks(weeks || numberOfWeeks);
      const initialPlan = Array.from(
        { length: daysPerWeek },
        (_, dayIndex) => ({
          label: dayLabels[dayIndex],
          exercises:
            muscleGroups[dayIndex]?.map((group) => ({
              muscleGroup: group,
              exercise: "",
              sets: [{}, {}],
            })) || [],
        })
      );
      setPlan(initialPlan);
    }
  }, [template, daysPerWeek, muscleGroups]);

  const handleChange = (dayIndex, exerciseIndex, field, value) => {
    const updatedPlan = [...plan];
    const muscleGroup =
      field === "muscleGroup"
        ? value
        : updatedPlan[dayIndex].exercises[exerciseIndex].muscleGroup;
    const selectedExercise =
      exercises[muscleGroup]?.find(
        (ex) =>
          ex.name ===
          (field === "exercise"
            ? value
            : updatedPlan[dayIndex].exercises[exerciseIndex].exercise)
      ) ||
      customExercises[muscleGroup]?.find(
        (ex) =>
          ex.name ===
          (field === "exercise"
            ? value
            : updatedPlan[dayIndex].exercises[exerciseIndex].exercise)
      );

    updatedPlan[dayIndex] = {
      ...updatedPlan[dayIndex],
      exercises: [...updatedPlan[dayIndex].exercises],
    };

    updatedPlan[dayIndex].exercises[exerciseIndex] = {
      ...updatedPlan[dayIndex].exercises[exerciseIndex],
      [field]: value,
      type:
        selectedExercise?.type ||
        updatedPlan[dayIndex].exercises[exerciseIndex].type,
      videoLink:
        selectedExercise?.videoLink ||
        updatedPlan[dayIndex].exercises[exerciseIndex].videoLink,

      priority:
        selectedGroups[muscleGroup] ||
        updatedPlan[dayIndex].exercises[exerciseIndex].priority,
    };
    setPlan(updatedPlan);
  };

  const handleAddExercise = (dayIndex) => {
    const updatedPlan = [...plan];
    updatedPlan[dayIndex].exercises.push({
      muscleGroup: "",
      exercise: "",
      sets: [
        {
          completed: false,
          targetWeight: 0,
          targetReps: 0,
        },
        {
          completed: false,
          targetWeight: 0,
          targetReps: 0,
        },
      ],
    });
    setPlan(updatedPlan);
  };

  const handleRemoveExercise = (dayIndex, exerciseIndex) => {
    const updatedPlan = [...plan];
    updatedPlan[dayIndex].exercises.splice(exerciseIndex, 1);
    setPlan(updatedPlan);
  };

  const handleAddDay = () => {
    setPlan([...plan, { label: "", exercises: [] }]);
  };

  const handleRemoveDay = (dayIndex) => {
    const updatedPlan = [...plan];
    updatedPlan.splice(dayIndex, 1);
    setPlan(updatedPlan);
  };

  const handleLabelChange = (dayIndex, value) => {
    const updatedPlan = [...plan];
    updatedPlan[dayIndex].label = value;
    setPlan(updatedPlan);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Training Block Name: ", mesocycleName);
    console.log("Weeks:", numberOfWeeks);
    handleModalSave();
    // setIsModalOpen(true);
  };
  const handleModalSave = () => {
    // const handleModalSave = (selectedGroups) => {
    // setSelectedGroups(selectedGroups);

    const firstWeekPlan = [...plan];
    const filledPlan = [];

    for (let i = 0; i < numberOfWeeks; i++) {
      filledPlan.push(
        ...firstWeekPlan.map((day) => ({
          ...day,
          exercises: day.exercises.map((exercise) => {
            console.log("Exercise before mapping:", exercise); // Check if 'type' and 'videoLink' exist

            return {
              ...exercise,
              priority: selectedGroups[exercise.muscleGroup],
              type: exercise.type,
              videoLink: exercise.videoLink,
            };
          }),
        }))
      );
    }

    const mesocycleData = {
      name: mesocycleName,
      weeks: numberOfWeeks,
      daysPerWeek: firstWeekPlan.length,
      plan: filledPlan,
      completedDate: null,
      isCurrent: true,
    };
    console.log("Mesocycle Data from mesocycleform:", mesocycleData); // Log the full mesocycle object
    onSubmit(mesocycleData);
    onSubmit(mesocycleData);
    setIsModalOpen(false);
  };
  const handleAutofillExercises = (event) => {
    event.preventDefault(); // Forhindre at skjemaet blir sendt

    const filledPlan = plan.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => {
        const randomExercise =
          exercise.exercise || getRandomExercise(exercise.muscleGroup);
        const exerciseType = exercises[exercise.muscleGroup]?.find(
          (ex) => ex.name === randomExercise
        )?.type;
        return {
          ...exercise,
          exercise: randomExercise,
          type: exerciseType,
        };
      }),
    }));
    setPlan(filledPlan);
  };

  const getRandomExercise = (muscleGroup) => {
    const exerciseList = exercises[muscleGroup];
    return exerciseList && exerciseList.length > 0
      ? exerciseList[Math.floor(Math.random() * exerciseList.length)].name
      : "";
  };

  return (
    <div>
      {/* Render MesocycleDetailsModal */}
      <MesocycleDetailsModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSave={handleSaveMesocycleDetails}
        mesocycleName={mesocycleName}
        setMesocycleName={setMesocycleName}
        numberOfWeeks={numberOfWeeks}
        setNumberOfWeeks={setNumberOfWeeks}
      />
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {" "}
          <div className="text-center  mb-10 p-4 ">
            <button
              type="submit"
              style={{ marginTop: "20px" }}
              className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg  mr-4"
            >
              Save Plan
            </button>
            <button
              type="button"
              style={{ marginTop: "20px" }}
              className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
              onClick={(event) => handleAutofillExercises(event)}
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
                className="bg-darkestGray border-gray-700 shadow-lg p-1 mb-6  max-w-sm"
              >
                <label className="flex items-center justify-between mb-2">
                  <select
                    value={day.label}
                    onChange={(e) =>
                      handleLabelChange(dayIndex, e.target.value)
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
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={exerciseIndex}
                    className="flex justify-between flex-col bg-darkGray border  border-gray-700 max-w p-3 mb-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex flex-col">
                        <label>
                          Muscle Group:
                          <select
                            value={exercise.muscleGroup}
                            onChange={(e) =>
                              handleChange(
                                dayIndex,
                                exerciseIndex,
                                "muscleGroup",
                                e.target.value
                              )
                            }
                            className="bg-darkestGray text-center border border-gray-400 w-50 rounded p-1 flex flex-col"
                            required
                          >
                            <option value="">Select a muscle group</option>
                            {AllMuscleGroups.map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </select>
                        </label>
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
                    <div className="flex  mb-2">
                      <label className="flex flex-col w-full">
                        Exercise:
                        <select
                          value={exercise.exercise}
                          onChange={(e) =>
                            handleChange(
                              dayIndex,
                              exerciseIndex,
                              "exercise",
                              e.target.value
                            )
                          }
                          required
                          className="bg-darkestGray text-center border border-gray-400 w-full rounded p-1 flex flex-grow"
                          placeholder="Select an "
                        >
                          <option value="" disabled selected hidden>
                            Select an exercise
                          </option>

                          {exercises[exercise.muscleGroup]
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((ex) => (
                              <option key={ex.name} value={ex.name}>
                                {ex.name}
                              </option>
                            ))}
                          <option
                            disabled
                            className="block w-full border-t border-black-300 my-2"
                          ></option>
                          <option
                            disabled
                            className="block w-full border-t border-black-300 font-bold text-gray-700"
                          >
                            Custom Exercises
                          </option>

                          {customExercises[exercise.muscleGroup]
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((ex) => {
                              console.log(
                                `Custom Exercise: ${ex.name}, Type: ${ex.type}`
                              );
                              return (
                                <option key={ex.name} value={ex.name}>
                                  {ex.name}
                                </option>
                              );
                            })}
                        </select>
                      </label>
                      {/* <span style={{ marginLeft: "10px" }}>
                    Priority: {exercise.priority || "None"}
                    </span> */}
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddExerciseModal}
                      className="text-sm"
                    >
                      Add custom exercise
                    </button>
                  </div>
                ))}
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
                style={{ height: "", marginTop: "" }}
              >
                + Add a day
              </button>
            </div>
          </div>
        </div>
        {/* <MuscleGroupModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        muscleGroups={AllMuscleGroups}
        onSave={handleModalSave}
        href="../current-workout"
      /> */}
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
