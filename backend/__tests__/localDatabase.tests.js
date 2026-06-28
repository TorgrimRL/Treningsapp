import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createLocalDatabase } from "../db/localDatabase.js";
import { ensureSchema } from "../db/schema.js";

describe("local SQLite database adapter", () => {
  let tempDir;
  let db;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "treningsapp-db-"));
    db = createLocalDatabase({ dbPath: path.join(tempDir, "dev.sqlite") });
  });

  afterEach(async () => {
    await db?.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates schema and returns the result shape expected by routes", async () => {
    await ensureSchema((sql, ...values) => db.sql(sql, ...values), {
      logger: null,
    });

    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    const insert = await db.sql`
      INSERT INTO users (username, password)
      VALUES (${"local@example.com"}, ${"hashed-password"})
    `;
    expect(insert).toMatchObject({ lastID: 1, changes: 1 });

    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    const users = await db.sql`
      SELECT * FROM users WHERE username = ${"local@example.com"}
    `;
    expect(users).toEqual([
      {
        id: 1,
        username: "local@example.com",
        password: "hashed-password",
        auth_provider: "local",
        auth0_sub: null,
        email: null,
        email_verified: 0,
        picture: null,
      },
    ]);

    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    const update = await db.sql`
      UPDATE users SET password = ${"new-hash"} WHERE id = ${1}
    `;
    expect(update.changes).toBe(1);

    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    const remove = await db.sql`
      DELETE FROM users WHERE id = ${1}
    `;
    expect(remove.changes).toBe(1);
  });

  it("supports raw SQL strings for schema and maintenance commands", async () => {
    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    await db.sql("CREATE TABLE example (id INTEGER PRIMARY KEY, name TEXT)");
    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    await db.sql("INSERT INTO example (name) VALUES (?)", "raw");

    // noinspection SqlNoDataSourceInspection,SqlDialectInspection
    const rows = await db.sql("SELECT * FROM example");

    expect(rows).toEqual([{ id: 1, name: "raw" }]);
  });
});
