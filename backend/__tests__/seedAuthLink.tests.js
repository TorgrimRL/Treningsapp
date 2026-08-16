import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createLocalDatabase } from "../db/localDatabase.js";
import {
  demoCredentials,
  seedLocalDatabase,
} from "../scripts/seedLocalDb.js";
import { upsertAuth0User } from "../utils/auth0Users.js";

function createQuery(db) {
  return async (strings, ...values) => ({
    result: await db.sql(strings, ...values),
    hadRetry: false,
  });
}

describe("local demo Auth0 linking", () => {
  let tempDir;
  let dbPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "treningsapp-auth-seed-"));
    dbPath = path.join(tempDir, "seed.sqlite");
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("links the verified demo login without losing seeded workouts", async () => {
    await seedLocalDatabase({
      dbPath,
      requireLocalMode: false,
      logger: null,
    });
    const db = createLocalDatabase({ dbPath });

    try {
      const seededUsers = await db.sql("SELECT * FROM users");
      expect(seededUsers).toHaveLength(1);
      expect(seededUsers[0].auth0_sub).toBeNull();

      const linkedUser = await upsertAuth0User(
        {
          sub: "auth0|real-demo-user",
          email: demoCredentials.username,
          email_verified: true,
        },
        createQuery(db)
      );

      expect(linkedUser).toMatchObject({
        id: seededUsers[0].id,
        username: demoCredentials.username,
        auth_provider: "auth0",
        auth0_sub: "auth0|real-demo-user",
      });

      const users = await db.sql("SELECT * FROM users");
      const mesocycles = await db.sql("SELECT * FROM Mesocycles");
      const exercises = await db.sql("SELECT * FROM exercises");

      expect(users).toHaveLength(1);
      expect(mesocycles).toHaveLength(3);
      expect(exercises).toHaveLength(12);
      expect(mesocycles.every(({ user_id }) => user_id === linkedUser.id)).toBe(
        true
      );
      expect(exercises.every(({ user_id }) => user_id === linkedUser.id)).toBe(
        true
      );
    } finally {
      await db.close();
    }
  });

  it("preserves the linked demo identity when workout data is reseeded", async () => {
    await seedLocalDatabase({
      dbPath,
      requireLocalMode: false,
      logger: null,
    });
    let db = createLocalDatabase({ dbPath });
    const linkedUser = await upsertAuth0User(
      {
        sub: "auth0|persistent-demo-user",
        email: demoCredentials.username,
        email_verified: true,
      },
      createQuery(db)
    );
    await db.close();

    await seedLocalDatabase({
      dbPath,
      requireLocalMode: false,
      logger: null,
    });
    db = createLocalDatabase({ dbPath });

    try {
      const users = await db.sql("SELECT * FROM users");
      const mesocycles = await db.sql("SELECT * FROM Mesocycles");
      const exercises = await db.sql("SELECT * FROM exercises");

      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        id: linkedUser.id,
        username: demoCredentials.username,
        auth0_sub: "auth0|persistent-demo-user",
      });
      expect(mesocycles).toHaveLength(3);
      expect(exercises).toHaveLength(12);
      expect(mesocycles.every(({ user_id }) => user_id === linkedUser.id)).toBe(
        true
      );
      expect(exercises.every(({ user_id }) => user_id === linkedUser.id)).toBe(
        true
      );
    } finally {
      await db.close();
    }
  });
});
