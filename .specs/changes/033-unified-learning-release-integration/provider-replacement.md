# C33 — Authorized fresh Supabase replacement

## Latest installation receipt — 2026-09-26

Following the owner's “Segue”, the clean baseline was installed via CLI in the
separate `supabase/fresh` workdir. Managed catalog: 25 tables, 22 classified
functions, two sequences, all 634 role/RLS assertions passed. Real Auth/REST
disposable tests pass for isolation, points, assessment/review/retry/Daily and
simulator evidence; test users removed. Fourteen private source PDFs restored
for Chapters 1–7. Auth URLs/client ID prepared; actual Google secret/callback
remain required. See `fresh-installation.md` for exact evidence and owner steps.
Production app credentials remain unchanged; no deploy/CPD. Earlier zero-table
creation observations below are historical, not the current schema state.

## Owner decision — 2026-09-26

The owner states that QUANTUM has no learner data that must be preserved and
authorizes pausing or, if necessary, deleting only the old QUANTUM project to
free a Free-plan slot and create a replacement. TERMO is explicitly out of scope.
Prefer pause: deletion is unnecessary if pause succeeds. Do not delete other
projects, change subscription, purchase add-ons or switch the production app.

This replaces the requirement to recover/import old learner balances for the
fresh destination only. It does not claim the old database is empty or repaired.
Historical migrations remain preserved, and their known bootstrap defects must
still be resolved before installing the application schema on the new project.

## Exact targets

- Organization: `farevhlbtnmkuewoxhry` / `MSR-BR's Org`; API verified `free`.
- Old QUANTUM: `plqiofznjlbpfufigpcp` / `quantum_mechanics`, `sa-east-1`.
- Protected TERMO: `guifkjjuxsdgwjlhkmnx` / `termo`, `us-east-2`.
- Replacement name: `quantum_rebuild`, region `sa-east-1`.
- New project reference: `crasnnvdvujzxudmbakv`; use this explicitly for new work.

## Execution receipt

- Identity confirmed through official Management API using the existing CLI
  credential in memory. No token printed or copied into the repository.
- Organization entitlement `project_pausing`: enabled; plan Free confirmed.
- `POST /v1/projects/plqiofznjlbpfufigpcp/pause`: HTTP 200; subsequent status
  `PAUSING`, then `INACTIVE` verified before creation. No deletion requested.
- TERMO remained `ACTIVE_HEALTHY`; no mutation requested for that project.
- Native Safari automation unavailable because of the local executor's
  symlinked-writable-root error. No sandbox setting changed; official API used.
- Security worktree fast check: PASS, 212 files, seven sensitive triggers.
- `POST /v1/projects`: created `crasnnvdvujzxudmbakv`, name `quantum_rebuild`,
  organization `farevhlbtnmkuewoxhry`, region `sa-east-1`. No paid options sent.
- New project status: `ACTIVE_HEALTHY`, provider version `17.6.1.166`.
- Read-only Management API SQL succeeded as `supabase_read_only_user`, reporting
  PostgreSQL 17.6, zero public tables and zero Auth users. This establishes a
  working fresh read path, not application readiness or a diagnosis of old PAM.
- Password saved in macOS Keychain: service `QUANTUM Supabase replacement`,
  account `quantum_rebuild-20260926`. No password or token in repository/output.
- Old and replacement IDs were checked together; TERMO remains `ACTIVE_HEALTHY`.
- Official CLI 2.118.0 `db query --linked --project-ref crasnnvdvujzxudmbakv`
  SELECT succeeded as `postgres`, zero public tables. No PAM error in this test.
- Application tables, Google OAuth, seeds, private storage, secrets and production
  credentials are not configured. No claim of end-to-end login/learning success.

Infrastructure creation and schema installation: completed and tested (see above). Application release gate:
**BLOCKED** until fresh schema/auth/security/learning readiness is established.

## Boundaries and next gates

Create only under the confirmed Free organization, with no paid options; store
the generated database password in macOS Keychain, never logs/specs/Git. Test
read-only SQL access before application schema installation. Keep the local CLI
link and Vercel/application credentials unchanged until an explicit cutover step.
While paused, the old backend cannot serve the site's authenticated features.

If creation or SQL access fails, report the actual result without claiming PAM
resolved, and do not delete the retained project automatically. A fresh project
does not waive clean migration replay, explicit grants/RLS, role isolation,
learning-flow tests, backup planning or the exact release gate.

Gamification policy, consent, reviewed-content restrictions and C18 hold remain
unchanged. No commit, push, deployment or TERMO work is part of this operation.
