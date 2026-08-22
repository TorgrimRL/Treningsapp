import { useEffect, useMemo, useState } from "react";
import { exerciseTypes, exercises, muscleGroups } from "../../constants/constants";
import { buildMesocyclePayload } from "../../utils/mesocyclePlan";
import {
  normalizeExerciseName,
  parseCsvPlan,
  parseTextPlan,
  rowsToWeeklyPlan,
} from "./importPlanParser";
import { useApiFetch } from "../../utils/apiFetch";

const csvTemplate =
  "day,exercise,sets,weight,reps,muscle_group,type\nMonday,Bench Press,3,60,8,Chest,barbell\n";
const fieldInvalid = (row, field) =>
  ({
    day: !row.day?.trim(),
    exercise: !row.exercise?.trim(),
    sets: !Number.isFinite(Number(row.sets)) || Number(row.sets) <= 0,
    reps:
      row.reps !== "" &&
      Number(row.reps) !== 0 &&
      (!Number.isFinite(Number(row.reps)) || Number(row.reps) < 0),
    weight:
      row.weight !== undefined &&
      (!Number.isFinite(Number(row.weight)) || Number(row.weight) < 0),
  })[field];
const fieldClass = (invalid, width = "") =>
  `${width} border bg-inputBGGray p-1 ${invalid ? "border-red-500 ring-1 ring-red-500" : "border-transparent"}`;

