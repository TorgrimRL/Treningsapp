import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PageContainer from "../../components/PageContainer";
import ProtectedRoute from "../../components/ProtectedRoute";
import DropsetModal from "../../components/DropsetModal";
import OnboardingProgress from "./OnboardingProgress";
import { exerciseTypes, exercises, muscleGroups, normalizeProgressionSettings } from "../../constants/constants";
import { useApiFetch } from "../../utils/apiFetch";
import { useAuth } from "../../utils/AuthContext";
import { clearCurrentWorkoutQuery } from "../../utils/currentWorkoutQuery";
import { useQueryClient } from "@tanstack/react-query";
import {
  DROPSET_DROP_PERCENT,
  DROPSET_REP_TARGET_POLICY,
  buildDropsetSets,
  generateDropsetWeights,
} from "../../utils/dropsets";

const inputClass =
  "min-h-11 w-full rounded-lg border border-gray-600 bg-darkestGray px-3 py-2 text-base text-white tabular-nums outline-none transition-colors focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/40 aria-[invalid=true]:border-red-500";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-600 bg-darkGray px-5 py-3 font-semibold text-gray-100 transition-colors hover:border-gray-400 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 active:scale-[0.96]";

const builtInExercises = Object.entries(exercises).flatMap(([muscleGroup, list]) =>
  list.map((exercise) => ({ ...exercise, muscleGroup }))
);

function emptySet() {
  return { weight: "", reps: "", completed: false };
}

function emptyDay(index) {
  return { label: `Day ${index + 1}`, finished: false, exercises: [] };
}

function validSet(set) {
  const weight = Number(set.weight);
  const reps = Number(set.reps);
  return set.completed === true && Number.isFinite(weight) && weight >= 0 &&
    Number.isInteger(reps) && reps >= 1 && reps <= 30;
}

function dayHasCompletedSet(day) {
  return day.exercises.some((exercise) => exercise.sets.some(validSet));
}

