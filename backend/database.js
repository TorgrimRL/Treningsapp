import { createLocalDatabase } from "./db/localDatabase.js";
import { ensureSchema } from "./db/schema.js";

const db = createLocalDatabase();

db.ready = ensureSchema((sql, ...values) => db.sql(sql, ...values)).catch(
  (err) => {
    db.initializationError = err;
    console.error(err.message);
  }
);

export default db;
