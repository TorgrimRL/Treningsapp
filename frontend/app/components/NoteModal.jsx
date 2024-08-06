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
      contentLabel="Template Overview"
      className=" relative bg-darkGray text-white rounded focus:outline-none shadow-lg p-0 max-w-3xl mx-auto mt-20 text-2sm "
      overlayClassName="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 "
    >
      <button
        onClick={onRequestClose}
        className=" absolute top-0 right-2 m-0 text-3xl text-white-600 hover:text-gray-800"
      >
        &times;
      </button>
      <header className="bold text-2xl mb-4 mt-2 border-b-1 border-inputBGGray">
        Add/Edit Note
      </header>
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Type your note here..."
        style={{ width: "100%", height: "100px", marginBottom: "20px" }}
        className="bg-inputBGGray"
      />
      <div className="flex justify-center mt-20 mb-2">
        <button
          onClick={onSave}
          className="flex items-center justify-center bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
        >
          Save
        </button>
        <button
          onClick={onRequestClose}
          className="flex items-center justify-center bg-inputNRGrey text-white border-none py-2 px-4 cursor-pointer text-lg"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default NoteModal;
