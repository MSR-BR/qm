# C30 corrective follow-up — assessment integrity, selection and coverage

Status: released on 2026-10-18 after explicit owner authorization; see
`release-2026-10-18.md`. The record below preserves the local implementation
checkpoint of 2026-10-17 after C15's second parity audit. Its references to
unpublished work and no remote mutation describe that earlier turn, not current
production. TERMO remains read-only/out of scope.

## Requirements and decisions

1. Server-owned deterministic option permutation, versioned with the item set.
   Public questions never reveal the answer key or internal original order.
   Grading uses exactly the displayed mapping. Reject stale browser submissions
   rather than silently grading an old A/B/C/D order against a new key.
2. Rank all eligible chapters using reviewed/studied concepts, errors, spacing and
   last practice. Preserve three items and one chapter per daily issue (existing
   SQL contract), idempotent daily issuance and source gates. Prioritize weakest
   eligible chapter; use bounded rotation to prevent indefinite starvation.
3. Expand from 3 to 6 distinct source-linked objectives per reviewed chapter,
   each with changed-form retry (84 items total). Manually inspect source pages;
   no paid AI. Keep source/answer/feedback provenance testable. This is broader
   sampling, NOT a validated comprehensive assessment of 85 sections.
4. Expose sampled-versus-total concept coverage. A partial bank cannot certify
   whole-chapter mastery or issue new whole-chapter mastery XP. Preserve existing
   ledger/XP/badges; old outcomes are historical, not new comprehensive evidence.
   Concept-level delayed retrieval remains available. The existing policy already
   requires reviewed coverage; the former hard-coded three-concept shortcut did
   not enforce that requirement. Full coverage/editorial certification remains a
   future gate, not a fabricated completion claim.

## Implementation / release boundaries

- Add a forward migration for catalogue additions and recording/coverage guards;
  never edit released migrations or the immutable fresh baseline. Fresh-target
  tests replay the baseline plus subsequent migration(s).
- Keep all RPC grants server-only, fixed search paths and existing RLS.
- Preserve first-assessment/review/retry caps and daily zero-XP policy. No account
  or identity migration, no TERMO policy changes, no recalculation of earned XP.
- Reject older catalogue submissions explicitly; retain historical reads. Record
  the candidate application + additive migration as one release unit, not a safe
  app-only deployment. No production application until authorization.

## Acceptance and risk controls

- Catalogue tests: 7 x 6 unique objectives, 84 IDs, diverse answer positions,
  balanced chapter keys, correct display-to-grade mapping, no hidden answers,
  manifest/taxonomy/locks and changed retry forms.
- Selection tests: later weak chapters win, due-success practice, ties/rotation,
  insufficient study and no locked/unknown sources; handler issuance is mocked.
- Mastery tests: partial coverage remains insufficient even if all sampled items
  succeed twice; no new chapter award from legacy history; saved points unchanged.
- Handler tests: correct/wrong/confidence, stale versions, own-user access,
  failures, retries, duplicate/idempotent keys and missing/tampered answer sets.
- Isolated PostgreSQL replay: grants, RLS, transaction rollback, concurrency,
  expanded item set, coverage and unchanged reward caps. No production credentials.
- Browser: public and synthetic-auth assessment/daily loop, mobile/keyboard,
  failure states, header/menu regressions. Synthetic sessions are not production
  Google-login proof. Run source/math/content/SEO validators and full Node suite.

