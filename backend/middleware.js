import jwt from "jsonwebtoken";
import csurf from "csurf";
import dotenv from "dotenv";
import { clearAuthTokenCookie } from "./utils/authCookies.js";
import { safeQuery } from "./utils/safeQuery.js";

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;
const csrfCookieName = "_csrf";
const csrfCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  path: "/",
};

export const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("Access Denied");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secretKey);
  } catch {
    clearAuthTokenCookie(res);
    clearCsrfCookie(res);
    return res.status(403).send("Invalid Token");
  }

  try {
    const { result: users } = await safeQuery`
      SELECT id
      FROM users
      WHERE id = ${decodedToken.id}
      LIMIT 1
    `;
    const authenticatedUser = users?.[0];

    if (!authenticatedUser) {
      clearAuthTokenCookie(res);
      clearCsrfCookie(res);
      return res.status(401).send("Access Denied");
    }

    req.user = decodedToken;
    return next();
  } catch (error) {
    console.error("Authentication user lookup failed", {
      code: error?.code,
      name: error?.name,
    });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const csrfProtection = csurf({
  cookie: csrfCookieOptions,
});

export function clearCsrfCookie(res) {
  res.clearCookie(csrfCookieName, csrfCookieOptions);
}

export const csrfTokenRoute = (app) => {
  app.get("/api/csrf-token", authenticateToken, csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();

    res.set("Cache-Control", "no-store");
    res.json({ csrfToken });
  });
};
