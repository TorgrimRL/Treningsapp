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
      className="absolute left-full ml-1 top-5 w-48 bg-white rounded-md shadow-lg z-10"
    >
      <ul className="py-1 bg-hamburgerbackground text-white">
        <li className="block px-4 py-2 bg-inputBGGray hover:!bg-darkestGray z-20">
          <label
            htmlFor={"future-weeks-" + exerciseIndex + "-" + setIndex}
            className="inline-flex items-center"
          >
            <input
              id={"future-weeks-" + exerciseIndex + "-" + setIndex}
              type="checkbox"
              className="form-checkbox"
              checked={applyToFutureWeeks}
              onChange={onApplyToFutureWeeksChange}
              style={{
                width: "20px",
                height: "20px",
                marginTop: "10px",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            />
            <span className="ml-2">Apply to future weeks</span>
          </label>
        </li>
        <li className="block px-4 py-2 hover:!bg-darkestGray z-20">
          <button
            type="button"
            onClick={onAddSet}
            className="focus:outline-none block w-full text-left cursor-pointer"
          >
            Add set
          </button>
        </li>
        <li className="block px-4 py-2 hover:bg-darkGray">
          <button
            type="button"
            onClick={onRemoveSet}
            className="focus:outline-none block w-full text-left cursor-pointer"
          >
            Remove set
          </button>
        </li>
      </ul>
    </div>
  );
}
