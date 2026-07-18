import { useMemo, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer";
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
    backgroundError,
    commitWorkoutData,
    currentDayIndex,
    currentMesocycle,
    fetchStatus,
    initialError,
    isBackgroundFetching,
    loading,
    markWorkoutDirty,
    notes,
    refreshWorkoutData,
    setCurrentDayIndex,
    setCurrentMesocycle,
    setNotes,
    setSets,
    sets,
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
    commitWorkoutData,
    markWorkoutDirty,
    menus,
    refreshWorkoutData,
    selectedExercise,
    setApplyToFutureWeeks,
    setCurrentDayIndex,
    setCurrentMesocycle,
    setNotes,
    setSets,
    sets,
    workoutModals,
  });

  if (loading) {
    return <LoadingState />;
  }

  if (initialError) {
    return (
      <PageContainer size="narrow" className="min-w-0 md:px-6">
        <div
          data-testid="current-workout-error"
          role="alert"
          className="mx-4 my-8 border border-red-700 bg-red-950/40 p-4 text-center text-red-200"
        >
          <p className="mb-3">Unable to load current workout.</p>
          <button
            type="button"
            onClick={() => void refreshWorkoutData()}
            disabled={fetchStatus === "fetching"}
            className="min-h-11 border border-red-500 px-4 py-2 font-semibold text-red-100 transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            Retry
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="narrow" className="min-w-0 md:px-6">
      <div data-testid="current-workout-layout" className="min-w-0">
        {backgroundError ? (
          <div
            data-testid="current-workout-background-error"
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-amber-700 bg-amber-950/40 px-4 py-2 text-sm text-amber-100"
          >
            <span>Unable to refresh current workout. Showing saved data.</span>
            <button
              type="button"
              onClick={() => void refreshWorkoutData()}
              disabled={fetchStatus === "fetching"}
              className="min-h-11 shrink-0 border border-amber-500 px-3 py-1 font-semibold hover:bg-amber-800 disabled:cursor-wait disabled:opacity-60"
            >
              Retry
            </button>
          </div>
        ) : isBackgroundFetching ? (
          <div
            data-testid="current-workout-background-loading"
            role="status"
            className="border-b border-gray-700 px-4 py-2 text-sm text-gray-300"
          >
            Updating workout...
          </div>
        ) : null}
        {currentMesocycle && (
          <div
            data-testid="current-workout-sticky-header"
            className="sticky top-12 z-20 border-b border-darkestGray bg-darkGray shadow-md"
          >
            {currentDay && (
              <CurrentWorkoutDayBar
                week={week}
                currentMesocycle={currentMesocycle}
                dayNumber={dayNumber}
                dayLabel={getDayLabel(currentDay)}
                onClick={workoutModals.openCalendarModal}
              />
            )}
            <CurrentWorkoutHeader
              currentMesocycle={currentMesocycle}
              progress={progress}
            />
          </div>
        )}
        {currentDay ? (
          <ul
            data-testid="current-workout-exercises"
            className="list-inside list-none text-white md:space-y-4 md:py-4"
          >
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
        ) : (
          <div className="px-4 py-8 text-center text-red-500">
            No current workout found
          </div>
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
    </PageContainer>
  );
}
