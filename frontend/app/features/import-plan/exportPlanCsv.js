const columns = [
  "day",
  "exercise",
  "sets",
  "weight",
  "reps",
  "muscle_group",
  "type",
  "progression_mode",
  "weight_increment",
  "minimum_weight",
];

const delimiter = ";";
const escapeCsv = (value) => {
  const rawValue = String(value ?? "");
  const text = /^-?\d+(?:\.\d+)?$/.test(rawValue)
    ? rawValue.replace(".", ",")
    : rawValue;
  return /[";\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function exportMesocycleCsv(mesocycle) {
  const days = Array.isArray(mesocycle?.plan)
    ? mesocycle.plan.slice(0, Number(mesocycle.daysPerWeek) || 0)
    : [];
  const rows = days.flatMap((day) =>
    (day.exercises || []).map((exercise) => {
      const firstSet = exercise.sets?.[0] || {};
      return [
        day.label,
        exercise.exercise,
        exercise.sets?.length || 0,
        firstSet.targetWeight ?? "",
        firstSet.targetReps ?? "",
        exercise.muscleGroup,
        exercise.type,
        exercise.progressionMode,
        exercise.weightIncrement,
        exercise.minimumWeight,
      ].map(escapeCsv).join(delimiter);
    })
  );
  return [columns.join(delimiter), ...rows].join("\n") + "\n";
}

export function getExportFilename(name = "training-plan") {
  const safeName = String(name)
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${safeName || "training-plan"}.csv`;
}

export function downloadMesocycleCsv(mesocycle) {
  const url = URL.createObjectURL(
    new Blob([exportMesocycleCsv(mesocycle)], { type: "text/csv;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = getExportFilename(mesocycle?.name);
  link.click();
  URL.revokeObjectURL(url);
}
