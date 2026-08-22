# Security Policy

## Verification Baseline and Reporting Taxonomy

Security reviews cover all applicable requirements from
[OWASP ASVS 5.0.0](https://owasp.org/www-project-application-security-verification-standard/)
as the verification baseline. This policy does not claim compliance with an
ASVS verification level. Cite an ASVS requirement identifier only after
verifying it against the official 5.0.0 source.

Classify reportable findings using the closest
[OWASP Top 10:2025](https://owasp.org/Top10/2025/) category:

- A01:2025 Broken Access Control
- A02:2025 Security Misconfiguration
- A03:2025 Software Supply Chain Failures
- A04:2025 Cryptographic Failures
- A05:2025 Injection
- A06:2025 Insecure Design
- A07:2025 Authentication Failures
- A08:2025 Software or Data Integrity Failures
- A09:2025 Security Logging and Alerting Failures
- A10:2025 Mishandling of Exceptional Conditions

The taxonomy is for reporting. It does not replace the ASVS verification
baseline or limit findings to ten vulnerability classes.

## System Scope and Exposed Surfaces

Treningsappen is a web application for creating training plans, recording
workouts, tracking personal records, and calculating progression targets.
Repository documentation identifies `https://setoptimizer.com` as its hosted
site.

The covered system consists of:

- The React Router/React frontend in `frontend/`, including server rendering,
  browser routes, public assets, and API clients.
- The Express API in `backend/`, including middleware, route handlers,
  business logic, database adapters, schema management, and local seed/reset
  tooling.
- Authentication and session integration with Auth0.
- Local SQLite and SQLite Cloud persistence paths.
- Deployment, dependency, CI, and test configuration stored in this
  repository.

Internet-reachable or security-relevant surfaces identified in the repository
include:

- Frontend pages, server-rendered responses, browser navigation, and static
  assets.
- Public API health and landing endpoints.
- Auth0 login, registration, callback, logout, and session-status endpoints.
- Authenticated endpoints for the current user, CSRF token issuance,
  exercises, mesocycles, current workouts, and personal records.
- Account deletion and all exercise or mesocycle mutations.
- Cross-origin credentialed requests from configured frontend origins.
- Requests forwarded through the deployment proxy to Express.

No file upload, webhook, or WebSocket surface was identified. Reassess this
statement when such functionality is added.

## Attacker-Controlled Inputs

Treat the following as attacker-controlled until validated for their specific
use:

- HTTP methods, paths, route parameters, query strings, headers, cookies,
  origins, content types, and request bodies.
- Mesocycle names and identifiers; week and day counts; deeply nested plan,
  exercise, set, dropset, weight, repetition, completion, and progression data.
- Exercise names, types, muscle groups, and video links.
- Usernames supplied to account-management routes.
- CSRF tokens, app-session cookies, and malformed or expired tokens.
- Forwarding headers such as `X-Forwarded-For` unless they have crossed the
  exact configured trusted-proxy boundary.
- Auth0 profile claims and callback data until the Auth0/OIDC integration has
  completed cryptographic and protocol validation.
- Database contents when parsed or returned, including stored JSON plans and
  legacy rows.
- Dependency metadata and code executed by local, CI, build, or deployment
  workflows.

Environment variables and deployment configuration are privileged
administrative inputs, but must still be validated and must fail closed when
security-critical values are absent or invalid.

## Trust Boundaries

Important trust boundaries are:

- The user-controlled browser to the frontend and Express API.
- The frontend origin to the credentialed, potentially cross-origin API.
- Public requests and forwarding headers to the trusted deployment proxy, then
  from that proxy to Express.
- Express to Auth0 for OIDC authentication and logout.
- Auth0-validated identity claims to the locally issued app-session token.
- Express and business logic to SQLite Cloud or the local SQLite file.
- One authenticated user's records to every other user's records.
- Runtime application code to environment secrets and deployment
  configuration.
- Repository source to npm dependencies, GitHub Actions, Vercel, and other
  build or deployment infrastructure.

Client-side route protection, CORS, and hidden UI controls are not
authorization boundaries. Authorization must be enforced by the API.

## Authentication and Authorization Requirements

- Interactive login and registration must use the configured Auth0/OIDC flow.
  Legacy password-authentication routes must not be exposed.
- Auth0 callback data must be accepted only through a successfully validated
  OIDC transaction. A local app-session token may be issued only after that
  validation and successful local-user resolution.
- App-session tokens must be server-generated, integrity-protected, expired,
  and stored in an HTTP-only cookie. Production cookies must use secure
  transport attributes. Missing, malformed, expired, or deleted-user sessions
  must not authenticate a request.
- Auth0 account linking by email requires a provider-verified email claim.
  Unverified email claims must not link to an existing account, and an existing
  Auth0 subject must not be reassigned to another user.
- Every endpoint that reads or changes user, exercise, mesocycle, workout, or
  personal-record data must authenticate the caller unless the data is
  explicitly and intentionally public.
- Authorization and database predicates must derive ownership from the
  authenticated user identifier, not from a username or object identifier
  supplied by the request.
- A user must never read, update, rename, or delete another user's private
  records. Account deletion must apply only to the authenticated user's own
  account.
- State-changing browser requests must require a valid CSRF token tied to the
  authenticated session. CORS and cookie attributes are defense in depth, not
  replacements for CSRF validation.
- Authentication and authorization failures must fail closed without exposing
  whether another user's private object exists.

## Sensitive Data and Operations

Sensitive or security-relevant data includes:

- Email addresses, usernames, Auth0 subject identifiers, verification state,
  and profile image URLs.
- Exercise history, training plans, workout completion data, timestamps,
  progression data, and personal records.
- Any retained legacy password hashes.
- App-session and CSRF cookies or tokens.
- JWT, Auth0, database, and deployment secrets.
- Local and cloud database files, connection strings, and backups.

Sensitive operations include identity creation and linking, session issuance
and termination, account deletion, creation or mutation of workout data,
selection of the current mesocycle, schema changes, and database seed/reset
operations.

Secrets, raw session material, password hashes, and database credentials must
not appear in client responses, source control, logs, test artifacts, or
frontend bundles. Seed/reset tooling must remain restricted to an explicitly
selected local database and must not operate against production or cloud data.

## Security Invariants

- User records and workout data remain isolated by authenticated user ID at
  every read and mutation.
- Request-supplied object identifiers or usernames cannot change the
  authorization subject.
- SQL influenced by untrusted data remains parameterized. Dynamic SQL
  identifiers or fragments must come only from fixed, trusted values.
- Request bodies and stored JSON are validated for expected type, structure,
  size, nesting, numeric ranges, and allowed values before expensive
  processing or persistence.
- Stored names, labels, links, profile data, and plan content cannot become
  executable HTML, JavaScript, or unsafe navigation in browser output.
- Server-controlled timestamps and derived workout state cannot be overwritten
  directly by client-supplied values.
- Invalid plans and exceptional database or provider conditions fail safely,
  do not cross user boundaries, and do not disclose secrets or unnecessary
  internal details.
- Production startup fails closed when required signing or identity-provider
  secrets are absent. Trusted-proxy configuration accepts only an exact,
  validated hop count appropriate to the deployment.
- Credentialed CORS access is limited to explicit expected origins. Requests
  with no browser `Origin` header are not assumed to be authenticated.
- Rate-limit identity is derived only after the trusted-proxy boundary is
  correctly established, and attackers cannot select another user's quota key.
- Security-relevant dependency and workflow changes preserve lockfile
  integrity, least-privilege CI permissions, and pinned third-party actions.

## Reportable Findings and Severity

A finding is reportable when repository evidence shows a realistic path from
an untrusted actor, compromised low-trust component, or unsafe deployment
configuration to a violation of an applicable ASVS requirement or a security
invariant above.

Reportable examples include authentication or session bypass, cross-user data
access, unsafe identity linking, CSRF on meaningful operations, injection,
stored or reflected script execution, secret exposure, destructive database
behavior, exploitable dependency or workflow compromise, unbounded processing,
and error handling that creates confidentiality, integrity, or availability
impact.

Assign severity from demonstrated reachability and impact:

- **Critical:** unauthenticated or broadly reachable compromise of session
  signing, arbitrary code execution, systemic account takeover, or compromise
  of most users or production data.
- **High:** cross-account access or mutation, account takeover, unauthorized
  account deletion, significant sensitive-data disclosure, or a reliably
  exploitable injection or integrity failure.
- **Medium:** a realistically reachable but constrained confidentiality,
  integrity, or availability failure requiring meaningful preconditions or
  affecting a limited surface.
- **Low:** a limited-impact weakness or hardening gap with a credible security
  consequence but no demonstrated path to higher impact.

Do not lower severity solely because the application has a small audience,
because a control is delegated to Auth0, Vercel, or SQLite Cloud, or because a
client-side control appears to prevent access.

## Known Limitations, Exclusions, and Accepted Risk

No exclusions or accepted risks have been owner-confirmed. Do not infer
suppression authority from this section.

Repository inspection cannot verify deployed TLS termination, response
headers, Vercel project settings, Auth0 tenant configuration, cloud-database
access controls, secret rotation, backups, production logging, alerting, or
incident response. Treat these controls as unverified until deployment evidence
is available.

Tests describe intended controls and failure modes but do not prove that those
controls are effective in production. The ASVS baseline applies only to
requirements relevant to this system; no ASVS verification level or complete
compliance claim has been selected.
