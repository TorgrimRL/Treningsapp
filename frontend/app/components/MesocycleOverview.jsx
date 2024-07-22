import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const MesocycleOverview = () => {
  const [mesocycles, setMesocycles] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const menuRef = useRef(null);

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
        const response = await fetch("http://localhost:3000/api/mesocycles", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        const updatedData = data.map(checkCompletion);
        setMesocycles(updatedData);
      } catch (error) {
        console.error("Error fetching mesocycles:", error);
      }
    };
    fetchMesocycles();
  }, []);

  const checkCompletion = (mesocycle) => {
    const allDaysCompleted = mesocycle.plan.every((day) =>
      day.exercises.every((exercise) => exercise.completed)
    );
    if (allDaysCompleted && !mesocycle.completedDate) {
      // Uncomment when exercisestatus per day is implemented
      // mesocycle.completedDate = new Date().toISOString();
    }
    return mesocycle;
  };

  const toggleMenu = (id) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <div className=" mx-auto p-5 bg-gray-900 text-white">
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
        {mesocycles.map((mesocycle) => (
          <li
            key={mesocycle.id}
            className={`flex justify-between items-center bg-gray-800 p-4 rounded mb-2 ${
              mesocycle.isCurrent ? "border-l-4 border-red-600" : ""
            }`}
          >
            <div>
              <h2 className="text-lg m-0 mb-1">{mesocycle.name}</h2>
              <p className="text-sm text-gray-400 m-0">
                {mesocycle.weeks} WEEKS - {mesocycle.daysPerWeek} DAYS/WEEK
              </p>
              {mesocycle.completedDate && (
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
                    : mesocycle.completedDate
                    ? "bg-green-600"
                    : "bg-gray-600"
                }`}
              >
                {mesocycle.isCurrent
                  ? "CURRENT"
                  : mesocycle.completedDate
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
              {openMenus[mesocycle.id] && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                  ref={menuRef}
                >
                  <ul className="py-1">
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                        // onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Delete
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        View Details
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MesocycleOverview;
