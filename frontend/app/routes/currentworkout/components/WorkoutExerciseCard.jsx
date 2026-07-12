import ExerciseNote from "./ExerciseNote";
import WorkoutExerciseMenu from "./WorkoutExerciseMenu";
import WorkoutSetRow from "./WorkoutSetRow";

export default function WorkoutExerciseCard({
  applyToFutureWeeks,
  currentDayIndex,
  exercise,
  exerciseIndex,
  exerciseSets,
  isMenuOpen,
  menuRef,
  note,
  onAddSet,
  onApplyToFutureWeeksChange,
  onChangeExercise,
  onOpenDropset,
  onOpenNote,
  onOpenProgressionMode,
  onOpenWeightIncrement,
  onRemoveSet,
  onRepsChange,
  onSetCompletionChange,
  onToggleMenu,
  onToggleSetMenu,
  onWeightChange,
  openSetMenus,
  setMenuRefs,
  week,
}) {
  return (
    <li
      data-testid={"workout-exercise-" + exerciseIndex}
      className="p-3 overflow-visible bg-darkGray"
    >
      <WorkoutExerciseMenu
        exerciseIndex={exerciseIndex}
        isOpen={isMenuOpen}
        menuRef={menuRef}
        muscleGroup={exercise.muscleGroup}
        onToggleMenu={onToggleMenu}
        onAddNote={() =>
          onOpenNote({
            dayIndex: currentDayIndex,
            exerciseIndex,
            note,
          })
        }
        onChangeExercise={() =>
          onChangeExercise({ dayIndex: currentDayIndex, exerciseIndex })
        }
        onOpenDropset={() =>
          onOpenDropset({ dayIndex: currentDayIndex, exerciseIndex })
        }
        onOpenProgressionMode={() =>
          onOpenProgressionMode({ dayIndex: currentDayIndex, exerciseIndex })
        }
        onOpenWeightIncrement={() =>
          onOpenWeightIncrement({ dayIndex: currentDayIndex, exerciseIndex })
        }
      />
      <div className="text-white font-semibold">{exercise.exercise}</div>
      {note && <ExerciseNote note={note} />}
      {exerciseSets.map((set, setIndex) => {
        const setMenuId = exerciseIndex + "-" + setIndex;

        return (
          <WorkoutSetRow
            key={setIndex}
            applyToFutureWeeks={applyToFutureWeeks}
            exercise={exercise}
            exerciseIndex={exerciseIndex}
            isSetMenuOpen={!!openSetMenus[setMenuId]}
            onAddSet={(shouldApplyToFutureWeeks) =>
              onAddSet(currentDayIndex, exerciseIndex, shouldApplyToFutureWeeks)
            }
            onApplyToFutureWeeksChange={onApplyToFutureWeeksChange}
            onRemoveSet={(targetSetIndex, shouldApplyToFutureWeeks) =>
              onRemoveSet(
                currentDayIndex,
                exerciseIndex,
                targetSetIndex,
                shouldApplyToFutureWeeks
              )
            }
            onRepsChange={(targetSetIndex, value) =>
              onRepsChange(currentDayIndex, exerciseIndex, targetSetIndex, value)
            }
            onSetCompletionChange={(targetSetIndex, value) =>
              onSetCompletionChange(
                currentDayIndex,
                exerciseIndex,
                targetSetIndex,
                value
              )
            }
            onToggleSetMenu={onToggleSetMenu}
            onWeightChange={(targetSetIndex, value) =>
              onWeightChange(
                currentDayIndex,
                exerciseIndex,
                targetSetIndex,
                value,
                exercise
              )
            }
            set={set}
            setIndex={setIndex}
            setMenuRef={(element) => {
              setMenuRefs.current[setMenuId] = element;
            }}
            week={week}
          />
        );
      })}
    </li>
  );
}
