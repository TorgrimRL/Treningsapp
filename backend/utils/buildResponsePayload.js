export function buildResponsePayload(hadRetry, basePayload = {}) {
  return hadRetry
    ? { ...basePayload, message: "Database went to sleep!" }
    : basePayload;
}
