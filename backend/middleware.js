import jwt from "jsonwebtoken";

import csurf from "csurf";
import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

//Middleware to verifiy token

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  console.log("Token from cookies:", token);

  if (!token) {
    return res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, secretKey);

    req.user = verified;

    console.log("Verified user:", req.user);

    next();
  } catch (error) {
    console.log("Token verification error:", error.message);

    res.status(403).send("Invalid Token");
  }
};

export const csrfProtection = csurf({ cookie: true });

export const csrfTokenRoute = (app) => {
  app.get("/csrf-token", authenticateToken, csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();

    res.cookie("XSRF-TOKEN", csrfToken);

    res.json({ csrfToken });
  });
};
