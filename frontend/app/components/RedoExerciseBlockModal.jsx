import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import MesocycleDetailsModal from "./MesocycleDetailsModal";
import { getCookie } from "../utils/cookies";
import { useNavigate } from "@remix-run/react";

Modal.setAppElement("#root");

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
        const response = await fetch(`${baseUrl}/csrf-token`, {
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
  }, []);

  useEffect(() => {
    console.log("Exercise Block Data:", exerciseBlock);
  }, [exerciseBlock]);

  if (!exerciseBlock || !Array.isArray(exerciseBlock.plan)) {
    console.error("Invalid exercise block data:", exerciseBlock);
    return null;
  }

  // Gruppér treningsdagene i uker basert på `daysPerWeek`
  const groupedWeeks = [];
  for (
    let i = 0;
    i < exerciseBlock.plan.length;
    i += exerciseBlock.daysPerWeek
  ) {
    const week = exerciseBlock.plan.slice(i, i + exerciseBlock.daysPerWeek);
    groupedWeeks.push(week);
  }

  const handleSave = () => {
    try {
      if (wantToUsePreviousWeekAsBase && weekAsTarget !== null) {
        const newExerciseBlock = {
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
                    console.error(`Invalid target day at index ${dayIndex}`);
                    return day;
                  }

                  return {
                    ...day,
                    isCompleted: false,
                    exercises: day.exercises.map((exercise, exerciseIndex) => {
                      const targetExercise = targetDay.exercises[exerciseIndex];
                      if (!targetExercise) {
                        console.error(
                          `Invalid target exercise at index ${exerciseIndex}`
                        );
                        return exercise;
                      }

                      return {
                        ...exercise,
                        sets: exercise.sets.map((set, setIndex) => {
                          const targetSet = targetExercise.sets[setIndex];
                          if (!targetSet) {
                            console.error(
                              `Invalid target set at index ${setIndex}`
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
              } else {
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
              }
            })
            .flat(),
        };

        console.log("New exercise block ready to save:", newExerciseBlock);
        // Lagre newExerciseBlock i state for å bruke i handleSaveMesocycleDetails
        setNewExerciseBlock(newExerciseBlock);
        setIsDetailsModalOpen(true);
      } else {
        onRequestClose();
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  // Bruk newExerciseBlock i handleSaveMesocycleDetails for å sende riktig data til backend
  const handleSaveMesocycleDetails = async () => {
    if (mesocycleName && numberOfWeeks) {
      // Bruk newExerciseBlock som inneholder de oppdaterte ukene
      const mesocycleData = {
        name: mesocycleName,
        weeks: numberOfWeeks,
        daysPerWeek: exerciseBlock.daysPerWeek,
        plan: newExerciseBlock.plan, // Bruker den oppdaterte treningsplanen
        completedDate: null,
        isCurrent: true,
      };

      try {
        const token = getCookie("token");
        console.log("Retrieved token:", token);

        const response = await fetch(`${baseUrl}/mesocycles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(mesocycleData),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        console.log("Mesocycle created:", result);

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
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Redo Exerciseblock"
        className="relative bg-darkGray text-white rounded focus:outline-none shadow-lg p-0 max-w-3xl mx-auto mt-20 text-2sm"
        overlayClassName="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50"
      >
        <button
          onClick={onRequestClose}
          className="absolute top-0 right-2 m-0 text-3xl text-white-600 hover:text-gray-800"
        >
          &times;
        </button>
        <header className="bold text-2xl mb-4 mt-2 border-b-1 border-inputBGGray">
          Want to do the training block again?
        </header>
        {exerciseBlock && (
          <div className="flex flex-col h-[60vh]">
            <header className="bold text-2xl mb-4 mt-2 border-b-1 border-inputBGGray p-2">
              {exerciseBlock.name}
            </header>
            <input
              type="checkbox"
              checked={wantToUsePreviousWeekAsBase}
              onChange={(e) => setWantToUsePreviousWeekAsBase(e.target.checked)}
              className="scale-125"
              style={{
                width: "20px",
                height: "20px",
                marginTop: "10px",
                marginLeft: "160px",
                marginRight: "10px",
                marginBottom: "20px",
              }}
            />
            <label>
              Use a previous done week to get target reps and weights for first
              week
            </label>
            {wantToUsePreviousWeekAsBase && (
              <div className="flex-1 overflow-y-auto p-2">
                <label htmlFor="week-select">
                  Select week to use as target:
                </label>
                <select
                  id="week-select"
                  value={weekAsTarget}
                  onChange={(e) => setWeekAsTarget(parseInt(e.target.value))}
                  className="bg-darkestGray text-white border border-gray-600 p-2 rounded w-full"
                >
                  <option value={null} disabled>
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
        )}
      </Modal>

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
