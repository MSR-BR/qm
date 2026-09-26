# Validation

## Local checks

- `node scripts/check-supabase-privileges.mjs`
- `node --test tests/qm-supabase-privilege-contract.test.mjs`
- `npm run check`
- full local Node test suite used by the project
- Pó Mágico deterministic security fast check in worktree mode
- disposable Supabase CLI replay/reset with effective-grant, RLS, and database-lint inspection

## Database boundary

The repository has no `supabase/config.toml`, so validation used a temporary `supabase init` project and local Docker only. Canonical migration SQL was copied without semantic changes except for two documented compatibility transforms required to replay historical files: unique temporary aliases for duplicate legacy version prefixes and a guarded temporary replacement for an unconditional revoke of the absent `public.rls_auto_enable()` helper.

This proves that C21/C27 SQL, privileges, RLS state, and routines work on a clean database after the historical replay defects are neutralized. It does not claim that the canonical migration directory can currently be reset directly. Do not rename or rewrite applied history without a separate migration-history reconciliation plan and explicit authorization.

Do not substitute the linked remote project. Remote migration, advisors, disposable-user audit, and production smoke tests remain a separately authorized release step.
