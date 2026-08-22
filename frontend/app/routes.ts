import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.jsx"),
  route("login", "routes/login.jsx"),
  route("register", "routes/register.jsx"),
  route("mesocycles", "routes/mesocycles.jsx"),
  route("mesocycles-new", "routes/mesocycles-new.jsx"),
  route("import-plan", "routes/import-plan.jsx"),
  route("currentworkout", "routes/currentworkout/route.jsx"),
  route("personal-records", "routes/personal-records/route.jsx"),
  route("templates", "routes/templates.jsx"),
];
