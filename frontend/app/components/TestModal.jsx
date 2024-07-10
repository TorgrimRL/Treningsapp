import React, { useState } from "react";
import Modal from "react-modal";
import MuscleGroupModal from "./MuscleGroupModal";

Modal.setAppElement("#root");

const muscleGroups = [
  "Chest",
  "Back",
  "Triceps",
  "Biceps",
  "Shoulders",
  "Quads",
  "Glutes",
  "Hamstrings",
  "Calves",
];

const TestModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveModal = (selectedGroups) => {
    console.log("Selected Groups:", selectedGroups);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Test Modal</h1>
      <button onClick={handleOpenModal}>Open Modal</button>
      <MuscleGroupModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        muscleGroups={muscleGroups}
        onSave={handleSaveModal}
      />
    </div>
  );
};

export default TestModal;
