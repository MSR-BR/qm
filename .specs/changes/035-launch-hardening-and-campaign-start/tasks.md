# Tasks

Current checkpoint, 2026-10-19: local corrections and tests complete; no CPD or
activation performed. See `validation-evidence.md`, `measurement-baseline-2026-10-19.md`
and `launch-2026-10-19.md`. `[x]` below is evidence of the named task, not closure
of the whole Change. The user explicitly requires notification before publication
or Ads activation; no login was needed for these local/read-only checks.

## A. Preflight (read-only)

- [x] Confirm `pwd -P` is `Documents/Developer/qm`, `main`, HEAD = local `origin/main` at `e04b107`; no tracked changes at entry. The user-supplied untracked C35 folder was preserved.
- [x] Read `audit-2026-10-19.md`, this Change, and C18 `activation-gates-2026-10-19.md` / `conversion-setup-2026-10-19.md`.
- [x] Run baseline tests (`npm run test:analytics`, `node --test tests/*.test.mjs`, `npm run check`, `npm run validate:seo`): 22/139 pass, content/privileges/SEO pass.

## B. App hardening

- [x] R1 pin Supabase JS exact version 2.118.0; exact CDN bytes match. Shared-loader/page/generator cache revision 1019.1.
- [x] R2 single `section_complete` per section per browser profile with usable storage; concurrent tabs serialized by Web Locks; revocation/blocked-storage limits tested and documented.
- [x] R3 sliding attribution TTL on consented page views; exact expiry, unknown/malformed state and revocation tests.
- [x] Re-run all validations plus `scripts/test-qm-analytics-browser.mjs`; see validation receipt.
- [x] Owner explicitly authorized CPD on 2026-10-19, with the campaign kept paused and TERMO unchanged.
- [ ] Verify Vercel READY and production bytes = committed candidate after CPD.
- [ ] Owner performs one Google login for the production login/reload/logout check (no section completion needed).

## C. Measurement records

- [x] R5 clean baseline boundary and internal-test annotation of the 12:28 / 21:33 events.
- [x] R6 metric hierarchy (consented GA4 sample primary, Ads conversions as lower bound).
- [x] Read GA4 2026-10-18..19 with the specified dimensions/event filter: three historical rows; Oct 19 ~11:40 row **not confirmed** in processed report at about 19:11 BRT. No event generated.
- [x] Update `CODEX_CONTEXT.md` and `.specs/project-state.md`.

## D. Ads read-only verification (stop on any mismatch)

Account 3838359068 (EUR). Expected:

- [x] Campaign 24369162368 PAUSED; budget 15962079046 independent, EUR 2.00 average/day; Maximize Clicks, CPC ceiling EUR 0.25.
- [x] Google Search only (Search Partners and Display off); English 1000; positive geo type PRESENCE; exactly 17 countries (2356, 2076, 2840, 2586, 2360, 2566, 2484, 2032, 2124, 2036, 2554, 2710, 2608, 2050, 2404, 2826, 2372).
- [x] Ad group 199601244925 PAUSED; ad 828563447756 PAUSED, policy APPROVED; final URL `https://quantummechanicsbook.app/` only; exact headlines/descriptions recorded in launch receipt and JSON.
- [x] Eight positive keywords PAUSED; eleven campaign phrase negatives; no shared list.
- [x] Final URL suffix `utm_source=google&utm_medium=cpc&utm_campaign=quantum_international_en_search_pilot`; tracking template empty; auto-tagging on.
- [x] Goal config CAMPAIGN with only custom goal 6459537936 = action 7855071770 (ENABLED, ONE_PER_CLICK, secondary, value 0).
- [ ] No enabled campaign or account-level assets that could serve on this campaign; automatically created assets / text customization / final URL expansion off.
- [x] Spend to date EUR 0; zero clicks and impressions at this read.
- [x] TERMO campaign 24027143907 baseline recorded read-only (status, budget, goals) for later comparison; account default goals also captured.

The unresolved assets item above is **partial**: no campaign assets, no enabled
account assets, both account sitelinks PAUSED and text automation OPTED_OUT. The
API did not explicitly establish QUANTUM final-URL-expansion opt-out or AI Max false;
confirm the panel before activation. A null field is not evidence of disabled state.
All checked remote items are time-bound and require a fresh read before launch.

## E. Activation (only after the owner types an explicit confirmation in this session)

- [ ] Present the section D snapshot and ask: "Confirma ativar a campanha QUANTUM agora?".
- [ ] Enable the eight keywords → ad → ad group → campaign last; readback after each step.
- [ ] Re-read TERMO baseline and account-default goals: unchanged.
- [ ] Load the production landing with the campaign suffix (no gclid, no ad click): 200, consent panel, login button present.
- [ ] Record activation timestamp (BRT), monitoring plan, stop rules and rollback in `launch-2026-MM-DD.md`; mark C18's final task done with a link here.

## F. After 24 h (separate session)

- [ ] Ads: status, impressions, clicks, cost, search terms, disapprovals.
- [ ] GA4: `google / cpc` sessions and `section_complete` in the clean segment.
- [ ] Apply stop rules; no budget change without a new owner decision.
