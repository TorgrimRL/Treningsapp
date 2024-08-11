import { Database } from "@sqlitecloud/drivers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Opprett __dirname ekvivalent for ES-moduler
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.vercel/.env.development.local"),
});

const dbUri = process.env.DB_URI;
console.log("DB_URI:", dbUri);
const db = new Database(process.env.DB_URI);
db.sql`USE database.sqlite`
  .then(() => console.log("Database selected"))
  .catch((err) => console.error("Failed to select database:", err));

db.sql`SELECT 1`
  .then(() => console.log("Connected to SQLite Cloud"))
  .catch((err) => console.error("Connection failed:", err));

const createUserTable = async () =>
  await db.sql`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    `;
const Mesocycles = async () =>
  await db.sql`CREATE TABLE IF NOT EXISTS Mesocycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        weeks INTEGER,
        plan TEXT,
        daysPerWeek INTEGER,
        completedDate TEXT,
        isCurrent INTEGER,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    `;
const exercises = async () =>
  await db.sql`CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        muscleGroup TEXT,
        videolink TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    `;
createUserTable();
Mesocycles();
exercises();
export default db;
