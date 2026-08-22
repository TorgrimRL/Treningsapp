import { useEffect, useState } from "react";
import AppModal from "./AppModal";

export default function RenameMesocycleModal({
  isOpen,
  mesocycle,
  onRequestClose,
  onSave,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(mesocycle?.name || "");
      setError("");
      setIsSaving(false);
    }
  }, [isOpen, mesocycle]);

  const normalizedName = name.trim();
  const currentName = (mesocycle?.name || "").trim();
  const canSave =
    normalizedName.length > 0 &&
    normalizedName !== currentName &&
    !isSaving;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSave) {
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const result = await onSave(normalizedName);
      if (!result?.ok) {
        setError(result?.error || "Failed to rename training block");
        return;
      }

      onRequestClose();
    } catch (saveError) {
      console.error("Failed to rename mesocycle:", saveError);
      setError("Failed to rename training block");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppModal
      contentLabel="Rename training block"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnEsc={!isSaving}
      shouldCloseOnOverlayClick={!isSaving}
      showCloseButton={!isSaving}
      title="Rename training block"
    >
      <form onSubmit={handleSubmit}>
        <label
          className="mb-2 block text-sm text-gray-300"
          htmlFor="rename-mesocycle-name"
        >
          Training block name
        </label>
        <input
          aria-describedby={error ? "rename-mesocycle-error" : undefined}
          aria-invalid={Boolean(error)}
          className="min-h-11 w-full rounded border border-gray-600 bg-inputBGGray px-3 py-2 text-white outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500"
          data-testid="rename-mesocycle-name"
          disabled={isSaving}
          id="rename-mesocycle-name"
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          required
          type="text"
          value={name}
        />
        {error && (
          <p
            className="mt-2 text-sm text-red-400"
            data-testid="rename-mesocycle-error"
            id="rename-mesocycle-error"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="min-h-11 rounded px-4 py-2 text-gray-200 transition-colors hover:bg-gray-700 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="rename-mesocycle-cancel"
            disabled={isSaving}
            onClick={onRequestClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-11 rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-500 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="rename-mesocycle-save"
            disabled={!canSave}
            type="submit"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </AppModal>
  );
}
