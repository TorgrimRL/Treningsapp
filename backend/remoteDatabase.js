import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCloudDatabase } from "./db/cloudDatabase.js";
import { createLocalDatabase } from "./db/localDatabase.js";
import { ensureSchema } from "./db/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const dbMode = (process.env.DB_MODE || "cloud").toLowerCase();

if (!["cloud", "local"].includes(dbMode)) {
  throw new Error(`Unsupported DB_MODE: ${dbMode}`);
}

const db =
  dbMode === "local"
    ? createLocalDatabase()
    : createCloudDatabase({ dbUri: process.env.DB_URI });

async function initializeDatabase() {
  if (dbMode === "cloud") {
    await db.sql("USE DATABASE database.sqlite");
    console.log("Database selected successfully");
  } else {
    console.log(`Using local SQLite database: ${db.path}`);
  }

  await ensureSchema((sql, ...values) => db.sql(sql, ...values));
  console.log(
    dbMode === "local" ? "Connected to local SQLite" : "Connected to SQLite Cloud"
  );
}

db.ready = initializeDatabase().catch((err) => {
  db.initializationError = err;
  console.error("Connection failed:", err);
});

export default db;
