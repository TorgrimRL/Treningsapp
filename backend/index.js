import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import { createAuth0Router } from "./routes/auth0Routes.js";
import mesocycleRoutes from "./routes/mesocycleRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import {
  authenticateToken,
  csrfProtection,
  csrfTokenRoute,
} from "./middleware.js";
import dotenv from "dotenv";
import { safeQuery } from "./utils/safeQuery.js";
import { buildResponsePayload } from "./utils/buildResponsePayload.js";
import { clearAuthTokenCookie } from "./utils/authCookies.js";
import { serializeUser } from "./utils/auth0Users.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const auth0Routes = createAuth0Router();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "https://setoptimizer.com",
      "https://www.setoptimizer.com",
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("Missing JWT_SECRET_KEY in environment");
}
app.get("/favicon.ico", (req, res) => res.status(204));

app.use("/api/auth0", auth0Routes);
app.use("/api", exerciseRoutes);
app.use("/api", mesocycleRoutes);
csrfTokenRoute(app);

app.get("/api/", (req, res) => {
  res.send("Welcome to the API");
});

app.get("/api/ping", async (req, res) => {
  try {
    await safeQuery`SELECT 1`;
    return res.status(200).send("OK");
  } catch (err) {
    console.error(`${new Date().toISOString()} – ping FEILET:`, err);
    return res.status(500).json({ message: err.message });
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
  } catch (error) {
    clearAuthTokenCookie(res);
    return sendLoggedOut(res);
  }

  try {
    const { result } = await safeQuery`
      SELECT id, username, auth_provider, auth0_sub, email, email_verified, picture
      FROM users
      WHERE id = ${decodedToken.id}
      LIMIT 1
    `;
    const user = result[0];

    if (!user) {
      clearAuthTokenCookie(res);
      return sendLoggedOut(res);
    }

    res.json({ isLoggedIn: true, user: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete(
  "/api/users/:username",
  authenticateToken,
  csrfProtection,
  async (req, res) => {
    try {
      const { username } = req.params;
      const { hadRetry } =
        await safeQuery`DELETE FROM users WHERE username = ${username}`;
      const responsePayload = buildResponsePayload(hadRetry);
      res.status(200).json(responsePayload);
    } catch (error) {
      console.log("Database Error");
      res.status(500).json({ message: error.message });
    }
  }
);

app.get("/", (req, res) => {
  res.send("Welcome to the Workout App API!");
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
