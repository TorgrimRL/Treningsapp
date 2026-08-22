import express from "express";
import { authenticateToken, csrfProtection } from "../middleware.js";
import { safeQuery } from "../utils/safeQuery.js";
import { buildResponsePayload } from "../utils/buildResponsePayload.js";
const router = express.Router();

const muscleGroups = new Set([
  "Abs", "Back", "Biceps", "Calves", "Chest", "Forearms", "Front Delts",
  "Glutes", "Hamstrings", "Quads", "Rear Delts", "Side Delts", "Traps", "Triceps",
]);
const exerciseTypes = new Set(["barbell", "machine", "dumbbell", "bodyweight", "cable"]);
const MAX_EXERCISE_NAME_LENGTH = 120;

function normalizeExerciseInput(body = {}) {
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const type = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
  const muscleGroup = typeof body.muscleGroup === "string" ? body.muscleGroup.trim() : "";
  const videolink = typeof (body.videolink || body.videoLink) === "string" ? (body.videolink || body.videoLink).trim() : "";
  if (!name || name.length > MAX_EXERCISE_NAME_LENGTH || !muscleGroups.has(muscleGroup) || !exerciseTypes.has(type) || videolink.length > 2048) return null;
  return { name, type, muscleGroup, videolink };
}

export default router;

// Endpoint to add a a new exercise
router.post("/exercises", authenticateToken, csrfProtection, async (req, res) => {
  try {
    const userID = req.user.id;
    const exercise = normalizeExerciseInput(req.body);
    if (!exercise) {
      return res.status(400).json({ error: "Exercise name, muscle group, and type are invalid" });
    }
    const existing = await safeQuery`
      SELECT id FROM exercises
      WHERE user_id = ${userID} AND lower(trim(name)) = lower(${exercise.name})
      LIMIT 1
    `;
    if (existing.result?.[0]) {
      return res.status(200).json({ message: "Exercise already exists", exerciseID: existing.result[0].id });
    }
    const { result, hadRetry } = await safeQuery`
      INSERT INTO exercises (name, type, muscleGroup, videolink, user_id)
      VALUES (${exercise.name}, ${exercise.type}, ${exercise.muscleGroup}, ${exercise.videolink}, ${userID})
    `;
    const responsePayload = buildResponsePayload(hadRetry, {
      message: "Exercise created successfully",
      exerciseID: result.lastID,
    });
    res.status(201).json(responsePayload);
  } catch (error) {
    console.error("Error creating new exercise", {
      code: error?.code,
      name: error?.name,
    });
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
    console.error("Error fetching exercises", {
      code: err?.code,
      name: err?.name,
    });
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});
