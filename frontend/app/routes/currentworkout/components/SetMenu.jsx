export default function SetMenu({
  applyToFutureWeeks,
  exerciseIndex,
  setIndex,
  onApplyToFutureWeeksChange,
  onAddSet,
  onRemoveSet,
  menuRef,
}) {
  return (
    <div
      ref={menuRef}
      className="absolute left-full top-5 z-10 ml-2 w-56 overflow-hidden rounded-lg border border-gray-600 bg-hamburgerbackground text-white shadow-lg"
    >
      <div className="border-b border-gray-600 bg-inputBGGray p-2">
        <div className="relative flex min-h-11 items-center justify-between gap-3 rounded-md px-3 text-left hover:bg-darkestGray">
          <input
            id={"future-weeks-" + exerciseIndex + "-" + setIndex}
            type="checkbox"
            aria-label="Apply to future weeks"
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            checked={applyToFutureWeeks}
            onChange={onApplyToFutureWeeksChange}
          />
          <span>
            <span className="block text-sm font-semibold">
              Apply to future weeks
            </span>
            <span className="block text-xs text-gray-300">
              Use this change for the remaining weeks.
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-xs text-transparent transition-colors peer-checked:border-green-500 peer-checked:bg-green-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-red-400"
          >
            ✓
          </span>
        </div>
      </div>
      <ul className="space-y-1 p-2">
        <li>
          <button
            type="button"
            onClick={onAddSet}
            className="flex min-h-11 w-full items-center rounded-md px-3 text-left font-semibold transition-colors hover:bg-darkestGray focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            Add set
          </button>
        </li>
        <li className="border-t border-gray-600 pt-1">
          <button
            type="button"
            onClick={onRemoveSet}
            className="flex min-h-11 w-full items-center rounded-md px-3 text-left text-red-300 transition-colors hover:bg-red-950/50 hover:text-red-100 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            Remove set
          </button>
        </li>
      </ul>
    </div>
  );
}
