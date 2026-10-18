# C15 — second QUANTUM / TERMO learning parity audit

Follow-up: the three high-priority defects below were corrected and tested locally
under C30 on 2026-10-17. See
`../030-adaptive-learning-modes-and-rewards/corrective-followup-2026-10-17.md`.
The original findings remain as the audit baseline; neither the corrective work
nor its forward SQL migration has been published. Other parity decisions remain open.

Date: 2026-10-17. Status: audit and local header implementation complete; unpublished.
Scope authorized: inspect TERMO read-only, audit QUANTUM, add a QUANTUM header
announcement and prepare a reciprocal TERMO handoff. No pedagogical changes,
database writes, paid AI calls, commit, push or deployment authorized this turn.
Current Codex session; exact model/reasoning route unavailable. No delegation.

## Outcome and evidence boundary

**Not equivalent end to end.** Shared principles and released implementation do
not establish identical learning methods. The preceding C15 menu fix addresses
discoverability only and is still unpublished. C33 remains a valid release
record, not proof that every parity requirement passed learner acceptance.

Read-only baseline: Developer/qm `98b269c` plus existing local menu changes;
Developer/termo `4a7acf4` plus three existing injector edits and an untracked
Supabase guidance document, all untouched. No learner accounts or remote SQL
were exercised. Runtime server revision and currently installed SQL definitions
were not independently verified in this audit.

Public GETs returned 200 for both canonical homepages. TERMO `/index.html` source
(served at `/`), policy and simulator-capability JSON match local files byte for
byte. QUANTUM public assessment JS and policy match local files; its homepage
does not match the unpublished menu changes. This verifies only those public
assets, not the entire deployment or an authenticated workflow.

Additional safe public GETs to QUANTUM `/api/qm-chapter-quiz?chapterId=01` and
`chapterId=07` returned 200 and exactly the local `publicQuiz(getQuiz(id))` output
(3 questions each). This route was inspected first and serves a static catalogue;
no generation, grading or learner write was invoked. TERMO quiz-generation
endpoints were deliberately not called. Public response equality does not expose
or independently verify the server's answer key.

## Comparison and required follow-up

