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
        user_id INTERGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

export default db;
