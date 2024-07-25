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
    setIsCalendarModalOpen(false); // Lukk modalen når en dag blir klikket
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

  return (
    <div>
      <h1 className="text-sm text-gray-500 bg-gray-200 pl-4 uppercase">
        {currentMesocycle.name}
      </h1>
      {currentDay ? (
        <div className="mb-4">
          <div className="p-1 bg-gray-200 rounded mb-2 flex items-center justify-between">
            <div className="space-x-2 pl-3">
              <span className="font-semibold uppercase">
                Week {week} Day {dayNumber} {getDayLabel(currentDay)}
              </span>{" "}
            </div>
            <FaCalendarAlt
              className="text-gray-500 cursor-pointer"
              onClick={openCalendarModal}
            />{" "}
            {/* Calendar icon */}
          </div>
          <ul className="list-disc list-inside">
            {currentDay.exercises.map((exercise, exIndex) => (
              <li key={exIndex} className="ml-4">
                {exercise.exercise}
              </li>
            ))}
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
