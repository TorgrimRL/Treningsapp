import { useEffect, useState, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import Modal from "react-modal";
import CalendarModal from "./CalendarModal";

Modal.setAppElement("#root");

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
  const calendarIconRef = useRef(null);

  const handleRepsChange = (dayIndex, exerciseIndex, setIndex, value) => {
    setSets((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) =>
          sIndex === setIndex ? { ...set, reps: value, completed: false } : set
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
          setIndex === 0
            ? { ...set, weight: value, completed: false }
            : sIndex === setIndex
            ? { ...set, weight: value, completed: false }
            : set
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
    <div className="pt-6">
      <h1 className="text-sm text-gray-500 bg-darkGray sticky top-12 pl-4 uppercase">
        {currentMesocycle.name}
      </h1>
      {currentDay ? (
        <div className="mb-4">
          <div className="p-1 text-white bg-darkGray mb-1 flex items-center justify-between sticky top-16 ">
            <div className="space-x-2 pl-3 mr-auto">
              <span className="font-semibold uppercase">
                Week {week} Day {dayNumber} {getDayLabel(currentDay)}
              </span>{" "}
            </div>
            <FaCalendarAlt
              className="text-white cursor-pointer text-xl -ml-4"
              onClick={openCalendarModal}
              style={{ transform: "translateX(-10px)" }}
            />{" "}
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-150px)] ">
            <ul className="list-none list-inside text-white ">
              {currentDay.exercises.map((exercise, exIndex) => (
                <li key={exIndex} className="p-3 overflow-auto bg-darkGray">
                  <div className="flex flex-col items-start">
                    <div className=" flex flex-row flex items-center">
                      <span className="text-sm text-white border uppercase border-red-500 bg-darkBackgroundRed inline-block w-auto px-2 py-1 ">
                        {exercise.muscleGroup}
                      </span>

                      <span className="text-sm text-gray-500 uppercase pl-2 ">
                        {exercise.priority || "none"}
                      </span>
                    </div>
                    <span className="font-semibold">{exercise.exercise}</span>
                  </div>
                  {sets[currentDayIndex]?.[exIndex]?.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="flex flex-row items-stretch items-center space-y-0 mb-4 border-b border-gray-600 pb-2"
                    >
                      <div className="flex flex-col items-center space-y-1 flex-grow">
                        <label className="text-center h-6 flex items-center justify-center">
                          WEIGHT
                        </label>
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
                          className="bg-inputBGGray text-center border-black w-20 rounded p-1"
                          style={{
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        ></input>
                      </div>
                      <div className="flex flex-col items-center space-y-1 flex-grow">
                        <label className="text-center h-6 flex items-center justify-center ">
                          REPS
                        </label>
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
                          className="bg-inputBGGray text-center border-black w-20 rounded p-1"
                          style={{
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        ></input>
                      </div>
                      <div className="flex flex-col items-center space-y-1 flex-grow">
                        <label className="text-center h-6 flex items-center justify-center">
                          LOG
                        </label>
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
                          className="border rounded p-1 scale-125 text-green-500 focus:ring-green-500 checked:bg-green-500 checked:text-white"
                          style={{
                            width: "20px",
                            height: "20px",
                            marginTop: "10px",
                          }}
                        />
                      </div>
                    </div>
                  ))}{" "}
                  <button
                    onClick={() => addSet(currentDayIndex, exIndex)}
                    className="text-white focus:outline-none"
                  >
                    ADD SET
                  </button>
                </li>
              ))}{" "}
            </ul>
          </div>
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
        calendarIconRef={calendarIconRef}
      >
        <h2>Mesocycle Overview</h2>
      </CalendarModal>
    </div>
  );
}
