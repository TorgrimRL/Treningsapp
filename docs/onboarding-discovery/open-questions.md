# Open questions

## Must answer before implementation

1. What exact event defines onboarding success: created plan, opened Current workout, or logged first valid set?
2. Should first-time users be redirected from Auth0 directly into onboarding, or should the authenticated landing page present an explicit start action?
3. May users skip onboarding? If so, should it be marked skipped permanently, per onboarding version, or only for the session?
4. Should progress resume across devices, or is same-browser/session recovery sufficient?
5. Should existing accounts with zero plans receive onboarding automatically after release?
6. Is template the recommended default, and should any goal/schedule answers filter templates?
7. Which user questions materially change the generated plan? Do not include questions without a defined downstream effect.
8. Should onboarding support English only, Norwegian only, or localization from the start?
9. What analytics events are permitted, and what is the retention/privacy policy for onboarding answers?
10. Where should users reopen onboarding or Getting started after completion/skip?

## Valuable research questions

- Do target users understand “training block,” “deload,” “target reps,” and “progression” without help?
- Are users arriving with an existing plan to import, or do most need a template?
- Does “Build from scratch” communicate freedom or unnecessary work?
- How much setup are users willing to complete before seeing Current workout?
- Do users expect weight units to be inferred from account preferences? No unit preference currently exists in the data model.
- Should users be shown the default exercise type/increment during basic setup, or only when an unmatched exercise appears?

## Instrumentation proposal for approval

If analytics is allowed, measure events without raw plan contents:

- `onboarding_started` with onboarding version;
- `onboarding_path_selected` with `template`, `import`, or `scratch`;
- `onboarding_step_viewed` and `onboarding_step_error` with step identifier/error category;
- `onboarding_skipped` with step identifier;
- `onboarding_plan_created` with path, week count, and day count;
- `first_workout_opened`;
- `first_valid_set_logged`.

Do not send exercise names, pasted content, weights, reps, email, or raw validation text without an explicit privacy review.
