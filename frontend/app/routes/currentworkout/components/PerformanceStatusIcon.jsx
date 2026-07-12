import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";

const iconByStatus = {
  target: faBullseye,
  above: faArrowUp,
  below: faArrowDown,
};

export default function PerformanceStatusIcon({ status }) {
  const icon = iconByStatus[status];

  if (!icon) {
    return null;
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      className="mt-2 ml-0 text-white-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{ top: "50%", transform: "translateY(-10%)" }}
    />
  );
}
