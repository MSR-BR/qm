# Validation evidence

## Owner-authorized sequence

On 2026-09-16 the owner instructed the project to execute all pending technical work except C18, publish it, then perform the detailed manual review. This is an explicit sequencing exception to the original C17 prerequisite. C15 owner acceptance is not inferred or marked complete.

## Local browser audit

The isolated-Chrome audit executed eight journeys at 1440 × 900 and 390 × 844:

1. public home;
2. Chapter 7 mobile menu;
3. reviewed-content search;
4. a mathematics-heavy Chapter 7 section;
5. the coupled-bases simulator;
6. chapter assessments;
7. signed-out study journey;
8. locked Chapter 8.

The final local run passed with no warnings or errors. It verified English metadata, expected content, exactly one visible `h1`, no horizontal overflow, accessible names, image alt text, unique IDs, keyboard-visible focus, MathJax output, simulator result tables, menu opening, and absence of console/network errors or error overlays.

## Route, asset, API, and authorization audit

A predeployment production audit with new-header enforcement temporarily disabled passed:

- 96 canonical sitemap URLs;
- 85 reviewed search sections;
- 61 same-origin assets;
- six locked-chapter redirect boundaries;
- nine public/private API status and authorization boundaries;
- public configuration with authentication enabled and the approved GA4 ID;
- no answer key in the public assessment response;
- no secret-key field in public configuration;
- route p95 258 ms and maximum 358 ms during that run.

The full header requirement will be repeated after deployment.

## Automated repository gates

Executed on 2026-09-16:

- `npm run check`: 13 chapter files passed.
- `node --test tests/*.test.mjs`: 25 of 25 tests passed.
- `npm run validate:seo`: 85 published sections passed.
- `npm run audit:exercise-sources`: 85 eligible sections and 74 curated topics passed.
- `npm run validate:book-corpus`: 85 eligible and 10 deferred sections passed.
- `npm run validate:book-topics` and `validate:book-topic-index`: passed.
- `npm run smoke:math-contract`, `smoke:ai-context`, and `smoke:ai-renderer`: passed.
- JavaScript syntax, JSON syntax, and `git diff --check`: passed.

The six added operational tests cover rating sanitization and owner authorization, legal-preference authentication and consent persistence, disabled email delivery without Resend, the English `SEND` campaign contract, and public assessment answer-key protection.

## Production evidence

Pending CPD and post-deployment rerun.
