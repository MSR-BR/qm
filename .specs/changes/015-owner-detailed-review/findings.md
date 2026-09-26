# Owner review findings

## C15-001 — Header sign-in affordance

- **Status:** corrected and verified locally.
- **Observed:** the signed-out header control was labeled `Save progress`, which obscured that it was the entry point for account authentication.
- **Expected:** an explicit `Sign in` control should be visible in the primary header, consistent with the TERMO authentication pattern.
- **Correction:** the shared authentication trigger now renders `Sign in` with the sign-in icon while signed out, preserves the signed-in avatar/name state, and continues to open the same Google/Supabase modal. The JavaScript asset version was renewed across the public chapter pages to prevent stale browser caches.
- **Verification:** local configuration reports `authEnabled: true`; the root page and a Chapter 1 page serve the new asset version.

## C15-002 — Administration menu for the responsible professor

- **Status:** published and production-verified in commit `8c7f2b0`.
- **Observed:** the QM app contained the server-authorized editorial validation review, but exposed it incorrectly inside the learner Personal Area and did not present an Administration group for the responsible account.
- **Correction:** added a dedicated `Administration` drawer group, shown only after the signed-in account is recognized in the public validator allow-list. It now includes `Pending validations` and the existing `AI exercise index` reference.
- **Security:** client-side visibility is only a convenience; the validation API independently verifies the Supabase access token and allow-listed e-mail before returning or changing reports. Ratings and communication were intentionally not added because QM does not yet implement their corresponding data or delivery flows.


## C15-003 — Learner affordances and TERMO feature parity audit

- **Status:** published and production-verified in commit `8c7f2b0`.
- **Observed:** the QUANTUM database and secure endpoints already recorded section completion and points, but the header and section cards did not expose them consistently. The generated-exercise card also lacked an immediate favorite control.
- **Correction:** the header now displays account points, published section cards show **Studied** or **Not studied**, and a generated exercise gains a favorite star after it is saved to the learner's account.
- **Data protection:** all three controls use existing account-scoped storage; no browser-side authorization or new public write access was introduced.
- **Audit:** the complete TERMO-to-QUANTUM operational matrix is recorded in termo-parity-audit.md. Missing TERMO capabilities are explicitly staged as full backend-and-UI workflows rather than placeholder menu entries.

## C15-004 — Header actions are not visually coherent on mobile

- **Status:** diagnosed; assigned to C22.
- **Observed:** `Points` and `Book preview` render as exposed links while `Sign in` and `Send` render as pill controls, creating an inconsistent and crowded mobile header.
- **Expected:** one responsive action group with button affordances, accessible touch targets, and no horizontal overflow.

## C15-005 — Mixed-language share message

- **Status:** diagnosed; assigned to C22.
- **Observed:** the index share builder emits `Veja este interactive Quantum Mechanics book.` while content-page sharing is English.
- **Cause:** duplicated share-message builders in `assets/termo-share.js` and `index.html`, including a Portuguese fallback.
- **Expected:** one shared English-only message contract covering Web Share, mail, and clipboard fallbacks.

## C15-006 — Simulator exploration is not recorded by the real UI

- **Status:** reproduced and diagnosed; assigned to C21.
- **Observed:** opening a simulator leaves Study Journey at zero simulators explored.
- **Cause:** simulator pages load `qm-simulator-progress.js` but do not load the shared Supabase/authentication runtime it expects. The recorder exits before a session is available. A direct authenticated insert succeeds, confirming that the browser database policy is not the primary failure.
- **Expected:** the simulator boot path initializes or awaits authentication and records one meaningful exploration event without refresh inflation.

## C15-007 — Chapter assessment save/history failure and poor mobile layout

