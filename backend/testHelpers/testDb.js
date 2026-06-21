import sqlite3 from "sqlite3";
import { schemaStatements } from "../db/schema.js";

function toSql(strings) {
  return strings.reduce((sql, chunk, index) => {
    return sql + chunk + (index < strings.length - 1 ? "?" : "");
  }, "");
}

function createRun(db) {
  return (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
}

function createAll(db) {
  return (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
}

function createGet(db) {
  return (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
}

export async function createTestDb() {
  const db = new sqlite3.Database(":memory:");
  const run = createRun(db);
  const all = createAll(db);
  const get = createGet(db);

  // noinspection SqlNoDataSourceInspection
  await run("PRAGMA foreign_keys = ON");
  for (const statement of schemaStatements) {
    await run(statement.sql);
  }

  const query = async (strings, ...values) => {
    const sql = toSql(strings);
    const command = sql.trim().split(/\s+/)[0]?.toUpperCase();
    const result =
      command === "SELECT" || command === "PRAGMA"
        ? await all(sql, values)
        : await run(sql, values);

    return { result, hadRetry: false };
  };

  const close = () =>
    new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

  return { query, run, all, get, close };
}
