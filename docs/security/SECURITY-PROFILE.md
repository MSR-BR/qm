# QUANTUM security profile

- Profile version: `2026-10-02.1`
- Classification: `S3_SENSITIVE`
- Reason: authenticated learner-owned records, server-only credentials, privileged administration, e-mail delivery, analytics, and production database migrations.
- Current assessment scope: local working tree, Supabase privilege readiness and owner-authorized provider replacement; no application production release.

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

- Current C33 Auth decision (2026-10-02): owner explicitly authorized Google-only
  login. Only `external_email_enabled=false` changed on the replacement project;
  public Auth settings list Google as the sole enabled provider, password login
  returns 422 `email_provider_disabled`, and Google authorize returns the
  dedicated client/new callback. All 634 catalog/grant/RLS checks still pass.
  `auth_leaked_password_protection` remains an Advisor WARN but password login
  is unavailable; reconsider the warning before any future password enablement.
  Google Audience is In production and authenticated Preview profile passed.
  Recovery SQL restore/ACL rehearsal passed; five SQL files and fourteen verified
  private PDFs are preserved in an AES-256-GCM local archive outside Git with
  its key in macOS Keychain. Decryption/hash and tamper checks pass. No off-site
  or continuous-backup claim. See current C33 preflight; older observations below
  are retained as history and do not supersede this checkpoint.

- Latest fresh-target C33 proof supersedes old-target observations below:
  unique baseline `20260926204825` installed on `crasnnvdvujzxudmbakv`;
  634 exact managed grants/RLS assertions pass, no advisor ERROR/WARN (eight
  expected server-only RLS/no-policy INFO items). Managed disposable Auth/REST
  proves own/other/anonymous/service boundaries, concurrent rewards, adaptive
  activities and consent-denied communication; fixture accounts removed.
  Fourteen reviewed-chapter PDFs verified by hash/bytes and public/learner denial.
  Node regression 82/82. Fresh candidate digest
  `bee86b08ab55a651dd690c4ba058c18076eefd5b032854a444df1cbfb30d8f2e`.
  Google secret/callback and real login remain pending; provider disabled, URLs
  prepared. Production app environment unchanged. Release **BLOCKED** on OAuth,
  app/cutover/recovery proof and scoped publication approval. Source of truth:
  C33 `fresh-installation.md`; no old PAM-repair or efficacy claim.

- C33 provider replacement (2026-09-26): authorized pause of old QUANTUM
  `plqiofznjlbpfufigpcp` verified `INACTIVE`; no deletion. New Free project
  `crasnnvdvujzxudmbakv` / `quantum_rebuild`, same organization/region, verified
  `ACTIVE_HEALTHY`. API read-only SQL and CLI SELECT as `postgres` succeed; zero
  public tables/Auth users. Password in macOS Keychain. TERMO untouched, no app
  credential switch/deploy. Old data reconciliation waived by owner for the
  fresh target only; clean bootstrap, grants/RLS, OAuth and application gates
  still pending. Existing records below describe the old target unless noted.

- C33 integrated proof (2026-09-26): candidate payload
  `2e7f159e8b28064d50811ad7e09ba7257326c5d608ec95d52c36fce36a4d23ec`,
  base HEAD `f667621fd4bd646f4c79844899a95342171b594e`; 369 release inputs.
  Isolated SQL replay found and repaired C32's invalid report CTE and event
  semantics. Provider idempotency now distinguishes recipients without exposing
  their identifiers. Delivery is recorded separately from unmeasured reading.
  80 Node tests, 525 table/66 function privilege checks, communication concurrency,
  caps/opt-out/erasure and executable aggregate report passed. Security fast
  check: PASS, 211 files, seven sensitive triggers. These checks use synthetic
  PostgreSQL and cannot validate managed Auth/PostgREST or canonical history.
  Read-only connector identity call denied; CLI 2.118.0 history call failed PAM
  (28000). No current history or learner data obtained. Three duplicate historical
  version groups are now inventoried. C33 release **BLOCKED** until exact history,
  recovery, managed role/API and balance gates pass. See C33 runbook/manifest.
  Follow-up: CLI account and exact project identity are now verified; the
  connector has different organization scope. Management API SQL also fails
  PAM for `postgres`. Backup listing returns no entries and PITR disabled;
  WAL-G enabled alone does not prove recoverability. No remote repair attempted.

- C32 local proof (2026-09-26): optional learning email is affirmative and
  versioned, requires a valid time zone, supports pause and signed unsubscribe,
  and is atomically bounded to one eligible message per local day and two in
  seven days with 21:00–07:00 quiet hours. Only reviewed content can be reserved.
  Free-form bulk campaign sending is disabled; provider acceptance is recorded
  as `sent`, not learner exposure. Standards-based one-click unsubscribe uses a
  strong HMAC secret and bounded token input. Production delivery additionally
  requires `QM_LEARNING_EMAIL_DELIVERY_ENABLED=true`, which was not set or
  tested. Aggregate evaluation is owner-only and separates learning, behavior,
  experience, implementation fidelity and equity/safety. The worktree security
  fast check passed on 203 files with seven classified sensitive triggers.
  Managed Supabase/PostgREST, sender verification, webhook delivery/bounce
  evidence, secrets and production release remain unchecked and unauthorized.

- C30 local proof (2026-09-26): instructional evidence is server-scored through
  narrowly granted RPCs; reviewed/locked eligibility fails closed; one answer,
  assisted work and simulator opens cannot create mastery. Isolated PostgreSQL
  proved 504 table and 60 function privilege assertions, 12-way deduplication,
  São Paulo day-boundary and rolling seven-day reward caps, own/cross-user
  isolation, immutable evidence and rollback. Daily Challenge and simulator cycles award zero XP. The worktree
  security fast check passed on 70 files with four sensitive triggers classified.
  Managed Supabase/PostgREST, real history and production release remain unchecked.

- C29 local proof (2026-09-26): canonical ledger is append-only with explicit
  account-erasure exception; reviewed content validated server/DB; only server
  identity reaches private snapshot; operator-only historical import. Isolated
  PostgreSQL proved 315 table and 39 function privilege assertions, 12-way
  concurrency/deduplication, cross-user/admin-metadata denial and atomic rollback.
  Minimal managed-schema fixtures are not production/Supabase/PostgREST proof.
  Browser presentation used synthetic data only. C29 release remains blocked.

- Local deterministic security check: `VERIFIED` on 2026-09-26; C30 worktree result `PASS`, 70 files inspected, four sensitive triggers classified and no finding emitted.
- Supabase access contract/static regression: `VERIFIED` locally.
- Local disposable Supabase replay/reset: `VERIFIED WITH DOCUMENTED COMPATIBILITY HARNESS`; C21/C27 SQL, exact grants, 13-table RLS state, and database lint passed. Direct canonical replay remains blocked by two pre-existing migration-history defects recorded as `QM-SEC-006`.
- Remote schema/advisors/two-identity proof: `NOT_CHECKED`; intentionally not run without authorization.
- Production release decision: `BLOCKED` on 2026-09-26 for the accumulated C21/C22/C23/C27–C32 candidate. Local gates passed, but `QM-SEC-001`, `QM-SEC-006`, `QM-SEC-007`, `QM-SEC-008`, and `QM-SEC-009` prevent push/deploy until the exact remote migration history, historical reconciliation and C29–C32 database contracts are reviewed and authorized.
- Remote history evidence: a read-only `supabase migration list --linked` attempt using CLI `2.118.0` returned `403` for insufficient account privilege. No remote mutation occurred.
