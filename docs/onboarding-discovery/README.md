# Onboarding discovery

This folder is the handoff package for designing a new-user onboarding wizard for SetOptimizer. It documents the product as it exists in the repository on 2026-08-23 and separates verified behavior from decisions that still require a product owner.

Start with [`onboarding-design-brief.md`](./onboarding-design-brief.md). The supporting documents provide traceable evidence:

- [`current-user-journey.md`](./current-user-journey.md): current entry and plan-creation paths.
- [`state-matrix.md`](./state-matrix.md): user, loading, empty, failure, and recovery states.
- [`concepts-and-copy.md`](./concepts-and-copy.md): vocabulary and what needs contextual explanation.
- [`api-and-data-contracts.md`](./api-and-data-contracts.md): authentication, persistence, validation, ownership, and quotas.
- [`design-system-notes.md`](./design-system-notes.md): existing visual conventions and onboarding UI requirements.
- [`product-decisions.md`](./product-decisions.md): recommended decisions and alternatives.
- [`open-questions.md`](./open-questions.md): questions that cannot be answered from code.
- [`source-map.md`](./source-map.md): repository files inspected.
- [`screenshots/README.md`](./screenshots/README.md): capture matrix and limitations.

## Evidence labels

- **Verified in code** means the behavior is directly supported by the referenced implementation or test.
- **Recommended** means a proposed product or design direction, not current behavior.
- **Needs validation** means it requires a stakeholder decision, user research, analytics, or a live Auth0 production test.

No onboarding UI or persistence has been implemented as part of this discovery package.
