import express from "express";
import { authenticateToken, csrfProtection } from "../middleware.js";
import calculateNewTarget from "../utils/calculateNewTarget.js";
import createDeloadWeek from "../utils/createDeloadWeek.js";
import processPlan from "../utils/processPlan.js";
import { safeQuery } from "../utils/safeQuery.js";
import { buildResponsePayload } from "../utils/buildResponsePayload.js";
const router = express.Router();

// Endpoint to add a new mesocycle
router.post("/mesocycles", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, weeks, daysPerWeek, plan, completedDate, isCurrent } =
      req.body;

    const { hadRetry: updateHadRetry } = await safeQuery`
      UPDATE mesocycles 
      SET isCurrent = 0 
      WHERE user_id = ${userId}
    `;

    const planJson = JSON.stringify(plan);

    const { result: insertResult, hadRetry: insertHadRetry } = await safeQuery`
      INSERT INTO mesocycles (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
      VALUES (${name}, ${weeks}, ${daysPerWeek}, ${planJson}, ${userId}, ${completedDate}, 1)
    `;

    const hadRetry = updateHadRetry || insertHadRetry;
    const basePayload = {
      message: "Mesocycle created successfully",
      mesocycleId: insertResult.lastID,
    };
    const responsePayload = buildResponsePayload(hadRetry, basePayload);
    res.status(201).json(responsePayload);
  } catch (err) {
    console.error("Error creating new mesocycle:", err.message);
    res.status(500).json({ error: "Failed to create new mesocycle" });
  }
});

