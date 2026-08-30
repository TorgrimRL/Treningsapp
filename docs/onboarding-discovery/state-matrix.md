# State matrix

| State | How it is detected today | Current experience | Onboarding implication |
| --- | --- | --- | --- |
| Logged out | `/api/me` returns 401 | Protected routes navigate to `/login` | Onboarding must wait for resolved authentication. |
| Auth check pending | `isLoggedIn === null` / `authCheckInProgress` | Route-specific loading fallback | Do not flash the wizard before auth resolves. |
| Newly registered, zero plans | Not explicitly represented | User returns to `/`; navbar is authenticated; Current workout is empty | Needs a durable first-run signal or an explicit first-run endpoint. |
| Existing user, zero plans | Indistinguishable from a new zero-plan user | Same empty state | Do not infer account age from plan count alone. |
| No current plan, completed history exists | Current workout 404 plus completed mesocycle in history | Offers new or repeat latest plan | This is a reactivation flow, not initial onboarding. |
| No current plan, incomplete historical plans | Current workout 404; history may contain non-current unfinished plans | Empty state only offers a new plan | Consider offering Set current separately from onboarding. |
| Current plan exists | Current workout 200 | Workout logging UI | Wizard should not auto-open unless explicitly resumed. |
| Plan just created | Successful POST and GET | Redirect to Current workout | Candidate onboarding completion point. |
| First set logged | Completed set persisted in plan | Targets and history begin to become useful | Candidate activation milestone, not necessarily wizard completion. |
| Onboarding skipped | Not represented | No current behavior | Requires persistence if skipping is supported. |
| Onboarding partly completed | Not represented | Route state is lost on refresh/navigation | Requires draft persistence if resume is supported. |
| Current workout 404 | Query maps response to `null` | Expected empty state; no retry | Keep distinct from failures. |
| Current workout 401 | Query throws | Error UI with manual Retry | Auth may be stale; onboarding should not mask it. |
| Current workout 500 | One automatic retry | Error UI with manual Retry | Preserve retry behavior around onboarding handoff. |
| Templates fail | Templates are local constants | Template cards remain available | Exercise fetch failures can still affect the editor. |
| Custom exercise fetch fails | API error logged | Editor/import continues with built-ins or empty custom set | Surface a recoverable notice if it changes matching results. |
| Import parse error | Parser returns line/global errors | Review does not open | Preserve raw input and show actionable format guidance. |
| Import review error | Invalid/unresolved row | Red cell/row state; Continue disabled | Color must not be the only signal; keep text and `aria-invalid`. |
| Duplicate block name | Case-insensitive name lookup | Details save disabled with inline message | Onboarding must expose or resolve this before final submission. |
| Mesocycle validation failure | POST returns 400 | Currently logged to console in creation route | Wizard design needs a visible submission error and retry path. |
| Quota reached | POST returns 422 | Currently logged to console | Explain the limit and route to History; do not discard work. |
| Network failure during creation | Fetch rejects | Currently logged to console | Preserve draft and offer Retry. |

## Required state separation

The design and implementation must distinguish:

1. first-run onboarding state;
2. plan lifecycle state;
3. authentication state;
4. transient UI draft state.

Combining any of these will create false onboarding launches or lost progress.
