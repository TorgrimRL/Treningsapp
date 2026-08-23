export function parseMesocycleListResponse(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.data) ? payload.data : [];
}