export default function ImportPlanWizard({ onCancel, onSubmit }) {
  const [source, setSource] = useState("paste");
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [review, setReview] = useState(false);
  const [name, setName] = useState("Imported training block");
  const [weeks, setWeeks] = useState(4);
  const [includeDeload, setIncludeDeload] = useState(false);
  const [custom, setCustom] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { apiFetch } = useApiFetch();
  const baseUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    apiFetch(`${baseUrl}/exercises`, { credentials: "include" })
      .then(({ ok, data }) => {
        if (ok && Array.isArray(data)) setCustom(data);
      })
      .catch(() => {});
  }, [apiFetch, baseUrl]);
  const known = useMemo(
    () => [
      ...Object.entries(exercises).flatMap(([muscleGroup, list]) =>
        list.map((item) => ({ ...item, muscleGroup })),
      ),
      ...custom.map((item) => ({
        name: item.name,
        type: item.type,
        muscleGroup: item.muscleGroup,
      })),
    ],
    [custom],
  );
  const match = (row) =>
    known.find(
      (item) =>
        normalizeExerciseName(item.name) ===
        normalizeExerciseName(row.exercise),
    );
  const incomplete = (row) =>
    ["day", "exercise", "sets", "weight"].some((field) =>
      fieldInvalid(row, field),
    );
  const unresolved = (row) =>
    !match(row) && !muscleGroups.includes(row.muscle_group);
  const edit = (id, field, value) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  const parse = () => {
    const result =
      source === "csv" ? parseCsvPlan(input) : parseTextPlan(input);
    setRows(result.rows);
    setErrors(result.errors);
    setReview(result.rows.length > 0 && !result.errors.length);
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([csvTemplate], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "training-plan-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const additions = rows
        .filter((row) => !match(row))
        .filter(
          (row, index, all) =>
            all.findIndex(
              (item) =>
                normalizeExerciseName(item.exercise) ===
                normalizeExerciseName(row.exercise),
            ) === index,
        );
      for (const row of additions) {
        const { ok, data } = await apiFetch(`${baseUrl}/exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: row.exercise.trim(),
            muscleGroup: row.muscle_group,
            type: exerciseTypes.includes(row.type) ? row.type : "barbell",
            videolink: "",
          }),
        });
        if (!ok)
          throw new Error(data?.error || "Could not create a custom exercise.");
      }
      const plan = rowsToWeeklyPlan(rows).map((day) => ({
        ...day,
        exercises: day.exercises.map((exercise) => {
          const row = rows.find(
            (item) =>
              item.day.trim() === day.label &&
              item.exercise.trim().replace(/\s+/g, " ") === exercise.exercise,
          );
          const item = match(row);
          return {
            ...exercise,
            muscleGroup: item?.muscleGroup || row.muscle_group,
            type:
              item?.type ||
              (exerciseTypes.includes(row.type) ? row.type : "barbell"),
          };
        }),
      }));
      await onSubmit(
        buildMesocyclePayload({ name, weeks, includeDeload, plan }),
      );
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };
  if (!review)
    return (
      <section className="mx-auto max-w-2xl p-4 text-white">
        <h1 className="text-2xl font-bold">Import a plan</h1>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setSource("paste")}
            aria-pressed={source === "paste"}
            className={`min-h-11 px-4 transition-colors ${source === "paste" ? "bg-red-600 text-white" : "bg-darkGray text-gray-300 hover:bg-gray-700"}`}
          >
            Paste plan
          </button>
          <button
            type="button"
            onClick={() => setSource("csv")}
            aria-pressed={source === "csv"}
            className={`min-h-11 px-4 transition-colors ${source === "csv" ? "bg-red-600 text-white" : "bg-darkGray text-gray-300 hover:bg-gray-700"}`}
          >
            Upload CSV
          </button>
        </div>
        {source === "paste" ? (
          <div className="mt-5">
            <p className="mb-2 text-sm text-gray-300">
              One exercise per line. Use{" "}
              <code>Monday: Bench Press — 3 sets</code>, optionally add{" "}
              <code>× 8</code> for a target and <code>@ 60</code> for a
              starting weight.
            </p>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Monday: Bench Press — 3 sets @ 60"
              className="min-h-40 w-full bg-inputBGGray p-3"
            />
            <p className="mt-2 text-sm text-gray-300">
              You can export a previous training log, then use your preferred AI
              to reformat it into these lines. Review all results before
              continuing; pasted content stays in your browser.
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <input
              id="import-csv"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setFileName(file?.name || "");
                file?.text().then(setInput);
              }}
            />
            <label
              htmlFor="import-csv"
              className="inline-flex min-h-11 cursor-pointer items-center bg-red-600 px-4 font-semibold"
            >
              Choose CSV file
            </label>
            <span className="ml-3 text-sm text-gray-300">
              {fileName || "No file selected"}
            </span>
            <button
              type="button"
              onClick={download}
              className="mt-3 block text-red-300 underline"
            >
              Download CSV template
            </button>
          </div>
        )}
        {errors.map((error) => (
          <p key={error} className="text-red-400">
            {error}
          </p>
        ))}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 border px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={parse}
            className="min-h-11 bg-red-600 px-4"
          >
            Review plan
          </button>
        </div>
      </section>
    );
  const hasErrors = rows.some((row) => incomplete(row) || unresolved(row));
  return (
    <section className="mx-auto max-w-6xl p-4 text-white">
      <h1 className="text-2xl font-bold">Review imported plan</h1>
      <p className="mt-2 text-gray-300">
        Fields with a red outline need attention.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label>
          Plan name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 h-11 w-full bg-inputBGGray p-2"
          />
        </label>
        <label>
          Weeks
          <select
            value={weeks}
            onChange={(event) => setWeeks(Number(event.target.value))}
            className="mt-1 h-11 w-full bg-inputBGGray p-2 text-center [font-variant-numeric:tabular-nums] [text-align-last:center]"
          >
            {[4, 5, 6].map((value) => (
              <option className="text-center" key={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 pt-6">
          <span className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              checked={includeDeload}
              onChange={(event) => setIncludeDeload(event.target.checked)}
              className="h-6 w-6 accent-red-600"
            />
            Final-week deload
          </span>
          <span className="pl-9 text-xs text-gray-300">
            Reduces training stress in the final week so you can recover before
            the next block.
          </span>
        </label>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Day</th>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Target reps (optional)</th>
              <th>Weight</th>
              <th>Muscle group</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const item = match(row);
              return (
                <tr
                  key={row.id}
                  className={
                    incomplete(row) || unresolved(row)
                      ? "border-l-2 border-red-500 bg-red-950/20"
                      : "border-l-2 border-transparent"
                  }
                >
                  <td>
                    <input
                      aria-invalid={fieldInvalid(row, "day")}
                      value={row.day}
                      onChange={(event) =>
                        edit(row.id, "day", event.target.value)
                      }
                      className={fieldClass(fieldInvalid(row, "day"), "w-28")}
                    />
                  </td>
                  <td>
                    <input
                      aria-invalid={fieldInvalid(row, "exercise")}
                      value={row.exercise}
                      onChange={(event) =>
                        edit(row.id, "exercise", event.target.value)
                      }
                      className={fieldClass(
                        fieldInvalid(row, "exercise"),
                        "w-40",
                      )}
                    />
                  </td>
                  <td>
                    <input
                      aria-invalid={fieldInvalid(row, "sets")}
                      type="number"
                      value={row.sets}
                      onChange={(event) =>
                        edit(row.id, "sets", event.target.value)
                      }
                      className={fieldClass(fieldInvalid(row, "sets"), "w-16")}
                    />
                  </td>
                  <td>
                    <input
                      aria-invalid={fieldInvalid(row, "reps")}
                      type="number"
                      placeholder="Set during workout"
                      value={Number(row.reps) === 0 ? "" : row.reps}
                      onChange={(event) =>
                        edit(row.id, "reps", event.target.value)
                      }
                      className={fieldClass(fieldInvalid(row, "reps"), "w-16")}
                    />
                  </td>
                  <td>
                    <input
                      aria-invalid={fieldInvalid(row, "weight")}
                      type="number"
                      value={row.weight ?? ""}
                      onChange={(event) =>
                        edit(
                          row.id,
                          "weight",
                          event.target.value === ""
                            ? undefined
                            : event.target.value,
                        )
                      }
                      className={fieldClass(
                        fieldInvalid(row, "weight"),
                        "w-20",
                      )}
                    />
                  </td>
                  <td>
                    {item ? (
                      item.muscleGroup
                    ) : (
                      <select
                        aria-invalid={!muscleGroups.includes(row.muscle_group)}
                        value={row.muscle_group}
                        onChange={(event) =>
                          edit(row.id, "muscle_group", event.target.value)
                        }
                        className={fieldClass(
                          !muscleGroups.includes(row.muscle_group),
                        )}
                      >
                        <option value="">Choose</option>
                        {muscleGroups.map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {item ? (
                      item.type
                    ) : (
                      <select
                        aria-invalid={false}
                        value={row.type}
                        onChange={(event) =>
                          edit(row.id, "type", event.target.value)
                        }
                        className={fieldClass(false)}
                      >
                        <option value="">Default: barbell (2.5 kg)</option>
                        {exerciseTypes.map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {hasErrors && (
        <p className="mt-3 text-red-300">
          Correct the highlighted fields before continuing.
        </p>
      )}
      {saveError && <p className="mt-3 text-red-400">{saveError}</p>}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setReview(false)}
          className="min-h-11 border px-4"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!name.trim() || hasErrors || saving}
          onClick={save}
          className="min-h-11 bg-red-600 px-4 disabled:bg-gray-600"
        >
          {saving ? "Preparing…" : "Continue to editor"}
        </button>
      </div>
    </section>
  );
}
