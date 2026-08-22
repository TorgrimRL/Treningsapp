const identifiersMatch = (firstIdentifier, secondIdentifier) =>
  firstIdentifier != null &&
  secondIdentifier != null &&
  String(firstIdentifier) === String(secondIdentifier);

export async function requestMesocycleRename(
  apiFetch,
  baseUrl,
  mesocycleId,
  name
) {
  try {
    const { ok, data } = await apiFetch(
      `${baseUrl}/mesocycles/${mesocycleId}/name`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      }
    );

    if (!ok) {
      return {
        ok: false,
        error:
          data?.error || data?.message || "Failed to rename training block",
      };
    }

    if (!data?.mesocycle?.name) {
      return {
        ok: false,
        error: "The rename response was invalid",
      };
    }

    return { ok: true, mesocycle: data.mesocycle };
  } catch (error) {
    console.error("Failed to rename mesocycle:", error);
    return { ok: false, error: "Failed to rename training block" };
  }
}

export function mergeMesocycleName(mesocycle, renamedMesocycle) {
  if (
    !mesocycle ||
    !identifiersMatch(mesocycle.id, renamedMesocycle?.id)
  ) {
    return mesocycle;
  }

  return {
    ...mesocycle,
    name: renamedMesocycle.name,
    personalRecordHistory: Array.isArray(mesocycle.personalRecordHistory)
      ? mesocycle.personalRecordHistory.map((record) =>
          identifiersMatch(record?.mesocycleId, renamedMesocycle.id)
            ? { ...record, mesocycleName: renamedMesocycle.name }
            : record
        )
      : mesocycle.personalRecordHistory,
  };
}
