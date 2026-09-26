# Quantum Mechanics — project state

## Classification

`INTERACTIVE_BOOK + EDUCATIONAL_MATERIAL + BOOK_OR_CHAPTER + APP`

## Current state

- Canonical branch: `main`.
- Last published baseline: C17 technical-audit release on `main` (2026-09-16), release `v20260916.2013`.
- The public application is in English; project collaboration may be in Portuguese.
- Chapters 1–7 are reviewed and published. Chapters 8–13 are under editorial review and must not expose learning content, exercises, or indexed SEO pages.
- The QM Supabase project reference `plqiofznjlbpfufigpcp` was read-only verified on 2026-09-03. Any remote database mutation still requires its own scoped authorization.

## Active change

- `001-content-availability-and-canonical-registry` — published.
- `002-exercise-source-governance-and-index-audit` — published in `bbb0325`.
- `003-public-discovery-routes-and-seo-parity` — published in `8732fec`.
- `004-learner-profile-and-study-journey-foundation` — published in `ee3e91a`.
- `005-gamification-and-assessment-foundation` — published in `5ced1e4`.
- `006-reviewed-chapter-assessments` — published in `883a80f`.
- `007-learner-facing-gamification` — published in `5b24041`.
- `008-assessment-editorial-quality` — published in `54cbabd`.
- `009-section-aware-practice` — published in `af8b64e`.
- `010-simulator-integration` — published in `cfe6cb6`.
- `011-search-seo-and-structured-content` — published in `acea642`.
- `012-editorial-review-workflow` — published in `35885e4`.
- `013-production-domain-and-measurement-foundation` — published; final domain, Supabase Auth allow-list, final-domain authenticated session, and legacy fallback policy are verified.
- `014-canonical-seo-and-search-console` — published; ownership is verified, the sitemap is accepted with 96 discovered pages, and the QUANTUM-branded static artifacts are live.
- `015-owner-detailed-review` — active; reported operational findings were corrected and the owner explicitly authorized C16. The exhaustive owner desktop/mobile checklist remains open; on 2026-09-16 the owner authorized the C17 technical audit to run first, without implying C15 acceptance.
- `016-ga4-measurement-foundation` — published; the privacy-first client/server implementation, real Measurement ID, 90-day QM Supabase migration, production consent journey, GA Collect transport, first-party persistence, sanitization, cleanup, and runtime logs are verified. Only the signed-in visual confirmation inside GA4 DebugView remains as an external evidence gate.
- `017-external-user-quality-audit` — technical audit published in `38bbd74` and `2e3176e`; final production route/API/browser/security/log gates pass. The owner's authenticated desktop/mobile review and C16 DebugView visual confirmation remain open.
- `018-google-ads-readiness` — planned; depends on C13–C17 and explicit launch approval.
- `019-operational-parity-completion` — published in `86b2c2b`; live email delivery remains safely inactive until Resend sender verification and `RESEND_API_KEY` are configured.
- `020-po-magico-governance-baseline` — published in `e68e643`; documentation-only governance baseline, no application behavior change.
- `021-authenticated-learning-flow-repair` — active; the local implementation and all local gates passed on 2026-09-24. The exact QM migration, dry-run/reconciliation, temporary-user Supabase audit, deployment, and authenticated production browser evidence remain pending; the pre-migration dry-run returned the expected 403 and changed no data.
- `022-learner-interface-and-rendering-polish` — locally implemented and validated on 2026-09-25. Responsive header actions, English-only shared copy, the assessment UX/status lifecycle, favorite detail lookup/math rendering, and versioned first-login consent are complete locally. Optional email now defaults off; an unapplied local migration preserves explicit timestamped opt-ins while withdrawing only legacy implicit defaults. The 2026-09-25 CPD gate is `BLOCKED`: C21/C27 are not applied remotely and `QM-SEC-006` prevents a reproducible canonical migration run. A local commit may be prepared, but push/deploy remain withheld because pushing `main` may publish an application whose required database contract is absent.
- `023-unified-learning-gamification-blueprint` — blueprint and reusable skill completed on 2026-09-23; the package is versioned under `.specs/blueprints/`, validated, and installed as a personal Codex skill. Project adoption is staged in C21, C22, and the canonical C28–C32 program; C24/C25 are superseded planning records.
- `024-adaptive-study-journey-and-daily-practice` — superseded before execution by the smaller, auditable C28–C32 program. Its requirements were preserved and redistributed; it must not be executed as a competing implementation.
- `025-learning-communication-and-reengagement` — superseded before execution by C32. Its consent, frequency, quiet-hours, unsubscribe, and non-coercion requirements were preserved.
- `026-canonical-url-consolidation-and-search-console-validation` — planned from the 2026-09-23 Search Console notice; consolidates `/index.html` alternates into the canonical root-query routes and requires affected-URL inspection before validation.
- `027-supabase-explicit-data-api-privileges` — locally implemented on 2026-09-25. The full table/function/sequence access contract, least-privilege migration, static drift gate, handler-operation tests, security profile, and rollback are recorded. A normalized disposable replay/reset proves the C21/C27 SQL, exact grants, RLS, and lint; direct canonical reset remains blocked by two older migration-history defects (`QM-SEC-006`). No remote migration, audit, or deploy occurred; history reconciliation and release proof remain separately authorized.
- `028-unified-learning-contract-and-adapter` — planned; inventories and classifies every learning, activity, reward, assessment, simulator, and analytics event against the shared policy without changing production behavior.
- `029-authoritative-learning-ledger-and-profile` — planned; completes the immutable ledger, derived profile, atomic/idempotent award paths, historical reconciliation, and own/cross-user security proof.
- `030-adaptive-learning-modes-and-rewards` — planned; implements Daily Challenge, chapter assessment/review/retry, simulator evidence, concept scheduling, mechanism cards, missions, badges, and transparent next actions.
- `031-learning-methodology-help-and-explainability` — planned; adds a stable public English Help page and contextual explanations of exercises, evidence, rewards, AI, privacy, and reporting.
- `032-academic-evaluation-and-responsible-communication` — planned; separates learning/behavior/experience/fidelity/equity outcomes and implements affirmative-opt-in communication with caps, quiet hours, unsubscribe, and non-coercive evaluation.

