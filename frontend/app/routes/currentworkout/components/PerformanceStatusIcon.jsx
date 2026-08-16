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
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
    />
  );
}
