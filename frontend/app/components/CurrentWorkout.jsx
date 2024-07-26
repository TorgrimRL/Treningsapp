import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import CalendarModal from "./CalendarModal";

const getFirstIncompleteDay = (plan) => {
  for (let i = 0; i < plan.length; i++) {
    const day = plan[i];
    const allExercisesCompleted = day.exercises.every(
      (exercise) => exercise.completed
    );
    if (!allExercisesCompleted) {
      return i;
    }
    return plan.length - 1;
  }
};

export default function CurrentWorkout() {
  const [currentMesocycle, setCurrentMesocycle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);
  const [sets, setSets] = useState({});

  const handleRepsChange = (dayIndex, exerciseIndex, setIndex, value) => {
    setSets((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) =>
          sIndex === setIndex ? { ...set, reps: value } : set
        ),
      },
    }));
  };

  const handleWeightChange = (dayIndex, exerciseIndex, setIndex, value) => {
    setSets((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) =>
          sIndex === setIndex ? { ...set, weight: value } : set
        ),
      },
    }));
  };

  const addSet = (dayIndex, exerciseIndex) => {
    setSets((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [exerciseIndex]: [
          ...(prev[dayIndex]?.[exerciseIndex] || []),
          { weight: "", reps: "", completed: false },
        ],
      },
    }));
  };

  const openCalendarModal = () => setIsCalendarModalOpen(true);

  useEffect(() => {
    const fetchMesocycle = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/current-workout",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        console.log("Mesocycle Data:", data);
        setCurrentMesocycle(data);

        const firstIncompleteDayIndex = getFirstIncompleteDay(data.plan);
        setCurrentDayIndex(firstIncompleteDayIndex);

        const setsData = {};
        data.plan.forEach((day, dayIndex) => {
          setsData[dayIndex] = {};
          day.exercises.forEach((exercise, exerciseIndex) => {
            setsData[dayIndex][exerciseIndex] = exercise.sets || [];
          });
        });
        setSets(setsData);
      } catch (error) {
        console.error("Error fetchign mesocycles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMesocycle();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDayClick = (index) => {
    setCurrentDayIndex(index);
    setIsCalendarModalOpen(false);
  };

  const getDayLabel = (day) => {
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return daysOfWeek.includes(day.label) ? day.label : "";
  };

  const currentDay = currentMesocycle.plan[currentDayIndex];
  const getWeekAndDay = (index, daysOfWeek) => {
    const week = Math.floor(index / daysOfWeek) + 1;
    const day = (index % daysOfWeek) + 1;
    return { week, day };
  };
  const { week, day: dayNumber } = getWeekAndDay(
    currentDayIndex,
    currentMesocycle.daysPerWeek
  );

  const handleSetCompletionChange = async (
    dayIndex,
    exerciseIndex,
    setIndex,
    value,
    weightValue,
    repsValue
  ) => {
    // Updating sets localy
    setSets((prev) => {
      const updatedSets = {
        ...prev,
        [dayIndex]: {
          ...prev[dayIndex],
          [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) =>
            sIndex === setIndex
              ? {
                  ...set,
                  completed: value,
                  weight: weightValue,
                  reps: repsValue,
                }
              : set
          ),
        },
      };

      // Updating mesocycle with the new data for sets
      const updatedMesocycle = {
        ...currentMesocycle,
        plan: currentMesocycle.plan.map((day, dIndex) =>
          dIndex === dayIndex
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIndex) =>
                  eIndex === exerciseIndex
                    ? {
                        ...exercise,
                        sets: updatedSets[dayIndex][exerciseIndex],
                      }
                    : exercise
                ),
              }
            : day
        ),
      };

      // Sending updated mesocycle to backend
      (async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/mesocycles/${currentMesocycle.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(updatedMesocycle),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update mesocycle: ${errorText}`);
          }

          console.log("Successfully updated mesocycle");
        } catch (error) {
          console.error("Error updating mesocycle:", error);
        }
      })();

      return updatedSets;
    });
  };
  return (
    <div>
      <h1 className="text-sm text-gray-500 bg-darkGray pl-4 uppercase">
        {currentMesocycle.name}
      </h1>
      {currentDay ? (
        <div className="mb-4">
          <div className="p-1 text-white bg-darkGray mb-2 flex items-center justify-between">
            <div className="space-x-2 pl-3">
              <span className="font-semibold uppercase">
                Week {week} Day {dayNumber} {getDayLabel(currentDay)}
              </span>{" "}
            </div>
            <FaCalendarAlt
              className="text-white cursor-pointer"
              onClick={openCalendarModal}
            />{" "}
            {/* Calendar icon */}
          </div>
          <ul className="list-disc list-inside text-white bg-darkGray">
            {currentDay.exercises.map((exercise, exIndex) => (
              <li key={exIndex} className="ml-4 overflow-auto ">
                {exercise.exercise}
                {sets[currentDayIndex]?.[exIndex]?.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center space-x-2">
                    <label className="flex-1">
                      WEIGHT
                      <input
                        type="number"
                        value={set.weight || ""}
                        onChange={(e) =>
                          handleWeightChange(
                            currentDayIndex,
                            exIndex,
                            setIndex,
                            e.target.value
                          )
                        }
                        placeholder="KGS"
                        className="border rounded p-1"
                      ></input>
                    </label>
                    <label className="flex-1">
                      REPS
                      <input
                        type="number"
                        value={set.reps || ""}
                        onChange={(e) =>
                          handleRepsChange(
                            currentDayIndex,
                            exIndex,
                            setIndex,
                            e.target.value
                          )
                        }
                        placeholder="3 REPS IN RESERVE"
                        className="border rounded p-1"
                      ></input>
                    </label>
                    <label className=" flex-1">
                      COMPLETED
                      <input
                        type="checkbox"
                        checked={
                          sets[currentDayIndex]?.[exIndex]?.[setIndex]
                            ?.completed || false
                        }
                        onChange={(e) =>
                          handleSetCompletionChange(
                            currentDayIndex,
                            exIndex,
                            setIndex,
                            e.target.checked,
                            sets[currentDayIndex]?.[exIndex]?.[setIndex]
                              ?.weight || "",
                            sets[currentDayIndex]?.[exIndex]?.[setIndex]
                              ?.reps || ""
                          )
                        }
                        className="border rounded p-1"
                      />
                    </label>
                  </div>
                ))}{" "}
                <button
                  onClick={() => addSet(currentDayIndex, exIndex)}
                  className="text-white"
                >
                  ADD SET
                </button>
              </li>
            ))}{" "}
          </ul>
        </div>
      ) : (
        <div className="text-red-500">No current workout found</div>
      )}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onRequestClose={() => setIsCalendarModalOpen(false)}
        mesocycle={currentMesocycle}
        currentDayIndex={currentDayIndex}
        onDayClick={handleDayClick}
      >
        <h2>Mesocycle Overview</h2>
      </CalendarModal>
    </div>
  );
}
