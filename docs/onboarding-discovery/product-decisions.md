# Product decisions

These are recommended defaults for design exploration. A product owner must approve items marked **Needs approval** before implementation.

| Decision | Recommendation | Status | Rationale |
| --- | --- | --- | --- |
| Primary goal | Get a user to a reviewed, current training block and open the first workout | Needs approval | Matches the existing successful creation boundary. |
| Secondary activation | Track first valid logged set separately | Needs approval | It measures experienced value but should not hold the setup wizard open. |
| Entry trigger | Use explicit versioned onboarding state after successful auth | Needs approval | Plan count cannot distinguish new and returning users. |
| Existing users | Do not auto-launch; provide an optional “Getting started” entry | Needs approval | Avoid surprising established users after deployment. |
| Skip | Allow skip, persist it, and keep a visible resume entry | Needs approval | Respects users who only want to inspect the product. |
| Resume | Persist the last navigation step; persist plan drafts only if separately approved | Needs approval | Avoids collecting unnecessary training data. |
| Number of steps | Four conceptual steps maximum before entering the existing editor | Design recommendation | Reduces setup burden while preserving choice. |
| Creation choice | Templates first, Import second, Scratch third; do not preselect silently | Needs approval | Templates are lowest effort, while all existing paths remain available. |
| Personal questions | Ask only questions used to select or shape a template | Design recommendation | Avoids survey-like onboarding with no product effect. |
| Final review | Always use the existing editor before save | Verified product constraint | Preserves canonical payloads and user control. |
| Completion | Mark complete only after successful plan creation; then open Current workout | Needs approval | Avoids completing onboarding when setup failed. |
| Language | Keep English until localization strategy is approved | Needs approval | Current UI and document language are English. |

## Candidate wizard architecture

This is information architecture for the design agent, not a prescribed visual design.

1. **Welcome/value** — explain that setup creates a first training block and takes the user to their first workout. Include Skip if approved.
2. **Choose a starting point** — Template, Import, or Build from scratch, with effort and result described.
3. **Configure through the chosen existing flow** — route into template selection/import/scratch details without duplicating their logic.
4. **Review and save** — use the existing editor, then mark onboarding complete only after the server confirms creation.

After redirect, use a small contextual first-workout hint for logging the first set instead of extending the wizard across the full workout screen.
