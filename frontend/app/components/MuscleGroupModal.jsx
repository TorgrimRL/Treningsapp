import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const MuscleGroupModal = ({ isOpen, onRequestClose, muscleGroups, onSave }) => {
  const [selectedGroups, setSelectedGroups] = useState(
    muscleGroups.reduce((acc, group) => ({ ...acc, [group]: "secondary" }), {})
  );

  const handleChange = (group, value) => {
    setSelectedGroups((prevState) => ({
      ...prevState,
      [group]: value,
    }));
  };

  const handleSave = () => {
    if (wantToUsePreviousWeekAsBase && weekAsTarget !== null) {
      // Lag en kopi av treningsblokken der vi kun endrer den første uken
      const newExerciseBlock = {
        ...exerciseBlock,
        weeks: exerciseBlock.weeks.map((week, weekIndex) => {
          if (weekIndex === 0) {
            // Sett target-vekter og reps for første uke basert på valgt uke
            const targetWeek = exerciseBlock.weeks[weekAsTarget];
            return {
              ...week,
              exercises: week.exercises.map((exercise, exerciseIndex) => {
                const targetExercise = targetWeek.exercises[exerciseIndex];
                return {
                  ...exercise,
                  sets: exercise.sets.map((set, setIndex) => {
                    const targetSet = targetExercise.sets[setIndex];
                    return {
                      ...set,
                      targetWeight: targetSet.weight,
                      targetReps: targetSet.reps,
                      completed: false, // Nullstill fullføringsstatus for første uke
                      weight: 0, // Nullstille vekten for ny gjennomføring
                      reps: 0, // Nullstille repetisjoner for ny gjennomføring
                    };
                  }),
                };
              }),
            };
          } else {
            // Andre uker beholdes som de er, med blanke sets
            return {
              ...week,
              exercises: week.exercises.map((exercise) => ({
                ...exercise,
                sets: exercise.sets.map((set) => ({
                  ...set,
                  completed: false, // Nullstill fullføringsstatus
                  weight: 0, // Nullstille vekten
                  reps: 0, // Nullstille repetisjoner
                })),
              })),
            };
          }
        }),
      };

      console.log("New exercise block ready to save:", newExerciseBlock);
      // Her kan du lagre eller bruke newExerciseBlock som ønsket
    }
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Muscle Group Settings"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-0 right-2 m-0 p-0 text-3xl text-gray-600 hover:text-gray-800"
      >
        &times;
      </button>
      <h1>Muscle Group Progressions</h1>
      {muscleGroups.map((group) => (
        <div
          key={group}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span>{group}</span>
          <div>
            <button
              type="button"
              onClick={() => handleChange(group, "primary")}
              className={`mr-2 px-4 py-2 ${
                selectedGroups[group] === "primary"
                  ? "bg-black text-white"
                  : "bg-gray-300 text-white"
              }`}
            >
              Primary
            </button>
            <button
              type="button"
              onClick={() => handleChange(group, "secondary")}
              className={`px-4 py-2 ${
                selectedGroups[group] === "secondary"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-300 text-white"
              }`}
            >
              Secondary
            </button>
          </div>
        </div>
      ))}
      <h3>About progression rates</h3>
      <text>
        Priority muscle groups will be progressed based on your feedback to
        optimize muscle growth, potentially adding many sets if you're
        responding well. This will enhance growth opportunities but also require
        more time and effort in your training sessions.
      </text>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="mt-4 bg-black text-white px-4 py-2 mr-2"
        >
          Save
        </button>
        <button
          onClick={onRequestClose}
          className="mt-4 bg-gray-500 text-white px-4 py-2"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default MuscleGroupModal;
