import { useState, useEffect } from "react";
import {
  exercises as predefinedExercises,
  muscleGroups as predefinedMuscleGroups,
} from "../constants/constants";
import { useApiFetch } from "../utils/apiFetch";
import AddExerciseModal from "./AddExerciseModal";
import AppModal from "./AppModal";

const ChooseExerciseModal = ({ isOpen, onRequestClose, onSave }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [availableExercises, setAvailableExercises] = useState({});
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [applyToFutureWeeks, setApplyToFutureWeeks] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const { apiFetch } = useApiFetch();
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { ok, data } = await apiFetch(baseUrl + "/exercises", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (ok) {
          const customExercises = data;
          const combinedExercises = { ...predefinedExercises };

          customExercises.forEach((exercise) => {
            if (!combinedExercises[exercise.muscleGroup]) {
              combinedExercises[exercise.muscleGroup] = [];
            }
            combinedExercises[exercise.muscleGroup].push({
              name: exercise.name,
              type: exercise.type,
              videoLink: exercise.videoLink || exercise.videolink || "",
            });
          });

          setAvailableExercises(combinedExercises);
        } else {
          console.error(
            "Failed to fetch exercises: " + (data.message || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen, apiFetch, baseUrl]);

  const handleSave = () => {
    const selectedExercise = availableExercises[selectedMuscleGroup]?.find(
      (exercise) => exercise.name === selectedExerciseId
    );

    if (selectedExercise) {
      onSave(
        {
          exercise: selectedExercise.name,
          name: selectedExercise.name,
          muscleGroup: selectedMuscleGroup,
          priority: selectedMuscleGroup,
          type: selectedExercise.type,
          videoLink:
            selectedExercise.videoLink || selectedExercise.videolink || "",
        },
        applyToFutureWeeks
      );
      onRequestClose();
    }
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
      const { ok, data } = await apiFetch(baseUrl + "/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(exerciseToSave),
      });

      if (!ok) {
        const error = data?.message || data?.error || "Unknown error";
        console.error("Failed to update custom exercises: " + error);
        return { ok: false, error };
      }

      setAvailableExercises((currentExercises) => ({
        ...currentExercises,
        [exerciseToSave.muscleGroup]: [
          ...(currentExercises[exerciseToSave.muscleGroup] || []),
          {
            name: exerciseToSave.name,
            type: exerciseToSave.type,
            videoLink: exerciseToSave.videoLink,
          },
        ],
      }));
      setSelectedMuscleGroup(exerciseToSave.muscleGroup);
      setSelectedExerciseId(exerciseToSave.name);
      return { ok: true };
    } catch (error) {
      console.error("Error trying to send exercise to backend", error);
      return {
        ok: false,
        error: "Unable to save this exercise. Please try again.",
      };
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Choose Exercise"
      title="Choose an exercise"
    >
      <label className="mb-4 block" htmlFor="choose-exercise-muscle-group">
        <span className="block mb-2">Select a Muscle Group:</span>
        <select
          id="choose-exercise-muscle-group"
          data-testid="choose-exercise-muscle-group"
          value={selectedMuscleGroup}
          onChange={(e) => {
            setSelectedMuscleGroup(e.target.value);
            setSelectedExerciseId(null);
          }}
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
        <label className="block mb-2" htmlFor="choose-exercise-name">
          Select an Exercise:
        </label>
        <select
          id="choose-exercise-name"
          data-testid="choose-exercise-name"
          value={selectedExerciseId || ""}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="bg-inputBGGray text-center w-full p-1"
          disabled={!selectedMuscleGroup}
        >
          <option value="" disabled>
            -- Select an Exercise --
          </option>
          {selectedMuscleGroup &&
            availableExercises[selectedMuscleGroup]?.map((exercise, index) => (
              <option key={exercise.name + "-" + index} value={exercise.name}>
                {exercise.name}
              </option>
            ))}
        </select>
      </div>
      <button
        type="button"
        data-testid="choose-exercise-add-custom"
        onClick={() => setIsAddExerciseModalOpen(true)}
        className="mb-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-gray-600 bg-inputBGGray px-4 py-2 text-sm font-semibold text-gray-100 transition-colors hover:border-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 active:scale-[0.96]"
      >
        + Add custom exercise
      </button>
      <div>
        <input
          id="choose-exercise-apply-future"
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
        <label htmlFor="choose-exercise-apply-future">
          Apply to future weeks
        </label>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          data-testid="choose-exercise-save"
          onClick={handleSave}
          disabled={!selectedExerciseId}
          className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-large flex justify center"
        >
          Save
        </button>
      </div>
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        onRequestClose={() => setIsAddExerciseModalOpen(false)}
        onSave={handleSaveCustomExercise}
      />
    </AppModal>
  );
};

export default ChooseExerciseModal;