| Area | QUANTUM evidence | TERMO evidence | Required QUANTUM action / decision |
| --- | --- | --- | --- |
| Activity discovery | Local Extras links to journey, assessments, Daily Challenge, all simulators; persistent Search | Extras exposes journey, daily challenge and simulator catalogue | Keep C15 fix; publish only after authorization. Keep English and external book preview; do not copy TERMO's PDF gate. |
| Assessment construction | `lib/qm-chapter-quiz-catalog.mjs`: 3 fixed questions/chapter, 7 chapters, 21 originals + 21 transfer variants | `lib/gamification-ai-quiz.mjs`: 5 AI questions with before/during/after stages; `lib/chapter-quiz-handler.mjs` uses versioned fallback | C30 follow-up: add explicit diagnostic/during/after assessment flows and a reviewed, broader item blueprint if exact experience parity is wanted. AI is not itself evidence of quality; retain provenance, validation, fallback, cost controls and locked-content exclusions. |
| Answer-position integrity — HIGH | All 42 catalogue items have correct option `a`; `publicQuestion` preserves option order and `assets/qm-assessments.js` renders `Object.entries(question.options)` | No claim that TERMO has an equivalent fixed-key defect | Fix server-issued option permutation with grading mapping/idempotent retries and regression tests before treating scores as reliable mastery evidence. Do not shuffle client labels without changing grading contract. No fix made during this audit. |
| Coverage / mastery label | 21 represented concepts/sections versus 68 graph concepts and 85 reviewed sections; chapter mastery requires its 3 configured assessment concepts, not all reviewed content | TERMO uses >=80% full-quiz attempts, 2 different days and quiz keys, with independent correct evidence (`lib/gamification-adaptive-v1.mjs`) | C30 follow-up: editorially approve assessment coverage, diversify actual representations and distinguish sampled-objective mastery from whole-chapter mastery. Neither a changed ID nor a second MCQ alone proves transfer. |
| Daily Challenge | `selectDailyChallenge` requests 3 studied concepts (policy 3–5, 5–10 minutes), unavailable if too few; concept-history selection | 1 question (`DAILY_CHALLENGE_QUESTION_COUNT = 1`), AI with canonical fallback | Product decision: retain deliberate 3-item practice or introduce a clearly labelled short mode. Do not silently replace the approved QUANTUM contract with TERMO's shorter challenge. |
| Daily selection across chapters — HIGH | `lib/qm-adaptive-learning-handler.mjs` loops 01..07 and stops at the first eligible chapter; requires 3 checkpoint concepts within that chapter | TERMO uses its separate single-item challenge flow; cross-chapter effectiveness not measured here | Fix QUANTUM's chapter selection to rank eligible needs across chapters before issuing the daily set, with starvation/rotation and insufficient-evidence tests. Do not call the current within-chapter ranker globally adaptive. |
| Rewards | 20 section, 30 initial assessment, 10 review/retry; no additional daily XP; 80 chapter mastery | Same base 20/30/10/10; 10 daily correct, once UTC day; mastery reward is legacy-only | C28/C30 decision: approve one shared reward policy or document intentional adapter differences, then align help/tests/ledger prospectively. Do not retroactively recalculate balances during a UI change. |
| Study routes / recommendations | Concept states, prerequisites, 24h delayed retrieval and computed next action; no equivalent three-route selector found in journey | `journeyStudyGuides` offers Sequential, Chapter mastery, Error review | Add accessible route choices with persistence and clear reasons/alternatives if matching TERMO UX is desired; retain QUANTUM's delayed retrieval and prerequisites. Route choice must not force unlocks or imply points = mastery. |
| Simulator evidence | `assets/qm-simulator-progress.js` has prediction / interaction / comparison cycle; generic input counter and self-report comparison | `termo-simulator-capabilities-v1.json` explicitly open-only, no mastery/XP | Do not downgrade QUANTUM to open-only. Improve per-simulator target, distinct meaningful controls and explanatory feedback: two input events can be two moves on the same control, despite copy saying two controls. This is not scientific correctness evidence. |
| Policy truthfulness | `qm-learning-policy.v1.json.activation` still says pending migration despite C33 release | TERMO policy has production status together with historical pending-remote gaps | Reconcile QUANTUM policy/documentation lifecycle metadata against release evidence, without changing runtime grants. TERMO contradictions are audit notes only, not permission to edit. |

Additional semantic differences: TERMO's retry/review handler awards 10 only on
all-correct submissions; QUANTUM SQL awards retry XP when the remediation cycle
is reward-eligible, without an all-correct condition. TERMO excludes low-confidence
correct feedback from independent mastery evidence; QUANTUM counts unaided
low-confidence correctness but schedules its next review sooner. TERMO checks
different calendar days and form keys; QUANTUM checks >=24 hours and declared
representations. These are policy choices to reconcile, not just matching labels.

Missions/badges/levels are present in both codebases, but not an identical product
contract: QUANTUM computes missions from due concepts/remediation and reads
criterion badges from its snapshot; TERMO maps `active_missions_json` and
`recent_badges_json` and constructs optional next-action missions. Both use
100-XP level steps. Do not repeat the stale TERMO policy note that missions have
no implementation as a current fact. Full badge criteria, streak midnight
boundaries and actual mission completion/exposure still require authenticated
acceptance, not this anonymous/read-only audit.

The shared nucleus remains: account-scoped ledger/projections, once-only core
awards, guided remediation, evidence differentiated from simple engagement, no
XP for simulator opening, and no single-answer mastery rule. This is code-level
evidence, not a fresh concurrency/RLS/real-account validation.

