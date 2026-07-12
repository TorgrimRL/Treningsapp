const auth0SubColumn = "auth0_sub";

// noinspection SqlNoDataSourceInspection,SqlDialectInspection,SqlResolve
const createUsersTableSql = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      auth_provider TEXT DEFAULT 'local',
      ${auth0SubColumn} TEXT,
      email TEXT,
      email_verified INTEGER DEFAULT 0,
      picture TEXT
    )`;

// noinspection SqlNoDataSourceInspection,SqlDialectInspection
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

// noinspection SqlNoDataSourceInspection,SqlDialectInspection
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

export const schemaMigrationStatements = [
  {
    name: "users.auth_provider",
    table: "users",
    column: "auth_provider",
    sql: "ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'",
  },
  {
    name: "users.auth0_sub",
    table: "users",
    column: auth0SubColumn,
    sql: `ALTER TABLE users ADD COLUMN ${auth0SubColumn} TEXT`,
  },
  {
    name: "users.email",
    table: "users",
    column: "email",
    sql: "ALTER TABLE users ADD COLUMN email TEXT",
  },
  {
    name: "users.email_verified",
    table: "users",
    column: "email_verified",
    sql: "ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0",
  },
  {
    name: "users.picture",
    table: "users",
    column: "picture",
    sql: "ALTER TABLE users ADD COLUMN picture TEXT",
  },
  {
    name: "users.auth0_sub_unique",
    // noinspection SqlNoDataSourceInspection,SqlDialectInspection,SqlResolve
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth0_sub
      ON users(${auth0SubColumn})
      WHERE ${auth0SubColumn} IS NOT NULL AND ${auth0SubColumn} != ''`,
  },
];

function getColumnName(row) {
  return row?.name || row?.NAME || row?.[1] || "";
}

async function columnExists(execute, table, column) {
  const rows = await execute(`PRAGMA table_info(${table})`);
  return rows.some(
    (row) => String(getColumnName(row)).toLowerCase() === column.toLowerCase()
  );
}

function isIgnorableMigrationError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("duplicate column name") ||
    message.includes("already exists")
  );
}

export async function ensureSchema(execute, { logger = console } = {}) {
  for (const statement of schemaStatements) {
    await execute(statement.sql);
    logger?.log?.(`${statement.name} table ready`);
  }

  for (const statement of schemaMigrationStatements) {
    try {
      if (
        statement.table &&
        statement.column &&
        (await columnExists(execute, statement.table, statement.column))
      ) {
        logger?.log?.(`${statement.name} migration already applied`);
        continue;
      }

      await execute(statement.sql);
      logger?.log?.(`${statement.name} migration ready`);
    } catch (error) {
      if (!isIgnorableMigrationError(error)) {
        throw error;
      }
    }
  }
}
