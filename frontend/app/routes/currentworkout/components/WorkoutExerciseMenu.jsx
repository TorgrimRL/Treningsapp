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
  return (
    <div
      className="flex justify-between items-center relative"
      ref={menuRef}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm text-white border uppercase border-red-500 bg-darkBackgroundRed inline-block w-auto px-2 py-1">
          {muscleGroup}
        </span>
      </div>
      <button
        type="button"
        data-testid={"exercise-menu-" + exerciseIndex}
        onClick={() => onToggleMenu(exerciseIndex)}
        className="text-white focus:outline-none"
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-md shadow-lg z-10">
          <ul className="py-1 bg-hamburgerbackground">
            <li className="block px-4 py-2 hover:!bg-darkestGray">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddNote();
                }}
                className="block text-white focus:outline-none"
              >
                Add note
              </button>
            </li>
            <li className="block px-4 py-2 hover:!bg-darkestGray">
              <button
                type="button"
                data-testid={"change-exercise-" + exerciseIndex}
                onClick={(event) => {
                  event.stopPropagation();
                  onChangeExercise();
                }}
              >
                Change exercise
              </button>
            </li>
            <li className="block px-4 py-2 hover:!bg-darkestGray">
              <button
                type="button"
                data-testid={"dropset-exercise-" + exerciseIndex}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenDropset();
                }}
              >
                Dropsets
              </button>
            </li>
            <li className="block px-4 py-2 hover:!bg-darkestGray">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenProgressionMode();
                }}
              >
                Progression mode
              </button>
            </li>
            <li className="block px-4 py-2 hover:!bg-darkestGray">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenWeightIncrement();
                }}
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
