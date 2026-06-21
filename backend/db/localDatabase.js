import sqlite3 from "sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

export function resolveLocalDbPath(dbPath = process.env.LOCAL_DB_PATH) {
  if (dbPath === ":memory:") {
    return dbPath;
  }

  if (!dbPath) {
    return path.join(backendDir, "database.sqlite");
  }

  return path.isAbsolute(dbPath) ? dbPath : path.resolve(backendDir, dbPath);
}

export function normalizeSqlCommand(sqlInput, values = []) {
  if (Array.isArray(sqlInput)) {
    const query = sqlInput.reduce((sql, chunk, index) => {
      return sql + chunk + (index < values.length ? "?" : "");
    }, "");
    return { query, parameters: values };
  }

  if (typeof sqlInput === "string") {
    return { query: sqlInput, parameters: values };
  }

  if (sqlInput && typeof sqlInput === "object" && sqlInput.query) {
    return {
      query: sqlInput.query,
      parameters: sqlInput.parameters || [],
    };
  }

  throw new Error("Invalid SQL command");
}

function getCommand(query) {
  return query.trim().split(/\s+/)[0]?.toUpperCase();
}

function run(db, query, parameters) {
  return new Promise((resolve, reject) => {
    db.run(query, parameters, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function all(db, query, parameters) {
  return new Promise((resolve, reject) => {
    db.all(query, parameters, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

export function createLocalDatabase({ dbPath } = {}) {
  const resolvedPath = resolveLocalDbPath(dbPath);

  if (resolvedPath !== ":memory:") {
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  }

  const connection = new sqlite3.Database(resolvedPath);

  return {
    path: resolvedPath,
    raw: connection,
    sql: async (sqlInput, ...values) => {
      const { query, parameters } = normalizeSqlCommand(sqlInput, values);
      const command = getCommand(query);

      if (command === "SELECT" || command === "PRAGMA") {
        return all(connection, query, parameters);
      }

      return run(connection, query, parameters);
    },
    close: () =>
      new Promise((resolve, reject) => {
        connection.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      }),
  };
}
