# Requirements

## Owner authorization — 2026-10-19

The owner reviewed the app ("a princípio ok") and asked for a Codex run that
improves the app and the start of the campaign, recorded as a Change. Activation
had already been authorized on 2026-10-19 in C18, subject to technical gates.
This Change keeps that authorization, but the executing agent must still ask the
owner for a final "ativar" confirmation in its own session immediately before
changing any Ads status, after presenting the read-only verification.

## App hardening (R1–R4)

- R1. Pin the Supabase JS ESM import in `assets/termo-auth.js` to an exact version
  (the version currently resolved by jsDelivr for the unpinned URL, unless it is
  incompatible). Bump the loader cache-buster where needed. Login, logout, reload
  persistence and the OAuth `redirectTo` behaviour must remain unchanged.
- R2. Prevent repeated `section_complete` analytics for the same section by the
  same browser after un-mark/re-mark. Suggested: send only when the previous record
  was not already completed earlier in this page session, plus a per-section
  `localStorage` marker cleared on analytics revocation. Database progress and
  gamification behaviour must not change. Add a unit/runtime test.
- R3. Make campaign attribution TTL sliding (refresh expiry on each consented page
  view while a known campaign is stored), still capped at 30 minutes of inactivity,
  still only the three known tuples, still cleared on revocation. Add a test.
- R4. Do not change consent defaults, Google consent signals, privacy copy meaning,
  event names/parameters, the relay contract, or anything under TERMO.

Optional, only if trivial and fully tested: move `validatorEmails` out of the public
config if a server-side check already authorizes validators; otherwise just
document it. Never weaken server-side authorization.

## Measurement (R5–R6)

- R5. Document the clean paid-measurement baseline in C18/C35: start at
  2026-10-18 22:13 BRT (deployment `dpl_8PKH1ta448yxdEJK7tVYFz5pgPg9`), exclude
  `codex_qa / qa`, and note the 21:33 and 12:28 completions as internal tests
  (21:33 directly matched, 12:28 inferred).
- R6. Record that Google Ads conversion counts are a lower bound (opt-in ads
  measurement, basic consent mode). Primary pilot metrics: GA4 sessions with
  `google / cpc / quantum_international_en_search_pilot`, their `section_complete`
  rate, and Ads clicks/cost/search terms. Ads conversions are secondary.

## Campaign start (R7–R9)

- R7. Read-only re-verification of Ads account 3838359068 before activation
  (see `tasks.md`). Any mismatch with the expected state stops the run.
- R8. Activation order: keywords → ad → ad group → campaign last; verify each by
  readback. Never touch TERMO campaign 24027143907, account-default goals, shared
  budgets, billing, or other campaigns/drafts.
- R9. After activation: verify landing/login and consent on production, record
  timestamps, and write a monitoring plan (24 h check, then daily for 7 days),
  stop rules (pause immediately for broken landing/login, consent regression,
  wrong URL/goal, misleading ad; manual review at EUR 14 spend without a qualified
  attributed completion) and the QUANTUM-only rollback (pause campaign).

## Governance

- Follow `CODEX_CONTEXT.md`, `.specs/po-magico-reference.md` and the C18 records.
- Commit/push/deploy only on an explicit `cpd` from the owner.
- Never print or version secrets; never read `.env*` values.
