# Tasks

- [x] Record the owner's authorization to proceed with the proposed privacy-first event and metric plan.
- [x] Obtain the Measurement ID from the owner-created or owner-selected GA4 web data stream.
- [x] Implement the explicit event contract and privacy exclusions.
- [x] Add an opt-in consent surface and an accessible preferences control.
- [x] Add final-host-only GA4 loading from public environment configuration.
- [x] Add same-origin, server-sanitized first-party event ingestion.
- [x] Add a 90-day retention migration and structurally remove learner identity from the analytics table.
- [x] Instrument real reading, simulator, exercise, assessment, authentication, rating, favorite, search, and book-preview completion points.
- [x] Verify consent, revocation, disabled-analytics behavior, and payload sanitization in an isolated local browser.
- [x] Apply the retention migration to the correct QM Supabase project after temporary database access is available.
- [x] Set the real Measurement ID in Vercel Production; keep Preview analytics disabled unless a separate test stream is approved.
- [x] Set GA4 event-data retention to 14 months and keep Google Signals and advertising features disabled unless separately approved.
- [x] Verify from a fresh production browser that consented debug traffic reaches Google Analytics Collect and the first-party endpoint.
- [ ] Confirm the received event visually in the signed-in GA4 DebugView interface.
- [x] Document event meanings, metric questions, exclusions, routing, fallbacks, and validation evidence.
- [x] Obtain an explicit CPD request before committing or deploying.
