# Tasks

Current checkpoint, 2026-10-20: serving confirmed (2 impressions, ENABLED/LEARNING);
processed Oct 19 QA completion now confirmed once with correct QA labels. No
remote edits needed in follow-up; see `campaign-audit-2026-10-20.md`.

Historical checkpoint, 2026-10-19: corrections published by authorized CPD; production
auth acceptance confirmed manually by the owner; campaign enabled with explicit authorization at approximately 21:52:37 BRT. Initial aggregate eligibility/actual serving still needs follow-up. See `validation-evidence.md`, `measurement-baseline-2026-10-19.md`
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
- [x] Verify Vercel READY and production bytes = committed candidate after CPD (`c7c5fb7`, receipt in validation evidence).
- [x] Owner confirmed Google login, reload with session persistence, and logout in Safari after publication: “Login, recarga e saída funcionaram”. Owner-reported acceptance, not an automated browser observation; no section completion requested.

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
- [x] No enabled campaign or account-level assets returned; text automation OPTED_OUT by API. Owner subsequently confirmed AI Max, text customization and final URL expansion off in the panel; see `activation-attempt-2026-10-19.md` (owner-reported evidence).
- [x] Spend to date EUR 0; zero clicks and impressions at this read.
- [x] TERMO campaign 24027143907 baseline recorded read-only (status, budget, goals) for later comparison; account default goals also captured.

At the earlier API-only checkpoint, the assets item was **partial**: no campaign assets, no enabled
account assets, both account sitelinks PAUSED and text automation OPTED_OUT. The
API did not explicitly establish QUANTUM final-URL-expansion opt-out or AI Max false;
The owner subsequently supplied the panel confirmation. A null field itself is not evidence of disabled state.
All checked remote items are time-bound and require a fresh read before launch.

## E. Activation (only after the owner types an explicit confirmation in this session)

- [x] Owner explicitly authorized activation after confirming the three automation controls off. Earlier browser attempts failed; Firefox later succeeded. See dated attempt record.
- [x] Enable group → ad → eight keywords, with API readback after each; campaign last at approximately 21:52:37 BRT. Order of children differed from plan, but campaign remained PAUSED until all were verified ENABLED.
- [x] Re-read TERMO baseline and account-default goals: unchanged.
- [x] Load canonical landing with campaign suffix (no gclid, no ad click): HTTP 200. No new login/consent acceptance test; prior dated production evidence remains the source.
- [x] Record activation timestamp, monitoring plan, stop rules and rollback in `launch-2026-10-19.md`; link C18 activation task here. No monitor scheduled.
- [x] Confirm campaign aggregate eligibility and actual serving: Oct 20 07:20 BRT, ENABLED/LEARNING with 2 impressions; prior NOT_ELIGIBLE cleared. Group/ad and seven keywords eligible; one low-volume keyword remains.

## E2. Oct 20 early follow-up (before full 24 h)

- [x] Compare manual changes/current settings with launch receipts; no material drift found in queried fields. No subsequent edit returned by scoped change history.
- [x] Confirm processed Oct 19 QA completion once with QA labels; no genuine paid attribution claimed.
- [x] Confirm isolated goal, caps, networks, targets, negatives, policy approval and canonical landing.
- [x] Run 32 analytics tests, SEO validation and public landing/legal/sitemap HTTP checks.
- [x] Record API evidence, unavailable UI controls, rationale for no unnecessary bid/creative/budget changes and TERMO preservation.

## F. After 24 h (separate session)

- [ ] Ads: status, impressions, clicks, cost, search terms, disapprovals.
- [ ] GA4: `google / cpc` sessions and `section_complete` in the clean segment.
- [ ] Apply stop rules; no budget change without a new owner decision.