function ChoiceGrid({ label, name, options, value, onChange, invalid = false }) {
  return (
    <fieldset aria-invalid={invalid} className="min-w-0">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <label key={option} className="relative min-w-0 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
            />
            <span className="flex min-h-11 items-center justify-center rounded-lg border border-gray-600 bg-darkestGray px-2 py-2 text-center text-sm font-medium capitalize text-gray-200 transition-colors peer-checked:border-red-500 peer-checked:bg-red-600/15 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red-400">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function readLocalDraft(id) {
  try {
    return JSON.parse(localStorage.getItem(`onboarding-draft-${id}`) || "null");
  } catch {
    return null;
  }
}

function ExerciseChooser({
  catalog,
  description = "Search for it, then a new set will be ready to log.",
  eyebrow = "Exercise search",
  headingLevel = "h1",
  onChoose,
  onCancel,
  title = "What exercise are you doing first?",
}) {
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [type, setType] = useState("barbell");
  const normalizedSearch = search.trim().toLowerCase();
  const matches = normalizedSearch
    ? catalog.filter((item) => item.name.toLowerCase().includes(normalizedSearch)).slice(0, 8)
    : [];
  const exactMatch = catalog.some(
    (item) => item.name.toLowerCase() === normalizedSearch
  );
  const Heading = headingLevel;

  return (
    <section aria-labelledby="exercise-heading" className="rounded-2xl bg-darkGray p-4 shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-400">{eyebrow}</p>
      <Heading id="exercise-heading" className="mt-2 text-balance text-2xl font-bold sm:text-3xl">
        {title}
      </Heading>
      <p className="mt-2 text-pretty text-gray-300">{description}</p>
      <label className="mt-6 block text-sm font-semibold" htmlFor="exercise-search">Exercise</label>
      <input
        id="exercise-search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="e.g. High Bar Squat"
        className={`${inputClass} mt-2`}
        autoComplete="off"
      />
      {matches.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-gray-700 bg-darkestGray">
          {matches.map((item) => (
            <li key={`${item.muscleGroup}-${item.type}-${item.name}`}>
              <button
                type="button"
                onClick={() => onChoose(item)}
                className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-red-400"
              >
                <span>{item.name}</span>
                <span className="text-sm text-gray-400">{item.muscleGroup}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {normalizedSearch && !exactMatch && (
        <div className="mt-5">
          <p className="rounded-lg border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm text-gray-200">
            Can’t find the right exercise? Add “{search.trim()}” to your exercise library below.
          </p>
          <div className="mt-3 rounded-xl border border-gray-700 p-4">
          <p className="font-semibold">Add “{search.trim()}”</p>
          <p className="mt-1 text-sm text-gray-400">We only need its muscle group. Equipment defaults to barbell.</p>
          <div className="mt-4 grid gap-5">
            <ChoiceGrid
              label="Muscle group"
              name="custom-exercise-muscle-group"
              options={muscleGroups}
              value={muscleGroup}
              onChange={setMuscleGroup}
              invalid={!muscleGroup}
            />
            <ChoiceGrid
              label="Equipment (optional)"
              name="custom-exercise-equipment"
              options={exerciseTypes}
              value={type}
              onChange={setType}
            />
          </div>
          {!muscleGroup && <p className="mt-3 text-sm text-red-300">Choose a muscle group to add this exercise.</p>}
          <button type="button" disabled={!muscleGroup} onClick={() => onChoose({ name: search.trim(), muscleGroup, type, isCustom: true })} className={`${primaryButton} mt-4`}>
            Add custom exercise
          </button>
          </div>
        </div>
      )}
      {onCancel && <button type="button" onClick={onCancel} className="mt-4 min-h-11 px-2 text-sm text-gray-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">Cancel</button>}
    </section>
  );
}

function Welcome({ onStart, onSkip, busy, initialPlanChoice = null }) {
  const [planChoice, setPlanChoice] = useState(initialPlanChoice);
  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-darkGray p-5 shadow-[0_16px_50px_rgba(0,0,0,0.32)] sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-400">Welcome to SetOptimizer</p>
      <h1 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">Do you already have a training plan?</h1>
      <p className="mt-3 max-w-xl text-pretty text-gray-300">Your answer decides how we set up your first week. We won’t ask for goals or training days before you start.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={busy} onClick={() => setPlanChoice("has-plan")} className={planChoice === "has-plan" ? primaryButton : secondaryButton} aria-pressed={planChoice === "has-plan"}>Yes, I have a plan</button>
        <button type="button" disabled={busy} onClick={() => setPlanChoice("needs-plan")} className={planChoice === "needs-plan" ? primaryButton : secondaryButton} aria-pressed={planChoice === "needs-plan"}>No, I need a plan</button>
      </div>
      {planChoice === "has-plan" && (
        <div className="mt-4 rounded-xl border border-gray-700 bg-darkestGray p-4">
          <p className="font-semibold">Use the plan you already have</p>
          <p className="mt-1 text-sm text-gray-400">Build it as you go by logging the exercises in front of you, or import the complete plan now.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" disabled={busy} onClick={() => onStart("discovery")} className={primaryButton}>Log it as I train</button>
            <button type="button" onClick={() => onStart("import")} className={secondaryButton}>Paste or import CSV</button>
          </div>
        </div>
      )}
      {planChoice === "needs-plan" && (
        <div className="mt-4 rounded-xl border border-gray-700 bg-darkestGray p-4">
          <p className="font-semibold">Start from a proven structure</p>
          <p className="mt-1 text-sm text-gray-400">Choose a template, then adjust its exercises and training days before activating it.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" disabled={busy} onClick={() => onStart("template")} className={primaryButton}>Choose a template</button>
            <button type="button" onClick={() => onStart("scratch")} className={secondaryButton}>Build manually</button>
          </div>
        </div>
      )}
      <div className="mt-6 flex items-center text-sm">
        <button type="button" onClick={onSkip} className="min-h-11 text-gray-400 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">Skip for now</button>
      </div>
    </section>
  );
}

function TrainingDay({ day, dayIndex, onChange, onAddExercise, onConfigureDropset, onFinish, error }) {
  const [completionErrors, setCompletionErrors] = useState({});
  const updateExercise = (exerciseIndex, updater) => {
    const exercises = day.exercises.map((exercise, index) => index === exerciseIndex ? updater(exercise) : exercise);
    onChange({ ...day, exercises });
  };
  const updateWeight = (exerciseIndex, setIndex, value) => {
    setCompletionErrors((current) => ({ ...current, [`${exerciseIndex}-${setIndex}`]: false }));
    updateExercise(exerciseIndex, (current) => {
      const directlyUpdatedSets = current.sets.map((item, index) =>
        index === setIndex
          ? { ...item, weight: value, completed: item.completed && Number(value) >= 0 }
          : item
      );
      if (!current.dropset?.enabled || setIndex !== 0) {
        return { ...current, sets: directlyUpdatedSets };
      }
      const { weightIncrement, minimumWeight } = normalizeProgressionSettings(current);
      const { weights, error: dropsetError } = generateDropsetWeights({
        startWeight: value,
        setCount: current.dropset.setCount,
        increment: weightIncrement,
        minimumWeight,
        dropPercent: DROPSET_DROP_PERCENT,
      });
      if (dropsetError) {
        return {
          ...current,
          dropset: { ...current.dropset, startWeight: value },
          sets: directlyUpdatedSets,
        };
      }
      return {
        ...current,
        dropset: { ...current.dropset, startWeight: Number(value) },
        sets: directlyUpdatedSets.map((set, index) =>
          index > 0 && set.completed
            ? set
            : { ...set, weight: weights[index], targetWeight: weights[index], completed: false }
        ),
      };
    });
  };
  return (
    <section aria-labelledby="day-heading" className="rounded-2xl bg-darkGray p-4 shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-400">Your baseline week</p>
          <h1 id="day-heading" className="mt-1 text-balance text-2xl font-bold">{day.label || `Day ${dayIndex + 1}`}</h1>
        </div>
        <p className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">No targets · just log</p>
      </div>
      <div className="mt-6 space-y-5">
        {day.exercises.map((exercise, exerciseIndex) => (
          <article key={`${exercise.exercise}-${exerciseIndex}`} className="rounded-xl border border-gray-700 bg-darkestGray p-4">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="font-semibold">{exercise.exercise}</h2><p className="text-sm text-gray-400">{exercise.muscleGroup} · {exercise.type}</p></div>
              <button type="button" aria-label={`Remove ${exercise.exercise}`} onClick={() => onChange({ ...day, exercises: day.exercises.filter((_, index) => index !== exerciseIndex) })} className="min-h-11 px-3 text-sm text-gray-300 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">Remove</button>
            </div>
            <div className="mt-4 space-y-3">
              {exercise.sets.map((set, setIndex) => {
                const setKey = `${exerciseIndex}-${setIndex}`;
                const completionErrorId = `baseline-set-error-${dayIndex}-${exerciseIndex}-${setIndex}`;
                const setIsInvalid = (set.completed && !validSet(set)) || completionErrors[setKey];
                return (
                  <div key={setIndex} className="grid grid-cols-[2rem_1fr_1fr_3rem] items-end gap-2 sm:grid-cols-[3rem_1fr_1fr_7rem_3rem]">
                    <span className="pb-3 text-center text-sm tabular-nums text-gray-400">{setIndex + 1}</span>
                    <label className="text-xs font-semibold text-gray-300">Weight<input inputMode="decimal" aria-invalid={setIsInvalid} value={set.weight} onChange={(event) => updateWeight(exerciseIndex, setIndex, event.target.value)} className={`${inputClass} mt-1`} /></label>
                    <label className="text-xs font-semibold text-gray-300">Reps<input inputMode="numeric" placeholder="1–30" aria-invalid={setIsInvalid} aria-describedby={completionErrors[setKey] ? completionErrorId : undefined} value={set.reps} onChange={(event) => {
                      setCompletionErrors((current) => ({ ...current, [setKey]: false }));
                      updateExercise(exerciseIndex, (current) => ({ ...current, sets: current.sets.map((item, index) => index === setIndex ? { ...item, reps: event.target.value, completed: item.completed && Number.isInteger(Number(event.target.value)) && Number(event.target.value) >= 1 && Number(event.target.value) <= 30 } : item) }));
                    }} className={`${inputClass} mt-1`} /></label>
                    <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-600 px-2 text-sm font-semibold focus-within:ring-2 focus-within:ring-red-400"><input type="checkbox" aria-describedby={completionErrors[setKey] ? completionErrorId : undefined} checked={set.completed} onChange={(event) => {
                      if (event.target.checked && !(Number(set.weight) >= 0 && set.weight !== "" && Number.isInteger(Number(set.reps)) && Number(set.reps) >= 1 && Number(set.reps) <= 30)) {
                        setCompletionErrors((current) => ({ ...current, [setKey]: true }));
                        return;
                      }
                      setCompletionErrors((current) => ({ ...current, [setKey]: false }));
                      updateExercise(exerciseIndex, (current) => ({ ...current, sets: current.sets.map((item, index) => index === setIndex ? { ...item, completed: event.target.checked } : item) }));
                    }} className="h-5 w-5 accent-red-600" /><span className="hidden sm:inline">Done</span></label>
                    <button type="button" aria-label={`Remove set ${setIndex + 1}`} disabled={exercise.sets.length === 1} onClick={() => updateExercise(exerciseIndex, (current) => {
                      const sets = current.sets.filter((_, index) => index !== setIndex);
                      return { ...current, sets, dropset: current.dropset?.enabled ? { ...current.dropset, setCount: sets.length } : current.dropset };
                    })} className="min-h-11 text-gray-400 hover:text-red-300 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">×</button>
                    {completionErrors[setKey] && <p id={completionErrorId} role="alert" className="col-start-2 col-span-3 text-sm font-semibold text-red-300 sm:col-span-4">Enter Weight and Reps from 1 to 30 before marking this set Done.</p>}
                  </div>
                );
              })}
            </div>
            {!exercise.dropset?.enabled && <button type="button" disabled={exercise.sets.length >= 20} onClick={() => updateExercise(exerciseIndex, (current) => {
              const sets = [...current.sets, emptySet()];
              return { ...current, sets };
            })} className="mt-3 min-h-11 text-sm font-semibold text-red-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">Add set</button>}
            <div className="mt-4 grid gap-3 border-t border-gray-800 pt-4 sm:grid-cols-[12rem_1fr]">
              <div className="rounded-lg border border-gray-700 p-2">
                <button type="button" onClick={() => onConfigureDropset(exerciseIndex)} className="min-h-11 w-full rounded-md px-3 text-sm font-semibold text-red-300 transition-colors hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">
                  {exercise.dropset?.enabled ? "Edit dropset" : "Configure dropset"}
                </button>
                {exercise.dropset?.enabled && <button type="button" onClick={() => updateExercise(exerciseIndex, (current) => ({ ...current, dropset: { enabled: false } }))} className="min-h-11 w-full px-3 text-sm text-gray-400 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">Remove dropset</button>}
              </div>
              <label className="text-xs font-semibold text-gray-300">
                Note <span className="font-normal text-gray-500">(optional)</span>
                <textarea
                  value={exercise.note || ""}
                  onChange={(event) => updateExercise(exerciseIndex, (current) => ({ ...current, note: event.target.value }))}
                  maxLength={1000}
                  rows={2}
                  placeholder="e.g. Superset with Cable Row"
                  className={`${inputClass} mt-1 resize-y`}
                />
              </label>
            </div>
            {exercise.dropset?.enabled && <div className="mt-2 space-y-1 text-sm text-gray-400"><p className="tabular-nums">20% drops · {exercise.dropset.setCount} sets · starts at {exercise.dropset.startWeight}. Changing the first weight recalculates unfinished drops.</p><p className="text-gray-300">Each row is a real dropset. Enter the reps you perform and mark every row Done.</p></div>}
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onAddExercise} className={secondaryButton}>Add exercise</button>
        <button type="button" onClick={onFinish} className={primaryButton}>Finish training day</button>
      </div>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-300">{error}</p>}
    </section>
  );
}

function WeekSummary({ days, onAnother, onFinishWeek, onEdit }) {
  return (
    <section className="rounded-2xl bg-darkGray p-5 sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-400">Training day saved</p>
      <h1 className="mt-2 text-balance text-3xl font-bold">Keep going, or build your plan.</h1>
      <div className="mt-6 space-y-2">
        {days.filter((day) => day.finished).map((day, index) => (
          <button key={index} type="button" onClick={() => onEdit(index)} className="flex min-h-11 w-full items-center justify-between rounded-lg border border-gray-700 px-4 py-3 text-left hover:border-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">
            <span className="font-semibold">{day.label}</span><span className="text-sm text-gray-400">Edit</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={days.length >= 14} onClick={onAnother} className={primaryButton}>Start another training day</button>
        <button type="button" onClick={onFinishWeek} className={secondaryButton}>Finish first week</button>
      </div>
    </section>
  );
}

function Review({ catalog, data, onChange, onFinalize, onRememberExercise, busy, error }) {
  const [replacementSlot, setReplacementSlot] = useState(null);
  const replacementMap = new Map((data.review?.replacements || []).map((item) => [`${item.dayIndex}-${item.exerciseIndex}`, item.exercise]));
  const weeks = Number(data.review?.weeks) || 5;
  const updateReview = (changes) => onChange({ ...data, review: { name: "My first training block", weeks: 5, includeDeload: false, replacements: [], ...data.review, ...changes } });
  const replaceExercise = (dayIndex, exerciseIndex, choice) => {
    const replacements = (data.review?.replacements || []).filter((item) => item.dayIndex !== dayIndex || item.exerciseIndex !== exerciseIndex);
    if (choice) {
      replacements.push({
        dayIndex,
        exerciseIndex,
        exercise: {
          muscleGroup: choice.muscleGroup,
          type: choice.type || "barbell",
          exercise: choice.name,
          videoLink: choice.videoLink || "",
        },
      });
      onRememberExercise(choice);
    }
    updateReview({ replacements });
    setReplacementSlot(null);
  };
  return (
    <section className="rounded-2xl bg-darkGray p-5 sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-400">Review your first week</p>
      <h1 className="mt-2 text-balance text-3xl font-bold">Turn your logs into a training block.</h1>
      <p className="mt-2 text-pretty text-gray-300">Week 1 stays exactly as logged. Future replacements only affect weeks 2–{weeks} and start without targets.</p>
      <div className="mt-6 space-y-4">
        {data.days.filter((day) => day.finished).map((day, dayIndex) => (
          <article key={dayIndex} className="rounded-xl border border-gray-700 bg-darkestGray p-4">
            <h2 className="font-semibold">{day.label}</h2>
            <div className="mt-3 space-y-4">
              {day.exercises.filter((exercise) => exercise.sets.some(validSet)).map((exercise, exerciseIndex) => {
                const replacement = replacementMap.get(`${dayIndex}-${exerciseIndex}`);
                return <div key={exerciseIndex} className="border-t border-gray-800 pt-3 first:border-0 first:pt-0">
                  <div className="flex flex-wrap justify-between gap-2"><span>{exercise.exercise}</span><span className="text-sm tabular-nums text-gray-400">{exercise.sets.filter(validSet).map((set) => `${set.weight} × ${set.reps}`).join(" · ")}</span></div>
                  <div className="mt-3 flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-700 px-3 py-2">
                    <div className="text-sm"><span className="text-gray-400">Weeks 2–{weeks}: </span><span className="font-semibold">{replacement?.exercise || `Keep ${exercise.exercise}`}</span></div>
                    <div className="flex gap-2">
                      {replacement && <button type="button" onClick={() => replaceExercise(dayIndex, exerciseIndex, null)} className="min-h-11 px-2 text-sm text-gray-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">Undo</button>}
                      <button type="button" onClick={() => setReplacementSlot({ dayIndex, exerciseIndex, currentName: exercise.exercise })} className="min-h-11 px-2 text-sm font-semibold text-red-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">Search replacement</button>
                    </div>
                  </div>
                </div>;
              })}
            </div>
          </article>
        ))}
      </div>
      {replacementSlot && (
        <div className="mt-5">
          <ExerciseChooser
            catalog={catalog.filter((item) => item.name !== replacementSlot.currentName)}
            description="Search the exercise library or type a new exercise name. This only changes future weeks."
            eyebrow="Future exercise"
            headingLevel="h2"
            title={`Replace ${replacementSlot.currentName}`}
            onChoose={(choice) => replaceExercise(replacementSlot.dayIndex, replacementSlot.exerciseIndex, choice)}
            onCancel={() => setReplacementSlot(null)}
          />
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Plan name<input value={data.review?.name ?? "My first training block"} onChange={(event) => updateReview({ name: event.target.value })} className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-semibold">Number of weeks
          <select value={weeks} onChange={(event) => updateReview({ weeks: Number(event.target.value) })} className={`${inputClass} mt-2`}>
            {Array.from({ length: 10 }, (_, index) => index + 3).map((weekCount) => (
              <option key={weekCount} value={weekCount}>{weekCount} weeks{weekCount === 5 ? " — Recommended" : ""}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-gray-400">Includes your completed baseline week.</span>
        </label>
      </div>
      <div className="mt-4 flex min-h-11 items-start gap-3 rounded-xl border border-gray-700 p-3"><input id="onboarding-deload" aria-label="Use the final week as a deload" type="checkbox" checked={Boolean(data.review?.includeDeload)} onChange={(event) => updateReview({ includeDeload: event.target.checked })} className="mt-1 h-5 w-5 accent-red-600" /><div><label htmlFor="onboarding-deload" className="font-semibold">Use week {weeks} as a deload</label><p className="text-sm text-gray-400">A lighter final week can reduce fatigue before your next block. Off by default.</p></div></div>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-300">{error}</p>}
      <button type="button" disabled={busy || !(data.review?.name ?? "My first training block").trim()} onClick={onFinalize} className={`${primaryButton} mt-6 w-full`}>{busy ? "Creating your block…" : "Activate plan and start week 2"}</button>
    </section>
  );
}

export default function Onboarding() {
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("not_started");
  const [draft, setDraft] = useState(null);
  const [data, setData] = useState({ days: [] });
  const [path, setPath] = useState("exercise");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [error, setError] = useState("");
  const [choosingExercise, setChoosingExercise] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [dropsetExerciseIndex, setDropsetExerciseIndex] = useState(null);
  const [isDropsetModalOpen, setIsDropsetModalOpen] = useState(false);
  const [exerciseCatalog, setExerciseCatalog] = useState(builtInExercises);
  const revisionRef = useRef(0);
  const dataRef = useRef(data);
  const pathRef = useRef(path);
  const saveTimerRef = useRef();
  const saveChainRef = useRef(Promise.resolve(true));
  const hydratedRef = useRef(false);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { pathRef.current = path; }, [path]);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`${baseUrl}/exercises`).then(({ ok, data: response }) => {
      if (!ok || cancelled) return;
      const savedExercises = (response?.data ?? response ?? []).map((item) => ({
        name: item.name,
        muscleGroup: item.muscleGroup,
        type: item.type,
        videoLink: item.videoLink || item.videolink || "",
      }));
      setExerciseCatalog((current) => {
        const all = [...current, ...savedExercises];
        return all.filter((item, index) => all.findIndex((candidate) =>
          candidate.name.toLowerCase() === item.name.toLowerCase() &&
          candidate.muscleGroup === item.muscleGroup
        ) === index);
      });
    }).catch(() => {
      // Built-in exercises remain available when the custom library is offline.
    });
    return () => { cancelled = true; };
  }, [apiFetch, baseUrl]);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`${baseUrl}/onboarding`).then(({ ok, data: response }) => {
      if (cancelled) return;
      if (!ok) { setError(response?.error || "Could not load onboarding."); setLoading(false); return; }
      setStatus(response.status);
      if (response.draft) {
        const local = readLocalDraft(response.draft.id);
        const initialData = local?.data || response.draft.data;
        const initialPath = local?.path || response.draft.path;
        setDraft(response.draft);
        revisionRef.current = response.draft.revision;
        setData(initialData);
        setPath(initialPath === "discovery" ? "exercise" : initialPath);
        const kind = initialData?.kind;
        if (!location.state?.returnToSetup) {
          if (kind === "import") navigate("/import-plan", { replace: true, state: { onboardingDraftId: response.draft.id, onboardingPlanChoice: "has-plan" } });
          if (kind === "template") navigate("/templates", { replace: true, state: { onboardingDraftId: response.draft.id, onboardingPlanChoice: "needs-plan" } });
          if (kind === "scratch") navigate("/mesocycles-new", { replace: true, state: { onboardingDraftId: response.draft.id, onboardingPlanChoice: "needs-plan" } });
        }
      }
      hydratedRef.current = true;
      setLoading(false);
    }).catch(() => { setError("Could not load onboarding."); setLoading(false); });
    return () => { cancelled = true; };
  }, [apiFetch, baseUrl, location.state?.returnToSetup, navigate]);

  const saveNow = useCallback((snapshot = dataRef.current, nextPath = pathRef.current) => {
    if (!draft) return Promise.resolve(true);
    setSaveStatus("Saving");
    saveChainRef.current = saveChainRef.current.then(async () => {
      const result = await apiFetch(`${baseUrl}/onboarding/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: draft.id, revision: revisionRef.current, path: nextPath, data: snapshot }),
      });
      if (result.status === 409) {
        revisionRef.current = result.data.draft.revision;
        setData(result.data.draft.data);
        setPath(result.data.draft.path);
        setSaveStatus("Not saved — newer changes loaded");
        setError("This setup changed in another session. The newest saved version is shown.");
        return false;
      }
      if (!result.ok) {
        setSaveStatus("Not saved — Retry");
        setError(result.data?.error || "Your changes are still on this device. Retry saving.");
        return false;
      }
      revisionRef.current = result.data.draft.revision;
      setSaveStatus("Saved");
      setError("");
      if (JSON.stringify(dataRef.current) === JSON.stringify(snapshot) && pathRef.current === nextPath) {
        localStorage.removeItem(`onboarding-draft-${draft.id}`);
      }
      return true;
    }).catch(() => {
      setSaveStatus("Not saved — Retry");
      setError("Your changes are still on this device. Retry when you’re online.");
      return false;
    });
    return saveChainRef.current;
  }, [apiFetch, baseUrl, draft]);

  useEffect(() => {
    if (!hydratedRef.current || !draft) return undefined;
    localStorage.setItem(`onboarding-draft-${draft.id}`, JSON.stringify({ data, path }));
    setSaveStatus("Saving");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { void saveNow(data, path); }, 650);
    return () => clearTimeout(saveTimerRef.current);
  }, [data, draft, path, saveNow]);

  const start = async (kind) => {
    setBusy(true); setError("");
    const response = await apiFetch(`${baseUrl}/onboarding/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
    setBusy(false);
    if (!response.ok) { setError(response.data?.error || "Could not start setup."); return; }
    await checkAuthStatus();
    const nextDraft = response.data.draft;
    if (kind === "import") return navigate("/import-plan", { state: { onboardingDraftId: nextDraft.id, onboardingPlanChoice: "has-plan" } });
    if (kind === "template") return navigate("/templates", { state: { onboardingDraftId: nextDraft.id, onboardingPlanChoice: "needs-plan" } });
    if (kind === "scratch") return navigate("/mesocycles-new", { state: { onboardingDraftId: nextDraft.id, onboardingPlanChoice: "needs-plan" } });
    navigate("/onboarding", { replace: true, state: null });
    setStatus("in_progress"); setDraft(nextDraft); revisionRef.current = nextDraft.revision;
    setData({ kind: "discovery", days: [] }); setPath("exercise"); hydratedRef.current = true;
  };

  const skip = async () => {
    const response = await apiFetch(`${baseUrl}/onboarding/skip`, { method: "POST" });
    if (response.ok) { await checkAuthStatus(); navigate("/templates", { replace: true }); }
    else setError(response.data?.error || "Could not skip setup.");
  };

  const activeDayIndex = editingDay ?? Math.max(0, data.days.findIndex((day) => !day.finished));
  const activeDay = data.days[activeDayIndex];
  const needsFirstExercise = draft && path !== "summary" && path !== "review" && (!activeDay || activeDay.exercises.length === 0 || choosingExercise);
  const rememberExercise = useCallback((choice) => {
    if (!choice?.isCustom) return;
    const savedChoice = { ...choice, isCustom: false };
    setExerciseCatalog((current) => current.some((item) =>
      item.name.toLowerCase() === savedChoice.name.toLowerCase() &&
      item.muscleGroup === savedChoice.muscleGroup
    ) ? current : [...current, savedChoice]);
    void apiFetch(`${baseUrl}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: savedChoice.name,
        muscleGroup: savedChoice.muscleGroup,
        type: savedChoice.type,
        videoLink: savedChoice.videoLink || "",
      }),
    });
  }, [apiFetch, baseUrl]);
  const chooseExercise = (choice) => {
    rememberExercise(choice);
    const exercise = { exercise: choice.name, muscleGroup: choice.muscleGroup, type: choice.type || "barbell", videoLink: choice.videoLink || "", sets: [emptySet()] };
    const days = data.days.length ? data.days.map((day, index) => index === activeDayIndex ? { ...day, exercises: [...day.exercises, exercise] } : day) : [{ ...emptyDay(0), exercises: [exercise] }];
    setData({ ...data, days }); setPath("logging"); setChoosingExercise(false); setEditingDay(activeDayIndex);
  };

  const saveDropset = ({ startWeight, setCount }) => {
    const exercise = activeDay?.exercises?.[dropsetExerciseIndex];
    if (!exercise) {
      setIsDropsetModalOpen(false);
      return;
    }

    const progressionSettings = normalizeProgressionSettings(exercise);
    const { sets, error: dropsetError } = buildDropsetSets({
      existingSets: exercise.sets,
      startWeight,
      setCount,
      increment: progressionSettings.weightIncrement,
      minimumWeight: progressionSettings.minimumWeight,
      dropPercent: DROPSET_DROP_PERCENT,
      targetRepPolicy: exercise.dropset?.enabled
        ? DROPSET_REP_TARGET_POLICY.preserve
        : DROPSET_REP_TARGET_POLICY.initialize,
    });

    if (dropsetError) {
      setError(dropsetError);
      return;
    }

    const nextExercise = {
      ...exercise,
      ...progressionSettings,
      dropset: {
        enabled: true,
        setCount,
        startWeight,
        dropPercent: DROPSET_DROP_PERCENT,
      },
      sets: sets.map((set) => ({
        ...set,
        reps: Number(set.reps) >= 1 ? set.reps : "",
      })),
    };
    setData({
      ...data,
      days: data.days.map((day, dayIndex) =>
        dayIndex === activeDayIndex
          ? {
              ...day,
              exercises: day.exercises.map((item, exerciseIndex) =>
                exerciseIndex === dropsetExerciseIndex ? nextExercise : item
              ),
            }
          : day
      ),
    });
    setIsDropsetModalOpen(false);
    setError("");
  };

  const finishDay = () => {
    if (!dayHasCompletedSet(activeDay)) { setError("Complete at least one set with Weight ≥ 0 and Reps from 1 to 30."); return; }
    setData({ ...data, days: data.days.map((day, index) => index === activeDayIndex ? { ...day, finished: true } : day) });
    setPath("summary"); setEditingDay(null); setError("");
  };

  const anotherDay = () => {
    if (data.days.length >= 14) return;
    const next = emptyDay(data.days.length);
    setData({ ...data, days: [...data.days, next] }); setPath("exercise"); setEditingDay(data.days.length); setChoosingExercise(false);
  };

  const finalize = async () => {
    setBusy(true); setError(""); clearTimeout(saveTimerRef.current);
    const saved = await saveNow(dataRef.current, "review");
    if (!saved) { setBusy(false); return; }
    const response = await apiFetch(`${baseUrl}/onboarding/finalize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draftId: draft.id }) });
    if (!response.ok) { setBusy(false); setError(response.data?.error || "Could not create your training block."); return; }
    localStorage.removeItem(`onboarding-draft-${draft.id}`);
    await clearCurrentWorkoutQuery(queryClient);
    await checkAuthStatus();
    navigate("/currentworkout", {
      replace: true,
      state: { onboardingTour: true, onboardingTourId: draft.id },
    });
  };

  const content = useMemo(() => {
    if (loading) return <div className="py-20 text-center text-gray-300">Loading your setup…</div>;
    if (!draft || status === "not_started" || ["completed", "skipped"].includes(status)) return <Welcome onStart={start} onSkip={skip} busy={busy} />;
    if (location.state?.returnToSetup) return <Welcome onStart={start} onSkip={skip} busy={busy} initialPlanChoice={location.state?.onboardingPlanChoice || (data.kind === "template" || data.kind === "scratch" ? "needs-plan" : "has-plan")} />;
    if (path === "review") return <Review catalog={exerciseCatalog} data={data} onChange={setData} onFinalize={finalize} onRememberExercise={rememberExercise} busy={busy} error={error} />;
    if (path === "summary") return <WeekSummary days={data.days} onAnother={anotherDay} onFinishWeek={() => { setData({ ...data, review: { name: "My first training block", weeks: 5, includeDeload: false, replacements: data.review?.replacements || [] } }); setPath("review"); }} onEdit={(index) => { setEditingDay(index); setPath("logging"); }} />;
    if (needsFirstExercise) {
      const isAdditionalExercise = Boolean(activeDay?.exercises?.length);
      return <ExerciseChooser
        catalog={exerciseCatalog}
        title={isAdditionalExercise ? "Add another exercise" : "What exercise are you doing first?"}
        description={isAdditionalExercise ? "Search the exercise library or create your own." : "Search for it, then your first set will be ready to log."}
        eyebrow={isAdditionalExercise ? `Day ${activeDayIndex + 1}` : "Quick start"}
        onChoose={chooseExercise}
        onCancel={choosingExercise ? () => setChoosingExercise(false) : null}
      />;
    }
    return <TrainingDay day={activeDay} dayIndex={activeDayIndex} onChange={(nextDay) => setData({ ...data, days: data.days.map((day, index) => index === activeDayIndex ? nextDay : day) })} onAddExercise={() => setChoosingExercise(true)} onConfigureDropset={(exerciseIndex) => { setDropsetExerciseIndex(exerciseIndex); setIsDropsetModalOpen(true); }} onFinish={finishDay} error={error} />;
  // Event handlers intentionally close over the latest draft state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, activeDayIndex, busy, data, draft, error, exerciseCatalog, loading, location.state?.onboardingPlanChoice, location.state?.returnToSetup, needsFirstExercise, path, rememberExercise, status]);

  const progressStage = ["summary", "review"].includes(path)
    ? "training-block"
    : "first-week";

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-darkestGray py-7 text-white sm:py-12">
        <PageContainer size="standard" className="px-4">
          <OnboardingProgress stage={progressStage} className="mb-4" />
          {draft && <div className="mb-3 flex min-h-11 items-center justify-between gap-3 text-sm" aria-live="polite"><button type="button" onClick={async () => { await saveNow(); navigate("/currentworkout"); }} className="min-h-11 px-2 text-gray-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">Save &amp; exit</button><button type="button" onClick={() => saveNow()} className={`px-2 py-2 font-semibold ${saveStatus.startsWith("Not saved") ? "text-red-300 underline" : "text-gray-400"}`}>{saveStatus}</button></div>}
          {content}
          <DropsetModal
            isOpen={isDropsetModalOpen}
            onRequestClose={() => setIsDropsetModalOpen(false)}
            exercise={activeDay?.exercises?.[dropsetExerciseIndex]}
            onSave={saveDropset}
            showApplyToFutureWeeks={false}
          />
          {!draft && error && <p role="alert" className="mx-auto mt-4 max-w-2xl text-sm font-semibold text-red-300">{error}</p>}
        </PageContainer>
      </div>
    </ProtectedRoute>
  );
}
