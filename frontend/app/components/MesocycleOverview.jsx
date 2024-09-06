import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const MesocycleOverview = () => {
  const [mesocycles, setMesocycles] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const [sortedPlans, setSortedPlans] = useState([]);
  const menuRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_URL;

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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenus({});
      }
    };

    document.addEventListener("mousedown", handleClickOutSide);
    document.addEventListener("touchstart", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
      document.removeEventListener("touchstart", handleClickOutSide);
    };
  }, [menuRef]);

  useEffect(() => {
    const fetchMesocycles = async () => {
      try {
        const response = await fetch(`${baseUrl}/mesocycles`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        setMesocycles(data);
      } catch (error) {
        console.error("Error fetching mesocycles:", error);
      }
    };
    fetchMesocycles();
  }, []);

  // const checkCompletion = (mesocycle) => {
  //   const allDaysCompleted = mesocycle.plan.every((day) =>
  //     day.exercises.every((exercise) => exercise.completed)
  //   );
  //   if (allDaysCompleted && !mesocycle.completedDate) {
  //     // Uncomment when exercisestatus per day is implemented
  //     mesocycle.completedDate = new Date().toISOString();
  //   }
  //   return mesocycle;
  // };

  const toggleMenu = (id) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <div className=" mx-auto p-5 text-white bg-darkGray">
      <header className="flex justify-between items-center mb-5">
        <h1 className="text-2xl m-0">Mesocycles</h1>
        <a
          href="mesocycles-new"
          className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg rounded"
        >
          + NEW
        </a>
      </header>
      <ul className="list-none p-0 m-0">
        {sortedPlans.map((mesocycle) => {
          const isCompleted = mesocycle.completedDate !== null;
          console.log(`Mesocycle ${mesocycle.id} is completed:`, isCompleted);

          return (
            <li
              key={mesocycle.id}
              className={`flex justify-between items-center max-w-sm bg-darkestGray p-4 rounded mb-2 ${
                mesocycle.isCurrent ? "border-l-4 border-red-600" : ""
              }`}
            >
              <div>
                <h2 className="text-lg m-0 max-w-sm mb-1 truncate max-w-[200px]">
                  {mesocycle.name}
                </h2>
                <p className="text-sm text-gray-400 m-0">
                  {mesocycle.weeks} WEEKS - {mesocycle.daysPerWeek} DAYS/WEEK
                </p>
                {isCompleted && (
                  <p className="text-sm text-gray-400 m-0">
                    Completed:{" "}
                    {new Date(mesocycle.completedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <span
                  className={`py-1 px-2 rounded text-sm mr-2 ${
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
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => toggleMenu(mesocycle.id)}
                    className="text-white focus:outline-none py-2"
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default MesocycleOverview;
