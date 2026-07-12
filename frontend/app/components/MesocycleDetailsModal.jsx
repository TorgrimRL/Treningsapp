import { useEffect, useState } from "react";
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
  variant = "modal",
}) => {
  const [existingNames, setExistingNames] = useState([]);
  const [isNameAvailable, setIsNameAvailable] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();
  const canSave = Boolean(
    mesocycleName.trim() && numberOfWeeks && isNameAvailable
  );

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
    setIsNameAvailable(
      !existingNames
        .map((existingName) => existingName.toLowerCase())
        .includes(name.trim().toLowerCase())
    );
  };

  if (!isOpen) {
    return null;
  }

  const detailsFields = (
    <>
      <div className="mb-4">
        <label htmlFor="training-block-name" className="mb-2 block">
          Training Block Name:
        </label>
        <input
          id="training-block-name"
          data-testid="training-block-name"
          type="text"
          value={mesocycleName}
          onChange={(event) => handleMesocycleNameChange(event.target.value)}
          placeholder="Enter name of training block"
          required
          className={
            "w-full border-black bg-inputBGGray p-2 text-center " +
            (!isNameAvailable ? "border-red-500" : "")
          }
        />
        {!isNameAvailable && (
          <p className="mt-1 break-words text-sm text-red-500">
            This training block name is already in use. Please choose another
            name.
          </p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="training-block-weeks" className="mb-2 block">
          Number of Weeks:
        </label>
        <select
          id="training-block-weeks"
          data-testid="training-block-weeks"
          value={numberOfWeeks}
          onChange={(event) => setNumberOfWeeks(event.target.value)}
          required
          className="w-full border-black bg-inputBGGray p-2 text-center"
        >
          <option value="" disabled>
            Select Weeks
          </option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
        </select>
      </div>
      <div className="flex items-center justify-between gap-3">
        <button
          data-testid="training-block-details-cancel"
          type="button"
          onClick={onRequestClose}
          className="border border-gray-500 px-4 py-2 text-lg text-gray-200 hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          data-testid="training-block-details-save"
          type="button"
          onClick={() => onSave(mesocycleName, numberOfWeeks)}
          className={
            "flex items-center justify-center px-4 py-2 text-lg text-white " +
            (canSave
              ? "cursor-pointer bg-red-600 hover:bg-red-700"
              : "cursor-not-allowed bg-gray-500")
          }
          disabled={!canSave}
        >
          Save
        </button>
      </div>
    </>
  );

  if (variant === "inline") {
    return (
      <section
        data-testid="training-block-details-panel"
        aria-labelledby="training-block-details-title"
        className="mx-auto w-full max-w-md bg-darkestGray p-4 md:my-8 md:border md:border-gray-700"
      >
        <h1
          id="training-block-details-title"
          className="mb-4 border-b border-inputBGGray pb-2 text-2xl font-bold"
        >
          Enter Training Block Details
        </h1>
        {detailsFields}
      </section>
    );
  }

  return (
    <AppModal
      data-testid="training-block-details-modal"
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      onRequestClose={onRequestClose}
      contentLabel="Enter Mesocycle Details"
      title="Enter Training Block Details"
    >
      {detailsFields}
    </AppModal>
  );
};

export default MesocycleDetailsModal;
