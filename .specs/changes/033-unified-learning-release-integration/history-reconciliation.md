# Migration history reconciliation — C33

Status amendment, 2026-09-26: this is the historical old-project plan. Owner
approved fresh launch without old data; old `plqiofznjlbpfufigpcp` is paused,
new `crasnnvdvujzxudmbakv` accepts SQL reads. Do not repair old history for the
new launch. Preserve files and prepare a deterministic fresh bootstrap resolving
the defects below. See `provider-replacement.md`.

## Evidence and current limit

The exact target remains `plqiofznjlbpfufigpcp` / `quantum_mechanics`.
On 2026-09-26 the Supabase connector denied `get_project`; CLI 2.118.0
`migration list --linked --project-ref plqiofznjlbpfufigpcp` reached the database
but returned SQLSTATE 28000, PAM authentication failure for `cli_login_postgres`.
No history rows were obtained. No application SQL, history repair or migration
executed successfully. Follow-up CLI metadata reads confirmed account `MSR-BR`,
the linked QUANTUM project in organization `farevhlbtnmkuewoxhry`, region
`sa-east-1`, provider status `ACTIVE_HEALTHY`, and reported PostgreSQL version
`17.6.1.155`. These are control-plane metadata, not proof of database health.
The connector lists a different organization and cannot access this project.

The official CLI Management API alternative (`db query --linked --project-ref
plqiofznjlbpfufigpcp`) also failed: HTTP 400 wrapping SQLSTATE 28000, PAM
authentication failure for `postgres`. It returned no history rows. CLI
`backups list` returned `backups: []`, `physical_backup_data: {}`,
`pitr_enabled: false`, `walg_enabled: true`; recoverability remains unverified.
Do not infer that WAL-G being enabled establishes a usable backup, or that an
empty listing proves every possible external backup absent. See
`supabase-support-request.md` for the unsent support draft and read-only next step.

The previous QM-SEC-006 record named only the first collision encountered.
Full inventory finds three duplicate-version groups:

| Version | Files sharing that version |
|---|---|
| 20260531 | fix_exercise_validation_rls; moderate_exercise_validation_reports |
| 20260731 | add_qm_book_sources; add_qm_saved_exercise_source_metadata |
| 20260803 | fix_qm_book_source_chapter_id_check; grant_qm_book_source_server_access |

`20260910230457_qm_operational_parity.sql` also unconditionally revokes execution
on `public.rls_auto_enable()`. The local isolated replay supplies a stand-in;
this proves application SQL behavior, not canonical Supabase bootstrap.

## Reviewable procedure once read access works

1. Confirm account, organization, project reference and region. Read the metadata
   query in `read-only-preflight.sql`, in a read-only transaction. If migration
   history is unavailable, record that and inspect catalog independently; never
   substitute a similarly named project or mark unknown entries applied.
2. Export migration metadata and, privately if needed, recorded SQL statements.
   Do not execute SQL obtained from history. Compare names, versions, statement
   digests and actual catalog with each file in `candidate-manifest.json`.
   Recorded statement-array digests are not raw-file hashes: differences require
   review of normalized SQL and catalog effects, not automatic equivalence.
3. For each migration classify `applied-equivalent`, `missing`, `divergent`,
   `remote-only` or `ambiguous`. Inspect all three collision groups. Record exact
   source-to-history mapping and dependencies in the Change before any mutation.
4. Preserve original historical SQL as evidence. If a recorded version contains
   only one of two local files, classify the second file by its real effects;
   propose a new forward migration for missing effects using CLI-generated
   versioning. Do not blindly rerun old SQL, squash away evidence, or rename an
   applied version. If effects already exist, design a reviewed baseline/history
   mapping that preserves them and validate it on a disposable Supabase stack.
5. Include the optional managed helper in that bootstrap design with an explicit
   existence guard; a later migration alone cannot repair an earlier clean-reset
   failure. Validate unique versions and a canonical CLI reset, without the
   stand-in used by the PostgreSQL unit harness.
6. Before approval, attach the exact forward SQL or baseline mapping, any
   proposed history-only operations, affected version list, diff, hashes,
   rehearsal and recovery proof. `migration repair` changes history only and
   cannot apply omitted schema changes. No repair command is executable from
   this plan until that evidence exists.

The reconciliation is **prepared, not resolved**. It cannot be made exact without
the production history. Remote access and history remain release blockers.

## Reviewed documentation

- [Supabase migration repair](https://supabase.com/docs/reference/cli/supabase-migration-repair)
- [Supabase changelog](https://supabase.com/changelog)
- [PostgreSQL 15.19 / 17.11 notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)

The current notice requires checking installed versions/extensions and affected
operators/indexes. QUANTUM migrations do not establish that the managed database
has no other extensions. Capture the remote version and catalog before deciding
whether provider upgrade remediation applies; do not change provider versions
as part of this local preparation.
