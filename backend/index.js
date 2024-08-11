import express from "express";
import pkg from "body-parser";
const { json } = pkg;
import db from "./remoteDatabase.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

import cors from "cors";
import mesocycleRoutes from "./routes/mesocycleRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import {
  authenticateToken,
  csrfProtection,
  csrfTokenRoute,
} from "./middleware.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(json());
app.use(cookieParser());

// Cross Origin Resource Sharing
const corsOptions = {
  origin: process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  next();
});

const secretKey = "secretkey";

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

app.get("/register", (req, res) => {
  res.send(
    "This is the register page. Use a POST request to register a new user."
  );
});
// Rute for brukerregistrering (uten CSRF-beskyttelse)
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.sql(
      `SELECT * FROM users WHERE username = ${username}`
    );

    if (user.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.sql`INSERT INTO users (username, password) VALUES (${username}, ${hashedPassword})`;

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Rute for brukerpålogging
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userResult =
      await db.sql`SELECT * FROM users WHERE username = ${username}`;

    const user = userResult[0];
    if (!user) {
      console.log("Username not found");
      return res.status(400).send("Username or password is incorrect");
    }
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      console.log("Invalid password");
      return res.status(400).send("Username or password is incorrect");
    }
    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "365d" });
    console.log("Generated Token:", token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ token });
  } catch (err) {
    console.log("Database Error:", err);
    return res.status(500).send(err.message);
  }
});

//Endepunkt for å sjekke autentiseringsstatus
app.get("/check-auth", authenticateToken, (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ isLoggedIn: false });
  }

  try {
    const verified = jwt.verify(token, secretKey);
    res.json({ isLoggedIn: true });
  } catch (error) {
    res.json({ isLoggedIn: false });
  }
});

// Endepunkt for å logge ut en bruker
app.post("/logout", async (req, res) => {
  console.log("Logout request received");
  console.log("Cookies before clearing:", req.cookies);

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  console.log("Cookies after clearing:", req.cookies);
  res.status(200).send("Logged out successfully");
});

//Endepunkt for å slette en bruker
app.delete(
  "/users/:username",
  authenticateToken,
  csrfProtection,
  async (req, res) => {
    try {
      const { username } = req.params;
      await db.sql`DELETE FROM users WHERE username = ${username}`;
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.log("Database Error");
      res.status(500).json({ message: err.message });
    }
  }
);

// Rute for å håndtere GET-forespørsler til roten
app.get("/", (req, res) => {
  res.send("Welcome to the Workout App API!");
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;