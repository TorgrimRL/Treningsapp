import { createEmptyExercise, emptySet } from "../../utils/mesocyclePlan";

const requiredColumns = ["day", "exercise", "sets"];
export const normalizeExerciseName = (value = "") =>
  String(value).trim().replace(/\s+/g, " ").toLocaleLowerCase();

function splitCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { values.push(value.trim()); value = ""; }
    else value += character;
  }
  if (quoted) return null;
  values.push(value.trim());
  return values;
}

function parseNumber(value, field, errors) {
  const number = Number(String(value ?? "").trim());
  if (!Number.isFinite(number) || number <= 0) errors.push(`${field} must be a positive number`);
  return number;
}

function toRow(values, line, headers) {
  const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  const errors = [];
  if (!record.day.trim()) errors.push("Day is required");
  if (!record.exercise.trim()) errors.push("Exercise is required");
  const sets = parseNumber(record.sets, "Sets", errors);
  const reps = record.reps === "" || record.reps === undefined
    ? 0
    : parseNumber(record.reps, "Reps", errors);
  const weightValue = record.weight ?? record.weight_kg ?? "";
  const weight = weightValue === "" ? undefined : Number(weightValue);
  if (weightValue !== "" && (!Number.isFinite(weight) || weight < 0)) errors.push("Weight must be zero or greater");
  return { id: `${line}-${record.day}-${record.exercise}`, line, ...record, sets, reps, weight, errors, warnings: [] };
}

export function parseCsvPlan(source) {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { rows: [], errors: ["Choose a CSV file with a header row."] };
  const headers = splitCsvLine(lines[0])?.map((header) => header.trim().toLowerCase());
  if (!headers) return { rows: [], errors: ["The CSV header has an unclosed quote."] };
  const missing = requiredColumns.filter((column) => !headers.includes(column));
  if (missing.length) return { rows: [], errors: [`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`] };
  const rows = lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    return values ? toRow(values, index + 2, headers) : { id: `line-${index + 2}`, line: index + 2, errors: ["Unclosed quote"], warnings: [] };
  });
  return { rows, errors: [] };
}

export function parseTextPlan(source) {
  const rows = [];
  const errors = [];
  source.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    const match = line.match(/^([^:]+):\s*(.+?)\s*[—–-]\s*(\d+)(?:\s*(?:[x×]\s*(\d+)|sets?))?(?:\s*@\s*(\d+(?:[.,]\d+)?)(?:\s*kg)?)?\s*$/i);
    if (!match) { errors.push(`Line ${index + 1}: use “Monday: Bench Press — 3 sets” or “Monday: Bench Press — 3 × 8 @ 60”.`); return; }
    const [, day, exercise, sets, reps, weight] = match;
    rows.push(toRow([day, exercise, sets, reps || "", weight?.replace(",", ".") || ""], index + 1, ["day", "exercise", "sets", "reps", "weight"]));
  });
  return { rows, errors };
}

export function rowsToWeeklyPlan(rows) {
  const days = [];
  rows.forEach((row) => {
    let day = days.find((candidate) => candidate.label === row.day.trim());
    if (!day) { day = { label: row.day.trim(), exercises: [] }; days.push(day); }
    const sets = Array.from({ length: row.sets }, () => emptySet({ targetWeight: row.weight ?? 0, targetReps: Number(row.reps) || 0 }));
    day.exercises.push(createEmptyExercise({
      exercise: row.exercise.trim().replace(/\s+/g, " "), muscleGroup: row.muscle_group?.trim() || "", type: row.type?.trim().toLowerCase() || "", sets,
      progressionMode: row.progression_mode, weightIncrement: row.weight_increment, minimumWeight: row.minimum_weight,
    }));
  });
  return days;
}
