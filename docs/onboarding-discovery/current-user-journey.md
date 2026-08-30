# Current user journey

## Entry and authentication

1. A logged-out visitor lands on `/` and sees the marketing page.
2. Register and login links open the backend Auth0 routes.
3. Auth0 creates or links a local user and sets the app authentication cookie.
4. Auth0 returns the browser to the configured frontend root URL.
5. The root route still renders the marketing page. There is no post-auth onboarding redirect in the frontend.

The current Playwright login helper navigates directly to `/templates`; this is test setup and not evidence of a production redirect.

## Authenticated navigation

The logged-in navbar exposes:

- Current workout
- Personal records
- Plan a new training block
- Templates
- History
- Logout

There is no onboarding, help, or resume-onboarding item.

## Existing plan-creation paths

```text
Templates
├── Select template ──> plan editor ──> save ──> Current workout
├── Import a plan ──> source ──> review ──> plan editor ──> save ──> Current workout
└── Build from scratch ──> block details ──> plan editor ──> save ──> Current workout
```

### Template

- Templates provide day labels and muscle-group slots.
- Selecting a card first opens a preview modal.
- The editor receives a four-week default plus the selected template's days and muscle groups.
- Exercises still need to be selected or auto-filled.

### Import

- Source selection supports pasted text or CSV upload.
- Required CSV fields are `day`, `exercise`, and `sets`; weight and target reps are optional in the parser.
- A review table highlights invalid cells and unresolved rows.
- Known exercises are matched case-insensitively after whitespace normalization.
- Unknown exercises require a muscle group. Type is optional and defaults to barbell if omitted.
- Continue sends the canonical plan to the familiar editor; it does not save the mesocycle yet.

### Build from scratch

- The first panel asks for a unique block name, four to six weeks, and optional final-week deload.
- The editor then asks for day labels, muscle groups, exercises, and progression settings.
- Auto Fill Exercises chooses exercises for filled muscle-group slots.

## Success boundary

Saving the editor:

1. posts a canonical mesocycle to `POST /api/mesocycles`;
2. makes every other plan non-current for that user;
3. creates the new plan as current;
4. fetches the created plan;
5. navigates to `/currentworkout`.

This makes **current plan created and Current workout opened** the cleanest existing activation boundary. Logging a first set is a later behavior and should be measured separately.

## Empty and returning states

- `GET /api/current-workout` returns 404 when no current plan exists.
- The frontend treats that 404 as an expected empty state, not an error.
- If history has a completed plan, the empty state offers a fresh plan or repeat of the latest completed plan.
- Otherwise it offers Create new plan, currently linking directly to the scratch editor rather than the three-way choice.

Consequently, “no active plan” includes both genuinely new users and returning users. It cannot safely be used as the only onboarding trigger.
