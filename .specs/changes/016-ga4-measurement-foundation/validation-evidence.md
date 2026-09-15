# Validation evidence

## Focused automated checks

Executed on 2026-09-12 and repeated or extended on 2026-09-14:

- `node --check` on the analytics client, handler, API route, public-config handler, local server, and exercise integration: passed.
- `npm run test:analytics`: 14 of 14 tests passed.
- `node --test tests/*.test.mjs`: 19 of 19 project tests passed.
- `npm run check`: passed for all 13 chapter files.
- `npm run validate:seo`: passed for 85 published sections.
- `npm run audit:exercise-sources`: passed for 85 eligible sections and 74 curated topics.
- `npm run validate:book-corpus`, `validate:book-topics`, and `validate:book-topic-index`: passed.
- `npm run smoke:math-contract`, `smoke:ai-context`, and `smoke:ai-renderer`: passed.
- HTML loader audit: all 119 application HTML pages use a shared C16 loader; only the instruction snippet, Google verification file, and static documentation page are intentionally excluded.
- `git diff --check`: passed.

The tests cover the 19-event contract, production-origin restriction, inactive-until-configured behavior, consent enforcement, URL stripping, event-specific property stripping, categorical-injection rejection, service-role-only writes, schema-level removal of learner identity, 90-day retention, environment-only Measurement ID validation, shared page coverage, and real completion-point wiring.

## Real GA4 web stream

Confirmed by the owner on 2026-09-14:

- Stream name: `QUANTUM production`.
- Stream URL: `https://quantummechanicsbook.app`.
- Stream ID: `15777520006`.
- Measurement ID: `G-X5Y1C68QMN`.
- GA4 event-data retention: owner-confirmed at 14 months.
- Vercel Production configuration: `PUBLIC_GA_MEASUREMENT_ID` added as a public Config value and verified with `vercel env ls production`.
- Preview analytics intentionally remains unconfigured so preview traffic cannot contaminate the production property.
- Visual evidence: [`evidence/ga4-web-stream-confirmation-2026-09-14.png`](evidence/ga4-web-stream-confirmation-2026-09-14.png).

## Isolated browser journey

Environment:

- Local QUANTUM server with `G-TEST123456`.
- Supabase service secret intentionally blank.
- Temporary Chrome profile.
- Google Tag host mapped to localhost.

Observed:

1. Initial state: analytics enabled for the debug journey, consent unknown, consent panel visible, GA script absent, data layer empty.
2. Opt-in: panel closed; default consent recorded all analytics/advertising storage as denied before the update; only `analytics_storage` changed to granted.
3. Configuration: the safe URL was `/home.html`; the debug query was excluded; Google Signals and ad personalization were disabled.
4. Sanitization: a synthetic search event retained only the length bucket and result count; injected raw search text and e-mail were absent.
5. Revocation: `analytics_storage` returned to denied and a subsequent section event was not emitted.
6. Disabled configuration: the home page title and heading loaded normally; analytics remained disabled; no panel or GA script appeared.

## Remote Supabase migration

Validated on 2026-09-14 against the healthy `quantum_mechanics` project `plqiofznjlbpfufigpcp`:

- Temporary database access was enabled and the owner mapping was corrected to the `postgres` role with a one-hour expiry. The CLI PAT was read only in memory from macOS Keychain; it was neither printed nor persisted in the repository.
- A read-only preflight confirmed that `20260910230457_qm_operational_parity` was already applied, `public.qm_analytics_events` existed, and its legacy `user_id` column was still present.
- The official Management API applied the migration transactionally with an idempotency key and recorded it as `20260914223802_qm_analytics_retention`. The local migration filename was aligned to that remote history version.
- A read-only postflight confirmed that `user_id` is absent, the 19-event check constraint exists, the security-definer purge function exists, the retention trigger exists, and the table comment states the 90-day non-PII retention contract.
- Supabase advisors returned only an informational no-policy notice for the analytics table, which is intentional because the table is service-role-only, plus expected unused-index information before production telemetry begins. No C16-specific security or performance error was reported.

## Production deployment and end-to-end verification

Verified on 2026-09-14:

- Functional commit `ac91fd1` was pushed to `origin/main`.
- Vercel production deployment `dpl_7uuKdnm86ZtGb2kLLRpzB1BcsUDz` reached `READY` and aliased `https://quantummechanicsbook.app`.
- The canonical domain, analytics client and stylesheet, release metadata `v20260914.2250`, and sitemap index returned HTTP 200.
- Public configuration exposed the expected `G-X5Y1C68QMN` Measurement ID and no server secret.
- The ingestion route returned 405 for GET, 403 for a foreign origin, and 400 without active consent.
- A consented synthetic event returned 202. A read-only Supabase query confirmed the stored row contained only the approved event name, safe page path, language, timezone, viewport group, and consent version. Debug and campaign parameters plus an injected e-mail field were absent.
- A fresh production Chrome profile showed the opt-in panel before collection. Granting consent persisted the versioned choice, loaded the Google tag, emitted `debug_mode: true`, received HTTP 204 from Google Analytics Collect, and received HTTP 202 from the first-party endpoint. Revocation persisted `denied` and returned `analytics_storage` to denied.
- Vercel runtime logs recorded matching `qm_analytics_start` and `qm_analytics_done` pairs; the error-only query returned no runtime errors.
- The three synthetic QA rows were removed by their exact database IDs after verification, and a separate transaction confirmed zero remaining test rows.
- Public regression covered the home shell, chapter navigation, Chapter 7 index, a mathematics-heavy section, reviewed-content search, the coupled-state simulator, and assessments. All returned HTTP 200, used English metadata, showed no error overlay, and exposed no raw LaTeX. The section rendered 33 MathJax nodes and the simulator rendered 41. The live chapter menu opened Chapter 7 with ten section links; Chapters 8–13 were disabled, marked `aria-disabled=true`, styled as locked, and labelled `Under editorial review`.
- The regression exposed one missing favicon declaration on section pages. A shared fallback to the existing QUANTUM SVG was added and locally reverified with the 404 eliminated and the mathematics unchanged.
- Temporary browser daemons, the isolated local server, generated lockfile, and ignored Finder metadata created or encountered during verification were cleaned up.

## External gate still open

- Google accepted the production debug request with HTTP 204 and the payload carried `debug_mode: true`. A signed-in visual confirmation of the event inside the GA4 DebugView interface remains open because the available authenticated browser could not be attached through the current Codex UI sandbox.
