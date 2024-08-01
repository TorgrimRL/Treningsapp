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

// db.all("SELECT id,plan FROM mesocycles", (err, rows) => {
//   if (err) {
//     console.error("Error fetching table info:", err.message);
//     return;
//   }

//   rows.forEach((row) => {
//     const mesocycleId = row.id;
//     let plan;

//     try {
//       plan = JSON.parse(row.plan);
//     } catch (error) {
//       console.error(
//         `Error parsing JSON for mesocycle with ${mesocycleId}`,
//         error
//       );
//       return;
//     }

//     const updatedPlan = plan.map((day) => ({
//       ...day,
//       exercises: day.exercises.map((exercise) => ({
//         ...exercise,
//         sets: Array(3).fill({ weight: "", reps: "", completed: false }),
//       })),
//     }));

//     const updatedPlanJson = JSON.stringify(updatedPlan);

//     db.run(
//       "UPDATE mesocycles SET plan = ? where id = ?",
//       [updatedPlanJson, mesocycleId],
//       (err) => {
//         if (err) {
//           console.error(
//             `Error updating mesoscyle with ${mesosycleID}`,
//             err.message
//           );
//         } else {
//           console.log(`Successfully updated mesocycle with id ${mesocycleId}`);
//         }
//       }
//     );
//   });
// });

export default db;
