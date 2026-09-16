# Validation evidence

## Owner-authorized sequence

On 2026-09-16 the owner instructed the project to execute all pending technical work except C18, publish it, then perform the detailed manual review. This is an explicit sequencing exception to the original C17 prerequisite. C15 owner acceptance is not inferred or marked complete.

## Local and production browser audit

The isolated-Chrome audit executed eight journeys at 1440 × 900 and 390 × 844:

1. public home;
2. Chapter 7 mobile menu;
3. reviewed-content search;
4. a mathematics-heavy Chapter 7 section;
5. the coupled-bases simulator;
6. chapter assessments;
7. signed-out study journey;
8. locked Chapter 8.

Both the final local run and the final production run passed with no warnings or errors. They verified English metadata, expected content, exactly one visible `h1`, no horizontal overflow, accessible names, image alt text, unique IDs, keyboard-visible focus, MathJax output, simulator result tables, menu opening, and absence of console/network errors or error overlays.

Representative production captures:

- [`home-desktop.png`](evidence/home-desktop.png)
- [`chapters-mobile-menu.png`](evidence/chapters-mobile-menu.png)
- [`section-math-desktop.png`](evidence/section-math-desktop.png)
- [`simulator-mobile.png`](evidence/simulator-mobile.png)

## Route, asset, API, authorization, and performance audit

The final production audit passed with new security-header enforcement enabled:

- 96 canonical sitemap URLs;
- 85 reviewed search sections;
- 61 same-origin assets;
- six locked-chapter redirect boundaries;
- nine public/private API status and authorization boundaries;
- public configuration with authentication enabled and the approved GA4 ID;
- no answer key in the public assessment response;
- no secret-key field in public configuration;
- `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` verified;
- route p95 421 ms and maximum 536 ms during the final run.

## Automated repository gates

Executed on 2026-09-16:

- `npm run check`: 13 chapter files passed.
- `node --test tests/*.test.mjs`: 26 of 26 tests passed.
- `npm run validate:seo`: 85 published sections passed.
- SEO generator idempotence: two consecutive runs produced identical hashes for all slide, home, index, and search HTML files.
- `npm run audit:exercise-sources`: 85 eligible sections and 74 curated topics passed.
- `npm run validate:book-corpus`: 85 eligible and 10 deferred sections passed.
- `npm run validate:book-topics` and `validate:book-topic-index`: passed.
- `npm run smoke:math-contract`, `smoke:ai-context`, and `smoke:ai-renderer`: passed.
- JavaScript syntax, JSON syntax, and `git diff --check`: passed.

The seven operational tests cover rating sanitization and owner authorization, legal-preference authentication and consent persistence, disabled email delivery without Resend, the English `SEND` campaign contract, public assessment answer-key protection, and WHATWG request-query parsing.

## Production deployment

- Functional commits: `38bbd74` and `2e3176e` on `main`.
- Final deployment: `dpl_gA2oNcHdzvkbt5GD9gCKxGZzN45r`, status `READY`.
- Canonical alias: `https://quantummechanicsbook.app`.
- Published release metadata: `v20260916.2013`, 16/09/2026.
- Vercel error-log query after the final route and browser audits: no logs found.

The first production log pass exposed Node's legacy `url.parse()` warning on two query-bearing routes. Both wrappers were migrated away from `req.query` to an explicit WHATWG `URL` parser, covered by a test, redeployed, and rechecked with a clean error log.

## External gates still open

- The owner's exhaustive authenticated desktop/mobile review remains open by explicit plan.
- The signed-in visual event confirmation inside GA4 DebugView remains an external C16 evidence gate.
- Live Resend delivery remains safely inactive until sender-domain verification and `RESEND_API_KEY` configuration.
- C18 Google Ads readiness was not started.
