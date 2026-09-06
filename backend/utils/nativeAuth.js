import { auth } from "express-oauth2-jwt-bearer";
import { upsertAuth0User } from "./auth0Users.js";

function trimTrailingSlash(value) {
  return value?.replace(/\/+$/, "");
}

export function getNativeAuthSettings(environment = process.env) {
  const configuredIssuer =
    environment.AUTH0_ISSUER_BASE_URL || environment.ISSUER_BASE_URL;
  const domain = environment.AUTH0_DOMAIN?.replace(/^https?:\/\//, "");
  const issuerBaseURL = trimTrailingSlash(
    configuredIssuer || (domain ? `https://${domain}` : "")
  );
  const audience = environment.AUTH0_AUDIENCE;

  return {
    audience,
    issuerBaseURL,
    enabled: Boolean(audience && issuerBaseURL),
  };
}

export function hasBearerAuthorization(req) {
  return /^Bearer\s+\S+$/i.test(req.get("authorization") || "");
}

let cachedVerifier;
let cachedVerifierKey;

function getVerifier(settings) {
  const verifierKey = `${settings.issuerBaseURL}|${settings.audience}`;
  if (!cachedVerifier || cachedVerifierKey !== verifierKey) {
    cachedVerifier = auth({
      audience: settings.audience,
      issuerBaseURL: settings.issuerBaseURL,
      tokenSigningAlg: "RS256",
    });
    cachedVerifierKey = verifierKey;
  }

  return cachedVerifier;
}

async function findUserByAuth0Sub(auth0Sub) {
  const { safeQuery } = await import("./safeQuery.js");
  const { result } = await safeQuery`
    SELECT id
    FROM users
    WHERE auth0_sub = ${auth0Sub}
    LIMIT 1
  `;

  return result?.[0] || null;
}

async function fetchAuth0Profile(req, settings, auth0Sub) {
  const response = await fetch(`${settings.issuerBaseURL}/userinfo`, {
    headers: { Authorization: req.get("authorization") },
  });

  if (!response.ok) {
    const error = new Error("Unable to load the Auth0 user profile");
    error.statusCode = 401;
    throw error;
  }

  const profile = await response.json();
  if (!profile?.sub || profile.sub !== auth0Sub) {
    const error = new Error("Auth0 user profile did not match the access token");
    error.statusCode = 401;
    throw error;
  }

  return profile;
}

function resolveNativeUser(req, res, next, { provisionUser }) {
  const settings = getNativeAuthSettings();
  if (!settings.enabled) {
    return res.status(503).json({ error: "Native Auth0 is not configured" });
  }

  return getVerifier(settings)(req, res, async (verificationError) => {
    if (verificationError) {
      return next(verificationError);
    }

    const auth0Sub = req.auth?.payload?.sub;
    if (!auth0Sub) {
      return res.status(401).json({ error: "Invalid access token" });
    }

    try {
      let user = await findUserByAuth0Sub(auth0Sub);
      if (!user && provisionUser) {
        const profile = await fetchAuth0Profile(req, settings, auth0Sub);
        user = await upsertAuth0User(profile);
      }

      if (!user) {
        return res.status(401).json({ error: "Access Denied" });
      }

      req.user = { id: user.id, sub: auth0Sub };
      req.authMethod = "bearer";
      return next();
    } catch (error) {
      return next(error);
    }
  });
}

export function authenticateNativeToken(req, res, next) {
  return resolveNativeUser(req, res, next, { provisionUser: false });
}

export function authenticateNativeSession(req, res, next) {
  return resolveNativeUser(req, res, next, { provisionUser: true });
}
