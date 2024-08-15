import express from "express";
import db from "../remoteDatabase.js";
import { authenticateToken, csrfProtection } from "../middleware.js";

const router = express.Router();

export default router;

// Endpoint to adda a new exercise
router.post("/exercises", authenticateToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { name, type, muscleGroup, videolink } = req.body;

    const result =
      await db.sql`INSERT INTO exercises (name, type, muscleGroup, videolink, user_id) VALUES (${name}, ${type}, ${muscleGroup}, ${videolink}, ${userID})`;
    res.status(201).json({
      message: "Exercise created successfully",
      exerciseID: result.lastID,
    });
  } catch (error) {
    console.error("Error creating new exercise:", err.message);
    res.status(500).json({ error: "Failed to create a new exercise" });
  }
});

router.get("/exercises", authenticateToken, async (req, res) => {
  const userID = req.user.id;
  try {
    const rows =
      await db.sql`SELECT * FROM exercises WHERE user_id = ${userID}`;
    res.json(rows);
  } catch (err) {
    console.log("Error fetching mesocycles:", err);
    res.status(500).json({ error: err.message });
  }
});
