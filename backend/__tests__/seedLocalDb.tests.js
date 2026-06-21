import bcrypt from "bcryptjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createLocalDatabase } from "../db/localDatabase.js";
import {
  demoCredentials,
  seedLocalDatabase,
} from "../scripts/seedLocalDb.js";

async function readSeededRows(dbPath) {
  const db = createLocalDatabase({ dbPath });

  try {
    // noinspection SqlNoDataSourceInspection
    const users = await db.sql("SELECT * FROM users");
    // noinspection SqlNoDataSourceInspection
    const exercises = await db.sql("SELECT * FROM exercises");
    // noinspection SqlNoDataSourceInspection
    const mesocycles = await db.sql(
      "SELECT * FROM Mesocycles ORDER BY id ASC"
    );
    return { users, exercises, mesocycles };
  } finally {
    await db.close();
  }
}

describe("local database seed script", () => {
  let tempDir;
  let dbPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "treningsapp-seed-"));
    dbPath = path.join(tempDir, "seed.sqlite");
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("refuses to run unless local mode is explicitly enabled", async () => {
    const previousMode = process.env.DB_MODE;
    delete process.env.DB_MODE;

    await expect(seedLocalDatabase({ dbPath, logger: null })).rejects.toThrow(
      "Refusing to seed unless DB_MODE=local"
    );

    if (previousMode === undefined) {
      delete process.env.DB_MODE;
    } else {
      process.env.DB_MODE = previousMode;
    }
  });

  it("creates deterministic local demo data", async () => {
    const first = await seedLocalDatabase({
      dbPath,
      requireLocalMode: false,
      logger: null,
    });
    const second = await seedLocalDatabase({
      dbPath,
      requireLocalMode: false,
      logger: null,
    });

    expect(second).toEqual(first);

    const { users, exercises, mesocycles } = await readSeededRows(dbPath);
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe(demoCredentials.username);
    await expect(
      bcrypt.compare(demoCredentials.password, users[0].password)
    ).resolves.toBe(true);

    expect(exercises).toHaveLength(5);
    expect(mesocycles).toHaveLength(3);
    expect(mesocycles.filter((row) => row.isCurrent)).toHaveLength(1);
    expect(mesocycles[0]).toMatchObject({
      id: 1,
      name: "Demo Current Block",
      weeks: 3,
      daysPerWeek: 2,
      user_id: 1,
    });
    expect(JSON.parse(mesocycles[0].plan)).toHaveLength(6);
  });
});
