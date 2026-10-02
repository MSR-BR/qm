# Local evidence — 2026-09-26

Status: **IMPLEMENTED LOCALLY; RELEASE BLOCKED**. No commit, push, deployment,
remote SQL, production backfill, provider changes or TERMO edits in this turn.

## Implemented boundaries

- CLI-created `20260926112057_qm_authoritative_learning_ledger.sql` adds the immutable
  ledger and a private 85-section/source allowlist derived from C28.
- Existing reward RPC now verifies saved completion and exact reviewed identity,
  locks the learner projection, checks reconciliation, and commits old-compatible
  reward record + canonical ledger + projection atomically.
- Lifetime user/section uniqueness excludes policy version. Undo cannot reset it.
- New assessment inserts atomically capture score/count evidence without answers,
  feedback text, invented help/session metadata, mastery or new assessment rewards.
- Historical import is operator-only, unavailable to service/API/browser roles,
  with expected count/XP checks. No migration-time learner import.
- One stable snapshot powers `/api/qm-learning-profile`, header points and Journey.
  All-time assessment aggregates no longer use the latest-20 history window.
- Simulator opens normalize by catalog path; legacy slug aliases do not lose
  records. Opens remain activity, never meaningful interaction or mastery.
- Missing domain data fails closed. Reconciliation-required rewards are explicit.
  Concepts/due reviews have insufficient evidence; C30 mechanics are not simulated.

## Deterministic gates

- `node --test tests/*.test.mjs`: 58 tests passed (including C28's preserved suite).
- `npm run check`: 13 chapter files; 15 tables, 13 functions, 2 sequences, 19 migrations.
- `node scripts/plan-qm-ledger-import.mjs tests/fixtures/qm-ledger-import.json`:
  synthetic one-user snapshot, 1 eligible import, 20 preserved points, 0 blocked;
  dry-run only, no remote writes and no raw account identifier in report.
- Security fast check: PASS; 45 files inspected, 2 sensitive triggers. `git diff --check` passed.

## Real local PostgreSQL assertions

Runner: `scripts/test-qm-learning-ledger-postgres.mjs`.
Container: `qm-c29-disposable-20260926`, `postgres:17-alpine`, `--network none`,
tmpfs data, no published ports or persistent volumes. Synthetic identities only.

- All 19 SQL files replayed in a fresh test database.
- 315 table-privilege checks and 39 function-privilege checks match the contract.
- 12 concurrent sessions: exactly 1 reward, 20 XP, 1 section event.
- Missing completion, unknown content, anonymous/direct authenticated RPC calls,
  cross-account reads, client writes and service/operator ledger mutation denied.
- A user with owner-like e-mail and mutable `admin` metadata gains no cross-user access.
- Undo/re-completion returns a duplicate without additional points.
- Legacy mismatch blocks; approved local import preserves 20 XP and repeated import adds 0.
- 25 assessment rows yield an all-time count of 25 and zero additional XP.
- Injected ledger failure rolls back both the legacy insert and reward projection.
- Explicit account deletion cascades private history; ordinary update/delete/truncate is blocked.

The runner supplies minimal synthetic `auth`/`storage` infrastructure and a stub of
the managed `rls_auto_enable()` function assumed by an old migration. It replays SQL
directly, not Supabase's migration-version bookkeeping. This is **not** a canonical
CLI reset, PostgREST proof, actual Google login test, or production validation.
QM-SEC-006 remains open. No claim that historical replay has been repaired.

## Browser checks

Isolated agent-browser session against `127.0.0.1:4199`, fake local configuration.
Signed-out page rendered. Authenticated presentation used an explicitly synthetic
session/profile response, not a real Supabase login. At 390×844: 1/85 reading sections,
20 points, 2 opened simulators and 25 assessments rendered, no horizontal overflow
or captured JavaScript errors. A simulated 503 displayed an unavailable message,
not zero attempts. Screenshot evidence was kept in `/private/tmp/qm-c29-*.png`.
Copy was subsequently clarified to avoid exposing internal Change numbers.

## Still required before release

- Authorized migration-history/PAM resolution, C21/C27/C22 prerequisites.
- Exact managed Supabase migration, private-schema configuration, role/API proof.
- Complete real historical dry run, discrepancy review and explicit backfill approval.
- Exact candidate build/deployment, authenticated multi-account production checks.
- C30 adds instructional assessment/daily challenge/review/retry rewards and real
  simulator evidence; historical counts alone cannot provide those capabilities.

References consulted: [Supabase functions](https://supabase.com/docs/guides/database/functions),
[Data API security](https://supabase.com/docs/guides/api/securing-your-api),
[Supabase changelog](https://supabase.com/changelog).
