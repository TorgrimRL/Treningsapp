import express from "express";
import db from "../database.js";
import { authenticateToken, csrfProtection } from "../middleware.js";

const router = express.Router();

// Endpoint to add a new mesocycle
router.post("/mesocycles", authenticateToken, (req, res) => {
  const userId = req.user.id; // Assuming req.user contains the authenticated user's information
  const { name, weeks, daysPerWeek, plan, completedDate, isCurrent } = req.body;

  // Update all existing mesocycles to set isCurrent to false
  const updateQuery = "UPDATE mesocycles SET isCurrent = 0 WHERE user_id = ?";
  db.run(updateQuery, [userId], function (err) {
    if (err) {
      console.error("Error updating mesocycles:", err.message);
      return res.status(500).json({ error: "Failed to update mesocycles" });
    }

    // Insert the new mesocycle with isCurrent = true
    const insertQuery = `
      INSERT INTO mesocycles (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;
    const planJson = JSON.stringify(plan);

    db.run(
      insertQuery,
      [name, weeks, daysPerWeek, planJson, userId, completedDate],
      function (err) {
        if (err) {
          console.error("Error creating new mesocycle:", err.message);
          return res
            .status(500)
            .json({ error: "Failed to create new mesocycle" });
        }

        res.status(201).json({
          message: "Mesocycle created successfully",
          mesocycleId: this.lastID,
        });
      }
    );
  });
});

// Fetch all mesocycles
router.get("/mesocycles", authenticateToken, csrfProtection, (req, res) => {
  console.log("Fetching mesocycles for user:", req.user.id);
  const userID = req.user.id;
  const query = "SELECT * FROM mesocycles WHERE user_id = ?";

  db.all(query, [userID], (err, rows) => {
    if (err) {
      console.log("Error fetching mesocycles:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(
      rows.map((row) => ({
        ...row,
        plan: JSON.parse(row.plan),
        isCurrent: !!row.isCurrent,
        completedDate: row.completedDate
          ? new Date(row.completedDate).toISOString()
          : null,
      }))
    );
  });
});

// Update a specific mesocycle
router.put("/mesocycles/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, weeks, plan, daysPerWeek, isCurrent, completedDate } = req.body;

  console.log("Received mesocycle data:", JSON.stringify(req.body, null, 2));

  const query = `
    UPDATE mesocycles
    SET name = ?, weeks = ?, plan = ?, daysPerWeek = ?, isCurrent = ?, completedDate = ?
    WHERE id = ? AND user_id = ?
  `;

  const userID = req.user.id;
  const allDaysCompleted = plan.every((day) =>
    day.exercises.every(
      (exercise) =>
        Array.isArray(exercise.sets) &&
        exercise.sets.every((set) => set.completed)
    )
  );
  const newCompletedDate = allDaysCompleted
    ? new Date().toISOString()
    : completedDate;

  db.run(
    query,
    [
      name,
      weeks,
      JSON.stringify(plan),
      daysPerWeek,
      isCurrent,
      newCompletedDate,
      id,
      userID,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ changes: this.changes });
    }
  );
});

// Endpoint to fetch a specific mesocycle
router.get("/mesocycles/:id", (req, res) => {
  const { id } = req.params;
  const query =
    "SELECT * FROM mesocycles WHERE id = ? AND (user_id = ? OR user_id IS NULL)";

  db.get(query, [id, req.user.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Mesocycle not found" });
    }
    res.json(row);
  });
});

// Endpoint to fetch the current workout
router.get(
  "/current-workout",
  authenticateToken,
  csrfProtection,
  (req, res) => {
    console.log("Fetching current workout for user:", req.user.id);
    const query =
      "SELECT * FROM mesocycles WHERE isCurrent = 1 AND user_id = ?";
    db.get(query, [req.user.id], (err, row) => {
      if (err) {
        console.log("Error fetching current workout:", err);
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        console.log("No current workout found for user:", req.user.id);
        return res.status(404).json({ error: "Current workout not found" });
      }
      res.json({
        ...row,
        plan: JSON.parse(row.plan), // Ensure plan is parsed as JSON
        isCurrent: !!row.isCurrent,
        completedDate: row.completedDate
          ? new Date(row.completedDate).toISOString()
          : null,
      });
    });
  }
);

export default router;
