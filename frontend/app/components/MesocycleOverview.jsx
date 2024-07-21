import React, { useEffect, useState } from "react";

const MesocycleOverview = () => {
  const [mesocycles, setMesocycles] = useState([]);

  useEffect(() => {
    const fetchMesocycles = async () => {
      try {
        const response = await fetch("http://localhost:3000/mesocycles", {
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

  return (
    <div className="w-4/5 mx-auto p-5 bg-gray-900 text-white">
      <header className="flex justify-between items-center mb-5">
        <h1 className="text-2xl m-0">Mesocycles</h1>
        <button className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg rounded">
          + NEW
        </button>
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
            <span
              className={`py-1 px-2 rounded text-sm ${
                mesocycle.isCurrent ? "bg-orange-600" : "bg-gray-600"
              }`}
            >
              {mesocycle.isCurrent ? "CURRENT" : "PAST"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MesocycleOverview;
