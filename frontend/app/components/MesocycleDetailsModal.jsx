import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useApiFetch } from "../utils/apiFetch";
const MesocycleDetailsModal = ({
  isOpen,
  onSave,
  mesocycleName,
  onRequestClose,
  setMesocycleName,
  numberOfWeeks,
  setNumberOfWeeks,
}) => {
  const [existingNames, setExistingNames] = useState([]);
  const [isNameAvailable, setIsNameAvailable] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();

  useEffect(() => {
    const fetchMesocycleNames = async () => {
      try {
        const { ok, data, hadSleep } = await apiFetch(
          `${baseUrl}/mesocycle-names`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (ok) {
          setExistingNames(data);
          console.log(data);
        } else {
          console.error("Failed to fetch mesocycle names");
        }
      } catch (error) {
        console.error("Error fetching mesocycle names:", error);
      }
    };

    fetchMesocycleNames();
  }, []);

  const handleMesocycleNameChange = (name) => {
    setMesocycleName(name);
    if (
      existingNames
        .map((n) => n.toLowerCase())
        .includes(name.trim().toLowerCase())
    ) {
      setIsNameAvailable(false);
    } else {
      setIsNameAvailable(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      contentLabel="Enter Mesocycle Details"
      className="relative bg-darkGray text-white rounded focus:outline-none shadow-lg p-0 max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50"
    >
      {mesocycleName && numberOfWeeks && (
        <button
          onClick={onRequestClose}
          className="absolute top-0 right-2 m-0 text-3xl text-white-600 hover:text-gray-800 cursor-pointer"
        >
          &times;
        </button>
      )}
      <div className="p-6">
        <header className="bold text-2xl mb-4 mt-2 border-b-1 border-inputBGGray">
          Enter Training Block Details
        </header>
        <div className="mb-4">
          <label className="block mb-2">Training Block Name:</label>
          <input
            type="text"
            value={mesocycleName}
            onChange={(e) => handleMesocycleNameChange(e.target.value)}
            placeholder="Enter name of training block"
            required
            className={`bg-inputBGGray text-center border-black w-full p-2 ${
              !isNameAvailable ? "border-red-500" : ""
            }`}
          />
          {!isNameAvailable && (
            <p className="text-red-500 text-sm mt-1">
              This training block name is already in use. Please choose another
              name.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-2">Number of Weeks:</label>
          <select
            value={numberOfWeeks}
            onChange={(e) => setNumberOfWeeks(e.target.value)}
            required
            className="bg-inputBGGray text-center border-black w-full p-2"
          >
            <option value={""} disabled>
              Select Weeks
            </option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onSave(mesocycleName, numberOfWeeks)}
            className={`
                              flex items-center justify-center bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"

                        ${
                          isNameAvailable
                            ? "hover:bg-primary-dark"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
            disabled={!isNameAvailable}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MesocycleDetailsModal;
