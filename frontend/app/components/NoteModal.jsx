// NoteModal Component
import React, { useEffect } from "react";
import Modal from "react-modal";
Modal.setAppElement("#root");
const NoteModal = ({ isOpen, onRequestClose, note, onNoteChange, onSave }) => {
  useEffect(() => {
    console.log("NoteModal visibility:", isOpen);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Note Modal"
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <h2>Add/Edit Note</h2>
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Type your note here..."
        style={{ width: "100%", height: "100px", marginBottom: "20px" }}
      />
      <button onClick={onSave} style={{ marginRight: "10px" }}>
        Save
      </button>
      <button onClick={onRequestClose}>Cancel</button>
    </Modal>
  );
};

export default NoteModal;
