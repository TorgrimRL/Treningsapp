import express from "express";
import jwt from "jsonwebtoken";
import auth0Sdk from "express-openid-connect";
import { clearAuthTokenCookie, setAuthTokenCookie } from "../utils/authCookies.js";
import { serializeUser, upsertAuth0User } from "../utils/auth0Users.js";

const { auth } = auth0Sdk;

const auth0RouteBasePath = "/api/auth0";

function trimTrailingSlash(value) {
  return value?.replace(/\/+$/, "");
}

function normalizeIssuerBaseUrl() {
  const issuerBaseUrl =
    process.env.AUTH0_ISSUER_BASE_URL || process.env.ISSUER_BASE_URL;
  if (issuerBaseUrl) {
    return trimTrailingSlash(issuerBaseUrl);
  }

  const domain = process.env.AUTH0_DOMAIN;
  if (!domain) {
    return null;
  }

  const normalizedDomain = domain.replace(/^https?:\/\//, "");
  return `https://${trimTrailingSlash(normalizedDomain)}`;
}

function getBackendBaseUrl() {
  return trimTrailingSlash(
    process.env.AUTH0_BASE_URL ||
      process.env.BASE_URL ||
      `http://localhost:${process.env.PORT || 3000}`
  );
}

function getAuth0SdkBaseUrl() {
  const backendBaseUrl = getBackendBaseUrl();
  return backendBaseUrl.endsWith(auth0RouteBasePath)
    ? backendBaseUrl
    : `${backendBaseUrl}${auth0RouteBasePath}`;
}

function getFrontendUrl() {
  return trimTrailingSlash(process.env.FRONTEND_URL || "http://localhost:5173");
}

function getAuth0Settings() {
  const settings = {
    issuerBaseURL: normalizeIssuerBaseUrl(),
    clientID: process.env.AUTH0_CLIENT_ID || process.env.CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET || process.env.CLIENT_SECRET,
    secret: process.env.AUTH0_SECRET || process.env.SECRET,
    baseURL: getAuth0SdkBaseUrl(),
    frontendUrl: getFrontendUrl(),
  };

  const missing = [
    ["AUTH0_DOMAIN or AUTH0_ISSUER_BASE_URL", settings.issuerBaseURL],
    ["AUTH0_CLIENT_ID", settings.clientID],
    ["AUTH0_CLIENT_SECRET", settings.clientSecret],
    ["AUTH0_SECRET", settings.secret],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  return {
    ...settings,
    enabled: missing.length === 0,
    missing,
  };
}

function unavailable(settings) {
  return {
    message: "Auth0 is not configured",
    missing: settings.missing,
  };
}

function createDisabledAuth0Router(settings) {
  const router = express.Router();

  router.get("/login", (req, res) => {
    res.status(503).json(unavailable(settings));
  });

  router.get("/register", (req, res) => {
    res.status(503).json(unavailable(settings));
  });

  router.get("/callback", (req, res) => {
    res.status(503).json(unavailable(settings));
  });

  router.get("/logout", (req, res) => {
    clearAuthTokenCookie(res);
    res.redirect(settings.frontendUrl);
  });

  router.get("/me", (req, res) => {
    res.status(503).json(unavailable(settings));
  });

  return router;
}

export function createAuth0Router() {
  const settings = getAuth0Settings();

  if (!settings.enabled) {
    return createDisabledAuth0Router(settings);
  }

  const router = express.Router();

  router.use(
    auth({
      authRequired: false,
      baseURL: settings.baseURL,
      clientID: settings.clientID,
      clientSecret: settings.clientSecret,
      issuerBaseURL: settings.issuerBaseURL,
      secret: settings.secret,
      idpLogout: true,
      authorizationParams: {
        response_type: "code",
        scope: "openid profile email",
      },
      routes: {
        login: false,
        logout: false,
        callback: "/callback",
        postLogoutRedirect: settings.frontendUrl,
      },
      session: {
        name: "auth0Session",
        cookie: {
          path: auth0RouteBasePath,
          sameSite: "Lax",
          secure: process.env.NODE_ENV === "production",
        },
      },
      transactionCookie: {
        name: "auth0_verification",
      },
      afterCallback: async (req, res, session) => {
        const auth0Profile = jwt.decode(session.id_token);
        const localUser = await upsertAuth0User(auth0Profile);
        setAuthTokenCookie(res, localUser.id);

        return {
          ...session,
          localUser: serializeUser(localUser),
        };
      },
    })
  );

  router.get("/login", (req, res) => {
    res.oidc.login({ returnTo: settings.frontendUrl });
  });

  router.get("/register", (req, res) => {
    res.oidc.login({
      returnTo: settings.frontendUrl,
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  });

  router.get("/logout", (req, res) => {
    clearAuthTokenCookie(res);

    if (!req.oidc.isAuthenticated()) {
      res.redirect(settings.frontendUrl);
      return;
    }

    res.oidc.logout({ returnTo: settings.frontendUrl });
  });

  router.get("/me", (req, res) => {
    if (!req.oidc.isAuthenticated()) {
      res.status(401).json({ isLoggedIn: false });
      return;
    }

    res.json({
      isLoggedIn: true,
      user: req.oidc.user,
      localUser: req.auth0Session?.localUser || null,
    });
  });

  return router;
}

