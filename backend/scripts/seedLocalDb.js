import { pathToFileURL } from "node:url";
import { createLocalDatabase } from "../db/localDatabase.js";
import { ensureSchema } from "../db/schema.js";

export const demoCredentials = {
  username: "demo@example.com",
  auth0Sub: null,
};

const customExercises = [
  ["Paused Bench Press", "barbell", "Chest", "https://example.com/paused-bench"],
  ["Chest Supported Row", "machine", "Back", "https://example.com/chest-row"],
  ["Cable Lateral Raise", "cable", "Side Delts", "https://example.com/lateral"],
  ["Lat Pulldown", "cable", "Back", "https://example.com/lat-pulldown"],
  ["Triceps Pressdown", "cable", "Triceps", "https://example.com/triceps-pressdown"],
  ["Incline Dumbbell Curl", "dumbbell", "Biceps", "https://example.com/incline-curl"],
  ["Romanian Deadlift", "barbell", "Hamstrings", "https://example.com/rdl"],
  ["Hack Squat", "machine", "Quads", "https://example.com/hack-squat"],
  ["Leg Extension", "machine", "Quads", "https://example.com/leg-extension"],
  ["Seated Leg Curl", "machine", "Hamstrings", "https://example.com/leg-curl"],
  ["Standing Calf Raise", "machine", "Calves", "https://example.com/calf-raise"],
  ["Cable Crunch", "cable", "Abs", "https://example.com/cable-crunch"],
];

const upperDayExercises = [
  ["Paused Bench Press", "barbell", "Chest", 80, 2.5, [6, 7, 8]],
  ["Chest Supported Row", "machine", "Back", 60, 2, [10, 10, 9]],
  ["Cable Lateral Raise", "cable", "Side Delts", 12, 1, [15, 14, 13]],
  ["Lat Pulldown", "cable", "Back", 55, 2.5, [10, 10, 9]],
  ["Triceps Pressdown", "cable", "Triceps", 25, 2.5, [12, 11, 10]],
  ["Incline Dumbbell Curl", "dumbbell", "Biceps", 12, 1, [12, 11, 10]],
];

const lowerDayExercises = [
  ["Hack Squat", "machine", "Quads", 110, 2.5, [8, 8, 7]],
  ["Romanian Deadlift", "barbell", "Hamstrings", 100, 2.5, [8, 8, 7]],
  ["Leg Extension", "machine", "Quads", 55, 2.5, [12, 11, 10]],
  ["Seated Leg Curl", "machine", "Hamstrings", 45, 2.5, [12, 11, 10]],
  ["Standing Calf Raise", "machine", "Calves", 80, 5, [12, 12, 10]],
  ["Cable Crunch", "cable", "Abs", 35, 2.5, [15, 14, 12]],
];

function set(weight, reps, completed = false) {
  return {
    weight: String(weight),
    reps: String(reps),
    targetWeight: String(weight),
    targetReps: String(reps),
    completed,
  };
}

function exercise(exerciseName, type, muscleGroup, sets) {
  return {
    exercise: exerciseName,
    type,
    muscleGroup,
    videoLink: "",
    priority: muscleGroup,
    sets,
  };
}

function withWorkoutTimestamps(day, startedAt, completedAt) {
  return {
    ...day,
    startedAt,
    completedAt,
  };
}

const currentWorkoutTimestamps = [
  ["2026-07-20T16:00:00.000Z", "2026-07-20T17:05:00.000Z"],
  ["2026-07-22T16:30:00.000Z", "2026-07-22T17:35:00.000Z"],
  ["2026-07-27T16:00:00.000Z", "2026-07-27T17:03:00.000Z"],
  ["2026-07-29T16:30:00.000Z", "2026-07-29T17:38:00.000Z"],
];

const completedWorkoutTimestamps = [
  ["2026-01-12T16:00:00.000Z", "2026-01-12T17:05:00.000Z"],
  ["2026-01-14T16:30:00.000Z", "2026-01-14T17:35:00.000Z"],
];

function workoutDay(label, definitions, weekIndex, completed) {
  return {
    label,
    exercises: definitions.map(
      ([name, type, muscleGroup, startWeight, weeklyIncrease, reps]) => {
        const weight = startWeight + weeklyIncrease * weekIndex;
        return exercise(
          name,
          type,
          muscleGroup,
          reps.map((setReps) => set(weight, setReps, completed))
        );
      }
    ),
  };
}

function currentPlan() {
  const plan = Array.from({ length: 5 }, (_, weekIndex) => {
    const completed = weekIndex < 2;
    return [
      workoutDay("Monday", upperDayExercises, weekIndex, completed),
      workoutDay("Wednesday", lowerDayExercises, weekIndex, completed),
    ];
  }).flat();

  return plan.map((day, dayIndex) => {
    const timestamps = currentWorkoutTimestamps[dayIndex];
    return timestamps
      ? withWorkoutTimestamps(day, timestamps[0], timestamps[1])
      : day;
  });
}

