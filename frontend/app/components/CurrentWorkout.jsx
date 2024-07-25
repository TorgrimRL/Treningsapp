import { useEffect, useState } from "react";

export default function CurrentWorkout() {
  const [currentMesocycle, setCurrentMesocycle] = useState([]);

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
        setCurrentMesocycle(data);
      } catch (error) {
        console.error("Error fetchign mesocycles", error);
      }
    };
    fetchMesocycle();
  }, []);
  const firstDay = currentMesocycle.plan && currentMesocycle.plan[0];

  return (
    <div>
      <h1>Current Workout</h1>
      {firstDay ? (
        <div>
          <h3>{firstDay.label}</h3>
          <ul>
            {firstDay.exercises.map((exercise, exIndex) => (
              <li key={exIndex}>{exercise.exercise}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>No days found in current workout</div>
      )}
    </div>
  );
}
