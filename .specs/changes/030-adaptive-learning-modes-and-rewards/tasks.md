# Tasks

## C29 handoff — 2026-09-26

- Consume `/api/qm-learning-profile` / `learning-profile-v1`; do not restore separate
  browser reward totals or use latest-20 assessment history as a lifetime count.
- Extend `qm_learning_ledger` with a forward migration for new evidence/reward
  types, semantic caps and atomic projections. The C29 check intentionally allows
  only section rewards and zero-XP limited legacy assessment evidence.
- Introduce request-idempotent instructional attempts, independent evidence of
  help/confidence/session/representation/delay, and actual assessment review/retry
  and simulator prediction/manipulation/reflection before granting their rewards.
- Preserve section lifetime uniqueness, private reviewed/source allowlist and
  historical import safeguards. Evolve reconciliation deliberately for non-section
  awards; never silently import old self-reports as mastery or reset reward caps.
- C29 leaves concepts/due reviews insufficient-evidence and missions/badges pending;
  these are explicit states to implement, not zero-valued production achievements.
- Real Supabase/PAM/history/release gates remain open. TERMO runs independently.

1. [x] Build the reviewed concept/prerequisite/representation graph.
2. [x] Implement deterministic eligibility, evidence weighting, due dates, and recommendation ranking.
3. [x] Implement Daily Challenge and chapter assessment/review/retry flows.
4. [x] Upgrade simulator evidence to declared capability levels.
5. [x] Apply versioned mechanism cards for points, level, missions, badges, and streaks.
6. [x] Add source-constrained optional AI ranking/variation and deterministic fallback.
7. [x] Add learner-facing explanations, alternatives, source/report routes, and safe empty/failure states.
8. [x] Validate mobile, accessibility, duplicate/retry, locked content, failure handling, reward caps, isolation, and pedagogical invariants locally.

## C28 handoff constraints

- Current chapter catalog has one question per chapter; expand reviewed coverage before any mastery claim.
- Adopt all mechanism cards and simulator capability declarations; current opens cannot be upgraded to prediction/reflection or rewarded learning.
- Persist criterion badges and fidelity exposure; the five current UI achievements are not durable badges.
- Implement and validate server-created remediation cycles with the adapter's once-per-cycle and daily/weekly caps; test timezone boundaries.
- The adapter's separate-session/representation minima do not replace delayed retrieval, concept coverage, rubric validation or calibration.

## Execution record — 2026-09-26

- Implemented the local C30 candidate without remote SQL, provider changes, commit,
  push or deployment.
- Added a forward-only C30 migration; replayed the complete SQL chain against an
  isolated PostgreSQL 17 container with networking disabled and synthetic users.
- Proved atomic/deduplicated rewards, São Paulo local-day review cap, rolling
  chapter cap logic, cross-user isolation, rollback, and zero-reward simulator and
  Daily Challenge evidence.
- Ran the complete Node, content, source, SEO, math, browser and Pó Mágico security
  gates. Exact results are in `validation-evidence.md`.
- C31 is the next local Change. C30 cannot be released until the accumulated
  C21/C27/C29/C30 database/history gates receive separate authorization and pass.
