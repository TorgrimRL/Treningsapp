import { useState, useEffect } from "react";
import MesocycleDetailsModal from "./MesocycleDetailsModal";
import { getCookie } from "../utils/cookies";
import { useNavigate } from "@remix-run/react";
import AppModal from "./AppModal";

const RedoExerciseBlockModal = ({ isOpen, onRequestClose, exerciseBlock }) => {
  const [weekAsTarget, setWeekAsTarget] = useState(null);
  const [wantToUsePreviousWeekAsBase, setWantToUsePreviousWeekAsBase] =
    useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [mesocycleName, setMesocycleName] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState("");
  const [csrfToken, setCSRFToken] = useState("");
  const [newExerciseBlock, setNewExerciseBlock] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(baseUrl + "/csrf-token", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setCSRFToken(data.csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, [baseUrl]);

  if (!exerciseBlock || !Array.isArray(exerciseBlock.plan)) {
    console.error("Invalid exercise block data:", exerciseBlock);
    return null;
  }

  const groupedWeeks = [];
  for (
    let index = 0;
    index < exerciseBlock.plan.length;
    index += exerciseBlock.daysPerWeek
  ) {
    const week = exerciseBlock.plan.slice(index, index + exerciseBlock.daysPerWeek);
    groupedWeeks.push(week);
  }

  const handleSave = () => {
    try {
      if (wantToUsePreviousWeekAsBase && weekAsTarget !== null) {
        const nextExerciseBlock = {
          ...exerciseBlock,
          plan: groupedWeeks
            .map((week, weekIndex) => {
              if (weekIndex === 0) {
                const targetWeek = groupedWeeks[weekAsTarget];
                if (!targetWeek) {
                  console.error("Invalid target week selected");
                  return week;
                }

                return week.map((day, dayIndex) => {
                  const targetDay = targetWeek[dayIndex];
                  if (!targetDay) {
                    console.error("Invalid target day at index " + dayIndex);
                    return day;
                  }

                  return {
                    ...day,
                    isCompleted: false,
                    exercises: day.exercises.map((exercise, exerciseIndex) => {
                      const targetExercise = targetDay.exercises[exerciseIndex];
                      if (!targetExercise) {
                        console.error(
                          "Invalid target exercise at index " + exerciseIndex
                        );
                        return exercise;
                      }

                      return {
                        ...exercise,
                        sets: exercise.sets.map((set, setIndex) => {
                          const targetSet = targetExercise.sets[setIndex];
                          if (!targetSet) {
                            console.error(
                              "Invalid target set at index " + setIndex
                            );
                            return set;
                          }

                          return {
                            ...set,
                            targetWeight: parseFloat(targetSet.weight),
                            targetReps: parseInt(targetSet.reps, 10),
                            completed: false,
                            weight: 0,
                            reps: 0,
                          };
                        }),
                      };
                    }),
                  };
                });
              }

              return week.map((day) => ({
                ...day,
                isCompleted: false,
                exercises: day.exercises.map((exercise) => ({
                  ...exercise,
                  sets: exercise.sets.map((set) => ({
                    ...set,
                    targetWeight: 0,
                    targetReps: 0,
                    completed: false,
                    weight: 0,
                    reps: 0,
                  })),
                })),
              }));
            })
            .flat(),
        };

        setNewExerciseBlock(nextExerciseBlock);
        setIsDetailsModalOpen(true);
      } else {
        onRequestClose();
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  const handleSaveMesocycleDetails = async () => {
    if (mesocycleName && numberOfWeeks) {
      const mesocycleData = {
        name: mesocycleName,
        weeks: numberOfWeeks,
        daysPerWeek: exerciseBlock.daysPerWeek,
        plan: newExerciseBlock.plan,
        completedDate: null,
        isCurrent: true,
      };

      try {
        const token = getCookie("token");

        const response = await fetch(baseUrl + "/mesocycles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
            Authorization: "Bearer " + token,
          },
          credentials: "include",
          body: JSON.stringify(mesocycleData),
        });

        if (!response.ok) {
          console.error("Network response was not ok");
          return;
        }

        await response.json();

        setIsDetailsModalOpen(false);
        onRequestClose();
        navigate("/currentworkout");
      } catch (error) {
        console.error("There was a problem with the fetch operation", error);
      }
    }
  };

  return (
    <>
      <AppModal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Redo Exerciseblock"
        title="Want to do the training block again?"
      >
        <div className="flex flex-col">
          <header className="bold text-2xl mb-4 mt-2 border-b border-inputBGGray p-2">
            {exerciseBlock.name}
          </header>
          <label
            htmlFor="use-previous-week-as-base"
            className="flex items-center gap-3 mb-4"
          >
            <input
              id="use-previous-week-as-base"
              type="checkbox"
              checked={wantToUsePreviousWeekAsBase}
              onChange={(e) => setWantToUsePreviousWeekAsBase(e.target.checked)}
              className="scale-125"
              style={{ width: "20px", height: "20px" }}
            />
            <span>
              Use a previous done week to get target reps and weights for first
              week
            </span>
          </label>
          {wantToUsePreviousWeekAsBase && (
            <div className="p-2">
              <label htmlFor="week-select">Select week to use as target:</label>
              <select
                id="week-select"
                value={weekAsTarget ?? ""}
                onChange={(e) => setWeekAsTarget(parseInt(e.target.value, 10))}
                className="bg-darkestGray text-white border border-gray-600 p-2 rounded w-full"
              >
                <option value="" disabled>
                  Select a week
                </option>
                {groupedWeeks.map((_, weekIndex) => (
                  <option key={weekIndex} value={weekIndex}>
                    Week {weekIndex + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-center mt-4 mb-4">
            <button
              onClick={handleSave}
              className="flex items-center justify-center bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
            >
              Save
            </button>
          </div>
        </div>
      </AppModal>

      <MesocycleDetailsModal
        isOpen={isDetailsModalOpen}
        onRequestClose={() => setIsDetailsModalOpen(false)}
        onSave={handleSaveMesocycleDetails}
        mesocycleName={mesocycleName}
        setMesocycleName={setMesocycleName}
        numberOfWeeks={numberOfWeeks}
        setNumberOfWeeks={setNumberOfWeeks}
      />
    </>
  );
};

export default RedoExerciseBlockModal;
