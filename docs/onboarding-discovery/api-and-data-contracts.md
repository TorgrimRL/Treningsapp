# API and data contracts

## Authentication and current user

- Auth0 registration/login is hosted outside the frontend.
- The callback upserts a local user and sets an HTTP-only app token cookie.
- `/api/me` returns the serialized local user for the app-wide auth context.
- The serialized user includes identity fields only. It has no account creation timestamp, onboarding status, onboarding version, skip status, or draft identifier.
- Protected pages wait for auth resolution and then redirect logged-out users to `/login`.

## Existing storage

`users` contains identity/auth fields. `Mesocycles` contains name, duration, JSON plan, completion/current status, deload, and owner. `exercises` contains custom exercise data and owner.

All mesocycle and custom-exercise reads/writes shown in the onboarding path are scoped to the authenticated `user_id`. State-changing endpoints use CSRF protection.

## Plan creation

`POST /api/mesocycles` accepts:

```json
{
  "name": "My first block",
  "weeks": 4,
  "daysPerWeek": 3,
  "includeDeload": false,
  "plan": []
}
```

The frontend canonical builder duplicates the first-week day structure across the requested weeks and initializes sets as incomplete. Creation makes existing plans non-current and inserts the new plan as current.

### Authoritative backend limits

- Weeks: integer from 1 through 52.
- Days per week: integer from 1 through 14.
- Total plan days: at most 728.
- Exercises per day: at most 50.
- Sets per exercise: at most 20.
- Dropset set count: at most 8.
- Serialized plan: at most 100 KiB.
- Default account quota: 250 mesocycles and 10 MiB of plan JSON, configurable by environment.

The current editor only exposes four to six weeks, so the frontend and backend ranges are intentionally different.

## Custom exercise creation

`POST /api/exercises` requires:

- normalized non-empty name, maximum 120 characters;
- one allowed muscle group;
- type in `barbell`, `machine`, `dumbbell`, `bodyweight`, or `cable`;
- optional video link no longer than 2048 characters.

Duplicates are checked per user, case-insensitively after trimming. A duplicate returns success with the existing ID. Imported raw plan text is parsed in the browser and is not sent to a third party.

## Import contract

CSV uses one exercise per row.

- Required: `day`, `exercise`, `sets`.
- Optional: `weight`, legacy alias `weight_kg`, `reps`, `muscle_group`, `type`, `progression_mode`, `weight_increment`, `minimum_weight`.
- Comma and semicolon delimiters are accepted.
- Comma decimals are supported with semicolon-delimited files.
- Pasted text accepts deterministic lines such as `Monday: Bench Press — 3 × 8 @ 60`.

Review prepares a canonical plan and then opens the normal editor. Only the editor's final save creates the mesocycle.

## Proposed onboarding persistence contract

This does not exist yet. If onboarding is skippable/resumable, prefer explicit versioned server state rather than deriving it from mesocycles:

```json
{
  "onboardingVersion": 1,
  "onboardingStatus": "not_started | in_progress | completed | skipped",
  "onboardingStep": "choose_path",
  "onboardingUpdatedAt": "ISO-8601 timestamp"
}
```

Store only navigation/progress metadata unless the product explicitly approves saving a plan draft. Avoid storing inferred training experience or goals unless those fields have a defined product use and retention policy.
