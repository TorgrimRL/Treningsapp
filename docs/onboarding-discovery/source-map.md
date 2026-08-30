# Source map

## Entry, auth, and navigation

- `frontend/app/root.jsx` — shared shell, language, navbar, footer, providers.
- `frontend/app/components/LandingPage.jsx` — marketing value proposition and registration CTAs.
- `frontend/app/routes/login.jsx` and `register.jsx` — Auth0 redirects.
- `frontend/app/utils/AuthContext.jsx` — `/me` lookup and frontend auth states.
- `frontend/app/components/ProtectedRoute.jsx` — protected-route loading and redirect behavior.
- `frontend/app/components/Navbar.jsx` — authenticated and logged-out navigation.
- `backend/routes/auth0Routes.js` — Auth0 return destination and session bridge.
- `backend/utils/auth0Users.js` — local user upsert and serialized fields.
- `backend/db/schema.js` — users, mesocycles, exercises, migrations, ownership cleanup.

## Plan choice and creation

- `frontend/app/routes/templates.jsx`
- `frontend/app/components/TemplateSelector.jsx`
- `frontend/app/constants/constants.js`
- `frontend/app/routes/import-plan.jsx`
- `frontend/app/features/import-plan/ImportPlanWizard.jsx`
- `frontend/app/features/import-plan/importPlanParser.js`
- `frontend/app/features/import-plan/exportPlanCsv.js`
- `frontend/test/fixtures/import-plans/`
- `frontend/app/routes/mesocycles-new.jsx`
- `frontend/app/components/MesocycleDetailsModal.jsx`
- `frontend/app/components/MesocycleForm.jsx`
- `frontend/app/utils/mesocyclePlan.js`

## Current workout and reactivation

- `frontend/app/utils/currentWorkoutQuery.js`
- `frontend/app/routes/currentworkout/CurrentWorkoutPage.jsx`
- `frontend/app/routes/currentworkout/components/CompletedWorkoutState.jsx`
- `frontend/app/routes/currentworkout/components/WorkoutExerciseCard.jsx`
- `frontend/app/routes/currentworkout/components/WorkoutSetRow.jsx`
- `frontend/app/components/MesocycleOverview.jsx`

## Backend contracts and safety

- `backend/routes/mesocycleRoutes.js`
- `backend/routes/exerciseRoutes.js`
- `backend/utils/planValidation.js`
- `backend/utils/mesocycleLimits.js`
- `backend/middleware.js`
- `backend/README.md`

## Design system and test evidence

- `frontend/tailwind.config.js`
- `frontend/app/components/PageContainer.jsx`
- `frontend/app/components/AppModal.jsx`
- `frontend/e2e/login.spec.js`
- `frontend/e2e/create-training-plan.spec.js`
- `frontend/e2e/current-workout.spec.js`
- `frontend/e2e/responsive-layout.spec.js`
- `frontend/playwright.config.js`

## Important evidence caveats

- The demo E2E seed represents an established user with current and historical plans, not a true zero-data account.
- `loginAsDemoUser` navigates directly to Templates and therefore does not validate the real Auth0 callback destination.
- The generic import parser has unit tests, but no complete import wizard Playwright journey is currently present.
- Static inspection cannot validate production Auth0 configuration, real-device behavior, assistive technology, or analytics availability.
