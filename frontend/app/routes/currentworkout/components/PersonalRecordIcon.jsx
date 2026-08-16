import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function PersonalRecordIcon({
  className = "",
  onClick,
  title = "Open personal record history",
}) {
  return (
    <button
      type="button"
      data-testid="personal-record-icon"
      aria-label={title}
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      className={
        "inline-flex min-h-6 min-w-6 items-center justify-center " +
        "text-amber-400 transition-colors hover:text-amber-300 " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 " +
        className
      }
    >
      <FontAwesomeIcon icon={faTrophy} className="h-3.5 w-3.5" />
    </button>
  );
}

export default PersonalRecordIcon;
