import { useState } from "react";
import { exerciseTypes, muscleGroups } from "../constants/constants";
import AppModal from "./AppModal";

const AddExerciseModal = ({ isOpen, onRequestClose, onSave }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [videolink, setVideolink] = useState("");

  const handleSave = () => {
    const exercise = { name, type, muscleGroup, videolink };
    onSave(exercise);
    onRequestClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Custom exercises"
      title="Add a custom exercise"
    >
      <form>
        <div className="mb-4 block">
          <label htmlFor="custom-exercise-name">Exercise name</label>
          <input
            id="custom-exercise-name"
            type="text"
            value={name}
            placeholder="Enter name of exercise here"
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-inputBGGray text-center w-full p-1"
          />
        </div>
        <div className="mb-4 block">
          <label htmlFor="custom-exercise-type">Exercise type</label>
          <select
            id="custom-exercise-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className="bg-inputBGGray text-center w-full p-1"
          >
            <option value={""} disabled>
              Select type
            </option>
            {exerciseTypes.map((exerciseType) => (
              <option key={exerciseType} value={exerciseType}>
                {exerciseType}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4 block">
          <label htmlFor="custom-exercise-muscle-group">Muscle Group</label>
          <select
            id="custom-exercise-muscle-group"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            required
            className="bg-inputBGGray text-center w-full p-1"
          >
            <option value={""} disabled>
              Select muscle group
            </option>
            {muscleGroups.map((currentMuscleGroup) => (
              <option key={currentMuscleGroup} value={currentMuscleGroup}>
                {currentMuscleGroup}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4 block">
          <label htmlFor="custom-exercise-video">Video Link</label>
          <input
            id="custom-exercise-video"
            type="url"
            value={videolink}
            onChange={(e) => setVideolink(e.target.value)}
            required
            className="bg-inputBGGray text-center w-full p-1"
          />
        </div>
        <div className="p-4 flex justify-center">
          <button
            type="button"
            data-testid="custom-exercise-save"
            onClick={handleSave}
            className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-large flex justify center"
          >
            Save exercise
          </button>
        </div>
      </form>
    </AppModal>
  );
};

export default AddExerciseModal;
