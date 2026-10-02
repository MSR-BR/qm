# Files to create or modify

- concept/prerequisite and mechanism-card registries under `data/`
- adaptive engine and handlers under `lib/` and `api/`
- Study Journey, assessment, Daily Challenge, and simulator assets/pages
- source-manifest and report-error integrations
- unit, contract, browser, accessibility, and authenticated-flow tests

## Delivered locally

- `data/qm-learning-concept-graph.v1.json`, learning policy/mechanism/event maps,
  simulator evidence registry and Supabase access contract
- `lib/qm-adaptive-engine.mjs`, `lib/qm-adaptive-learning-handler.mjs`, assessment,
  profile and gamification handlers
- `api/qm-adaptive-learning.js`, `dev-server.mjs`
- `daily-challenge.html`, `assets/qm-daily-challenge.js`, assessment/simulator/Journey
  clients and styles, `index.html`
- `supabase/migrations/20260926120250_qm_adaptive_learning_modes.sql`
- adaptive, authenticated-flow, profile, privilege and local PostgreSQL tests;
  browser audit scenarios
- C30 design, risk, validation, rollout and model-routing records; project security
  and state records
