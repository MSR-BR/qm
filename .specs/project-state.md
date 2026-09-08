# Quantum Mechanics — project state

## Classification

`INTERACTIVE_BOOK + EDUCATIONAL_MATERIAL + BOOK_OR_CHAPTER + APP`

## Current state

- Canonical branch: `main`.
- Last published baseline: `cfe6cb6`.
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
- `013-production-domain-and-measurement-foundation` — active; final domain is attached and HTTPS-verified, with the Supabase Auth allow-list and post-deploy verification pending.
- `014-canonical-seo-and-search-console` — planned; depends on C13.
- `015-ga4-measurement-foundation` — planned; depends on C13 and a user-supplied Measurement ID.
- `016-external-user-quality-audit` — planned; depends on C13–C15.
- `017-google-ads-readiness` — planned; depends on C13–C16 and explicit launch approval.

## Non-negotiable content contract

- Follow the Reis *Quantum Mechanics* text exactly; do not invent notation, concepts, equations, conclusions, or derivations.
- Math content must render with MathJax. Long dynamic LaTeX must use `String.raw`.
- Preserve the slide/card teaching pattern used by the reviewed chapters.
- A `cpd` request means commit, push to `main`, and production deployment; no commit otherwise.
