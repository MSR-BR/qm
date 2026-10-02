# C30 local validation evidence — 2026-09-26

Status: **IMPLEMENTED AND VALIDATED LOCALLY; RELEASE BLOCKED**.

No remote SQL, provider setting, real learner record, production app, Git commit,
push or deployment was changed.

## Application and policy gates

- `node --test tests/*.test.mjs`: 66/66 passed, including verified-identity and
  server-only adaptive evidence routing.
- `npm run check`: 13 chapter files; explicit contract for 24 tables, 20 functions,
  2 sequences and 20 migrations.
- `npm run validate:book-corpus`: 85 eligible, 10 deferred.
- topic taxonomy/index: 85 sections and 74 topics passed.
- exercise-source audit: Chapters 1–7 only; no remote request.
- SEO: 85 published sections passed.
- math contract, AI context and AI renderer smoke gates: passed.
- `git diff --check`: passed.

## PostgreSQL transaction and isolation gate

`scripts/test-qm-learning-ledger-postgres.mjs` replayed all migrations in a fresh
`postgres:17-alpine` container with `--network none`, tmpfs storage, no host port,
synthetic users and no Supabase credentials. The container was removed afterward.

- 504 exact table-privilege and 60 function-privilege assertions passed.
- 12 concurrent section requests produced one award.
- Assessment, guided review, changed-form retry, Daily Challenge and four-stage
  simulator cycle passed.
- First assessment/chapter, first eligible review/day, retry eligibility, zero-XP
  Daily and zero-XP simulator behavior matched policy.
- A second valid same-day review and its retry earned zero XP, proving the São Paulo
  local-day cap without penalizing practice.
- A 23:59 event on the preceding São Paulo day did not consume today's reward, and
  two earlier reviews in the rolling seven-day chapter window blocked a third.
- Own-user reads and cross-user denial passed for attempts and simulator evidence.
- One success could not create mastery; injected failure rolled back event and
  projection; direct mutation remained denied.

This is a direct PostgreSQL proof with minimal synthetic managed-schema fixtures,
not a Supabase CLI reset, PostgREST test or production proof.

## Browser/accessibility gate

Local CDP audit: 11/11 scenarios, no warnings or console/network errors. It covered
desktop home; mobile chapters/search/math/simulator/assessment/Daily Challenge;
320 px navigation; assessment at 320 px with 200% root text size; signed-out Journey;
and locked Chapter 8. Focus controls, semantics and no-horizontal-overflow checks
passed. It does not replace a real screen-reader or authenticated production review.

## Security gate

Pó Mágico project-security fast check in `worktree` mode: `PASS`, 70 files inspected,
four sensitive triggers classified. Focused review confirmed server-only evidence
writes, explicit grants, RLS, fixed function search paths, no browser service key,
no raw answer ledger payload and no remote mutation.

## Open release evidence

- canonical migration-history reconciliation (QM-SEC-006);
- exact managed Supabase/private-schema/PostgREST and advisors proof;
- complete real historical dry run and explicit reconciliation approval;
- authenticated own/other/owner production flow and observability;
- exact candidate commit/push/deployment authorization.
