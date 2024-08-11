import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import Modal from "react-modal";
import CalendarModal from "./CalendarModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faEllipsisV,
  faArrowUp,
  faArrowDown,
  faThumbtack,
} from "@fortawesome/free-solid-svg-icons";
import NoteModal from "./NoteModal";

Modal.setAppElement("#root");

export default function CurrentWorkout() {
  const [currentMesocycle, setCurrentMesocycle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);
  const [sets, setSets] = useState({});
  const calendarIconRef = useRef(null);
  const [openMenus, setOpenMenus] = useState({});
  const menuRefs = useRef([]);
  const [openSetMenus, setOpenSetMenus] = useState({});
  const setMenuRefs = useRef([]);
  const [notes, setNotes] = useState({});
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentExercise, setCurrentExercise] = useState(null);
  const baseUrl = process.env.REACT_APP_API_URL;

  const getFirstIncompleteDay = (plan) => {
    for (let i = 0; i < plan.length; i++) {
      const day = plan[i];
      const allExercisesCompleted = day.exercises.every((exercise) => {
        if (!exercise.sets) {
          return false;
        }
        return exercise.sets.every((set) => set.completed);
      });

      if (!allExercisesCompleted) {
        return i;
      }
    }

    return plan.length - 1;
  };
  const handleNoteChange = (newNote) => {
    setCurrentNote(newNote);
  };
  const handleSaveNote = async (applyToFutureWeeks) => {
    if (currentExercise) {
      const { dayIndex, exerciseIndex } = currentExercise;
      const daysPerWeek = currentMesocycle.daysPerWeek;

      setNotes((prevNotes) => {
        const updatedNotes = { ...prevNotes };

        if (applyToFutureWeeks) {
          const currentWeekDay = dayIndex % daysPerWeek;
          for (
            let i = dayIndex;
            i < currentMesocycle.plan.length;
            i += daysPerWeek
          ) {
            if (i % daysPerWeek === currentWeekDay) {
              updatedNotes[i] = updatedNotes[i] || {};
              updatedNotes[i][exerciseIndex] = currentNote;
            }
          }
        } else {
          updatedNotes[dayIndex] = {
            ...updatedNotes[dayIndex],
            [exerciseIndex]: currentNote,
          };
        }

        return updatedNotes;
      });

      const updatedMesocycle = {
        ...currentMesocycle,
        plan: currentMesocycle.plan.map((day, dIndex) =>
          applyToFutureWeeks
            ? dIndex % daysPerWeek === dayIndex % daysPerWeek
              ? {
                  ...day,
                  exercises: day.exercises.map((exercise, eIndex) =>
                    eIndex === exerciseIndex
                      ? {
                          ...exercise,
                          note: currentNote,
                        }
                      : exercise
                  ),
                }
              : day
            : dIndex === dayIndex
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIndex) =>
                  eIndex === exerciseIndex
                    ? {
                        ...exercise,
                        note: currentNote,
                      }
                    : exercise
                ),
              }
            : day
        ),
      };

      try {
        const response = await fetch(
          `${baseUrl}/api/mesocycles/${currentMesocycle.id}`,
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
      } catch (error) {
        console.error("Error updating mesocycle:", error);
      }

      setIsNoteModalOpen(false);
    }
  };

  const toggleSetMeny = useCallback((id) => {
    setOpenSetMenus((prevState) => {
      const newState = {
        ...prevState,
        [id]: !prevState[id],
      };
      return newState;
    });
  }, []);

  const toggleMenu = useCallback((id) => {
    setOpenMenus((prevState) => {
      const newState = {
        ...prevState,
        [id]: !prevState[id],
      };
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      let clickedOutside = true;
      menuRefs.current.forEach((ref) => {
        if (ref && ref.contains(event.target)) {
          clickedOutside = false;
        }
      });
      Object.values(setMenuRefs.current).forEach((ref) => {
        if (ref && ref.contains(event.target)) {
          clickedOutside = false;
        }
      });

      if (clickedOutside) {
        setOpenMenus({});
        setOpenSetMenus({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuRefs]);

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

  const handleWeightChange = (
    dayIndex,
    exerciseIndex,
    setIndex,
    value,
    exerciseType
  ) => {
    const currentWeight = parseFloat(value);
    const incrementSize = exerciseType === "dumbbell" ? 2 : 2.5;

    const { week } = getWeekAndDay(dayIndex, currentMesocycle.daysPerWeek);

    setSets((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) => {
          const applyCurrentWeight =
            sIndex === setIndex || (setIndex === 0 && !set.completed);

          if (applyCurrentWeight) {
            const targetWeight = parseFloat(set.targetWeight);
            const targetReps = parseInt(set.targetReps, 10);

            const incrementDifference =
              (currentWeight - targetWeight) / incrementSize;
            let newReps = targetReps - incrementDifference * 2;

            if (Math.abs(incrementDifference) > 3) {
              if (week <= 2) {
                newReps = "3 RIR";
              } else if (week === 3) {
                newReps = "2 RIR";
              } else if (week >= 4) {
                newReps = "0/1 RIR";
              }
            } else {
              newReps = Math.round(newReps);
            }

            return {
              ...set,
              weight: currentWeight,
              reps: newReps,
              completed: false,
            };
          }
          return set;
        }),
      },
    }));
  };

  const addSet = (dayIndex, exerciseIndex) => {
    const daysPerWeek = currentMesocycle.daysPerWeek;
    setSets((prev) => {
      const updatedSets = { ...prev };

      for (let i = dayIndex; i < Object.keys(prev).length; i += daysPerWeek) {
        updatedSets[i] = {
          ...updatedSets[i],
          [exerciseIndex]: [
            ...(updatedSets[i]?.[exerciseIndex] || []),
            { weight: "", reps: "", completed: false },
          ],
        };
      }
      return updatedSets;
    });
  };

  const removeSet = (dayIndex, exerciseIndex, setIndex) => {
    setSets((prev) => {
      const newSets = [...prev[dayIndex][exerciseIndex]];
      const updatedSets = newSets.filter((_, index) => index !== setIndex);
      return {
        ...prev,
        [dayIndex]: {
          ...prev[dayIndex],
          [exerciseIndex]: updatedSets,
        },
      };
    });
  };

  const openCalendarModal = () => setIsCalendarModalOpen(true);

  useEffect(() => {
    const fetchMesocycle = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/current-workout`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log("Mesocycle Data:", data);
        setCurrentMesocycle(data);

        const firstIncompleteDayIndex = getFirstIncompleteDay(data.plan);
        setCurrentDayIndex(firstIncompleteDayIndex);
        const notesData = {};
        const setsData = {};
        data.plan.forEach((day, dayIndex) => {
          setsData[dayIndex] = {};
          notesData[dayIndex] = {};
          day.exercises.forEach((exercise, exerciseIndex) => {
            setsData[dayIndex][exerciseIndex] = exercise.sets || [];
            notesData[dayIndex][exerciseIndex] = exercise.note || "";
          });
        });
        setNotes(notesData);
        setSets(setsData);
      } catch (error) {
        console.error("Error fetching mesocycles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMesocycle();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDayClick = async (index) => {
    try {
      const response = await fetch(`${baseUrl}/api/current-workout`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      console.log("Updated Mesocycle Data:", data);

      setCurrentMesocycle(data);
      setCurrentDayIndex(index);

      const setsData = {};
      data.plan.forEach((day, dayIndex) => {
        setsData[dayIndex] = {};
        day.exercises.forEach((exercise, exerciseIndex) => {
          setsData[dayIndex][exerciseIndex] = exercise.sets || [];
        });
      });
      setSets(setsData);

      setIsCalendarModalOpen(false);
    } catch (error) {
      console.error("Error fetching workout data:", error);
    }
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
    // Updating sets locally
    setSets((prev) => {
      const updatedSets = {
        ...prev,
        [dayIndex]: {
          ...prev[dayIndex],
          [exerciseIndex]: prev[dayIndex][exerciseIndex].map((set, sIndex) => {
            if (sIndex === setIndex) {
              if (!value) {
                return {
                  ...set,
                  completed: false,
                  weight: set.targetWeight,
                  reps: set.targetReps,
                };
              }

              return {
                ...set,
                completed: value,
                weight: weightValue,
                reps: repsValue,
              };
            }
            return set;
          }),
        },
      };

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

      const changes = getChanges(currentMesocycle.plan, updatedMesocycle.plan);

      (async () => {
        try {
          const response = await fetch(
            `${baseUrl}/api/mesocycles/${currentMesocycle.id}`,
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

  function getChanges(currentPlan, updatedPlan) {
    const changes = [];

    updatedPlan.forEach((day, dayIndex) => {
      day.exercises.forEach((exercise, exerciseIndex) => {
        exercise.sets.forEach((set, setIndex) => {
          const currentSet =
            currentPlan[dayIndex].exercises[exerciseIndex].sets[setIndex];
          if (
            currentSet.weight !== set.weight ||
            currentSet.reps !== set.reps ||
            currentSet.completed !== set.completed
          ) {
            changes.push({
              dayIndex,
              exerciseIndex,
              setIndex,
              changes: {
                weight: { from: currentSet.weight, to: set.weight },
                reps: { from: currentSet.reps, to: set.reps },
                completed: { from: currentSet.completed, to: set.completed },
              },
            });
          }
        });
      });
    });

    return changes;
  }

  const repRange = [];
  for (let i = 1; i <= 30; i++) {
    repRange.push(i);
  }

  const dumbbellWeights = [];
  for (let weight = 2; weight < 100; weight += 2) {
    dumbbellWeights.push(weight);
  }

  const barbellWeights = [];
  for (let weight = 2.5; weight <= 400; weight += 2.5) {
    barbellWeights.push(weight);
  }
  const getPerformanceStatus = (
    set,
    exerciseType,
    dayIndex,
    weekIndex,
    setIndex,
    exerciseIndex
  ) => {
    if (weekIndex === 1) {
      return "noEvaluation";
    }
    const incrementSize = exerciseType === "dumbbell" ? 2 : 2.5;
    const targetWeight = parseFloat(set.targetWeight);
    const targetReps = parseInt(set.targetReps, 10);
    const currentWeight = parseFloat(set.weight);
    const currentReps = parseInt(set.reps, 10);

    const weightDifference = currentWeight - targetWeight;
    const maxIncrementDeviation = 3 * incrementSize;

    const incrementDifference = weightDifference / incrementSize;
    const adjustedReps = targetReps - incrementDifference * 2;
    const roundedAdjustedReps = Math.round(adjustedReps);

    const isWeightInRange = Math.abs(weightDifference) <= maxIncrementDeviation;
    const isRepsInRange = currentReps >= roundedAdjustedReps;

    if (isWeightInRange && currentReps === roundedAdjustedReps) {
      return "target";
    } else if (isWeightInRange && currentReps > roundedAdjustedReps) {
      return "above";
    } else if (!isWeightInRange || currentReps < roundedAdjustedReps) {
      return "below";
    } else {
      return "offTarget";
    }
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
                {week === currentMesocycle.weeks
                  ? "DELOAD WEEK"
                  : `Week ${week} Day ${dayNumber} ${getDayLabel(currentDay)}`}
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
                  <div
                    className="flex justify-between items-center relative"
                    ref={(el) => (menuRefs.current[exIndex] = el)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white border uppercase border-red-500 bg-darkBackgroundRed inline-block w-auto px-2 py-1">
                        {exercise.muscleGroup}
                      </span>
                      <span className="text-sm text-gray-500 uppercase">
                        {exercise.priority || "none"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        toggleMenu(exIndex);
                      }}
                      className="text-white focus:outline-none "
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>
                    {openMenus[exIndex] && (
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg z-10">
                        <ul className="py-1 bg-hamburgerbackground ">
                          <li className="block px-4 py-2 hover:!bg-darkestGray">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();

                                setCurrentExercise({
                                  dayIndex: currentDayIndex,
                                  exerciseIndex: exIndex,
                                });
                                const currentNoteText =
                                  notes[currentDayIndex]?.[exIndex] || "";
                                setCurrentNote(currentNoteText);

                                setIsNoteModalOpen(true);
                              }}
                              className=" block text-white focus:outline-none "
                            >
                              Add note
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-white font-semibold">
                    {exercise.exercise}
                  </div>
                  {notes[currentDayIndex]?.[exIndex] && (
                    <div className="mt-2 bg-yellow-500 text-white p-2">
                      <FontAwesomeIcon
                        icon={faThumbtack}
                        style={{ marginRight: "10px" }}
                      />
                      {notes[currentDayIndex][exIndex]}
                    </div>
                  )}
                  {sets[currentDayIndex]?.[exIndex]?.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="flex flex-row items-stretch items-center space-y-0 mb-4 border-b border-gray-600 pb-2"
                    >
                      <div className="relative ">
                        <button
                          onClick={() => {
                            toggleSetMeny(`${exIndex}-${setIndex}`);
                          }}
                          className="text-white focus:outline-none mt-8 "
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>

                        {openSetMenus[`${exIndex}-${setIndex}`] && (
                          <div
                            ref={(el) =>
                              (setMenuRefs.current[`${exIndex}-${setIndex}`] =
                                el)
                            }
                            className="absolute left-full ml-1 top-5 w-48 bg-white rounded-md shadow-lg z-10"
                          >
                            <ul className="py-1 bg-hamburgerbackground text-white ">
                              <li className="block px-4 py-2 hover:!bg-darkestGray z-20">
                                <button
                                  onClick={(event) => {
                                    console.log(
                                      "Button clicked for adding set"
                                    );
                                    event.stopPropagation();
                                    addSet(currentDayIndex, exIndex);
                                  }}
                                  className=" focus:outline-none block w-full text-left cursor-pointer"
                                >
                                  ADD SET
                                </button>
                              </li>
                              <li className="block px-4 py-2 hover:bg-darkGray">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeSet(
                                      currentDayIndex,
                                      exIndex,
                                      setIndex
                                    );
                                  }}
                                  className=" focus:outline-none block w-full text-left cursor-pointer"
                                >
                                  REMOVE SET
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center space-y-1 flex-grow">
                        <label className="text-center h-6 flex items-center justify-center">
                          WEIGHT
                        </label>
                        <select
                          value={set.weight || set.targetWeight || ""}
                          onChange={(e) => {
                            console.log(
                              `Exercise type before change: ${exercise.type}`
                            ); // Log exercise type before handling weight change
                            handleWeightChange(
                              currentDayIndex,
                              exIndex,
                              setIndex,
                              e.target.value,
                              exercise.type
                            );
                          }}
                          className="bg-inputBGGray text-center border-black w-20 rounded p-1"
                        >
                          <option value={"Choose weight"} />
                          {exercise.type === "dumbbell"
                            ? dumbbellWeights.map((weight) => (
                                <option key={weight} value={weight}>
                                  {weight}
                                </option>
                              ))
                            : barbellWeights.map((weight) => (
                                <option key={weight} value={weight}>
                                  {weight}
                                </option>
                              ))}
                        </select>
                      </div>
                      <div className="flex flex-col items-center space-y-1 flex-grow relative">
                        <label className="text-center h-6 flex items-center justify-center ">
                          REPS
                        </label>
                        <select
                          value={
                            typeof set.reps === "string"
                              ? set.reps
                              : set.reps ||
                                (!set.completed && set.targetReps) ||
                                ""
                          }
                          onChange={(e) =>
                            handleRepsChange(
                              currentDayIndex,
                              exIndex,
                              setIndex,
                              e.target.value
                            )
                          }
                          className="bg-inputBGGray text-center border-black w-full rounded p-1"
                        >
                          {repRange.map((reps) => (
                            <option key={reps} value={reps}>
                              {reps}
                            </option>
                          ))}
                          {week <= 2 && (
                            <option value="3 RIR" disabled>
                              3 RIR
                            </option>
                          )}
                          {week === 3 && (
                            <option value="2 RIR" disabled>
                              2 RIR
                            </option>
                          )}
                          {week >= 4 && (
                            <option value="0/1 RIR" disabled>
                              0/1 RIR
                            </option>
                          )}
                        </select>
                      </div>
                      <div className="flex items-center justify-center ml-2 relative">
                        {(() => {
                          const { week: weekIndex } = getWeekAndDay(
                            currentDayIndex,
                            currentMesocycle.daysPerWeek
                          );
                          const status = getPerformanceStatus(
                            set,
                            exercise.type,
                            currentDayIndex,
                            weekIndex,
                            setIndex,
                            exIndex
                          );

                          const iconStyles = {
                            top: "50%",
                            transform: "translateY(-10%)",
                          };
                          if (status === "noEvaluation") {
                            return null;
                          }
                          if (status === "target") {
                            return (
                              <FontAwesomeIcon
                                icon={faBullseye}
                                className=" mt-2 ml-0 text-white-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                style={iconStyles}
                              />
                            );
                          } else if (status === "above") {
                            return (
                              <FontAwesomeIcon
                                icon={faArrowUp}
                                className=" mt-2 ml-0 text-white-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                style={iconStyles}
                              />
                            );
                          } else if (status === "below") {
                            return (
                              <FontAwesomeIcon
                                icon={faArrowDown}
                                className="mt-2 ml-0text-white-500 absolute  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                style={iconStyles}
                              />
                            );
                          }
                          return null;
                        })()}
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
                          className="scale-125"
                          style={{
                            width: "20px",
                            height: "20px",
                            marginTop: "10px",
                          }}
                        />
                      </div>
                    </div>
                  ))}{" "}
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
      <NoteModal
        isOpen={isNoteModalOpen}
        onRequestClose={() => setIsNoteModalOpen(false)}
        note={currentNote}
        onNoteChange={handleNoteChange}
        onSave={handleSaveNote}
      />
    </div>
  );
}
