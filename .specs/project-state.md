# Quantum Mechanics — project state

## Classification

`INTERACTIVE_BOOK + EDUCATIONAL_MATERIAL + BOOK_OR_CHAPTER + APP`

## Current state

- Canonical branch: `main`.
- Last published baseline: C16 production release on `main` (2026-09-14).
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
- `017-external-user-quality-audit` — technical audit in progress under the owner's explicit sequencing exception; local browser, repository, and predeployment production gates pass, and fixes are ready for CPD. Final authenticated owner review remains open.
- `018-google-ads-readiness` — planned; depends on C13–C17 and explicit launch approval.
- `019-operational-parity-completion` — published in `86b2c2b`; live email delivery remains safely inactive until Resend sender verification and `RESEND_API_KEY` are configured.
- `020-po-magico-governance-baseline` — published in `e68e643`; documentation-only governance baseline, no application behavior change.

## Non-negotiable content contract

- Follow the Reis *Quantum Mechanics* text exactly; do not invent notation, concepts, equations, conclusions, or derivations.
- Math content must render with MathJax. Long dynamic LaTeX must use `String.raw`.
- Preserve the slide/card teaching pattern used by the reviewed chapters.
- A `cpd` request means commit, push to `main`, and production deployment; no commit otherwise.