Model: current host-selected Codex session; exact variant/reasoning unavailable.
No delegation or route change. Learning-gamification and Supabase skills applied.
Current Supabase function security documentation consulted; preserve invoker
execution and explicit grants (https://supabase.com/docs/guides/database/functions).

## Evidence / remaining gates

### Implemented

- Catalogue `qm-reviewed-question-set-2026-10-17.1`: 42 assessment items plus
  42 changed-form retries. Server permutation gives A/B/C/D frequencies 2/2/1/1
  per six-item form, in a deterministic permuted order. A version mismatch returns
  409 before recording answers. This mitigates the all-A defect, not memorization
  or collusion; static MCQs are not independently validated transfer measures.
- `selectDailyChapter` compares every chapter with at least three completed
  checkpoint sources. Error/reveal > prerequisite > missing delayed retrieval >
  due maintenance > first evidence > interleaving. A past mastered concept can
  still become due or have a recent error. Ties use least-recent practice and
  daily rotation. Seven separate eligible practice sessions without a chapter
  give rotation priority. Multiple questions in one session count only once.
  Existing issued daily sets remain authoritative, not silently regenerated.
- Coverage is explicit in the API, assessment page and help: six objectives are
  sampled, with expandable source links for unassessed objectives. Chapter-level
  mastery requires the full reviewed-primary-objective set, not just sampled
  objectives. Concept-level evidence and historical points/badges are unchanged.
- Fixed the pre-existing broken chapter 5 radial source URL in the active
  catalogue/SQL contract. Historical attempt metadata was not rewritten.
- Atomicity follow-up: recording rechecks idempotency after taking the profile
  lock, preventing concurrent identical assessment requests from racing to insert.

| Chapter | Assessed / reviewed primary objectives | Added source sections |
| --- | --- | --- |
| 1 | 6 / 9 | 1.3, 1.5, 1.9 |
| 2 | 6 / 12 | 2.3, 2.7, 2.9 |
| 3 | 6 / 12 | 3.4, 3.6, 3.10 |
| 4 | 6 / 10 | 4.4, 4.9, 4.11 |
| 5 | 6 / 9 | 5.2, 5.7, 5.9 |
| 6 | 6 / 8 | 6.4, 6.6, 6.7 |
| 7 | 6 / 10 | 7.2, 7.3, 7.7 |

Counts are unique primary taxonomy objectives within each chapter, not section
counts; a shared objective can occur in multiple chapters. The reviewed section
manifest remains 85. The additional pairs and their source links are in
`lib/qm-additional-checkpoints.mjs` and `lib/qm-chapter-quiz-catalog.mjs`.

### Validation evidence

- Full Node suite: **117/117 passed**, including eight original corrective tests
  plus a maintenance-after-mastery regression. Public payloads have no answer key;
  all four choices of all 84 items are checked against the grading map. All source
  paths/IDs, six-objective uniqueness, balanced keys, locked exclusions, stale
  submissions, handler ownership/errors and partial mastery guards pass.
- Browser: **24 scenarios passed** (20 public desktop/mobile/menu/header/math/
  keyboard/locked-content regressions plus four synthetic learning flows).
  The latter exercise real client JS and real handlers with synthetic auth/RPCs:
  six-item assessment (5/6 = 83%), review → changed retry (100%), stale-version
  and storage failure recovery, three-item daily → hint → submission. They do NOT
  prove production Google login or managed Supabase connectivity.
- Evidence: `/private/tmp/qm-c30-corrections-20261017`; final rerun with the
  refreshed preview uses `/private/tmp/qm-c30-corrections-final-20261017` and
  also passed all 24 scenarios with zero errors/warnings. Safe public GETs against
  the refreshed local server matched current `publicQuiz` output for all seven
  chapters, including six items, version and explicit coverage.
- PostgreSQL 17, disposable `qm-qa-c30-20261017`, network disabled, no exposed
  ports, synthetic users: both historical migration replay and immutable fresh
  baseline + forward upgrade passed. Each verifies 525 table privileges and 66
  function privileges, RLS/cross-user isolation, immutable ledger, rollback,
  review/day/week caps, six-item assessment and six-item retry, obsolete-version
  rejection, and no chapter reward despite two delayed successful forms for all
  sampled objectives. Six concurrent identical assessments produce one attempt
  and one 30-point award. Twelve concurrent section completions produce one award.
  The disposable container and its synthetic tmpfs databases were removed after
  validation; no real backup, user data or managed database was removed.
- Existing historical test fixtures/rewards remain valid. Fresh baseline bytes
  and its 21 source hashes remain unchanged; upgrades are replayed separately.
- `npm run check`, SEO, corpus, taxonomy, topic-index, source-governance audit,
  math contract, AI renderer and AI-context package all passed. No paid AI calls.
- Failures found and corrected: source 5.5 used a nonexistent path; the new SQL
  test's review key did not follow `review:<cycle-id>` (fixture corrected, runtime
  validation preserved). No hidden failing assertions or skipped tests.

### Candidate release and rollback

Forward migration:
`supabase/migrations/20261018005852_qm_checkpoint_coverage_and_mastery_guard.sql`
(UTC filename; local authorization/date is 2026-10-17). The migration adds 42
contracts, repairs the one active source path, permits six-item attempts/cycles,
enforces the new version, and replaces the three-objective mastery shortcut.
Explicit service-role-only RPC grants, invoker security and RLS are preserved.

Before publishing: editorial acceptance of the new question pairs; scoped remote
authorization; inspect current managed schema/revision; verified backup; apply
the forward migration and application as a coordinated release; authenticated
smoke of assessment/review/retry/daily/profile. The preview was refreshed at
`http://127.0.0.1:4181`. C15's exhaustive owner acceptance remains open.

Rollback must preserve new attempts and earned rewards. Do NOT shrink constraints
or delete contracts/history, and do NOT restore the old three-objective mastery
rule. Before any remote application the atomic SQL transaction can simply roll
back. After release prefer a forward repair or temporarily disable affected
submissions; an app-only rollback to the old item version is incompatible and
will be rejected. An authorized operational release must document its exact
previous deployment and recovery commands after inspecting remote state.

No commit/push/deploy, remote mutation, credentials change or TERMO edit occurred.
TERMO's pre-existing three injector modifications and untracked Supabase document
remain untouched. This closes the three high-priority defects locally, not all
QUANTUM–TERMO methodological differences or complete editorial coverage.
Human editorial approval of the new source-grounded items, managed database
verification and real authenticated production acceptance remain explicit gates.
