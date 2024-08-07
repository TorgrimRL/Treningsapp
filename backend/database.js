import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS Mesocycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        weeks INTEGER,
        plan TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type, TEXT
    musclegroup TEXT,
    videolink TEXT,
    user_id INTERGER,
    FOREIGN KEY(user_id) REFERENCES users(id)

    )`);

  db.all("PRAGMA table_info(mesocycles)", (err, columns) => {
    if (err) {
      console.error("Error fetching table info:", err.message);
      return;
    }
    const columnNames = columns.map((col) => col.name);
    const addColumn = (column, type) => {
      if (!columnNames.includes(column)) {
        db.run(
          `ALTER TABLE Mesocycles ADD COLUMN ${column} ${type}`,
          [],
          function (err) {
            if (err) {
              console.error(`Error adding '${column}' column:`, err.message);
            } else {
              console.log(`Added '${column}' column to 'Mesocycles' table`);
            }
          }
        );
      }
    };
    addColumn("daysPerWeek", "INTEGER");
    addColumn("completedDate", "TEXT");
    addColumn("isCurrent", "INTEGER");
  });
});

export default db;