function completedPlan() {
  return currentPlan().slice(0, 2).map((day, dayIndex) => {
    const timestamps = completedWorkoutTimestamps[dayIndex];
    const completedDay = {
      ...day,
      exercises: day.exercises.map((item) => ({
        ...item,
        sets: item.sets.map((itemSet) => ({ ...itemSet, completed: true })),
      })),
    };

    return withWorkoutTimestamps(
      completedDay,
      timestamps[0],
      timestamps[1]
    );
  });
}

function oldPlan() {
  return [workoutDay("Friday", upperDayExercises, 0, false)];
}

async function findExistingDemoUser(db) {
  const users = await db.sql`
    SELECT * FROM users
    WHERE username = ${demoCredentials.username}
    LIMIT 1
  `;
  return users[0] || null;
}

async function resetTables(db, existingDemoUser) {
  // noinspection SqlNoDataSourceInspection
  await db.sql("PRAGMA foreign_keys = OFF");
  // noinspection SqlNoDataSourceInspection
  await db.sql("DELETE FROM exercises");
  // noinspection SqlNoDataSourceInspection
  await db.sql("DELETE FROM Mesocycles");
  if (existingDemoUser) {
    // noinspection SqlNoDataSourceInspection
    await db.sql`DELETE FROM users WHERE id != ${existingDemoUser.id}`;
    // noinspection SqlNoDataSourceInspection
    await db.sql(
      "DELETE FROM sqlite_sequence WHERE name IN ('Mesocycles', 'exercises')"
    );
  } else {
    // noinspection SqlNoDataSourceInspection
    await db.sql("DELETE FROM users");
    // noinspection SqlNoDataSourceInspection
    await db.sql(
      "DELETE FROM sqlite_sequence WHERE name IN ('users', 'Mesocycles', 'exercises')"
    );
  }
  // noinspection SqlNoDataSourceInspection
  await db.sql("PRAGMA foreign_keys = ON");
}

async function countRows(db, tableName) {
  // noinspection SqlNoDataSourceInspection
  const rows = await db.sql(`SELECT COUNT(*) AS count FROM ${tableName}`);
  return rows[0].count;
}

export async function seedLocalDatabase({
  dbPath,
  requireLocalMode = true,
  logger = console,
} = {}) {
  if (requireLocalMode && process.env.DB_MODE !== "local") {
    throw new Error("Refusing to seed unless DB_MODE=local");
  }

  const db = createLocalDatabase({ dbPath });

  try {
    await ensureSchema((sql, ...values) => db.sql(sql, ...values), { logger });
    const existingDemoUser = await findExistingDemoUser(db);
    await resetTables(db, existingDemoUser);

    let userId;
    if (existingDemoUser) {
      userId = existingDemoUser.id;
      // noinspection SqlNoDataSourceInspection
      await db.sql`
        UPDATE users
        SET username = ${demoCredentials.username},
            password = ${null},
            auth_provider = ${"auth0"},
            email = ${demoCredentials.username},
            email_verified = ${1}
        WHERE id = ${userId}
      `;
    } else {
      // noinspection SqlNoDataSourceInspection
      const userResult = await db.sql`
        INSERT INTO users
          (username, password, auth_provider, auth0_sub, email, email_verified, picture)
        VALUES
          (${demoCredentials.username}, ${null}, ${"auth0"}, ${demoCredentials.auth0Sub}, ${demoCredentials.username}, ${1}, ${null})
      `;
      userId = userResult.lastID;
    }

    for (const [name, type, muscleGroup, videolink] of customExercises) {
      // noinspection SqlNoDataSourceInspection
      await db.sql`
        INSERT INTO exercises (name, type, muscleGroup, videolink, user_id)
        VALUES (${name}, ${type}, ${muscleGroup}, ${videolink}, ${userId})
      `;
    }

    // noinspection SqlNoDataSourceInspection
    await db.sql`
      INSERT INTO Mesocycles (name, weeks, daysPerWeek, plan, completedDate, isCurrent, user_id)
      VALUES (${"Demo Current Block"}, ${5}, ${2}, ${JSON.stringify(
        currentPlan()
      )}, ${null}, ${1}, ${userId})
    `;
    // noinspection SqlNoDataSourceInspection
    await db.sql`
      INSERT INTO Mesocycles (name, weeks, daysPerWeek, plan, completedDate, isCurrent, user_id)
      VALUES (${"Completed Demo Block"}, ${1}, ${2}, ${JSON.stringify(
        completedPlan()
      )}, ${new Date("2026-01-14T17:35:00.000Z").toISOString()}, ${0}, ${userId})
    `;
    // noinspection SqlNoDataSourceInspection
    await db.sql`
      INSERT INTO Mesocycles (name, weeks, daysPerWeek, plan, completedDate, isCurrent, user_id)
      VALUES (${"Old Upper Focus"}, ${1}, ${1}, ${JSON.stringify(
        oldPlan()
      )}, ${null}, ${0}, ${userId})
    `;

    const summary = {
      dbPath: db.path,
      demoUser: demoCredentials.username,
      users: await countRows(db, "users"),
      exercises: await countRows(db, "exercises"),
      mesocycles: await countRows(db, "Mesocycles"),
    };

    logger?.log?.(
      `Seeded local database at ${summary.dbPath} for ${summary.demoUser}`
    );

    return summary;
  } finally {
    await db.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedLocalDatabase().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
