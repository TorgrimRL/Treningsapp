import { useState } from "react";
import AppModal from "./AppModal";

const NoteModal = ({ isOpen, onRequestClose, note, onNoteChange, onSave }) => {
  const [applyToFutureWeeks, setApplyToFutureWeeks] = useState(false);

  const handleSave = () => {
    onSave(applyToFutureWeeks);
    onRequestClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add/Edit Note"
      title="Add/Edit Note"
    >
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Type your note here..."
        className="bg-inputBGGray w-full h-24 mb-5 p-2"
      />
      <input
        id="note-apply-future-weeks"
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
      <label htmlFor="note-apply-future-weeks">Apply to future weeks </label>
      <div className="flex justify-center gap-3 mt-10 mb-2">
        <button
          onClick={handleSave}
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
    </AppModal>
  );
};

export default NoteModal;
