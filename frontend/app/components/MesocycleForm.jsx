import React, { useState } from "react";
import { muscleGroups, exercises, days } from "../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import MuscleGroupModal from "./MuscleGroupModal";
import { useNavigate } from "@remix-run/react";

Modal.setAppElement("#root");

const MesocycleForm = ({ onSubmit }) => {
  const [plan, setPlan] = useState(
    Array(1)
      .fill()
      .map(() => ({ label: "", exercises: [] }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mesocycleName, setMesocycleName] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState("");

  const navigate = useNavigate();

  const handleChange = (dayIndex, exerciseIndex, field, value) => {
    const updatedPlan = [...plan];
    updatedPlan[dayIndex] = {
      ...updatedPlan[dayIndex],
      exercises: [...updatedPlan[dayIndex].exercises],
    };
    updatedPlan[dayIndex].exercises[exerciseIndex] = {
      ...updatedPlan[dayIndex].exercises[exerciseIndex],
      [field]: value,
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
      weight: 0,
      sets: 0,
      reps: 0,
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
    navigate("currentworkout");
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
        <label>
          Mesocycle Name:
          <input
            type="text"
            value={mesocycleName}
            onChange={(e) => setMesocycleName(e.target.value)}
            required
          />
          <label>
            Number of weeks:
            <input
              type="number"
              value={numberOfWeeks}
              onChange={(e) => setNumberOfWeeks(e.target.value)}
              required
            />
          </label>
        </label>
        <button type="submit" style={{ marginTop: "20px" }}>
          Save Plan
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            overflow: "auto",
          }}
        >
          {plan.map((day, dayIndex) => (
            <div key={dayIndex} style={{ margin: "0 10px", flex: 1 }}>
              <label>
                Label:
                <select
                  value={day.label}
                  onChange={(e) => handleLabelChange(dayIndex, e.target.value)}
                  required
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
                <div key={exerciseIndex} style={{ marginBottom: "10px" }}>
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
                      required
                    >
                      <option value="">Select a muscle group</option>
                      {muscleGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
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
                    >
                      <option value="">Select an exercise</option>
                      {exercises[exercise.muscleGroup]?.map((ex) => (
                        <option key={ex} value={ex}>
                          {ex}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span style={{ marginLeft: "10px" }}>
                    Priority: {exercise.priority || "None"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveExercise(dayIndex, exerciseIndex)
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => handleAddExercise(dayIndex)}>
                Add Muscle Group
              </button>
            </div>
          ))}
          <div style={{ alignSelf: "flex-start", marginLeft: "20px" }}>
            <button
              type="button"
              onClick={handleAddDay}
              style={{ height: "fit-content", marginTop: "15px" }}
            >
              + Add a day
            </button>
          </div>
        </div>
      </div>
      <MuscleGroupModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        muscleGroups={muscleGroups}
        onSave={handleModalSave}
        href="current-workout"
      />
    </form>
  );
};

export default MesocycleForm;
