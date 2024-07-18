import express from "express";
import db from "../database.js";

const router = express.Router();

// Endpoint to add a new mesocycle
router.post("/mesocycles", (req, res) => {
  const { name, weeks, plan } = req.body;

  const userID = 1;

  const query =
    "INSERT INTO mesocycles (name, weeks, plan, user_id) VALUES (?,?,?,?)";

  db.run(query, [name, weeks, JSON.stringify(plan), userID], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

router.get("/mesocycles", (req, res) => {
  console.log("Fetching mesocycles for user:1"); // Add this line
  const userID = 1;
  const query = "SELECT * FROM mesocycles WHERE user_id = ?";

  db.all(query, [userID], (err, rows) => {
    if (err) {
      console.log("Error fetching mesocycles:", err); // Add this line
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Endpoint to fetch a specific mesocycle
router.get("/mesocycles/:id", (req, res) => {
  const { id } = req.params;
  const query =
    "SELECT * FROM mesocycles WHERE id = ? AND (user_id = ? OR user_id IS NULL)";

  db.get(query, [id, req.user.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Mesocycle not found" });
    }
    res.json(row);
  });
});

export default router;
