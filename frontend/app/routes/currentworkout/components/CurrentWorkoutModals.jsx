import CalendarModal from "../../../components/CalendarModal";
import ChooseExerciseModal from "../../../components/ChooseExerciseModal";
import DropsetModal from "../../../components/DropsetModal";
import NoteModal from "../../../components/NoteModal";
import ProgressionModeModal from "../../../components/ProgressionModeModal";
import WeightIncrementModal from "../../../components/WeightIncrementModal";

export default function CurrentWorkoutModals({
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
  isCalendarModalOpen,
  isChooseExerciseModalOpen,
  isDropsetModalOpen,
  isNoteModalOpen,
  isProgressionModeModalOpen,
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
  onWeightIncrementChange,
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
        applyToFutureWeeks={
          progressionKey ? !!applyWeightIncrementToFutureWeeks[progressionKey] : false
        }
        onWeightIncrementChange={onWeightIncrementChange}
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
    </>
  );
}
