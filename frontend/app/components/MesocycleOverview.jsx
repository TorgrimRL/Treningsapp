import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import RedoExerciseBlockModal from "./RedoExerciseBlockModal";
import { useApiFetch } from "../utils/apiFetch";

const MesocycleOverview = () => {
  const [mesocycles, setMesocycles] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const [sortedPlans, setSortedPlans] = useState([]);
  const [selectedExerciseBlock, setSelectedExerciseBlock] = useState(null);
  const [isRedoModalOpen, setIsRedoModalOpen] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();
  const sortPlansByCurrent = (plans) => {
    const currentPlans = plans.filter((plan) => plan.isCurrent);
    const nonCurrentPlans = plans.filter(
      (plan) => !plan.isCurrent && plan.completedDate === null
    );
    const finnishedPlans = plans.filter((plan) => plan.completedDate !== null);

    return currentPlans.concat(nonCurrentPlans, finnishedPlans);
  };

  useEffect(() => {
    const sorted = sortPlansByCurrent(mesocycles);
    setSortedPlans(sorted);
  }, [mesocycles]);

  useEffect(() => {
    const handleClickOutSide = (event) => {
      if (!event.target.closest(".menu-container")) {
        setOpenMenus({});
      }
    };

    document.addEventListener("mousedown", handleClickOutSide);
    document.addEventListener("touchstart", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
      document.removeEventListener("touchstart", handleClickOutSide);
    };
  }, []);

  useEffect(() => {
    const fetchMesocycles = async () => {
      try {
        const { ok, data } = await apiFetch(`${baseUrl}/mesocycles`, {
          method: "GET",
          credentials: "include",
        });
        if (ok) {
          setMesocycles(data);
        } else {
          console.error(data.message || "Failed to fetch mesocycles");
        }
      } catch (error) {
        console.error("Error fetching mesocycles:", error);
      }
    };
    fetchMesocycles();
  }, [apiFetch, baseUrl]);

  const toggleMenu = (id) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };
  const handleRedoExerciseBlock = (mesocycle) => {
    setOpenMenus({}); // Lukk alle menyer
    setSelectedExerciseBlock(mesocycle);
    setIsRedoModalOpen(true);
  };

  return (
    <>
      <div className="text-white">
        <header className="flex items-center justify-between gap-4 px-4 py-6 md:px-0">
          <h1 className="m-0 text-2xl">Mesocycles</h1>
          <Link
            to="/mesocycles-new"
            className="cursor-pointer bg-red-600 px-4 py-2 text-lg text-white"
          >
            + NEW
          </Link>
        </header>
        <ul
          data-testid="history-grid"
          className="m-0 grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2 md:gap-4 xl:grid-cols-3"
        >
          {sortedPlans.map((mesocycle) => {
            const isCompleted = mesocycle.completedDate !== null;

            return (
              <li
                key={mesocycle.id}
                data-testid={"history-card-" + mesocycle.id}
                className={`flex h-full min-w-0 items-start justify-between gap-3 bg-darkestGray p-4 md:border md:border-gray-700 ${
                  mesocycle.isCurrent ? "border-l-4 !border-l-red-600" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h2 className="mb-1 truncate text-lg" title={mesocycle.name}>
                    {mesocycle.name}
                  </h2>
                  <p className="m-0 break-words text-sm text-gray-400">
                    {mesocycle.weeks} WEEKS - {mesocycle.daysPerWeek} DAYS/WEEK
                  </p>
                  {isCompleted && (
                    <p className="m-0 break-words text-sm text-gray-400">
                      Completed:{" "}
                      {new Date(mesocycle.completedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center">
                  <span
                    className={`mr-2 max-w-28 break-words rounded px-2 py-1 text-center text-xs sm:max-w-none sm:whitespace-nowrap sm:text-sm ${
                      mesocycle.isCurrent
                        ? "bg-orange-600"
                        : isCompleted
                        ? "bg-green-600"
                        : "bg-gray-600"
                    }`}
                  >
                    {mesocycle.isCurrent
                      ? "CURRENT"
                      : isCompleted
                      ? new Date(mesocycle.completedDate).toLocaleDateString()
                      : "NOT COMPLETED"}
                  </span>
                  <div className="relative menu-container">
                    <button
                      onClick={() => toggleMenu(mesocycle.id)}
                      className="text-white focus:outline-none py-2"
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>
                    {openMenus[mesocycle.id] && (
                      <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg bg-darkGray p-2 shadow-lg">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-white"
                          onClick={() => handleRedoExerciseBlock(mesocycle)}
                        >
                          Redo Exercise Block
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {selectedExerciseBlock && (
        <RedoExerciseBlockModal
          isOpen={isRedoModalOpen}
          onRequestClose={() => setIsRedoModalOpen(false)}
          exerciseBlock={selectedExerciseBlock}
        />
      )}
    </>
  );
};
export default MesocycleOverview;
