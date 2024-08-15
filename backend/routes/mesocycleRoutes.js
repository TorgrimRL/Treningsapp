import express from "express";
import db from "../remoteDatabase.js";
import { authenticateToken, csrfProtection } from "../middleware.js";
import calculateNewTarget from "../utils/calculateNewTarget.js";
import createDeloadWeek from "../utils/createDeloadWeek.js";

const router = express.Router();

// Endpoint to add a new mesocycle
router.post("/mesocycles", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, weeks, daysPerWeek, plan, completedDate, isCurrent } =
      req.body;

    await db.sql`UPDATE mesocycles SET isCurrent = 0 WHERE user_id = ${userId}`;

    const planJson = JSON.stringify(plan);
    const result = await db.sql`
      INSERT INTO mesocycles (name, weeks, daysPerWeek, plan, user_id, completedDate, isCurrent)
      VALUES (${name}, ${weeks}, ${daysPerWeek}, ${planJson}, ${userId}, ${completedDate}, 1)
    `;

    res.status(201).json({
      message: "Mesocycle created successfully",
      mesocycleId: result.lastID,
    });
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
      console.log("Fetching mesocycles for user:", req.user.id);
      const userID = req.user.id;
      const rows =
        await db.sql`SELECT * FROM mesocycles WHERE user_id = ${userID}`;

      const mesocycles = rows.map((row) => ({
        ...row,
        plan: JSON.parse(row.plan),
        isCurrent: !!row.isCurrent,
        completedDate: row.completedDate
          ? new Date(row.completedDate).toISOString()
          : null,
      }));

      res.json(mesocycles);
    } catch (err) {
      console.log("Error fetching mesocycles:", err);
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

    console.log("Received mesocycle data:", JSON.stringify(req.body, null, 2));

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

    const result = await db.sql`
      UPDATE mesocycles
      SET name = ${name}, weeks = ${weeks}, plan = ${JSON.stringify(plan)}, 
          daysPerWeek = ${daysPerWeek}, isCurrent = ${isCurrent}, 
          completedDate = ${newCompletedDate}
      WHERE id = ${id} AND user_id = ${userID}
    `;

    console.log("Updated mesocycle successfully with changes:", result.changes);
    res.status(200).json({ changes: result.changes });
  } catch (err) {
    console.error("Error updating mesocycle:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch a specific mesocycle
router.get("/mesocycles/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const row = await db.sql`
      SELECT * FROM mesocycles WHERE id = ${id} AND (user_id = ${req.user.id} OR user_id IS NULL)
    `;

    if (!row) {
      return res.status(404).json({ error: "Mesocycle not found" });
    }

    res.json(row);
  } catch (err) {
    console.error("Error fetching mesocycle:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch the current workout
// router.get(
//   "/current-workout",
//   authenticateToken,
//   csrfProtection,
//   async (req, res) => {
//     try {
//       console.log("Fetching current workout for user:", req.user.id);
//       const result = await db.sql`
//       SELECT * FROM mesocycles WHERE isCurrent = 1 AND user_id = ${req.user.id}
//     `;
//       console.log("Result from db.sql:", result);

//       const row = result[0]; // Hvis result er en array, henter vi den første raden
//       if (!row) {
//         console.log("No current workout found for user:", req.user.id);
//         return res.status(404).json({ error: "Current workout not found" });
//       }
//       console.log("Raw plan data:", row.plan);
//       let plan;
//       try {
//         plan = JSON.parse(row.plan);
//       } catch (error) {
//         return res.status(500).json({ error: "Invalid plan data" });
//       }

//       // Resten av logikken som oppdaterer planen og returnerer responsen
//     } catch (err) {
//       console.error("Error fetching current workout:", err.message);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

router.get(
  "/current-workout",
  authenticateToken,
  csrfProtection,
  async (req, res) => {
    try {
      console.log("Fetching current workout for user:", req.user.id);
      const result = await db.sql`
      SELECT * FROM mesocycles WHERE isCurrent = 1 AND user_id = ${req.user.id}
    `;
      const row = result[0];
      if (!row) {
        console.log("No current workout found for user:", req.user.id);
        return res.status(404).json({ error: "Current workout not found" });
      }
      console.log("Raw plan data:", row.plan);
      let plan;
      try {
        plan = JSON.parse(row.plan);
      } catch (error) {
        return res.status(500).json({ error: "Invalid plan data" });
      }
      const daysPerWeek = row.daysPerWeek;
      const totalWeeks = row.weeks;
      const firstWeekExercises = plan[0].exercises;

      const updatedPlan = plan.map((day, dayIndex) => {
        const currentWeek = Math.floor(dayIndex / daysPerWeek) + 1;

        return {
          ...day,
          exercises: day.exercises.map((exercise, exerciseIndex) => {
            if (dayIndex >= daysPerWeek) {
              const previousWeekIndex = dayIndex - daysPerWeek;
              const previousWeekExercise =
                plan[previousWeekIndex].exercises[exerciseIndex];

              if (!previousWeekExercise) {
                console.error(
                  `No previousWeekExercise found for exerciseIndex: ${exerciseIndex} on dayIndex: ${dayIndex}`
                );
                return exercise;
              }
              if (!Array.isArray(exercise.sets)) {
                console.error(
                  `Exercise sets is not an array for exerciseIndex: ${exerciseIndex} on dayIndex: ${dayIndex}`
                );
                return exercise;
              }
              const isDeloadWeek = currentWeek === totalWeeks;
              if (isDeloadWeek) {
                return createDeloadWeek(
                  firstWeekExercises,
                  plan[dayIndex].exercises
                )[exerciseIndex];
              }

              const updatedSets = exercise.sets.map((set, setIndex) => {
                const prevWeekset = previousWeekExercise.sets[setIndex];
                if (!prevWeekset) {
                  console.error(
                    `No corresponding set found for setIndex: ${setIndex} in previous week exercise`
                  );
                  return set;
                }

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
              return {
                ...exercise,
                sets: updatedSets,
              };
            }
            return exercise;
          }),
        };
      });

      res.json({
        ...row,
        plan: updatedPlan,
        isCurrent: !!row.isCurrent,
        completedDate: row.completedDate
          ? new Date(row.completedDate).toISOString()
          : null,
        totalWeeks: row.weeks,
        daysPerWeek: row.daysPerWeek,
      });
    } catch (err) {
      console.error("Error fetching current workout:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
