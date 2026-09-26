# QUANTUM security profile

- Profile version: `2026-09-25.1`
- Classification: `S3_SENSITIVE`
- Reason: authenticated learner-owned records, server-only credentials, privileged administration, e-mail delivery, analytics, and production database migrations.
- Current assessment scope: local working tree and Supabase privilege readiness; no provider mutation or production release.

## Assets and trust boundaries

- Public static book, search, simulators, and reviewed Chapters 1–7.
- Browser Supabase client using only the public publishable key.
- Server handlers holding Supabase service/secret credentials, Resend credentials, and provider keys.
- Supabase Auth, Data API, Postgres/RLS, and private Storage bucket.
- Learner progress, saved exercises, assessment attempts, reward events/profile, preferences, ratings, and consented analytics.
- Owner-only administration and communication surfaces.

## Mandatory controls

- Keep service/secret credentials out of browser bundles, logs, specs, and Git.
- Treat authentication, object privileges, RLS, and server authorization as independent controls.
- Use explicit table/function/sequence privileges and owner predicates; do not authorize from mutable user metadata.
- Fix `search_path`, restrict `EXECUTE`, validate caller identity, and keep operations atomic for privileged RPCs.
- Restrict learning and AI features to reviewed content and approved source manifests.
- Test anonymous, own-user, cross-user, admin, and service behavior before an authorized release.
- Verify exact Supabase account, organization, and project reference before any remote mutation.
- Require an exact release candidate, rollback, and owner authorization before migration, deploy, or production audit.

## Evidence status

- Local deterministic security check: `VERIFIED` on 2026-09-25; result `PASS`, 144 files inspected, no findings.
- Supabase access contract/static regression: `VERIFIED` locally.
- Local disposable Supabase replay/reset: `VERIFIED WITH DOCUMENTED COMPATIBILITY HARNESS`; C21/C27 SQL, exact grants, 13-table RLS state, and database lint passed. Direct canonical replay remains blocked by two pre-existing migration-history defects recorded as `QM-SEC-006`.
- Remote schema/advisors/two-identity proof: `NOT_CHECKED`; intentionally not run without authorization.
- Production release decision: `BLOCKED` on 2026-09-25 for the accumulated C21/C22/C23/C27 candidate. The local fast check passed, but `QM-SEC-001` and `QM-SEC-006` prevent push/deploy until the exact remote migration history and required database contract are reconciled and authorized.
- Remote history evidence: a read-only `supabase migration list --linked` attempt using CLI `2.118.0` returned `403` for insufficient account privilege. No remote mutation occurred.