## Canonical execution order

### Local product and learning sequence

```text
C22 learner-facing repairs
  -> C28 contract and adapter
  -> C29 authoritative ledger/profile
  -> C30 adaptive modes and rewards
  -> C31 methodology Help and C32 evaluation/communication
```

C29 cannot pass its release gate until C21/C27 and `QM-SEC-006` have an authorized migration-history reconciliation and remote proof. Local specification, deterministic code, and disposable validation may proceed without remote mutation.

### Independent discovery sequence

```text
C26 canonical URL consolidation
  -> authorized CPD
  -> Search Console validation
  -> C18 Google Ads readiness only after the owner's detailed C15 review
```

### Remote-only gates

- C21 migration/reconciliation/audit/deploy.
- C27 explicit-grant migration and post-migration proof.
- Any migration-history repair, provider configuration, disposable remote data, Search Console mutation, Git push, or deployment.

Each requires explicit authorization for the exact action. The final TERMO/QUANTUM parity audit starts only after both independent programs are stable.

C24 and C25 are historical planning records, not executable competitors. C23, `.specs/blueprints/adaptive-learning-gamification/`, and `.specs/shared/learning-gamification-contract.md` are the methodological authorities for C22 and C28–C32. The Pó Mágico security profile and risk register apply concurrently and cannot be overridden by a product Change.

## Non-negotiable content contract

- Follow the Reis *Quantum Mechanics* text exactly; do not invent notation, concepts, equations, conclusions, or derivations.
- Math content must render with MathJax. Long dynamic LaTeX must use `String.raw`.
- Preserve the slide/card teaching pattern used by the reviewed chapters.
- A `cpd` request means commit, push to `main`, and production deployment; no commit otherwise.
- Remote database mutations, provider changes, audits with disposable remote data, Git push, and deploy require explicit authorization for that exact action.
