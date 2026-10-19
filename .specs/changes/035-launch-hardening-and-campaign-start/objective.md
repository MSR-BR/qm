# C35 — Launch hardening and QUANTUM campaign start

## Objective

Close the small technical and measurement gaps found by the independent
read-only audit of 2026-10-19 (`audit-2026-10-19.md`), then start the already
prepared QUANTUM Google Ads pilot (C18) safely and with a clean measurement
baseline.

## Scope

1. App hardening that protects the paid landing/login journey.
2. Measurement-quality fixes (re-completion counting, QA/internal segmentation).
3. Documentation drift (CODEX_CONTEXT, project-state, C18 records).
4. A read-only Google Ads re-verification, followed by activation of QUANTUM
   delivery entities **only** after the owner confirms in the executing session.

## Out of scope

- TERMO code, panels, campaign 24027143907, its conversion actions, account-default
  goals, shared budgets, billing or account settings.
- Budget increases, bidding-strategy changes, personalized advertising,
  remarketing or audiences.
- Fabricated clicks, fake gclids, injected GA4 events, or clicking the owner's ads.
- Any change to the consent model's defaults (advertising measurement stays opt-in,
  `ad_personalization` stays denied).

C18 remains the record of the campaign configuration; C35 records the launch.