// Fetch all mesocycles
router.get(
  "/mesocycles",
  authenticateToken,
  csrfProtection,
  async (req, res) => {
    try {
      const userID = req.user.id;
      const { result: rows, hadRetry } =
        await safeQuery`SELECT * FROM mesocycles WHERE user_id = ${userID}`;
      const mesocycles = rows.map((row) => ({
        ...row,
        plan: JSON.parse(row.plan),
        isCurrent: !!row.isCurrent,
        completedDate: row.completedDate
          ? new Date(row.completedDate).toISOString()
          : null,
      }));
      const responsePayload = hadRetry
        ? buildResponsePayload(hadRetry, { data: mesocycles })
        : mesocycles;
      res.json(responsePayload);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update a specific mesocycle
router.put("/mesocycles/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, weeks, plan, daysPerWeek, isCurrent, completedDate } =
      req.body;
    const userID = req.user.id;
    const allDaysCompleted = plan.every((day) =>
      day.exercises.every(
        (exercise) =>
          Array.isArray(exercise.sets) &&
          exercise.sets.every((set) => set.completed)
      )
    );
    const newCompletedDate =
      allDaysCompleted && !completedDate
        ? new Date().toISOString()
        : completedDate;
    const { result, hadRetry } = await safeQuery`
      UPDATE mesocycles
      SET name = ${name}, weeks = ${weeks}, plan = ${JSON.stringify(plan)}, 
          daysPerWeek = ${daysPerWeek}, isCurrent = ${isCurrent ? 1 : 0}, 
          completedDate = ${newCompletedDate}
      WHERE id = ${id} AND user_id = ${userID}
    `;
    const basePayload = {
      changes: result.changes,
      message: "Mesocycle updated successfully",
    };
    const responsePayload = buildResponsePayload(hadRetry, basePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch a specific mesocycle
router.get("/mesocycles/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { result: rows, hadRetry } = await safeQuery`
      SELECT * FROM mesocycles WHERE id = ${id} AND (user_id = ${req.user.id} OR user_id IS NULL)
    `;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Mesocycle not found" });
    }
    const row = rows[0];
    const responsePayload = hadRetry
      ? buildResponsePayload(hadRetry, { data: row })
      : row;
    res.json(responsePayload);
  } catch (err) {
    console.error("Error fetching mesocycle:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch all mesocycle names for the authenticated user
router.get("/mesocycle-names", authenticateToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { result: mesocycles, hadRetry } = await safeQuery`
      SELECT name FROM mesocycles WHERE user_id = ${userID}
    `;
    const names = mesocycles.map((mesocycle) => mesocycle.name);
    const responsePayload = hadRetry
      ? buildResponsePayload(hadRetry, { data: names })
      : names;
    res.status(200).json(responsePayload);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to fetch the current workout
router.get(
  "/current-workout",
  authenticateToken,
  csrfProtection,
  async (req, res) => {
    try {
      const userID = req.user.id;
      const { result: rows, hadRetry } = await safeQuery`
      SELECT * FROM mesocycles WHERE isCurrent = 1 AND user_id = ${userID}
    `;
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Current workout not found" });
      }
      const row = rows[0];
      let plan;
      try {
        plan = JSON.parse(row.plan);
      } catch (error) {
        return res.status(500).json({ error: "Invalid plan data" });
      }

      const { updatedPlan, firstIncompleteDayIndex } = processPlan(plan);
      const daysPerWeek = row.daysPerWeek;
      const totalWeeks = row.weeks;
      const finalPlan = updatedPlan.map((day, dayIndex) => {
        const currentWeek = Math.floor(dayIndex / daysPerWeek) + 1;
        const firstWeekExercises = plan[dayIndex % daysPerWeek].exercises;
        return {
          ...day,
          exercises: day.exercises.map((exercise, exerciseIndex) => {
            if (dayIndex >= daysPerWeek) {
              const previousWeekIndex = dayIndex - daysPerWeek;
              const previousWeekExercise =
                plan[previousWeekIndex].exercises[exerciseIndex];
              if (!previousWeekExercise) return exercise;
              if (!Array.isArray(exercise.sets)) return exercise;
              const isDeloadWeek = currentWeek === totalWeeks;
              if (isDeloadWeek) {
                return createDeloadWeek(
                  firstWeekExercises,
                  plan[dayIndex].exercises
                )[exerciseIndex];
              }
              const updatedSets = exercise.sets.map((set, setIndex) => {
                const prevWeekset = previousWeekExercise.sets[setIndex];
                if (!prevWeekset) return set;
                const lastWeekWeight = prevWeekset.completed
                  ? parseFloat(prevWeekset.weight)
                  : parseFloat(prevWeekset.targetWeight);
                const lastWeekReps = prevWeekset.completed
                  ? parseInt(prevWeekset.reps, 10)
                  : parseInt(prevWeekset.targetReps, 10);
                const previousFactor =
                  [1.0, 1.05, 1.075, 1.1, 1.125][currentWeek - 2] || 1.0;
                const currentFactor = [1.0, 1.05, 1.075, 1.1, 1.125][
                  currentWeek - 1
                ];
                const newTarget = calculateNewTarget(
                  lastWeekWeight,
                  lastWeekReps,
                  previousWeekExercise.type,
                  previousFactor,
                  currentFactor
                );
                const weightToUse =
                  !prevWeekset.completed || set.completed
                    ? set.weight
                    : newTarget.weight;
                const repsToUse =
                  !prevWeekset.completed || set.completed
                    ? set.reps
                    : newTarget.reps;
                return {
                  ...set,
                  weight: weightToUse,
                  reps: repsToUse,
                  targetWeight: newTarget.weight,
                  targetReps: newTarget.reps,
                };
              });
              return { ...exercise, sets: updatedSets };
            }
            return exercise;
          }),
        };
      });

      const finalResponse = {
        ...row,
        plan: finalPlan,
        isCurrent: !!row.isCurrent,
        completedDate: row.completedDate
          ? new Date(row.completedDate).toISOString()
          : null,
        totalWeeks: row.weeks,
        daysPerWeek: row.daysPerWeek,
        firstIncompleteDayIndex,
      };

      const responsePayload = hadRetry
        ? buildResponsePayload(hadRetry, { data: finalResponse })
        : finalResponse;

      res.json(responsePayload);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
