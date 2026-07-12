import { useMemo, useRef, useState } from "react";
import { useApiFetch } from "../../utils/apiFetch";
import CurrentWorkoutDayBar from "./components/CurrentWorkoutDayBar";
import CurrentWorkoutHeader from "./components/CurrentWorkoutHeader";
import CurrentWorkoutModals from "./components/CurrentWorkoutModals";
import LoadingState from "./components/LoadingState";
import WorkoutExerciseCard from "./components/WorkoutExerciseCard";
import useCurrentWorkoutActions from "./hooks/useCurrentWorkoutActions";
import useCurrentWorkoutData from "./hooks/useCurrentWorkoutData";
import useCurrentWorkoutModals from "./hooks/useCurrentWorkoutModals";
import useWorkoutMenus from "./hooks/useWorkoutMenus";
import {
  calculateWorkoutProgress,
  getCurrentExerciseAtSlot,
  getDayLabel,
  getProgressionKey,
  getWeekAndDay,
} from "./utils/workoutUtils";


export default function CurrentWorkoutPage() {
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();
  const calendarIconRef = useRef(null);
  const [applyToFutureWeeks, setApplyToFutureWeeks] = useState(false);

  const workoutData = useCurrentWorkoutData(apiFetch, baseUrl);
  const {
    currentMesocycle,
    setCurrentMesocycle,
    loading,
    currentDayIndex,
    sets,
    setSets,
    notes,
    setNotes,
    refreshWorkoutData,
  } = workoutData;
  const menus = useWorkoutMenus();
  const workoutModals = useCurrentWorkoutModals();

  const currentDay = currentMesocycle?.plan?.[currentDayIndex] || null;
  const { week, day: dayNumber } = getWeekAndDay(
    currentDayIndex || 0,
    currentMesocycle?.daysPerWeek || 1
  );
  const progress = useMemo(
    () => calculateWorkoutProgress({ currentMesocycle, currentDayIndex }),
    [currentMesocycle, currentDayIndex]
  );
  const selectedExercise = getCurrentExerciseAtSlot(
    currentMesocycle,
    workoutModals.currentExercise?.dayIndex,
    workoutModals.currentExercise?.exerciseIndex
  );
  const actions = useCurrentWorkoutActions({
    apiFetch,
    baseUrl,
    currentDayIndex,
    currentMesocycle,
    menus,
    refreshWorkoutData,
    selectedExercise,
    setApplyToFutureWeeks,
    setCurrentMesocycle,
    setNotes,
    setSets,
    sets,
    workoutModals,
  });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="pt-[4.8rem]">
      {currentMesocycle && (
        <CurrentWorkoutHeader
          currentMesocycle={currentMesocycle}
          progress={progress}
        />
      )}
      {currentDay ? (
        <div className="mb-0">
          <CurrentWorkoutDayBar
            week={week}
            currentMesocycle={currentMesocycle}
            dayNumber={dayNumber}
            dayLabel={getDayLabel(currentDay)}
            onClick={workoutModals.openCalendarModal}
          />

          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto relative">
            <ul className="list-none list-inside text-white">
              {currentDay.exercises.map((exercise, exerciseIndex) => (
                <WorkoutExerciseCard
                  key={exerciseIndex}
                  applyToFutureWeeks={applyToFutureWeeks}
                  currentDayIndex={currentDayIndex}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  exerciseSets={sets[currentDayIndex]?.[exerciseIndex] || []}
                  isMenuOpen={!!menus.openMenus[exerciseIndex]}
                  menuRef={(element) => {
                    menus.menuRefs.current[exerciseIndex] = element;
                  }}
                  note={notes[currentDayIndex]?.[exerciseIndex] || ""}
                  onAddSet={actions.addSet}
                  onApplyToFutureWeeksChange={setApplyToFutureWeeks}
                  onChangeExercise={workoutModals.openChooseExerciseModal}
                  onOpenDropset={workoutModals.openDropsetModal}
                  onOpenNote={workoutModals.openNoteModal}
                  onOpenProgressionMode={workoutModals.openProgressionModeModal}
                  onOpenWeightIncrement={workoutModals.openWeightIncrementModal}
                  onRemoveSet={actions.removeSet}
                  onRepsChange={actions.handleRepsChange}
                  onSetCompletionChange={actions.handleSetCompletionChange}
                  onToggleMenu={menus.toggleMenu}
                  onToggleSetMenu={menus.toggleSetMenu}
                  onWeightChange={actions.handleWeightChange}
                  openSetMenus={menus.openSetMenus}
                  setMenuRefs={menus.setMenuRefs}
                  week={week}
                />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-red-500">No current workout found</div>
      )}
      <CurrentWorkoutModals
        applyProgressionModeToFutureWeeks={
          workoutModals.applyProgressionModeToFutureWeeks
        }
        applyWeightIncrementToFutureWeeks={
          workoutModals.applyWeightIncrementToFutureWeeks
        }
        calendarIconRef={calendarIconRef}
        currentDayIndex={currentDayIndex}
        currentExercise={workoutModals.currentExercise}
        currentMesocycle={currentMesocycle}
        currentNote={workoutModals.currentNote}
        getProgressionKey={getProgressionKey}
        getProgressionModeDraft={workoutModals.getProgressionModeDraft}
        getWeightIncrementDraft={workoutModals.getWeightIncrementDraft}
        isCalendarModalOpen={workoutModals.isCalendarModalOpen}
        isChooseExerciseModalOpen={workoutModals.isChooseExerciseModalOpen}
        isDropsetModalOpen={workoutModals.isDropsetModalOpen}
        isNoteModalOpen={workoutModals.isNoteModalOpen}
        isProgressionModeModalOpen={workoutModals.isProgressionModeModalOpen}
        isWeightIncrementModalOpen={workoutModals.isWeightIncrementModalOpen}
        onApplyProgressionModeToFutureWeeksChange={
          actions.handleApplyProgressionModeToFutureWeeksChange
        }
        onApplyWeightIncrementToFutureWeeksChange={
          actions.handleApplyWeightIncrementToFutureWeeksChange
        }
        onChooseExerciseClose={() =>
          workoutModals.setIsChooseExerciseModalOpen(false)
        }
        onChooseExerciseSave={actions.handleSaveExercise}
        onDayClick={actions.handleDayClick}
        onDropsetClose={() => workoutModals.setIsDropsetModalOpen(false)}
        onDropsetSave={actions.handleSaveDropset}
        onNoteChange={actions.handleNoteChange}
        onNoteClose={() => workoutModals.setIsNoteModalOpen(false)}
        onNoteSave={actions.handleSaveNote}
        onProgressionModeChange={actions.handleProgressionModeChange}
        onProgressionModeClose={() =>
          workoutModals.setIsProgressionModeModalOpen(false)
        }
        onProgressionModeSave={actions.handleProgressionModeSave}
        onWeightIncrementChange={actions.handleWeightIncrementChange}
        onWeightIncrementClose={() =>
          workoutModals.setIsWeightIncrementModalOpen(false)
        }
        onWeightIncrementSave={actions.handleWeightIncrementSave}
        selectedExercise={selectedExercise}
        setIsCalendarModalOpen={workoutModals.setIsCalendarModalOpen}
      />
    </div>
  );
}
