import express from "express";
import pkg from "body-parser";
const { json } = pkg;
import db from "./remoteDatabase.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
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
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://setoptimizer.com",
      "https://www.setoptimizer.com",
    ];
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

app.use((req, res, next) => {
  next();
});

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("Missing JWT_SECRET_KEY in environment");
}
app.get("/favicon.ico", (req, res) => res.status(204));

app.use("/api", exerciseRoutes);
app.use("/api", mesocycleRoutes);
csrfTokenRoute(app);

app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

app.get("/api/", (req, res) => {
  res.send("Welcome to the API");
});

app.get("/api/ping", async (req, res) => {
  try {
    await safeQuery`SELECT 1`;
    res.status(200).send("OK");
    console.log($`${new Date().toISOString()} – ping OK`);
  } catch (err) {
    console.error(`${new Date().toISOString()} – ping FEILET:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { result: userResult, hadRetry: selectHadRetry } =
      await safeQuery`SELECT * FROM users WHERE username = ${username}`;
    if (userResult.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { hadRetry: insertHadRetry } =
      await safeQuery`INSERT INTO users (username, password) VALUES (${username}, ${hashedPassword})`;
    const hadRetry = selectHadRetry || insertHadRetry;
    const responsePayload = buildResponsePayload(hadRetry, {
      message: "User registered",
    });
    res.status(201).json(responsePayload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send("Mangler brukernavn eller passord");
    }

    const { result } = await safeQuery`
      SELECT id, password
      FROM users
      WHERE username = ${username}
    `;
    const user = result[0];
    if (!user) {
      console.log("Brukernavn ikke funnet");
      return res.status(400).send("Brukernavn eller passord er feil");
    }
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      console.log("Ugyldig passord");
      return res.status(400).send("Brukernavn eller passord er feil");
    }
    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "30d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ token });
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).send(err.message);
  }
});
app.get("/api/check-auth", authenticateToken, (req, res) => {
  const token = req.cookies.token;

  console.log("Received token for /api/check-auth:", token); // Logging av token

  if (!token) {
    console.log("No token found in cookies."); // Logging hvis token mangler
    return res.json({ isLoggedIn: false });
  }

  try {
    const verified = jwt.verify(token, secretKey);
    console.log("Token verification successful:", verified); // Logging av verifisert token
    res.json({ isLoggedIn: true });
  } catch (error) {
    console.log("Token verification failed:", error.message); // Logging ved feil i verifisering
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/",
    });
    res.json({ isLoggedIn: false });
  }
});

app.post("/api/logout", authenticateToken, async (req, res) => {
  console.log("Logout request received");
  console.log("Cookies before clearing:", req.cookies);

  // Fjern cookien med de samme alternativene som den ble satt med
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/",
  });

  console.log("Cookies after clearing:", req.cookies);
  res.status(200).send("Logged out successfully");
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
