# Onboarding design brief

## Objective

Design a guided first-run experience that helps a newly authenticated SetOptimizer user create a reviewed first training block and arrive at Current workout. Reuse the existing template, import, scratch, and editor flows instead of creating a parallel plan model.

## Audience

The repository does not define a single experience level or training goal. Design for a user who understands exercises and sets but may not know SetOptimizer-specific concepts such as training blocks, progression modes, target generation, or final-week deloads. Any narrower persona needs product/user-research evidence.

## Current problem

- Auth0 returns authenticated users to the marketing root.
- No first-run status or onboarding persistence exists.
- The three plan-creation paths exist but are distributed across Templates, Import, and Scratch.
- No-current-plan is not a reliable new-user signal.
- Some final creation errors are not visible to the user.

## Desired outcome

At the end of the wizard, the user has:

- deliberately chosen Template, Import, or Scratch;
- understood that they are creating a future reusable training block;
- reviewed name, weeks, schedule, exercises, sets, optional targets, progression defaults, and deload choice;
- saved through the authenticated, CSRF-protected mesocycle endpoint;
- landed on the first current workout;
- retained a way to revisit Getting started if needed.

## Required states and behaviors

- Wait for authentication before deciding whether to launch.
- Use explicit, versioned onboarding state if skip/resume/one-time launch is required.
- Preserve the chosen path and user work through Back and recoverable errors.
- Do not mark completion until plan creation succeeds.
- Keep 404/no-current-plan separate from network/auth failures.
- Do not import completed history or personal records.
- Do not transmit pasted plan text to AI or third parties.
- Always hand off to the existing editor for final review.
- Ensure existing users and completed-plan reactivation are not mistaken for first run.

## Content requirements

- Prefer “training block” over “mesocycle.”
- Explain Template, Import, and Scratch in terms of effort and result.
- Explain deload beside its control.
- Treat target reps as optional during import/setup.
- Treat weight as a unit-neutral number because no unit preference exists.
- State that unmatched imported exercises need a muscle group and that omitted type defaults to barbell with its progression defaults.
- Keep progression mode/increment/minimum weight under advanced or contextual disclosure.

## Interaction requirements

- Responsive page flow, tested at Pixel 5 and 1440×900.
- At most four conceptual wizard steps before the existing editor.
- Persistent text progress, explicit Back/Continue/Skip/Exit behavior, and visible recoverable errors.
- 44×44 px mobile targets, visible keyboard focus, semantic controls, and non-color-only validation.
- Restrained optional motion that respects reduced-motion preferences.
- No second styling system or second plan editor.

## Data and security constraints

- All user-owned API access must remain scoped to authenticated `user_id`.
- State changes must remain CSRF protected.
- Backend plan validation and quotas remain authoritative.
- Avoid storing onboarding answers that have no defined product use.
- Analytics must exclude raw plans and sensitive training contents unless separately approved.

## Suggested handoff points

| Wizard choice | Existing destination | Data passed |
| --- | --- | --- |
| Template | `/templates`, then `/mesocycles-new` | Template name, four-week default, days, labels, muscle groups |
| Import | `/import-plan`, then `/mesocycles-new` | Canonical imported plan after row review |
| Scratch | `/mesocycles-new` | Details collected by existing form |
| Completed save | `/currentworkout` | Server-created current mesocycle via query refresh |

The implementation may embed or compose these screens, but it should preserve their canonical utilities and API contracts.

## Acceptance criteria for the eventual design

1. Every entry, skip, back, resume, cancel, success, and failure transition is specified.
2. New, returning-without-current, and authenticated-existing users are treated as distinct states.
3. All three creation paths reach the same canonical editor and server create flow.
4. A failed save never loses the user's plan.
5. The design includes loading, empty, invalid, offline/network, unauthorized, quota, and success states.
6. Mobile layout, keyboard order, focus placement, screen-reader labels, and reduced motion are specified.
7. Copy defines training block and deload without overloading the first screen.
8. No unsupported personalization question is introduced.
9. Onboarding completion and analytics events have explicit product approval.
10. Open questions in [`open-questions.md`](./open-questions.md) are resolved or recorded as accepted assumptions.

## Design-agent instruction

Produce a flow diagram, responsive wireframes, annotated interaction states, final English copy (or the approved locale), and a component reuse map. Clearly label proposed backend/schema work. Do not assume that zero mesocycles means a new account and do not redesign the plan payload.
