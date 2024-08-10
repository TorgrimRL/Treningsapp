import { Database } from "@sqlitecloud/drivers";

const db = new Database(process.env.DB_URI);

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
