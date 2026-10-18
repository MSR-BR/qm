# C15-016/017 — correction and release, 2026-10-18

## Authorization and bounded plan

Owner authorized correction of both technical findings, tests, specification
records and CPD, without changing TERMO. Preserve the authenticated QA records;
no historical deletion, reward rewrite, provider change or paid AI call.

1. Lock submission synchronously before authentication awaits. Retain one
   immutable request/key until its outcome is known; recover from expired auth,
   network loss and replay without duplicating learning evidence.
2. Preserve server authority and owner-scoped replay, including the correction
   cycle needed after an assessment response is lost.
3. Align the snapshot's best score with its assessment-only count, including
   legacy chapter assessments, excluding daily and focused-retry scores.
4. Test overlapping UI submits, transport retry and error exits; test handler
   and PostgreSQL replay, mixed-mode summaries and unchanged grants/RLS.
5. Stage and verify QUANTUM only, apply the bounded forward migration, publish,
   check production and commit/push the evidence. Keep C15's separate human
   accessibility/editorial/real-device acceptance open.

Targets: Developer/qm main; Supabase quantum_rebuild `crasnnvdvujzxudmbakv`;
Vercel qm `prj_A9ZEdGd9hXOqAsacRPtIcKUaU8tq`, team
`team_jQuUBnU7RDJh0O3XASyu1WeS`. Never use the old implicit Supabase link.

Skills: adaptive-learning-gamification (event integrity and distinct activity
modes), Supabase/Postgres (invoker functions and explicit grants), Vercel
deployment/CLI (scoped staged release). No pedagogical thresholds or reward
amounts change. Actual host-selected model/reasoning identifier is not exposed;
no route switching or subagents is claimed.

## Execution evidence

- Implemented synchronous pre-auth submission lock, immutable in-memory request
  replay until a new assessment is explicitly started, account-change guard,
  stable result/review-cycle recovery, and assessment-only best score. Reloading
  the entire page does not retain an unresolved request; cross-reload durable
  recovery is not claimed.
- Forward migration `20261018194619_qm_assessment_replay_and_summary.sql`
  replaces only two invoker functions and retains their service-only grants.
- 127 Node tests passed, including ten new client/handler regression cases.
  One older source-pattern assertion initially failed because the guard now
  additionally checks an existing result; updated it to the stronger guard.
- Historical SQL replay and immutable fresh-baseline plus forward migrations
  passed in an isolated PostgreSQL 17 container with no network/ports. Covered
  immutable replay/mismatched requests, recovery cycle, completed retry replay,
  mixed-mode and legacy aggregates, six simultaneous requests, caps, rollback,
  cross-user isolation and 525 table/66 function privilege assertions per run.
- Content/privileges, SEO, exercise-source governance, corpus, taxonomy/index,
  math contract, AI-context and renderer checks passed without paid AI calls.
- Remote preflight confirmed the intended project and 634 catalog checks. The
  explicit-ref isolated CLI dry-run selected only this migration; no vault,
  seed, role or other migration changes. Existing password-protection warning
  and intentional service-only RLS informational notices were not changed.
- Implementation commit: `4121cfc`; release label `v20261018.1951`.
- Staged Vercel deployment `dpl_GriGLpHqep8VkCcv8W82CS47NQHB`,
  `qm-84pzzgply-msr-brs-projects.vercel.app`, built successfully. Authenticated
  CLI checks confirmed the client asset exactly matches the committed source,
  six-question public quiz and denied unauthenticated save. Deployment
  protection was not disabled. Connector inspection was unavailable; scoped
  existing CLI authentication was used, with project/team checked first.
- Applied only `20261018194619` through the explicit project-ref isolated
  migration directory, with vault/seed/role changes excluded. Migration history
  now contains baseline `20260926204825`, C30 `20261018005852`, and this fix.
- Before/after fingerprints of eight Auth/learning tables matched exactly:
  3 users, 58 ledger rows, 7 attempts, 31 attempt items, 5 badges, 3 profiles,
  4 remediation cycles and 2 challenge issues. No historical data was removed.
- Real managed PostgreSQL transaction proved assessment duplicate recovery with
  the same correction cycle; completed retry replay without extra XP; daily and
  retry 100% excluded from an assessment-only best score of 0%; count 1;
  consistent profile/ledger of 50 test XP; stale question-set rejection.
  Transaction rolled back and all eight fingerprints still matched; no
  persistent test user or activity was created by this database smoke.
- Post-migration catalog: 634 checks passed, no failures. Existing advisories
  unchanged. Functions remain invoker/service-only and RLS remains intact.
- Promoted the tested deployment to `https://quantummechanicsbook.app`.
  Production audit passed: 99 sitemap URLs, 85 reviewed search sections,
  65 assets, 9 API boundaries, zero errors/warnings.
- Post-fix authenticated browser recheck is **not claimed**: the prior audit
  signed out and cleared its isolated session. Reopened an isolated headed
  Chrome window and requested owner login. The native browser tool still
  cannot initialize because of the host's symlinked writable root; did not
  change host permissions/settings.
- Public Chrome audit passed all 20 scenarios, including 320/390/1440 px,
  Extras/search, assessments/daily/help, simulator catalogue/math, locked chapter
  and signed-out Journey; zero errors/warnings. This is not an authenticated or
  physical-device acceptance test. Canonical client bytes match local source.
- Removed only this run's isolated PostgreSQL container
  `qm-qa-c15-20261018` and its disposable synthetic databases after both replays;
  fixtures are reproducible from the committed runner. No backup or real learner
  data was deleted. Isolated headed login window remains available for the
  requested follow-up login; no credentials were read or recorded.

## CPD

Runtime commit `4121cfc` was deployed and promoted as recorded above. A following
documentation-only commit records the verification and outstanding login gate;
it does not require another runtime build. Push and clean-check receipt is
reported in the task after Git confirms it. No TERMO file or remote resource
was changed.

## Rollback and limits

Do not revert learner rows. A forward rollback may restore the two function
definitions from `20261018005852_qm_checkpoint_coverage_and_mastery_guard.sql`
and `20260926120250_qm_adaptive_learning_modes.sql`, retaining existing grants,
then reload the PostgREST schema. Reverting the app to the prior deployment
`dpl_Akfo99tTN8m68SzEqUDi5q87Z9WY` is possible but reintroduces the submit race;
prefer a forward fix. Migration history must remain truthful. The original
duplicate QA attempts and correction cycles remain untouched.