Reward evidence: `data/qm-learning-policy.v1.json`,
`supabase/migrations/20260926120250_qm_adaptive_learning_modes.sql` (daily event
without base XP; mastery 80); TERMO `data/termo-gamification-policy-v1.json`,
`lib/chapter-quiz-handler.mjs` (`computeAwardedXp`). Recommendation/mastery
evidence: `lib/qm-adaptive-engine.mjs`, `data/qm-learning-concept-graph.v1.json`,
`lib/qm-learning-profile-handler.mjs`; TERMO `lib/gamification-adaptive-v1.mjs`.
TERMO T52 validation itself retains an unchecked authenticated/manual gate.

### Reproducible local catalogue diagnostic

Import `dailyQuestionPool`, `getQuiz` from `lib/qm-chapter-quiz-catalog.mjs` and
`buildConceptGraph` from `lib/qm-adaptive-engine.mjs`. Count question IDs, correct
keys, source section IDs and concept IDs; group `getQuiz(1..7)` by chapter.
Observed: 42 items, `{a:42}`, 21 sections, 21 assessed concepts, 68 graph concepts,
7 assessments of 3 questions each. No API calls or learner writes required.

Mocked-handler diagnostic: with all checkpoint sections of chapters 01 and 02
completed and recent wrong answers only in chapter 02, the daily handler returns
200 and issues chapter **01**. Authentication, snapshot and issue RPC were local
`fetchImpl` stubs using `mock.invalid`, not live services. This reproduces the
first-eligible-chapter bias without modifying any learner record.

## Execution order proposed — not implemented here

1. C30 corrective follow-up: predictable answer positions, first-chapter daily
   selection bias, coverage and honest mastery claims; instrument simulator
   evidence accurately.
2. C28/C30 product decisions: daily length and XP/mastery reward differences.
3. C30 experience parity: study-route choices and staged assessments, retaining
   the evidence safeguards above. C31 help must describe the actual selected policy.
4. C15/C33 verification: real authenticated two-session flows, help/reveal,
   delayed retrieval, duplicate submissions, reward consistency and mobile
   accessibility on the authorized candidate, then production after approval.

C24/C25 remain superseded. Do not restart completed changes or create a parallel
undocumented learning program. Detailed follow-ups need their own scoped specs
and approval; this report records the necessary work without executing it.

## Header announcement plan and acceptance

Add a quiet companion-book strip inside the main application header, below the
four primary actions, not a fifth primary button. English copy names TERMO,
thermodynamics and Portuguese. Native external link, explicit new-tab text,
`noopener noreferrer`, no tracker, embedded content, popup or shared-login claim.
Must wrap at 320px, retain visible keyboard focus and a >=44px link target.
Preserve prior local menu fixes. Reciprocal instructions are stored only in
QUANTUM `.specs/handoffs/TERMO_QUANTUM_HEADER_ANNOUNCEMENT.md`.

## Validation

- 108/108 local Node tests pass, including three new companion-header tests and
  the six preceding menu regressions. `npm run check`, `npm run validate:seo`
  (85 sections), and `git diff --check` pass.
- 20/20 disposable Chrome public scenarios pass with zero warnings/errors:
  previous 17 scenarios plus header at 320px, 390px and 1440px. Checks include
  native safe link, four preserved primary actions, >=44px target, no horizontal
  clipping, actual keyboard focus, menu and locked-content regressions.
- Evidence: `/private/tmp/qm-second-parity-20261017`; the three header screenshots
  were visually inspected. Header strip wraps under the actions on mobile and
  stays on one line at desktop. No external account/session was exercised.
- TERMO canonical public link returns 200. No TERMO file was edited, and its
  pre-existing dirty paths remain unchanged. No production publication occurred.

Full parity is NOT an acceptance claim for this presentation patch. The learning
skill specifically prevents copying weaker evidence rules or inventing a shared
points/account system. The high-priority findings are listed for a subsequent
approved corrective change, not represented as fixed by passing existing tests.
