// noinspection SqlNoDataSourceInspection
const createUsersTableSql = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`;

// noinspection SqlNoDataSourceInspection
const createMesocyclesTableSql = `CREATE TABLE IF NOT EXISTS Mesocycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      weeks INTEGER,
      plan TEXT,
      daysPerWeek INTEGER,
      completedDate TEXT,
      isCurrent INTEGER,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`;

// noinspection SqlNoDataSourceInspection
const createExercisesTableSql = `CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      muscleGroup TEXT,
      videolink TEXT,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`;

export const schemaStatements = [
  {
    name: "users",
    sql: createUsersTableSql,
  },
  {
    name: "Mesocycles",
    sql: createMesocyclesTableSql,
  },
  {
    name: "exercises",
    sql: createExercisesTableSql,
  },
];

export async function ensureSchema(execute, { logger = console } = {}) {
  for (const statement of schemaStatements) {
    await execute(statement.sql);
    logger?.log?.(`${statement.name} table ready`);
  }
}
