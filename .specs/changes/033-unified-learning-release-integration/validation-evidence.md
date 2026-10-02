# C33 evidence — 2026-09-26

## Superseding execution update — 2026-10-02

- Google Auth Platform Audience: owner screenshot confirms External / **In
  production**; older Testing observations below are historical.
- Vercel Preview: `dpl_FQycaHgdZ32m3qCVwVCyauhA69P1` READY with replacement-target
  configuration. API handlers were consolidated to fit Vercel Hobby's 12
  Serverless Function limit while preserving public aliases with rewrites.
- Authenticated profile smoke against the replacement backend returned
  `learning-profile-v1`. The remote audit reports `complete=true`,
  `cleanupVerified=true`, `disposableUsers=2`, and
  `previewAuthenticatedProfile=true`; both disposable accounts were removed.
- Local verification: 85/85 Node tests PASS; `npm run check` PASS; SEO
  validation PASS for 85 sections; `git diff --check` PASS.
- A current local fingerprint calculation reports base
  `f667621fd4bd646f4c79844899a95342171b594e`, 381 payload files and SHA-256
  `c63f436a82167fc03c241b252bfc4962ca1fe0d4d477be7ef160c60c21c1cb68`.
  Regenerate/verify the full manifest after the candidate is frozen; this
  summary is not a commit or deployment identity.
- Production still points at the old paused project. Four-variable Production
  environment update was rejected by the approval reviewer; no alternative
  mutation path is permitted. Clean CPD remains open pending durable recovery,
  security disposition, final exact-candidate commit and authenticated
  production-domain smoke.

Latest amendment: see `fresh-installation.md`. Baseline installed on new
`crasnnvdvujzxudmbakv`; CLI dry-run now reports up to date. All 634 managed
catalog checks and disposable Auth/REST flows passed, with fixtures removed.
Fourteen private PDFs verified by byte count/SHA-256; public and learner access
denied. No app credential switch/deploy. Google OAuth setup remains incomplete.
Fresh manifest: 377 inputs, payload
`bee86b08ab55a651dd690c4ba058c18076eefd5b032854a444df1cbfb30d8f2e`.
82 Node tests pass. The candidate/old-target observations below are historical
and retained, not current replacement status or publication approval.

## Candidate

Base HEAD: `f667621fd4bd646f4c79844899a95342171b594e`.
Payload: `2e7f159e8b28064d50811ad7e09ba7257326c5d608ec95d52c36fce36a4d23ec`.
369 runtime/data/migration/test/tool files, 21 SQL migrations. See the manifest
for exact scope and per-file hashes. Specs/docs are outside this payload digest.
No new Git commit exists. This receipt is not a deployment receipt.

## Diagnosed and corrected locally

1. Integrated replay failed on C32: `column "sent" does not exist`. The
   communication CTE omitted `sent` while the report selected it. Mechanic
   exposure also used the wrong event names. Corrected the unpublished C32 SQL;
   the regression now executes the report as service_role and asserts values.
2. Confirmed delivery was labeled as learner exposure in report/UI. Delivery now
   has its own count; observed message reading is unmeasured (`null`), not zero
   exposure or an inferred rate. No academic outcome claim was added.
3. Provider idempotency keys omitted recipient identity, potentially colliding
   for two learners receiving the same daily concept. Keys now use a recipient-
   scoped HMAC; retries are stable and IDs/concepts are not in the provider key.
4. Preview now verifies the consent version; unavailable profile/history suppresses
   eligibility instead of treating failure as no previous messages. SQL remains
   the authoritative serialized reservation gate.
5. History inventory expanded QM-SEC-006 from its first observed duplicate to
   all three collision groups. Historical migration names/content preserved.

## Executed

- Full Node regression: **80/80 PASS**, including two new focused regressions.
- `npm run check`: PASS; 25 tables, 22 functions, 2 sequences, 21 migrations.
- `npm run validate:seo`: PASS for 85 published sections.
- Worktree security fast check: PASS; 211 files, seven sensitive triggers.
- Candidate manifest re-verification: exact match; eight inline index scripts
  parsed successfully; `git diff --check` passed.
- A deliberately stale manifest was rejected with exit code 1 without changing
  the candidate. Temporary negative fixture removed. The isolated test container
  was stopped; its synthetic databases remain local and recoverable.
- Isolated PostgreSQL replay of all 21 SQL files: PASS after C32 fix.
- Exact effective privileges: **525 table checks and 66 function checks**.
- Learning: 12 concurrent duplicate award requests yield one award; legacy import
  preserves balances, assessments/review/retry/Daily/simulators execute, caps and
  cross-user isolation pass, injected write fault rolls back atomically.
- Communication: 12 distinct concurrent reservations yield one eligible and 11
  daily-cap rejections; duplicate reservation dedupes; next-day passes; third-day
  hits rolling cap. Quiet hours, unknown timezone, pause, locked source, opt-out,
  anonymous/authenticated RPC denial, immutable events and account erasure pass.
- Academic report executes and returns actual mechanic exposure, provider sent
  and delivered counts separately; no communication-exposure field is inferred.
- Test runner corrected a fixture RPC name after its first C33 extension run;
  subsequent full run passed. No model fallback was invoked.
- Database isolation verified: network `none`, no published ports. Synthetic
  auth/storage fixtures and managed-function stand-in only. This is not a
  canonical Supabase CLI reset, PostgREST or production proof.

## Remote read outcomes

- Connector `get_project`: permission denied. No mutation.
- Supabase CLI 2.118.0 `migration list --linked --project-ref ...`: PAM failure,
  SQLSTATE 28000 for `cli_login_postgres`. No remote history obtained or changed.
- No learner rows, credentials or remote database contents exported.

### Follow-up control-plane checks

- CLI `whoami`: authenticated account `MSR-BR` confirmed. No token read/export.
- CLI project listing: exact linked QUANTUM reference, organization
  `farevhlbtnmkuewoxhry`, region `sa-east-1`, status `ACTIVE_HEALTHY`, reported
  PostgreSQL `17.6.1.155`. The connector instead lists another organization;
  connector denial is not evidence that the CLI account lacks project membership.
- CLI `db query --linked --project-ref plqiofznjlbpfufigpcp --output-format json`
  with a SELECT of migration metadata: HTTP 400, SQLSTATE 28000, PAM failure for
  `postgres`. No history returned; this official Management API path did not
  bypass the database authentication failure.
- CLI physical-backup listing: empty backup list/object; PITR false, WAL-G true.
  No backup created/restored. Available recovery capability remains unproven.
- Prepared an unsent support draft. No support access granted, ticket sent,
  password reset, project restart or remote schema/history/data change performed.

## Reused evidence and remaining limits

Reuse C30/C31 responsive browser and pedagogy evidence for unchanged mechanics.
New admin report text still requires the actual authenticated production loop.
C32's earlier passing static/unit checks did **not** prove its SQL executable;
this C33 receipt supersedes that limitation with isolated SQL proof.

Still open: working database access (CLI identity now confirmed), exact history mapping, canonical
Supabase reset, backup/restore rehearsal, managed grants/RLS/PostgREST, real
balance dry-run/import, approved candidate commit, deploy and authenticated
production/owner review. Sender/webhook/production emails remain inactive.

Release decision: **BLOCKED**. Local integration evidence does not waive these
requirements. See `rollout-and-rollback.md` and `verification-matrix.md`.
