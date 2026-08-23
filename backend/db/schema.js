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
      picture TEXT,
      onboarding_version INTEGER DEFAULT 1,
      onboarding_status TEXT DEFAULT 'completed',
      onboarding_step TEXT,
      onboarding_started_at TEXT,
      onboarding_first_set_at TEXT,
      onboarding_completed_at TEXT
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
      include_deload INTEGER DEFAULT 0,
      source_onboarding_draft_id TEXT,
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

const createOnboardingDraftsTableSql = `CREATE TABLE IF NOT EXISTS onboarding_drafts (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      UNIQUE(user_id)
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
  {
    name: "onboarding_drafts",
    sql: createOnboardingDraftsTableSql,
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
    name: "users.onboarding_version",
    table: "users",
    column: "onboarding_version",
    sql: "ALTER TABLE users ADD COLUMN onboarding_version INTEGER DEFAULT 1",
  },
  {
    name: "users.onboarding_status",
    table: "users",
    column: "onboarding_status",
    sql: "ALTER TABLE users ADD COLUMN onboarding_status TEXT DEFAULT 'completed'",
  },
  {
    name: "users.onboarding_step",
    table: "users",
    column: "onboarding_step",
    sql: "ALTER TABLE users ADD COLUMN onboarding_step TEXT",
  },
  {
    name: "users.onboarding_started_at",
    table: "users",
    column: "onboarding_started_at",
    sql: "ALTER TABLE users ADD COLUMN onboarding_started_at TEXT",
  },
  {
    name: "users.onboarding_first_set_at",
    table: "users",
    column: "onboarding_first_set_at",
    sql: "ALTER TABLE users ADD COLUMN onboarding_first_set_at TEXT",
  },
  {
    name: "users.onboarding_completed_at",
    table: "users",
    column: "onboarding_completed_at",
    sql: "ALTER TABLE users ADD COLUMN onboarding_completed_at TEXT",
  },
  {
    name: "mesocycles.include_deload",
    table: "Mesocycles",
    column: "include_deload",
    sql: "ALTER TABLE Mesocycles ADD COLUMN include_deload INTEGER DEFAULT 0",
  },
  {
    name: "mesocycles.source_onboarding_draft_id",
    table: "Mesocycles",
    column: "source_onboarding_draft_id",
    sql: "ALTER TABLE Mesocycles ADD COLUMN source_onboarding_draft_id TEXT",
  },
  {
    name: "mesocycles.source_onboarding_draft_id_unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_mesocycles_onboarding_source
      ON Mesocycles(source_onboarding_draft_id)
      WHERE source_onboarding_draft_id IS NOT NULL`,
  },
  {
    name: "users.auth0_sub_unique",
    // noinspection SqlNoDataSourceInspection,SqlDialectInspection,SqlResolve
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth0_sub
      ON users(${auth0SubColumn})
      WHERE ${auth0SubColumn} IS NOT NULL AND ${auth0SubColumn} != ''`,
  },
  {
    name: "mesocycles.user_id_isCurrent",
    // noinspection SqlNoDataSourceInspection,SqlDialectInspection,SqlResolve
    sql: `CREATE INDEX IF NOT EXISTS idx_mesocycles_user_id_is_current
      ON Mesocycles(user_id, isCurrent)`,
  },
  {
    name: "users.delete_owned_data.replace",
    sql: "DROP TRIGGER IF EXISTS delete_user_owned_data",
  },
  {
    name: "users.delete_owned_data",
    // noinspection SqlNoDataSourceInspection,SqlDialectInspection,SqlResolve
    sql: `CREATE TRIGGER delete_user_owned_data
      BEFORE DELETE ON users
      FOR EACH ROW
      BEGIN
        DELETE FROM Mesocycles WHERE user_id = OLD.id;
        DELETE FROM exercises WHERE user_id = OLD.id;
        DELETE FROM onboarding_drafts WHERE user_id = OLD.id;
      END`,
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
