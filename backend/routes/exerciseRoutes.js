import express from "express";
import { authenticateToken, csrfProtection } from "../middleware.js";
import { safeQuery } from "../utils/safeQuery.js";
import { buildResponsePayload } from "../utils/buildResponsePayload.js";
const router = express.Router();

export default router;

// Endpoint to add a a new exercise
router.post("/exercises", authenticateToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { name, type, muscleGroup, videolink } = req.body;
    const { result, hadRetry } = await safeQuery`
      INSERT INTO exercises (name, type, muscleGroup, videolink, user_id)
      VALUES (${name}, ${type}, ${muscleGroup}, ${videolink}, ${userID})
    `;
    const responsePayload = buildResponsePayload(hadRetry, {
      message: "Exercise created successfully",
      exerciseID: result.lastID,
    });
    res.status(201).json(responsePayload);
  } catch (error) {
    console.error("Error creating new exercise:", error.message);
    res.status(500).json({ error: "Failed to create a new exercise" });
  }
});

router.get("/exercises", authenticateToken, async (req, res) => {
  const userID = req.user.id;
  try {
    const { result: rows, hadRetry } = await safeQuery`
      SELECT * FROM exercises WHERE user_id = ${userID}
    `;
    const responsePayload = hadRetry
      ? buildResponsePayload(hadRetry, { data: rows })
      : rows;
    res.json(responsePayload);
  } catch (err) {
    console.log("Error fetching exercises:", err);
    res.status(500).json({ error: err.message });
  }
});
