import jwt from "jsonwebtoken";
import csurf from "csurf";

const secretKey = "secretkey";

//Middleware to verifiy token

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("Access Denied");
  }
  try {
    const verified = jwt.verify(token, secretKey);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
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
