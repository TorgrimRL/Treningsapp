function normalizeText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeEmailVerified(value) {
  return value === true || value === 1 || value === "true" ? 1 : 0;
}

function buildUsernameBase(profile) {
  const email = normalizeText(profile.email);
  const fallback =
    normalizeText(profile.nickname) ||
    normalizeText(profile.name) ||
    `auth0-${String(profile.sub).slice(-8)}`;

  return email || fallback;
}

async function getDefaultQuery() {
  const { safeQuery } = await import("./safeQuery.js");
  return safeQuery;
}

async function findUserByAuth0Sub(activeQuery, auth0Sub) {
  const { result } =
    await activeQuery`SELECT * FROM users WHERE auth0_sub = ${auth0Sub}`;
  return result[0] || null;
}

async function findLinkableUserByVerifiedEmail(activeQuery, email, emailVerified) {
  if (!email || !emailVerified) {
    return null;
  }

  const { result } = await activeQuery`
    SELECT * FROM users
    WHERE username = ${email}
      AND (auth0_sub IS NULL OR auth0_sub = '')
    LIMIT 1
  `;
  return result[0] || null;
}

async function usernameExists(activeQuery, username) {
  const { result } =
    await activeQuery`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
  return result.length > 0;
}

async function getAvailableUsername(activeQuery, baseUsername) {
  let candidate = baseUsername;
  let suffix = 1;

  while (await usernameExists(activeQuery, candidate)) {
    candidate = `${baseUsername}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    authProvider: user.auth_provider || "local",
    auth0Sub: user.auth0_sub || null,
    email: user.email || null,
    emailVerified: Boolean(user.email_verified),
    picture: user.picture || null,
  };
}

export async function upsertAuth0User(profile, query) {
  const activeQuery = query || (await getDefaultQuery());
  const auth0Sub = normalizeText(profile?.sub);
  if (!auth0Sub) {
    throw new Error("Auth0 profile is missing sub");
  }

  const email = normalizeText(profile.email);
  const emailVerified = normalizeEmailVerified(profile.email_verified);
  const picture = normalizeText(profile.picture);

  const existingAuth0User = await findUserByAuth0Sub(activeQuery, auth0Sub);
  if (existingAuth0User) {
    await activeQuery`
      UPDATE users
      SET email = ${email},
          email_verified = ${emailVerified},
          picture = ${picture},
          auth_provider = ${existingAuth0User.password ? "local_auth0" : "auth0"}
      WHERE id = ${existingAuth0User.id}
    `;

    return {
      ...existingAuth0User,
      auth_provider: existingAuth0User.password ? "local_auth0" : "auth0",
      email,
      email_verified: emailVerified,
      picture,
    };
  }

  const linkableUser = await findLinkableUserByVerifiedEmail(
    activeQuery,
    email,
    emailVerified
  );
  if (linkableUser) {
    await activeQuery`
      UPDATE users
      SET auth_provider = ${linkableUser.password ? "local_auth0" : "auth0"},
          auth0_sub = ${auth0Sub},
          email = ${email},
          email_verified = ${emailVerified},
          picture = ${picture}
      WHERE id = ${linkableUser.id}
    `;

    return {
      ...linkableUser,
      auth_provider: linkableUser.password ? "local_auth0" : "auth0",
      auth0_sub: auth0Sub,
      email,
      email_verified: emailVerified,
      picture,
    };
  }

  const username = await getAvailableUsername(
    activeQuery,
    buildUsernameBase(profile)
  );

  await activeQuery`
    INSERT INTO users
      (username, password, auth_provider, auth0_sub, email, email_verified, picture)
    VALUES
      (${username}, ${null}, ${"auth0"}, ${auth0Sub}, ${email}, ${emailVerified}, ${picture})
  `;
  const insertedUser = await findUserByAuth0Sub(activeQuery, auth0Sub);

  return {
    ...insertedUser,
    username,
    password: null,
    auth_provider: "auth0",
    auth0_sub: auth0Sub,
    email,
    email_verified: emailVerified,
    picture,
  };
}
