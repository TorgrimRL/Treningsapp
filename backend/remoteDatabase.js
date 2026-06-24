import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCloudDatabase } from "./db/cloudDatabase.js";
import { ensureSchema } from "./db/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const dbMode = (process.env.DB_MODE || "cloud").toLowerCase();

if (!["cloud", "local"].includes(dbMode)) {
  throw new Error(`Unsupported DB_MODE: ${dbMode}`);
}

let activeDb;

async function initializeDatabase() {
  if (dbMode === "cloud") {
    activeDb = createCloudDatabase({ dbUri: process.env.DB_URI });
    await activeDb.sql("USE DATABASE database.sqlite");
  } else {
    const { createLocalDatabase } = await import("./db/localDatabase.js");
    activeDb = createLocalDatabase();
    console.log(`Using local SQLite database: ${activeDb.path}`);
  }

  await ensureSchema((sql, ...values) => activeDb.sql(sql, ...values));
}

const db = {
  get path() {
    return activeDb?.path;
  },
  async sql(sqlInput, ...values) {
    if (!activeDb) {
      throw new Error("Database is not initialized");
    }

    return activeDb.sql(sqlInput, ...values);
  },
  close() {
    return activeDb?.close?.();
  },
};

db.ready = initializeDatabase().catch((err) => {
  db.initializationError = err;
  console.error("Connection failed:", err);
});

export default db;
