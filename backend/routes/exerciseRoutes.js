import express from "express";
import db from "../database.js";
import { authenticateToken, csrfProtection } from "../middleware.js";

const router = express.Router();

export default router;

// Endpoint to ada a new exercise
router.post("/exercises", authenticateToken, (req, res) => {
  const userID = req.user.id;
  const { name, type, muscleGroup, videolink } = req.body;

  const insertQuery = `INSERT INTO exercises (name, type, muscleGroup, videolink, user_id) VALUES (?, ?, ?, ?, ?)`;

  db.run(
    insertQuery,
    [name, type, muscleGroup, videolink, userID],
    function (err) {
      if (err) {
        console.error("Error creating new exercise:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to create a new exercise" });
      }
      res.status(201).json({
        message: "Exercise created successfully",
        exerciseID: this.lastID,
      });
    }
  );
});

router.get("/exercises", authenticateToken, (req, res) => {
  const userID = req.user.id;

  const query = "SELECT * FROM exercises WHERE user_id = ?";

  db.all(query, [userID], (err, rows) => {
    if (err) {
      console.log("Error fetching mesocycles:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});
