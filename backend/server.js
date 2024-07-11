import express from "express";
import bodyParser from "body-parser";
import db from "./database.js";
import Joi from "joi";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import cors from "cors";
import mesocycleRoutes from "./routes/mesocycleRoutes.js";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser());

// Cross Origin Resource Sharing
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log("Request Headers:", req.headers);
  console.log("Cookies:", req.cookies);
  next();
});
// CSRF-beskyttelse middleware
const csrfProtection = csurf({ cookie: true });
// app.use(csrfProtection);

const secretKey = "secretkey";

// Middleware for å verifisere token
export const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    console.log("No token provided");
    return res.status(401).send("Access Denied");
  }
  try {
    const verified = jwt.verify(token.split(" ")[1], secretKey); // Split for å håndtere 'Bearer' token
    req.user = verified;
    next();
  } catch (error) {
    console.log("Invalid Token:", error);
    res.status(400).send("Invalid Token");
  }
};

app.use("/api", mesocycleRoutes);

// Rute for å hente en CSRF-token
app.get("/csrf-token", authenticateToken, csrfProtection, (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  console.log("Generated CSRF Token:", csrfToken);
  res.json({ csrfToken });
});

// Rute for brukerregistrering (uten CSRF-beskyttelse)
app.post("/register", async (req, res) => {
  console.log("Received body:", req.body);
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) return res.status(500).json({ message: err.message });
      if (user)
        return res.status(400).json({ message: "Username already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        function (err) {
          if (err) return res.status(500).json({ message: err.message });
          res.status(201).json({ message: "User registered" });
        }
      );
    }
  );
});

// Rute for brukerpålogging
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        console.log("Database Error:", err);
        return res.status(500).send(err.message);
      }
      if (!user) {
        console.log("Username not found");
        return res.status(400).send("Username or password is incorrect");
      }
      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) {
        console.log("Invalid password");
        return res.status(400).send("Username or password is incorrect");
      }

      const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "1h" });
      console.log("Generated Token:", token);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      res.json({ token });
    }
  );
});

//Endepunkt for å logge ut en bruker
app.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.status(200).send("Logged out successfully");
});

//Endepunkt for å slette en bruker
app.delete(
  "/users/:username",
  authenticateToken,
  csrfProtection,
  (req, res) => {
    const { username } = req.params;
    db.run("DELETE FROM users WHERE username = ?", [username], function (err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (this.changes === 0) {
        return res.status(404).send("User not found");
      }
      res.status(200).send("User deleted");
    });
  }
);

// Type håndtering av treningsskjema
const workoutSchema = Joi.object({
  type: Joi.string().required(),
  duration: Joi.number().integer().required(),
}).strict();

// Rute for å håndtere GET-forespørsler til roten
app.get("/", (req, res) => {
  res.send("Welcome to the Workout App API!");
});

// Endepunkt for å lage en ny treningsøkt
app.post("/workouts", authenticateToken, csrfProtection, (req, res) => {
  const { error } = workoutSchema.validate(req.body);
  if (error) {
    console.log("Validation Error:", error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { type, duration } = req.body;
  db.run(
    "INSERT INTO workouts (type, duration) VALUES (?, ?)",
    [type, duration],
    function (err) {
      if (err) {
        console.log("Database Error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Endepunkt for å hente alle treningsøkter
app.get("/workouts", authenticateToken, csrfProtection, (req, res) => {
  db.all("SELECT * FROM workouts", [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(rows);
  });
});

// Endepunkt for å hente en spesifikk treningsøkt
app.get("/workouts/:id", authenticateToken, csrfProtection, (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM workouts WHERE id= ?", [id], (err, row) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!row) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json(row);
  });
});

//Endepunkt for å oppdatere en treningsøkt
app.put("/workouts/:id", authenticateToken, csrfProtection, (req, res) => {
  const { id } = req.params;
  const { type, duration } = req.body;
  db.run(
    "UPDATE workouts SET type = ?, duration = ? WHERE id = ?",
    [type, duration, id],
    function (err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(200).json({ changes: this.changes });
    }
  );
});

//Endepunkt for å slette en treningsøkt
app.delete("/workouts/:id", authenticateToken, csrfProtection, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM workouts WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(200).json({ changes: this.changes });
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
