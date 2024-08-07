import express from "express";
import db from "../database.js";
import { authenticateToken, csrfProtection } from "../middleware.js";

const router = express.Router();

export default router;

// Endpoint to adda a new exercise
router.post("/exercises", authenticateToken, (req, res) => {
  const userID = req.user.id;
  const { name, type, musclegroup, videolink } = req.body;

  const insertQuery = `INSERT INTO exercises (name, type, musclegroup, videolink) VALUES (?, ?, ?,?)`;

  db.run(
    insertQuery,
    [name, type, musclegroup, videolink, userID],
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
