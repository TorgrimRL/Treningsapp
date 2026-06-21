import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";
import { createLocalDatabase } from "../db/localDatabase.js";
import { ensureSchema } from "../db/schema.js";

export const demoCredentials = {
  username: "demo@example.com",
  password: "demo1234",
};

const customExercises = [
  ["Paused Bench Press", "barbell", "Chest", "https://example.com/paused-bench"],
  ["Chest Supported Row", "machine", "Back", "https://example.com/chest-row"],
  ["Cable Lateral Raise", "cable", "Side Delts", "https://example.com/lateral"],
  ["Romanian Deadlift", "barbell", "Hamstrings", "https://example.com/rdl"],
  ["Hack Squat", "machine", "Quads", "https://example.com/hack-squat"],
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

function currentPlan() {
  return [
    {
      label: "Monday",
      exercises: [
        exercise("Paused Bench Press", "barbell", "Chest", [
          set(80, 8, true),
          set(80, 8, true),
        ]),
        exercise("Chest Supported Row", "machine", "Back", [
          set(60, 10, true),
          set(60, 10, true),
        ]),
      ],
    },
    {
      label: "Wednesday",
      exercises: [
        exercise("Hack Squat", "machine", "Quads", [
          set(110, 8, true),
          set(110, 8, true),
        ]),
        exercise("Romanian Deadlift", "barbell", "Hamstrings", [
          set(100, 8, true),
          set(100, 8, true),
        ]),
      ],
    },
    {
      label: "Monday",
      exercises: [
        exercise("Paused Bench Press", "barbell", "Chest", [
          set(82.5, 8, true),
          set(82.5, 8, true),
        ]),
        exercise("Chest Supported Row", "machine", "Back", [
          set(62, 10, true),
          set(62, 10, true),
        ]),
      ],
    },
    {
      label: "Wednesday",
      exercises: [
        exercise("Hack Squat", "machine", "Quads", [
          set(112.5, 8, true),
          set(112.5, 8, true),
        ]),
        exercise("Romanian Deadlift", "barbell", "Hamstrings", [
          set(102.5, 8, true),
          set(102.5, 8, true),
        ]),
      ],
    },
    {
      label: "Monday",
      exercises: [
        exercise("Paused Bench Press", "barbell", "Chest", [
          set(85, 8, false),
          set(85, 8, false),
        ]),
        exercise("Chest Supported Row", "machine", "Back", [
          set(64, 10, false),
          set(64, 10, false),
        ]),
      ],
    },
    {
      label: "Wednesday",
      exercises: [
        exercise("Hack Squat", "machine", "Quads", [
          set(115, 8, false),
          set(115, 8, false),
        ]),
        exercise("Romanian Deadlift", "barbell", "Hamstrings", [
          set(105, 8, false),
          set(105, 8, false),
        ]),
      ],
    },
    {
      label: "Monday",
      exercises: [
        exercise("Paused Bench Press", "barbell", "Chest", [
          set(0, 0, false),
          set(0, 0, false),
        ]),
        exercise("Chest Supported Row", "machine", "Back", [
          set(0, 0, false),
          set(0, 0, false),
        ]),
      ],
    },
    {
      label: "Wednesday",
      exercises: [
        exercise("Hack Squat", "machine", "Quads", [
          set(0, 0, false),
          set(0, 0, false),
        ]),
        exercise("Romanian Deadlift", "barbell", "Hamstrings", [
          set(0, 0, false),
          set(0, 0, false),
        ]),
      ],
    },
    {
      label: "Monday",
      exercises: [
        exercise("Paused Bench Press", "barbell", "Chest", [
          set(0, 0, false),
          set(0, 0, false),
        ]),
        exercise("Chest Supported Row", "machine", "Back", [
          set(0, 0, false),
          set(0, 0, false),
        ]),
      ],
    },
    {
      label: "Wednesday",
      exercises: [
        exercise("Hack Squat", "machine", "Quads", [
          set(0, 0, false),
          set(0, 0, false),
        ]),
        exercise("Romanian Deadlift", "barbell", "Hamstrings", [
          set(0, 0, false),
          set(0, 0, false),
        ]),
      ],
    },
  ];
}
function completedPlan() {
  return currentPlan().slice(0, 2).map((day) => ({
    ...day,
    exercises: day.exercises.map((item) => ({
      ...item,
      sets: item.sets.map((itemSet) => ({ ...itemSet, completed: true })),
    })),
  }));
}

function oldPlan() {
  return [
    {
      label: "Friday",
      exercises: [
        exercise("Cable Lateral Raise", "cable", "Side Delts", [
          set(12, 15, false),
          set(12, 15, false),
        ]),
      ],
    },
  ];
}

async function resetTables(db) {
  // noinspection SqlNoDataSourceInspection
  await db.sql("PRAGMA foreign_keys = OFF");
  // noinspection SqlNoDataSourceInspection
  await db.sql("DELETE FROM exercises");
  // noinspection SqlNoDataSourceInspection
  await db.sql("DELETE FROM Mesocycles");
  // noinspection SqlNoDataSourceInspection
  await db.sql("DELETE FROM users");
  // noinspection SqlNoDataSourceInspection
  await db.sql(
    "DELETE FROM sqlite_sequence WHERE name IN ('users', 'Mesocycles', 'exercises')"
  );
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
    await resetTables(db);

    const hashedPassword = await bcrypt.hash(demoCredentials.password, 10);
    // noinspection SqlNoDataSourceInspection
    const userResult = await db.sql`
      INSERT INTO users (username, password)
      VALUES (${demoCredentials.username}, ${hashedPassword})
    `;
    const userId = userResult.lastID;

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
      )}, ${new Date("2026-01-15T12:00:00.000Z").toISOString()}, ${0}, ${userId})
    `;
    // noinspection SqlNoDataSourceInspection
    await db.sql`
      INSERT INTO Mesocycles (name, weeks, daysPerWeek, plan, completedDate, isCurrent, user_id)
      VALUES (${"Old Shoulder Focus"}, ${1}, ${1}, ${JSON.stringify(
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
