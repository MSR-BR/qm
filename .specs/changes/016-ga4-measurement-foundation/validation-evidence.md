# Validation evidence

## Focused automated checks

Executed on 2026-09-12:

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

## External gates still open

- Production DebugView cannot be verified until a new deployment receives `PUBLIC_GA_MEASUREMENT_ID` and emits consented events.
- No commit, push, or deployment has been performed; CPD requires a separate explicit request.
