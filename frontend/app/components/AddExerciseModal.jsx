import React from "react";
import { useState } from "react";
import { exerciseTypes, muscleGroups } from "../constants/constants";

const AddExerciseModal = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState(null);
  const [muscleGroup, setMuscleGroup] = useState(null);
  const [videolink, setVideolink] = useState("");

  return (
    <div className="bg-darkGrey text-white">
      <form>
        <label className="mb-4 block">
          <input
            type="text"
            value={name}
            placeholder="Enter name of exercise here"
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-inputBGGray text-center w-full p-1"
          />
        </label>
        <label>
          Exercise type:
          <select
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
        </label>
        <label>
          Muscle Group
          <select
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            required
            className="bg-inputBGGray text-center w-full p-1"
          >
            <option value={""} disabled>
              Select muscle group
            </option>
            {muscleGroups.map((muscleGroup) => {
              <option key={muscleGroup} value={muscleGroup}>
                {muscleGroup}
              </option>;
            })}
          </select>
        </label>
        <label className="mb-4 block">
          <input
            type="url"
            value={videolink}
            onChange={(e) => setVideolink(e.target.value)}
            required
            className="bg-inputBGGray text-center w-full p-1"
          ></input>
        </label>
      </form>
    </div>
  );
};

export default AddExerciseModal();
