# Design system notes

## Scope of inspection

Full interface-oriented code review of the entry, navigation, templates, import, plan-details, plan-editor, modal, empty Current workout, and error states. Framework: React Router 7/React 19. Styling: Tailwind utilities and a small extended color palette. No motion library is installed.

## Existing visual language

- Dark surfaces: `darkestGray`, `darkGray`, and `inputBGGray`.
- Primary action/state: red (`bg-red-600`, red focus outlines).
- Success/complete state: green-tinted surface and border.
- Errors: red border/background/text; background refresh warnings use amber.
- Containers: narrow `max-w-3xl`, standard `max-w-6xl`, wide `max-w-[1600px]`.
- Layout shifts from stacked mobile content to grids/flex layouts at `sm`, `md`, `lg`, and `xl`.
- Shared modals use React Modal, lock scroll, constrain height with `dvh`, and support Escape/overlay behavior.
- Stable workflow selectors use `data-testid`.

## Review coverage

| Category | Evidence inspected | Result |
| --- | --- | --- |
| Typography | Landing, Templates, Import, details panel, editor, Current workout states, Tailwind config | Existing hierarchy documented; onboarding requirements added for wrapping and numerals. |
| Surfaces | PageContainer, AppModal, cards, inputs, selected/error states | Existing dark/red language documented; inconsistent first-run destinations identified. |
| Animations | Component classes and frontend dependencies | No motion library or onboarding motion exists; restrained CSS-only requirements recorded. Browser slow-motion inspection not applicable to a not-yet-built wizard. |
| Icons | Navbar, editor delete controls, modal close control | Existing icon usage inspected; onboarding should reuse the established language and avoid another icon set. |
| Performance | Current workout query lifecycle, route handoffs, transition utilities | Query caching/retry behavior documented; draft preservation and specific transitions required. |

## Wizard requirements

1. Use existing Tailwind and shared components; do not introduce another styling system.
2. Keep the wizard inside a standard/narrow `PageContainer`, not a fragile viewport-centered overlay.
3. Prefer a page flow for plan creation. Use modals only for bounded choices or previews.
4. Give every touch target at least 44×44 px; dense desktop controls may be 40×40 px.
5. Preserve visible keyboard focus with the established red focus outline.
6. Indicate the active choice through label, color, and `aria-pressed`/semantics; color alone is insufficient.
7. Use a persistent text step label such as “Step 2 of 4”; a progress bar alone is insufficient.
8. Keep Back, Skip, Continue, Retry, and Exit behavior explicit and stable across steps.
9. Use `text-balance` on headings and `text-pretty` on explanations.
10. Use tabular numerals for weeks, days, sets, weights, reps, and progress counts.
11. Avoid `transition: all`; use short color/opacity/transform transitions only.
12. Do not animate high-frequency field changes. If a one-time step transition is used, it must honor reduced motion and have a static state cue.
13. Do not use hover-only explanations. Deload and progression help must be available to touch, keyboard, and assistive technology.
14. Preserve user entries when validation, network, quota, or auth errors occur.
15. Test at Pixel 5 and 1440×900 because those are the existing Playwright responsive targets.

## Known consistency issues the onboarding design should not copy

| Severity | Location | Current behavior | Requirement for onboarding | Why |
| --- | --- | --- | --- | --- |
| High | Plan creation route | Backend validation/quota/network errors are primarily logged to the console | Show an inline or page-level recoverable error and retain the draft | Silent submission failure can block activation without an explanation. |
| Medium | Auth callback to `/` | Authenticated first-time users return to the marketing landing page | Provide a deliberate post-auth destination after the trigger strategy is approved | The first success path is not discoverable automatically. |
| Medium | New-plan empty state | Create new plan links directly to scratch | Route genuinely new users to the approved three-way choice; keep returning-user reactivation separate | Existing import/template affordances are bypassed. |
| Medium | Import custom-exercise fetch | Failure is swallowed and may change which exercises appear unknown | Surface a non-blocking warning and allow Retry | Users may unnecessarily recreate known custom exercises. |
| Low | Existing controls | Hit-area/focus polish is not completely uniform | Apply the requirements above consistently in new wizard components | Onboarding is a high-attention first impression. |

## Considered but rejected

| Candidate | Rejected because |
| --- | --- |
| Put the whole onboarding in a modal | Plan selection and review are multi-step, responsive tasks; a modal adds scroll and history complexity. |
| Add decorative entrance animation to every step | It repeats during corrections/back navigation and adds attention cost without clarifying state. |
| Build a second simplified plan editor inside onboarding | The existing canonical editor is the authoritative final review and prevents payload drift. |
| Use cards with icons from a new icon set | The product already mixes a limited established set; adding another visual language for one flow reduces consistency. |

## Review boundary

This is a static code review. Browser motion at 10% speed, production Auth0, screen-reader output, and real-device touch behavior were not verified during discovery and remain acceptance checks for implementation.

## Verification and verdict

- `npm run test:unit -- app/features/import-plan/importPlanParser.test.js app/features/import-plan/exportPlanCsv.test.js app/utils/mesocyclePlan.test.js` — 2 discovered test files, 6 tests passed. The requested `mesocyclePlan.test.js` file does not exist and Vitest discovered only the import/export tests.
- `npm test -- --runInBand __tests__/auth.tests.js __tests__/securityControls.tests.js __tests__/exerciseMesocycle.tests.js` — 3 suites, 35 tests passed after allowing Supertest to bind a local test port.
- `git diff --check` — passed.
- Not verified: live production Auth0 callback, screen reader, real mobile device, reduced-motion behavior, 10%-speed motion inspection, and a deterministic zero-plan browser journey.

**Verdict: Block shipping the onboarding implementation while the high-severity visible submission-error requirement remains unresolved. This does not block wireframing or product decisions.**
