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
- Release and authenticated post-fix browser evidence: pending below.

## Rollback and limits

Do not revert learner rows. A forward rollback may restore the two function
definitions from `20261018005852_qm_checkpoint_coverage_and_mastery_guard.sql`
and `20260926120250_qm_adaptive_learning_modes.sql`, retaining existing grants,
then reload the PostgREST schema. Reverting the app to the prior deployment
`dpl_Akfo99tTN8m68SzEqUDi5q87Z9WY` is possible but reintroduces the submit race;
prefer a forward fix. Migration history must remain truthful. The original
duplicate QA attempts and correction cycles remain untouched.
