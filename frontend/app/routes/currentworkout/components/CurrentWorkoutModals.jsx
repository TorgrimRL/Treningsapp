import CalendarModal from "../../../components/CalendarModal";
import ChooseExerciseModal from "../../../components/ChooseExerciseModal";
import DropsetModal from "../../../components/DropsetModal";
import NoteModal from "../../../components/NoteModal";
import RenameMesocycleModal from "../../../components/RenameMesocycleModal";
import PersonalRecordModal from "./PersonalRecordModal";
import ProgressionModeModal from "../../../components/ProgressionModeModal";
import WeightIncrementModal from "../../../components/WeightIncrementModal";

export default function CurrentWorkoutModals({
  apiFetch,
  baseUrl,
  applyProgressionModeToFutureWeeks,
  applyWeightIncrementToFutureWeeks,
  calendarIconRef,
  currentDayIndex,
  currentExercise,
  currentMesocycle,
  currentNote,
  getProgressionKey,
  getProgressionModeDraft,
  getWeightIncrementDraft,
  getMinimumWeightDraft,
  isCalendarModalOpen,
  isChooseExerciseModalOpen,
  isDropsetModalOpen,
  isNoteModalOpen,
  isProgressionModeModalOpen,
  isRenameMesocycleModalOpen,
  isPersonalRecordModalOpen,
  isWeightIncrementModalOpen,
  onApplyProgressionModeToFutureWeeksChange,
  onApplyWeightIncrementToFutureWeeksChange,
  onChooseExerciseClose,
  onChooseExerciseSave,
  onDayClick,
  onDropsetClose,
  onDropsetSave,
  onNoteChange,
  onNoteClose,
  onNoteSave,
  onProgressionModeChange,
  onProgressionModeClose,
  onProgressionModeSave,
  onRenameMesocycleClose,
  onRenameMesocycleSave,
  onPersonalRecordClose,
  personalRecordContext,
  onWeightIncrementChange,
  onMinimumWeightChange,
  onWeightIncrementClose,
  onWeightIncrementSave,
  selectedExercise,
  setIsCalendarModalOpen,
}) {
  const progressionKey = currentExercise
    ? getProgressionKey(currentExercise.dayIndex, currentExercise.exerciseIndex)
    : null;

  return (
    <>
      {currentMesocycle && (
        <CalendarModal
          isOpen={isCalendarModalOpen}
          onRequestClose={() => setIsCalendarModalOpen(false)}
          mesocycle={currentMesocycle}
          currentDayIndex={currentDayIndex}
          onDayClick={onDayClick}
          calendarIconRef={calendarIconRef}
        >
          <h2>Mesocycle Overview</h2>
        </CalendarModal>
      )}
      <NoteModal
        isOpen={isNoteModalOpen}
        onRequestClose={onNoteClose}
        note={currentNote}
        onNoteChange={onNoteChange}
        onSave={onNoteSave}
      />
      {currentMesocycle && (
        <RenameMesocycleModal
          isOpen={isRenameMesocycleModalOpen}
          mesocycle={currentMesocycle}
          onRequestClose={onRenameMesocycleClose}
          onSave={onRenameMesocycleSave}
        />
      )}
      <ProgressionModeModal
        isOpen={isProgressionModeModalOpen}
        onRequestClose={onProgressionModeClose}
        exercise={selectedExercise}
        progressionMode={
          currentExercise && selectedExercise
            ? getProgressionModeDraft(
                currentExercise.dayIndex,
                currentExercise.exerciseIndex,
                selectedExercise
              )
            : null
        }
        applyToFutureWeeks={
          progressionKey ? !!applyProgressionModeToFutureWeeks[progressionKey] : false
        }
        onProgressionModeChange={onProgressionModeChange}
        onApplyToFutureWeeksChange={onApplyProgressionModeToFutureWeeksChange}
        onSave={onProgressionModeSave}
      />
      <WeightIncrementModal
        isOpen={isWeightIncrementModalOpen}
        onRequestClose={onWeightIncrementClose}
        exercise={selectedExercise}
        weightIncrement={
          currentExercise && selectedExercise
            ? getWeightIncrementDraft(
                currentExercise.dayIndex,
                currentExercise.exerciseIndex,
                selectedExercise
              )
            : null
        }
        minimumWeight={
          currentExercise && selectedExercise
            ? getMinimumWeightDraft(
                currentExercise.dayIndex,
                currentExercise.exerciseIndex,
                selectedExercise
              )
            : null
        }
        applyToFutureWeeks={
          progressionKey ? !!applyWeightIncrementToFutureWeeks[progressionKey] : false
        }
        onWeightIncrementChange={onWeightIncrementChange}
        onMinimumWeightChange={onMinimumWeightChange}
        onApplyToFutureWeeksChange={onApplyWeightIncrementToFutureWeeksChange}
        onSave={onWeightIncrementSave}
      />
      <DropsetModal
        isOpen={isDropsetModalOpen}
        onRequestClose={onDropsetClose}
        exercise={selectedExercise}
        onSave={onDropsetSave}
      />
      <ChooseExerciseModal
        isOpen={isChooseExerciseModalOpen}
        onRequestClose={onChooseExerciseClose}
        onSave={onChooseExerciseSave}
        currentExercise={currentExercise}
      />
      <PersonalRecordModal
        apiFetch={apiFetch}
        baseUrl={baseUrl}
        currentMesocycle={currentMesocycle}
        isOpen={isPersonalRecordModalOpen}
        onRequestClose={onPersonalRecordClose}
        recordContext={personalRecordContext}
      />
    </>
  );
}
