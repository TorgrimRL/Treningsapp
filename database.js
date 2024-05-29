const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE workouts(id INTEGER PRIMARY KEY, type TEXT, duration INTEGER)");  
});

module.exports = db;

