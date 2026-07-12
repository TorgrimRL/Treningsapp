import { useState, useEffect } from "react";
import { useApiFetch } from "../utils/apiFetch";
import AppModal from "./AppModal";

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
        const { ok, data } = await apiFetch(baseUrl + "/mesocycle-names", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (ok) {
          setExistingNames(data);
        } else {
          console.error("Failed to fetch mesocycle names");
        }
      } catch (error) {
        console.error("Error fetching mesocycle names:", error);
      }
    };

    fetchMesocycleNames();
  }, [apiFetch, baseUrl]);

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
    <AppModal
      data-testid="training-block-details-modal"
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      onRequestClose={onRequestClose}
      contentLabel="Enter Mesocycle Details"
      title="Enter Training Block Details"
      showCloseButton={!!(mesocycleName && numberOfWeeks)}
    >
      <div className="mb-4">
        <label htmlFor="training-block-name" className="block mb-2">
          Training Block Name:
        </label>
        <input
          id="training-block-name"
          data-testid="training-block-name"
          type="text"
          value={mesocycleName}
          onChange={(e) => handleMesocycleNameChange(e.target.value)}
          placeholder="Enter name of training block"
          required
          className={
            "bg-inputBGGray text-center border-black w-full p-2 " +
            (!isNameAvailable ? "border-red-500" : "")
          }
        />
        {!isNameAvailable && (
          <p className="text-red-500 text-sm mt-1 break-words">
            This training block name is already in use. Please choose another
            name.
          </p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="training-block-weeks" className="block mb-2">
          Number of Weeks:
        </label>
        <select
          id="training-block-weeks"
          data-testid="training-block-weeks"
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
          data-testid="training-block-details-save"
          onClick={() => onSave(mesocycleName, numberOfWeeks)}
          className={
            "flex items-center justify-center bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg " +
            (isNameAvailable ? "hover:bg-primary-dark" : "bg-gray-400 cursor-not-allowed")
          }
          disabled={!isNameAvailable}
        >
          Save
        </button>
      </div>
    </AppModal>
  );
};

export default MesocycleDetailsModal;
