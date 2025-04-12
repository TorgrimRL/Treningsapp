import { Database } from "@sqlitecloud/drivers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { safeQuery } from "./utils/safeQuery.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const dbUri = process.env.DB_URI;

const db = new Database(dbUri);

db.sql`USE DATABASE database.sqlite`
  .then(() => {
    console.log("Database selected successfully");

    return Promise.all([
      safeQuery`CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE,
              password TEXT
          )`
        .then(() => console.log("Users table created"))
        .catch((err) => console.error("Error creating Users table:", err)),

      safeQuery`CREATE TABLE IF NOT EXISTS Mesocycles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT,
              weeks INTEGER,
              plan TEXT,
              daysPerWeek INTEGER,
              completedDate TEXT,
              isCurrent INTEGER,
              user_id INTEGER,
              FOREIGN KEY(user_id) REFERENCES users(id)
          )`
        .then(() => console.log("Mesocycles table created"))
        .catch((err) => console.error("Error creating Mesocycles table:", err)),

      safeQuery`CREATE TABLE IF NOT EXISTS exercises (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT,
              type TEXT,
              muscleGroup TEXT,
              videolink TEXT,
              user_id INTEGER,
              FOREIGN KEY(user_id) REFERENCES users(id)
          )`
        .then(() => console.log("Exercises table created"))
        .catch((err) => console.error("Error creating Exercises table:", err)),
    ]);
  })
  .then(() => console.log("Connected to SQLite Cloud"))
  .catch((err) => console.error("Connection failed:", err));

export default db;
