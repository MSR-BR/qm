# C18 — authenticated launch checks, 2026-10-19

## Scope and authorization

The owner authorized the three technical checks, an authenticated QUANTUM test,
and activation of the existing QUANTUM campaign once the launch gates are met.
The owner did not authorize TERMO changes, an increased budget, personalized
advertising, remarketing, or fabricated paid clicks. All browser tests below used
the QUANTUM production site and the existing test account. No TERMO setting or
repository was changed.

## Fresh OAuth attribution and persisted completion

- Opened `https://quantummechanicsbook.app/` with the controlled QA labels
  `utm_source=codex_qa`, `utm_medium=qa`, and
  `utm_campaign=quantum_c18_validation` in a separate Chrome profile. The owner
  completed Google login without sharing credentials.
- After the OAuth return, the signed-in QUANTUM UI was visible and the GA4 page
  configuration still contained `codex_qa / qa / quantum_c18_validation`.
  Navigating through the chapter index to chapter 1, section 1.6 retained the
  same labels.
- Marked section 1.6, “Photoelectric effect,” completed **once**. The
  Supabase progress update returned HTTP 200, the first-party analytics relay
  returned HTTP 202, and one GA4 `section_complete` collection request carried
  `cs=codex_qa`, `cm=qa`, `cn=quantum_c18_validation`, `gcs=G111`, and `npa=1`.
  The page reported +20 study points. After reload and asynchronous account
  read, it still showed “Section completed.” No second completion was sent.
- GA4 property 554204628 reported one `section_complete` in Realtime after the
  test. The historical core report still had no 2026-10-19 row at the time of
  this check; Realtime cannot report session source/medium. Thus live transport
  and persistence are proven, but **current-day aggregate attribution awaits
  processing**. Do not represent this as a paid-click or Ads conversion.
- A minute-granularity GA4 core report places the two old
  `accounts.google.com / referral` completions at 2026-10-18 12:28 and 21:33
  BRT, before the recorded 22:17 controlled completion with
  `codex_qa / qa / quantum_c18_validation`. These historical rows do not
  demonstrate a failure of the later fix; they remain in history and are not
  silently reclassified. Recheck today's new completion in the processed
  report before claiming a clean full-day attribution baseline.

## QA segmentation

Every controlled C18 browser visit uses the distinctive source/medium/campaign
above. A repeatable GA4 Data API report over 2026-10-18–19, excluding
`sessionSourceMedium = codex_qa / qa` through `dimensionFilter.notExpression`,
returned 44 non-QA rows; among them the only processed `section_complete`
rows were the two historical Google referrals. The same unfiltered event-only
report returned one QA completion and two historical referrals. This is a
working **report segment**, not a global GA4 exclusion: the Internal Traffic
filter remains in Testing, and unrelated manual developer activity must not be
assumed absent. All future controlled QA journeys must retain this label, and
paid decisions must use the non-QA segment with source/campaign inspection.

## Final ad surface (read-only)

- Ads account 3838359068 (EUR); QUANTUM campaign 24369162368, ad group
  199601244925, and approved ad 828563447756 remained PAUSED. Its eight
  positive keywords also remained PAUSED. The ad's sole final URL is the
  canonical `https://quantummechanicsbook.app/`.
- Campaign suffix remains
  `utm_source=google&utm_medium=cpc&utm_campaign=quantum_international_en_search_pilot`;
  budget remains EUR 2 average/day, Maximize Clicks, EUR 0.25 CPC ceiling,
  Google Search only (partners/display off).
- No campaign-level assets and no enabled account-level assets were returned by
  Google Ads API. The two known account sitelinks remain paused. One
  automatically created YouTube-video asset exists elsewhere at account level,
  but no campaign association was found for this QUANTUM Search campaign.
  The campaign UI says Text customization and Final URL expansion are off;
  its AI Max optimization is not enabled. This is a scoped ad-surface check,
  not a claim that Google will never render an automated asset in the future.
- The Safari Ads panel displayed an ad-blocker warning during the final review.
  A separate Chrome profile authenticated to the QUANTUM test account was
  denied Ads access by that account's organization. No Ads mutation was made
  through either blocked surface. Activation requires the owner's authorized
  Ads account in a working browser session.

## Launch decision, monitoring and reversal

The owner has explicitly authorized activation, but authorization is distinct
from readiness. The current-day aggregate OAuth attribution row and an
operable Ads session remain unverified as recorded above. Until those gates are
resolved, **keep campaign, ad group, ad, and keywords paused**; do not claim
spend or a launch. After processing, the new `section_complete` row should be
exactly one with `codex_qa / qa / quantum_c18_validation`. The QA segment must
remain excluded from any paid result. Before turning on the campaign, verify
the same creative, budget, geo, English, negatives, goal isolation, and no
enabled cross-project assets. Enable only QUANTUM child entities while the
campaign stays paused, verify their states by API, then enable the campaign
last. Never modify the TERMO campaign or account-default goals.

After launch, inspect destination/login and consent immediately, Ads status and
spend within 24 hours, then daily for the first week. Pause the QUANTUM campaign
immediately for broken landing/login, consent regression, wrong URL/goal, or
misleading ad; review manually at EUR 14 spend without a qualified attributed
completion. EUR 14 is a review trigger, **not an automatic spending cap**.
The EUR 2 average daily budget can permit up to EUR 4 on a given day and up to
EUR 60.80 over a full unchanged-budget month. Do not optimize the budget from
the mixed historical period; observe a clean 14-day baseline first. Rollback
is a QUANTUM-only campaign pause, followed by inspection of the tagged GA4
segment and goal settings; TERMO remains untouched.
