import { pathToFileURL } from "node:url";
import { createLocalDatabase } from "../db/localDatabase.js";
import { ensureSchema } from "../db/schema.js";
import { demoCredentials } from "./seedLocalDb.js";

export async function resetOnboarding({
  username = demoCredentials.username,
  dbPath,
  logger = console,
} = {}) {
  if (process.env.DB_MODE !== "local") {
    throw new Error("Refusing to reset onboarding unless DB_MODE=local");
  }

  const db = createLocalDatabase({ dbPath });
  try {
    await ensureSchema((sql, ...values) => db.sql(sql, ...values), { logger: null });
    const users = await db.sql`
      SELECT id, username FROM users
      WHERE lower(username) = lower(${username})
      LIMIT 1
    `;
    const user = users[0];
    if (!user) {
      throw new Error(`No local user found for ${username}`);
    }

    await db.sql`DELETE FROM onboarding_drafts WHERE user_id = ${user.id}`;
    await db.sql`
      UPDATE users
      SET onboarding_version = ${1},
          onboarding_status = ${"not_started"},
          onboarding_step = ${null},
          onboarding_started_at = ${null},
          onboarding_first_set_at = ${null},
          onboarding_completed_at = ${null}
      WHERE id = ${user.id}
    `;

    logger?.log?.(`Onboarding reset for ${user.username}. Existing plans were kept.`);
    return user;
  } finally {
    await db.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  resetOnboarding({ username: process.argv[2] || demoCredentials.username }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
