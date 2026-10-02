# C33 — Supabase access investigation / unsent support draft

Date: 2026-09-26. Status: **not sent**. Contains project metadata only; do not
attach credentials, access tokens, database passwords or learner records.

## Subject

QUANTUM: database PAM authentication fails through CLI and Management API

## Message for an existing or new support ticket

Project reference: `plqiofznjlbpfufigpcp` (quantum_mechanics).
Organization: `farevhlbtnmkuewoxhry`. Region: `sa-east-1`.

Supabase CLI 2.118.0 authenticates successfully as MSR-BR, lists this project as
linked and reports ACTIVE_HEALTHY, PostgreSQL 17.6.1.155. However, both read-only
database metadata paths fail before returning query results:

1. `supabase migration list --linked --project-ref plqiofznjlbpfufigpcp`:
   SQLSTATE 28000, PAM authentication failed for user `cli_login_postgres`.
2. `supabase db query --linked --project-ref plqiofznjlbpfufigpcp` with a SELECT
   from `supabase_migrations.schema_migrations`: HTTP 400,
   `Failed to run sql query: FATAL: 28000: PAM authentication failed for user "postgres"`.

The account metadata and project listing work. This does not establish that the
database itself is unavailable to the running application. We have not reset
passwords, restarted the project, repaired migration history or applied schema
changes as part of this investigation.

The backups metadata endpoint returns `walg_enabled: true`, `pitr_enabled: false`,
`backups: []`, `physical_backup_data: {}`. Please also confirm the available
recovery options before any intervention that may affect existing data.

Please investigate the database PAM/temporary-access authentication path and
advise a non-destructive recovery procedure. We need read-only migration history
and catalog access before preparing an explicitly authorized migration release.

## Owner action / bounded next check

Add the message above to an existing ticket if one exists; avoid duplicate
tickets. Sending it or granting support access requires the owner's decision.
An alternate diagnostic is running only this query in QUANTUM's SQL Editor:

```sql
begin read only;
select current_database(), current_user;
commit;
```

Return the result or exact error, with no credentials. If it succeeds, the
prepared `read-only-preflight.sql` can capture schema metadata; if it fails,
append that result to the ticket. Do not substitute another Supabase project,
change roles, disable RLS, reset passwords, restart or restore to work around it.

After access recovery: inspect history/catalog, reconcile all three duplicate
version groups, establish backup/restore proof, then request approval for the
exact proposed operations. Gamification policy and existing points are unchanged.
