import jwt from "jsonwebtoken";

const tokenCookieMaxAge = 604800000;

export function getTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: tokenCookieMaxAge,
    path: "/",
  };
}

export function getClearTokenCookieOptions() {
  const { maxAge, ...options } = getTokenCookieOptions();
  return options;
}

export function signAuthToken(userId) {
  const secretKey = process.env.JWT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing JWT_SECRET_KEY in environment");
  }

  return jwt.sign({ id: userId }, secretKey, { expiresIn: "30d" });
}

export function setAuthTokenCookie(res, userId) {
  const token = signAuthToken(userId);
  res.cookie("token", token, getTokenCookieOptions());
  return token;
}

export function clearAuthTokenCookie(res) {
  res.clearCookie("token", getClearTokenCookieOptions());
}