- **Status:** production failure reproduced; data repair assigned to C21 and interface repair to C22.
- **Observed:** authenticated submission returns `Could not save your assessment attempt.`, history fails, repeated taps append duplicate error messages, and the page uses overflowing native/serif controls on mobile.
- **Cause:** the server-side assessment workflow lacks the required explicit `service_role` table privileges; the standalone page also lacks the QUANTUM design/status lifecycle.
- **Scope distinction:** a chapter assessment is a chapter-level diagnostic/mastery checkpoint. It is not the Daily Challenge, which is a short spaced-retrieval session. Both will feed the same learner model under the canonical C28–C30 program; C24 was superseded before execution.

## C15-008 — Completed sections do not award learning points

- **Status:** production failure reproduced; assigned to C21.
- **Observed:** section progress can be stored, but the reward endpoint returns `Your learning profile could not be prepared.` and XP remains unchanged.
- **Cause:** the server-side gamification workflow lacks explicit `service_role` privileges on profiles/events. Its current event-then-profile remote update is also non-atomic.
- **Repair requirement:** add narrow grants, replace the update with one idempotent atomic operation, and reconcile eligible historical completions without duplicate awards.

## C15-009 — Study Journey uses fragmented state

- **Status:** architectural finding; stabilization in C21 and redesign in C28–C30.
- **Observed:** the page assembles progress, rewards, simulator activity, and assessment evidence through independent client reads, so partial failures produce contradictory counters and no actionable explanation.
- **Expected:** one account-scoped profile snapshot with freshness, insufficient-evidence states, missions, due reviews, and an explained next action.

## C15-010 — Raw math delimiters in exercise cards

- **Status:** diagnosed; assigned to C22.
- **Observed:** list previews expose strings such as `\\(m\\)`, `\\(q\\)`, and `\\(x\\)`.
- **Cause:** list rendering escapes and truncates the raw statement, while only the detail modal uses the formatter/MathJax pipeline.
- **Expected:** a safe readable summary in the list and fully formatted mathematics in the detail surface.

## C15-011 — Favorite exercise does not open

- **Status:** diagnosed; assigned to C22.
- **Observed:** selecting a favorite exercise produces no detail view.
- **Cause:** the modal lookup searches only `state.savedExercises`, while the Favorites view renders `state.favoriteExercises`; a favorite absent from the saved-list snapshot causes an early return.
- **Expected:** unified exercise lookup and an accessible detail modal containing statement, solution, source, favorite, share, and report actions.

## C15-012 — First-login privacy and communication step is missing

- **Status:** product/privacy requirement; assigned to C22.
- **Observed:** privacy and communication choices exist only in Personal Area.
- **Expected:** first authenticated use presents the current required notice and a separate optional e-mail choice, both editable later.
- **Consent correction:** the owner's proposed initially checked optional-update choice is not adopted. Optional engagement e-mail must be unchecked until an affirmative action is recorded; essential service messages remain a separate purpose.

## C15-013 — TERMO gamification capability is not yet operationally present

- **Status:** confirmed parity gap; methodology in C23, QUANTUM implementation in C28–C30.
- **Observed:** QUANTUM currently has section-completion points and basic counters, but lacks TERMO's operational Daily Challenge, guided review, focused retry, durable missions/badges, richer next action, and chapter-mastery flow.
- **Expected:** adopt the shared learning methodology and event/profile contract rather than copying labels or static menu entries.

## C15-014 — Missing adaptive learning agent

- **Status:** planned in C28–C30 after C21/C22/C27 and the C23 methodology baseline.
- **Expected:** a deterministic-first recommendation engine uses reviewed concept evidence, prerequisites, errors, confidence, hints, and spaced successful retrieval. Optional AI may rank eligible actions or generate source-bounded variants, must explain why, retain provenance, exclude Chapters 8–13, and fall back deterministically.

## C15-015 — Automated audit coverage omitted the failing flows

- **Status:** diagnosed; assigned to C21 and C22.
- **Observed:** the existing Supabase audit covers saved exercises, validation reports, and book metadata but not study progress, gamification, assessment attempts, or simulator activity. Handler tests exercise the public quiz but not authenticated save/history success.
- **Expected:** authenticated database, handler, browser, mobile, and duplicate-request gates cover the entire learner loop before release.
