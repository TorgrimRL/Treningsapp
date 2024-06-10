import sqlite3 from 'sqlite3';


const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    // Opprett users-tabellen hvis den ikke allerede eksisterer
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Opprett workouts-tabellen hvis den ikke allerede eksisterer
    db.run(`CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY,
        type TEXT,
        duration INTEGER
    )`);
});

export default db;

