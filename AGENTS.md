# Repository Guidelines

## Project Structure & Module Organization

This repository is split into two npm projects. `frontend/` contains the Remix/React app, with routes in `frontend/app/routes`, shared UI in `frontend/app/components`, utilities in `frontend/app/utils`, constants in `frontend/app/constants`, public assets in `frontend/public`, and Playwright tests in `frontend/e2e`. `backend/` contains the Express API, with route handlers in `backend/routes`, database adapters and schema in `backend/db`, shared logic in `backend/utils`, Jest tests in `backend/__tests__`, test helpers in `backend/testHelpers`, and seed scripts in `backend/scripts`.

## Build, Test, and Development Commands

Install dependencies separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Backend commands: `npm run dev` starts the API with nodemon, `npm run dev:local` uses the local SQLite database, `npm run db:seed` resets local demo data, and `npm test -- --runInBand` runs Jest tests.

Frontend commands: `npm run dev` starts the Remix/Vite dev server, `npm run build` builds production assets, `npm run lint` runs ESLint, and `npm run test:e2e` runs Playwright E2E tests.

## Coding Style & Naming Conventions

Use modern ES modules throughout (`"type": "module"`). Prefer 2-space indentation, double quotes, semicolons, and descriptive camelCase names for variables and functions. React components use PascalCase filenames such as `CurrentWorkout.jsx`; route files use Remix route naming such as `mesocycles-new.jsx`. Keep backend route files grouped by API domain and shared calculations in `backend/utils`.

## Testing Guidelines

Backend tests use Jest and Supertest. Add tests under `backend/__tests__` with `*.tests.js` names and use helpers from `backend/testHelpers` for app/database setup. Frontend E2E tests use Playwright in `frontend/e2e` with `*.spec.js` names. Prefer stable `data-testid` selectors for workflow tests. Run backend tests before committing; run E2E tests when changing auth, navigation, workout creation, or API behavior.

## Commit & Pull Request Guidelines

Recent commits use short imperative prefixes such as `add:`, `fix:`, and `revert:`. Keep messages specific, for example `fix: validate mesocycle ownership on update`. Pull requests should include a concise summary, test results, linked issues when relevant, and screenshots or recordings for visible frontend changes. Note any database, environment, or seed-data changes explicitly.

## Security & Configuration Tips

Use Node.js 20 or newer. Do not commit local database files, cookies, Playwright reports, or `.env` files. Backend local development can use `DB_MODE=local`; frontend API calls require `VITE_API_URL`, for example `http://localhost:3000/api`. Keep JWT and database secrets in environment variables only.
