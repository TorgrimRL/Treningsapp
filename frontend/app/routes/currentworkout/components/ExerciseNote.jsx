import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";

export default function ExerciseNote({ note }) {
  return (
    <div className="mt-2 bg-yellow-500 text-white p-2">
      <FontAwesomeIcon icon={faThumbtack} style={{ marginRight: "10px" }} />
      {note}
    </div>
  );
}
