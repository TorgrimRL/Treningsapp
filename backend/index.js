import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createAuth0Router } from "./routes/auth0Routes.js";
import mesocycleRoutes from "./routes/mesocycleRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import {
  authenticateToken,
  clearCsrfCookie,
  csrfProtection,
  csrfTokenRoute,
} from "./middleware.js";
import dotenv from "dotenv";
import { safeQuery } from "./utils/safeQuery.js";
import { buildResponsePayload } from "./utils/buildResponsePayload.js";
import { clearAuthTokenCookie } from "./utils/authCookies.js";
import { serializeUser } from "./utils/auth0Users.js";
import { createCorsOptions } from "./utils/corsOptions.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const auth0Routes = createAuth0Router();

function parseTrustProxy(value) {
  if (value === undefined || value === "") {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error("TRUST_PROXY must be a non-negative integer");
  }

  const proxyHops = Number(value);
  if (!Number.isSafeInteger(proxyHops)) {
    throw new Error("TRUST_PROXY must be a non-negative integer");
  }

  return proxyHops;
}

const trustProxy = parseTrustProxy(process.env.TRUST_PROXY);
if (trustProxy !== null) {
  app.set("trust proxy", trustProxy);
}

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again in a minute.",
  },
});

app.use(cors(createCorsOptions()));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("Missing JWT_SECRET_KEY in environment");
}
app.get("/favicon.ico", (req, res) => res.status(204));

app.use("/api/auth0", auth0Routes);
app.use("/api", apiRateLimiter);
csrfTokenRoute(app);
app.use("/api", exerciseRoutes);
app.use("/api", mesocycleRoutes);

app.get("/api/", (req, res) => {
  res.send("Welcome to the API");
});

app.get("/api/ping", async (req, res) => {
  try {
    await safeQuery`SELECT 1`;
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Database health check failed", {
      code: err?.code,
      name: err?.name,
    });
    return res.status(503).json({ message: "Service unavailable" });
  }
});

function sendLoggedOut(res) {
  return res.status(401).json({ isLoggedIn: false, user: null });
}

app.get("/api/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return sendLoggedOut(res);
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secretKey);
  } catch {
    clearAuthTokenCookie(res);
    clearCsrfCookie(res);
    return sendLoggedOut(res);
  }

  try {
    // noinspection SqlResolve
    const { result } = await safeQuery`
      SELECT id, username, auth_provider, auth0_sub, email, email_verified, picture
      FROM users
      WHERE id = ${decodedToken.id}
      LIMIT 1
    `;
    const user = result[0];

    if (!user) {
      clearAuthTokenCookie(res);
      clearCsrfCookie(res);
      return sendLoggedOut(res);
    }

    res.json({ isLoggedIn: true, user: serializeUser(user) });
  } catch (err) {
    console.error("Current-user lookup failed", {
      code: err?.code,
      name: err?.name,
    });
    res.status(500).json({ message: "Internal server error" });
  }
});
app.delete(
  "/api/users/me",
  authenticateToken,
  csrfProtection,
  async (req, res) => {
    try {
      const { result, hadRetry } =
        await safeQuery`DELETE FROM users WHERE id = ${req.user.id}`;

      if (!result || result.changes !== 1) {
        return res.status(404).json({ message: "User not found" });
      }

      clearAuthTokenCookie(res);
      clearCsrfCookie(res);
      const responsePayload = buildResponsePayload(hadRetry);
      return res.status(200).json(responsePayload);
    } catch (error) {
      console.error("Account deletion failed", {
        code: error?.code,
        name: error?.name,
      });
      return res.status(500).json({ message: "Failed to delete user" });
    }
  }
);

app.use((error, _req, res, _next) => {
  if (error.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  if (error.code === "ECORS") {
    return res.status(403).json({ error: "Origin is not allowed" });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large" });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.error("Unhandled request error", {
    code: error?.code,
    name: error?.name,
  });
  return res.status(500).json({ error: "Internal server error" });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Workout App API!");
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
