import React, { useState, useEffect } from "react";
import {
  muscleGroups as AllMuscleGroups,
  exercises,
  days,
} from "../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import MuscleGroupModal from "./MuscleGroupModal";
import { useNavigate } from "@remix-run/react";
import { useLocation } from "@remix-run/react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mesocycleName, setMesocycleName] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState("");
  const [selectedGroups, setSelectedGroups] = useState({});
  const location = useLocation();
  const { template, weeks, daysPerWeek, muscleGroups, dayLabels } =
    location.state || {};

  const navigate = useNavigate();

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
      updatedPlan[dayIndex].exercises[exerciseIndex].muscleGroup;

    const selectedExercise = exercises[muscleGroup]?.find(
      (ex) => ex.name === value
    );

    updatedPlan[dayIndex] = {
      ...updatedPlan[dayIndex],
      exercises: [...updatedPlan[dayIndex].exercises],
    };
    updatedPlan[dayIndex].exercises[exerciseIndex] = {
      ...updatedPlan[dayIndex].exercises[exerciseIndex],
      [field]: value,
      type:
        field === "exercise" && selectedExercise
          ? selectedExercise.type
          : updatedPlan[dayIndex].exercises[exerciseIndex].type,
      priority:
        field === "muscleGroup"
          ? selectedGroups[value]
          : updatedPlan[dayIndex].exercises[exerciseIndex].priority,
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
    console.log("Mesocycle Name: ", mesocycleName);
    console.log("Weeks:", numberOfWeeks);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = (selectedGroups) => {
    setSelectedGroups(selectedGroups);

    const firstWeekPlan = [...plan];
    const totalDays = numberOfWeeks * firstWeekPlan.length;
    const filledPlan = [];

    for (let i = 0; i < numberOfWeeks; i++) {
      filledPlan.push(
        ...firstWeekPlan.map((day) => ({
          ...day,
          exercises: day.exercises.map((exercise) => ({
            ...exercise,
            priority: selectedGroups[exercise.muscleGroup],
          })),
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
    onSubmit(mesocycleData);
    setIsModalOpen(false);
    navigate("../currentworkout");
  };
  const handleAutofillExercises = () => {
    const filledPlan = plan.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => {
        const randomExercise =
          exercise.exercise || getRandomExercise(exercise.muscleGroup);
        const exerciseType = exercises[exercise.muscleGroup]?.find(
          (ex) => ex.name === randomExercise
        )?.type;
        // exercise: exercise.exercise || getRandomExercise(exercise.muscleGroup),
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
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {" "}
        <div className="text-center border-black mb-10 p-4 border border-black border-thick">
          <label className="mb-4 block">
            Mesocycle Name:
            <input
              type="text"
              value={mesocycleName}
              onChange={(e) => setMesocycleName(e.target.value)}
              required
              className="bg-inputBGGray text-center border-black w-full p-1"
            />
            <label className=" mb-4 block">
              Number of weeks:
              <input
                type="number"
                value={numberOfWeeks}
                onChange={(e) => setNumberOfWeeks(e.target.value)}
                required
                className="bg-inputBGGray text-center border-black w-full p-1"
              />
            </label>
          </label>
          <button
            type="submit"
            style={{ marginTop: "20px" }}
            className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg rounded mr-4"
          >
            Save Plan
          </button>
          <button
            style={{ marginTop: "20px" }}
            className="bg-red-600 text-white border-none py-2 px-4
            cursor-pointer text-lg rounded"
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
              className="bg-darkestGray border-gray-700 shadow-lg p-1 mb-6  max-w-sm"
            >
              <label className="flex items-center justify-between mb-2">
                <select
                  value={day.label}
                  onChange={(e) => handleLabelChange(dayIndex, e.target.value)}
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
                <button type="button" onClick={() => handleRemoveDay(dayIndex)}>
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
                      >
                        <option value="">Select an exercise</option>
                        {exercises[exercise.muscleGroup]?.map((ex) => (
                          <option key={ex.name} value={ex.name}>
                            {ex.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {/* <span style={{ marginLeft: "10px" }}>
                    Priority: {exercise.priority || "None"}
                  </span> */}
                  </div>
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
      <MuscleGroupModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        muscleGroups={AllMuscleGroups}
        onSave={handleModalSave}
        href="../current-workout"
      />
    </form>
  );
};

export default MesocycleForm;
