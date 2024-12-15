import React from "react";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import {
  exercises as predefinedExercises,
  muscleGroups as predefinedMuscleGroups,
} from "../constants/constants";

const ChooseExerciseModal = ({ isOpen, onRequestClose, onSave }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [availableExercises, setAvailableExercises] = useState({});
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [applyToFutureWeeks, setApplyToFutureWeeks] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch(`${baseUrl}/exercises`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (response.ok) {
          const customExercises = await response.json();
          const combinedExercises = { ...predefinedExercises };

          customExercises.forEach((exercise) => {
            if (!combinedExercises[exercise.muscleGroup]) {
              combinedExercises[exercise.muscleGroup] = [];
            }
            combinedExercises[exercise.muscleGroup].push({
              name: exercise.name,
              type: exercise.type,
              videoLink: exercise.videoLink,
            });
          });

          setAvailableExercises(combinedExercises);
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to fetch exercises: ${errorText}`);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (selectedExerciseId) {
      onSave(selectedExerciseId, applyToFutureWeeks);
      onRequestClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Choose Exercise"
      className="relative mx-4 md:mx-auto bg-darkGray text-white rounded focus:outline-none shadow-lg p-0 max-w-3xl mx-auto mt-20 text-2sm"
      overlayClassName="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-0 right-2 text-3xl hover:text-gray-800"
      >
        &times;
      </button>
      <div className="flex flex-col p-4">
        <header className="bold text-2xl mb-4 mt-2">Choose an exercise</header>

        <label className="mb-4">
          <span className="block mb-2">Select a Muscle Group:</span>
          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="bg-inputBGGray text-center w-full p-1"
          >
            <option value="">-- Select Muscle Group --</option>
            {predefinedMuscleGroups.map((muscleGroup) => (
              <option key={muscleGroup} value={muscleGroup}>
                {muscleGroup}
              </option>
            ))}
          </select>
        </label>

        <div className="mb-4">
          <label className="block mb-2">Select an Exercise:</label>
          <select
            value={selectedExerciseId || ""}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-inputBGGray text-center w-full p-1"
            disabled={!selectedMuscleGroup}
          >
            <option value="" disabled>
              -- Select an Exercise --
            </option>
            {selectedMuscleGroup &&
              availableExercises[selectedMuscleGroup]?.map((exercise) => (
                <option key={exercise.name} value={exercise.name}>
                  {exercise.name}
                </option>
              ))}
          </select>
        </div>
        <input
          type="checkbox"
          checked={applyToFutureWeeks}
          onChange={(e) => setApplyToFutureWeeks(e.target.checked)}
          className="scale-125"
          style={{
            width: "20px",
            height: "20px",
            marginTop: "10px",
            marginLeft: "10px",
            marginRight: "10px",
          }}
        />
        <label>Apply to future weeks </label>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleSave}
            disabled={!selectedExerciseId}
            className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-large flex justify center"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChooseExerciseModal;
