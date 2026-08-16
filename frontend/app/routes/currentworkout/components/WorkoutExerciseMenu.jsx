import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export default function WorkoutExerciseMenu({
  exerciseIndex,
  isOpen,
  menuRef,
  muscleGroup,
  onToggleMenu,
  onAddNote,
  onChangeExercise,
  onOpenDropset,
  onOpenProgressionMode,
  onOpenWeightIncrement,
}) {
  const menuButtonClassName =
    "flex min-h-11 w-full items-center rounded-md px-3 text-left transition-colors hover:bg-darkestGray focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400";

  return (
    <div
      className="relative flex min-w-0 items-center justify-between"
      ref={menuRef}
    >
      <div className="min-w-0 flex-1">
        <span className="inline-block max-w-full truncate border border-red-500 bg-darkBackgroundRed px-2 py-1 text-sm uppercase text-white">
          {muscleGroup}
        </span>
      </div>
      <button
        type="button"
        data-testid={"exercise-menu-" + exerciseIndex}
        onClick={() => onToggleMenu(exerciseIndex)}
        className="mr-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-64 overflow-hidden rounded-lg border border-gray-600 bg-hamburgerbackground text-white shadow-lg">
          <ul className="space-y-1 p-2">
            <li>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddNote();
                }}
                className={menuButtonClassName}
              >
                Add note
              </button>
            </li>
            <li>
              <button
                type="button"
                data-testid={"change-exercise-" + exerciseIndex}
                onClick={(event) => {
                  event.stopPropagation();
                  onChangeExercise();
                }}
                className={menuButtonClassName}
              >
                Change exercise
              </button>
            </li>
            <li>
              <button
                type="button"
                data-testid={"dropset-exercise-" + exerciseIndex}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenDropset();
                }}
                className={menuButtonClassName}
              >
                Dropsets
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenProgressionMode();
                }}
                className={menuButtonClassName}
              >
                Progression mode
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenWeightIncrement();
                }}
                className={menuButtonClassName}
              >
                Weight increment
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
