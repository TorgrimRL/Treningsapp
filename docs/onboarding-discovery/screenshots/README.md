# Screenshot capture matrix

Screenshots are supporting evidence, not the design specification. Never include real user plans, cookies, email addresses, or production data.

## Required captures for implementation kickoff

| View | Mobile | Desktop | State |
| --- | --- | --- | --- |
| Authenticated landing | Yes | Yes | Immediately after callback |
| Templates | Yes | Yes | Default and selected preview |
| Import source | Yes | Yes | Paste active and CSV active |
| Import review | Yes | Yes | Valid and invalid/unresolved rows |
| Scratch details | Yes | Yes | Empty, valid, duplicate name |
| Plan editor | Yes | Yes | Template, import, and scratch entry |
| Current workout | Yes | Yes | Active plan and first unlogged set |
| No active plan | Yes | Yes | No history and completed history |
| Creation error | Yes | Yes | Network, validation, and quota |

## Capture procedure

1. Use only the local SQLite test environment.
2. Create a dedicated zero-plan test user rather than modifying production-like data.
3. Capture Pixel 5 and 1440×900, matching Playwright configuration.
4. Record URL, viewport, user-state fixture, and mocked response beside each image.
5. Walk the same states using keyboard navigation and record focus order separately.
6. For any proposed motion, inspect it at 10% speed and with reduced motion enabled.

No binary screenshots are committed by this discovery pass because the existing seed contains an established demo account and the repository does not yet provide a deterministic zero-plan/onboarding fixture. Add that fixture as part of onboarding implementation so captures and E2E tests share the same state contract.
