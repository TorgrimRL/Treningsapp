import React from "react";
import { useState, useEffect } from "react";
import { exerciseTypes, muscleGroups } from "../constants/constants";
import Modal from "react-modal";

const AddExerciseModal = ({ isOpen, onRequestClose, onSave }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [videolink, setVideolink] = useState("");

  useEffect(() => {
    console.log("AddExerciseModal visibility", isOpen);
  }, [isOpen]);

  const handleSave = () => {
    const exercise = { name, type, muscleGroup, videolink };
    console.log("Saving exercise:", exercise);
    onSave(exercise);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentlabel="Custom exercises"
      className=" relative bg-darkGray text-white rounded focus:outline-none shadow-lg  p-0 max-w-3xl mx-auto mt-20 text-2sm "
      overlayClassName="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50"
    >
      <div>
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
              {muscleGroups.map((muscleGroup) => (
                <option key={muscleGroup} value={muscleGroup}>
                  {muscleGroup}
                </option>
              ))}
            </select>
          </label>
          <label className="mb-4 block">
            Video Link
            <input
              type="url"
              value={videolink}
              onChange={(e) => setVideolink(e.target.value)}
              required
              className="bg-inputBGGray text-center w-full p-1"
            ></input>
          </label>
          <button
            onClick={handleSave}
            className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-large"
          >
            Save exercise
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default AddExerciseModal;
