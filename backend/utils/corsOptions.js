const productionOrigins = [
  "https://setoptimizer.com",
  "https://www.setoptimizer.com",
];

const developmentOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

function normalizeConfiguredOrigin(value, nodeEnv) {
  if (!value) {
    return null;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("FRONTEND_URL must be an absolute HTTP(S) origin");
  }

  const hasUnexpectedComponents =
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash;
  const hasAllowedProtocol =
    url.protocol === "https:" ||
    (nodeEnv !== "production" && url.protocol === "http:");

  if (hasUnexpectedComponents || !hasAllowedProtocol) {
    throw new Error("FRONTEND_URL must be an absolute HTTP(S) origin");
  }

  return url.origin;
}

export function resolveAllowedOrigins({
  nodeEnv = process.env.NODE_ENV,
  frontendUrl = process.env.FRONTEND_URL,
} = {}) {
  const allowedOrigins = new Set(productionOrigins);

  if (nodeEnv !== "production") {
    developmentOrigins.forEach((origin) => allowedOrigins.add(origin));
  }

  const configuredOrigin = normalizeConfiguredOrigin(frontendUrl, nodeEnv);
  if (configuredOrigin) {
    allowedOrigins.add(configuredOrigin);
  }

  return allowedOrigins;
}

export function createCorsOptions(options = {}) {
  const allowedOrigins = resolveAllowedOrigins(options);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error("Origin is not allowed");
      error.code = "ECORS";
      callback(error);
    },
    credentials: true,
  };
}
