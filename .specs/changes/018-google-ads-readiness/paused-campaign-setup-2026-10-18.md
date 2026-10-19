# C18 — paused international campaign preparation

Historical snapshot. Current conversion, approval, attribution and launch gates
are superseded by `conversion-setup-2026-10-19.md` and
`launch-review-2026-10-19.md`. Campaign remains paused.

Date: 2026-10-18, America/Sao_Paulo. Starting checkout: clean `a380b2a` in
`Documents/Developer/qm`. Runtime remains `v20261018.2244`.

## Outcome and limits

**Campaign prepared and paused; conversion foundation configured, but Ads
conversion activation and campaign release are NOT accepted.** Owner authorized
international preparation at EUR 2/day and explicitly required notice before
activation. No TERMO resource, shared goal, billing setting or shared budget was
edited. No application code, environment, key, deployment or model changed.

The digital-discovery-audit skill requires controlled outcome, attribution and
consent evidence before importing a key event for advertising. It prevented
treating a GA4 link or a received event alone as a ready-to-launch conversion.

## Remote resources verified

| Resource | Verified state |
| --- | --- |
| Ads account | MSR-BR, `3838359068`, EUR, America/Sao_Paulo |
| Campaign | `24369162368`, `QUANTUM - Search - International - EN - Pilot`, **PAUSED** (renamed after owner follow-up) |
| Independent daily budget | `15962079046`, EUR 2.00, not shared |
| Bidding | Maximize clicks (`TARGET_SPEND`), CPC ceiling EUR 0.25 |
| Networks | Google Search only; Search Partners and Display off |
| Locations | 17 countries listed below; positive geo type `PRESENCE` preserved |
| Language | English `1000` |
| Ad group | `199601244925`, `Quantum Mechanics Study`, **PAUSED** |
| Responsive search ad | `828563447756`, **PAUSED**, policy `REVIEW_IN_PROGRESS` / approval `UNKNOWN` at final inspection |
| Positive keywords | Eight, all **PAUSED**, exact/phrase only |
| Negative keywords | Eleven phrase negatives on this campaign only; no shared list |
| Landing URL | `https://quantummechanicsbook.app/` |
| Expansion | UI: broad match, automatically created assets, text customization and final URL expansion off |

The initial UK/Ireland-only proposal was superseded by the owner's country
expansion request below. This is still an explicit country list, not worldwide
coverage. EUR 2 is an **average daily budget**, not a hard per-day ceiling:
Google's standard envelope can reach EUR 4 on an individual day and EUR 60.80
for a full month at an unchanged budget. No billing or account spend limit was
altered. No spend was authorized or campaign activated.

### Owner-directed country expansion — 2026-10-18

Owner requested India, Brazil, USA, Pakistan, Indonesia, Nigeria, Mexico,
Argentina and other countries with English-speaking audiences. Added those
eight and seven complementary markets; retained the original UK/Ireland.
The additional seven are agent-selected under that open-ended country scope,
not a claim that a proficiency ranking or acquisition economics was validated.

| Country | Google geo target ID | Basis |
| --- | --- | --- |
| India | 2356 | Explicit owner request |
| Brazil | 2076 | Explicit owner request |
| United States | 2840 | Explicit owner request |
| Pakistan | 2586 | Explicit owner request |
| Indonesia | 2360 | Explicit owner request |
| Nigeria | 2566 | Explicit owner request |
| Mexico | 2484 | Explicit owner request |
| Argentina | 2032 | Explicit owner request |
| Canada | 2124 | Complementary English-language market |
| Australia | 2036 | Complementary English-language market |
| New Zealand | 2554 | Complementary English-language market |
| South Africa | 2710 | Complementary English-language market |
| Philippines | 2608 | Complementary English-language market |
| Bangladesh | 2050 | Complementary English-language market |
| Kenya | 2404 | Complementary English-language market |
| United Kingdom | 2826 | Retained |
| Ireland | 2372 | Retained |

The Ads UI matched 15/15 new country names, then showed 17 selected countries.
Saved to campaign `24369162368`; GAQL independently returned the exact 17
positive location criteria above. Renamed the same campaign from
`QUANTUM - Search - UK IE - EN - Pilot` to
`QUANTUM - Search - International - EN - Pilot`; no duplicate campaign created.

Final GAQL confirmed PAUSED, EUR 2 total average daily budget (not per country),
EUR 0.25 CPC cap, PRESENCE, Search Partners off, Display off, and existing English
criterion `1000`. No conversion, ad, keyword, consent or account-default changes
in this follow-up. TERMO's inspected name/status/budget/network settings match
the prior baseline. Existing conversion/readiness blockers below remain open.

With Maximize clicks and a small shared budget, delivery may concentrate in
lower-cost markets; equal country exposure or statistically useful country
comparisons are not promised. Review country-level qualified outcomes before
later reallocating spend; no budget increase or automatic optimization authorized.

Language caveat: the UI/API still exposes English here, and all copy/landing
content remains English. Google documents a Search-language transition starting
September 2026 toward matching the ad language and user comprehension. Do not
describe the stored language criterion as an absolute English-fluency filter.
Source: [Google Ads language targeting](https://support.google.com/google-ads/answer/1722078?hl=en).

Proposed naming/UTM standard for any later adoption is now
`quantum_international_en_search_pilot`, superseding the UK/IE wording in the
original operating-plan record. No URL suffix or tracking template was changed.

Rollback of this follow-up only: remove the 15 newly added country criteria,
retain UK/Ireland, and restore the previous campaign name. Never touch TERMO.
Verification was remote config readback and `git diff --check`; application code
did not change and the earlier 131-test run was not presented as rerun here.

### Ad copy saved

Headlines (all at most 30 characters):

1. Learn Quantum Mechanics
2. Interactive Physics Book
3. Explore Quantum Simulators
4. Study Quantum Step by Step
5. Practice Quantum Exercises
6. Build Your Study Journey
7. Quantum Mechanics in English
8. Read Explore and Practice

Descriptions (all at most 90 characters):

- Explore quantum mechanics with interactive chapters and physics simulators.
- Read in English and practise concepts with exercises and chapter assessments.
- Build a study routine with progress tracking and daily challenges. Google sign-in.
- Start with the reviewed chapters and explore the interactive learning tools.

Display paths: `quantum` / `study` (not a different landing endpoint).
No institutional endorsement, guaranteed learning outcome, certificate or
unavailable product claim is made. No visual creative or audience list created.

Exact keywords: `learn quantum mechanics`, `quantum mechanics interactive book`,
`quantum mechanics exercises`, `quantum physics simulator`.

Phrase keywords: `learn quantum mechanics`, `interactive quantum mechanics`,
`quantum mechanics exercises`, `quantum mechanics simulations`.

Phrase negatives: `quantum computing`, `quantum computer`, `quantum ai`,
`trading`, `crypto`, `healing`, `manifestation`, `jobs`, `salary`, `torrent`,
`pirated`. No blanket exclusion of free/book/PDF educational intent.

## Measurement configuration and real test

- QUANTUM GA4: account `346683903`, property `554204628`, stream `15777520006`,
  Measurement ID `G-X5Y1C68QMN`.
- Link created: `properties/554204628/googleAdsLinks/16155308729`, Ads customer
  `3838359068`, created `2026-10-19T00:09:43.074Z` (Oct 18 locally).
- Personalized advertising **disabled**. Analytics-feature access within Ads
  **disabled**. Account auto-tagging was already enabled and was not changed.
- Existing `section_complete` appeared in Recent events for QUANTUM production;
  marked it as a key event. It represents a **self-declared, persisted section
  completion**, not assessed mastery, a sale or revenue. Page views and login
  remain diagnostics. Existing automatic purchase definition was not used.
- Owner confirmed login in Safari. Opened chapter 01/item 1.1, initially not
  studied, and used the real **Mark as completed** button once. UI confirmed
  completion and +20 points; a subsequent reload retained the completed state.
  Test record/points intentionally remain in that test account. No exercise was
  generated and no paid AI call made. The optional bookmark UI was also opened
  during inspection, which saved that section's bookmark.
- GA4 DebugView at **21:33:29** displayed **one `section_complete`** (top-events
  count 1, key-event count 1), alongside `chapter_start` and `section_open`.
  `debug_mode` present and `non_personalized_ads=1`. Existing analytics choice
  was preserved; advertising consent was not granted or changed.
- Test entry used `utm_source=codex_qa`, `utm_medium=qa`,
  `utm_campaign=quantum_c18_validation`, `analytics_debug=1`, not fake Google
  paid-click identifiers. Debug traffic is test evidence, not acquisition lift.
- Expanded `page_location` contained the canonical section URL **without UTMs**;
  `page_referrer` contained the prior QUANTUM chapters URL with the QA UTMs.
  This does **not** prove the session source/medium retained the intended
  acquisition. No source/medium report or paid-click attribution was confirmed.
  Do not conclude either successful attribution or definite attribution loss
  from the sanitized URL alone.

### Ads conversion state: not activated

After linking/marking the key event, the API lists
`7855071770` — `QUANTUM (web) section_complete`, GA4 property `554204628`, event
`section_complete`, type `GOOGLE_ANALYTICS_4_CUSTOM`, category `DEFAULT`,
**HIDDEN**, `primary_for_goal=false`, `MANY_PER_CLICK`. No manual Ads import or
enable action was performed; this linked hidden definition is not a completed
conversion configuration. A QUANTUM purchase definition is also HIDDEN and is
not part of this plan.

Target after validation: one conversion per ad click, no fabricated monetary
value, secondary at account level, used only through a QUANTUM-specific custom
goal. Do not add it to the shared primary Engagements goal: TERMO uses the
account defaults. The UI rejected saving campaign-specific goals without a
selected goal; the edit was cancelled. QUANTUM therefore still inherits
account-default Engagements and **must not be activated in that state**.

## Open launch blockers

1. **Attribution:** verify source/medium/campaign in an actual controlled journey
   through landing, sign-in and persisted completion. Inspect/retest sanitization
   if needed, preserving PII exclusion; do not simply forward arbitrary URL data.
2. **Advertising consent/privacy:** code keeps `ad_storage`, `ad_user_data` and
   `ad_personalization` denied; analytics opt-in is separate. Current privacy
   copy covers optional learning analytics, not the proposed advertising
   conversion export. Define and validate the intended measurement/consent
   treatment and matching public copy before enabling export. No remarketing
   or personalization is authorized by this preparation request.
3. **Conversion isolation:** after 1–2, finish the hidden QUANTUM conversion and
   campaign-specific goal, verifying no shared primary-goal change and no TERMO
   action included. Do not confuse the linked hidden action with an imported,
   enabled, validated Ads conversion.
4. **Launch QA:** confirm policy approval, any account-level inherited assets,
   Search Console ownership/sitemap, mobile landing and internal/developer
   traffic segmentation. Existing Internal Traffic filter remains Testing;
   debug segmentation is evidence only, not proof of active traffic exclusion.
5. **Owner approval:** approve final geography, copy, negatives, budget envelope
   and stop rules, then explicitly authorize activation. Campaign, group, ad
   and all positive keywords currently provide separate pause locks.

If attribution/event semantics are repaired, annotate the boundary and observe
at least 14 clean days before using the resulting data for budget optimization.
No claim is made that paid-media readiness is complete merely because C16's
earlier limited collection gate was closed.

## Proposed operating plan (not scheduled or activated)

- Naming: `quantum_uk_ie_en_search_pilot`; use account auto-tagging already on.
  Manual fallback, if adopted after attribution verification:
  `utm_source=google&utm_medium=cpc&utm_campaign=quantum_uk_ie_en_search_pilot`.
  No tracking template/suffix was installed in this run.
- Initially review search terms, geographies, destination errors, consent and
  qualified completion quality daily, then weekly if stable. No automation was
  created, no guarantee of continuous monitoring is made.
- Pause on broken landing/sign-in, consent regression, misleading ad or wrong
  conversion goal. Propose an owner review at EUR 14 actual spend with no
  qualified completion rather than automatic budget increases. This is a
  proposed manual stop rule, not an enforced account spending cap or a CPA claim.

## Verification and TERMO preservation

- Official CSV previews succeeded before applying: campaign 1/1, group 1/1,
  ad 1/1, positive keywords 8/8. The group upload's generic Status column did
  not pause the group; API readback detected this and it was paused through its
  scoped UI. Campaign and ad/keywords were already paused; no serving occurred.
- GAQL independently confirmed campaign/ad/group/keyword statuses, network flags,
  locations/language, independent budget, CPC cap, presence-only and eleven
  campaign negatives. Monetary values from this connector are normalized euros,
  not raw micros, despite the GAQL field names.
- Final TODAY query returned PAUSED, EUR 0 cost, zero clicks and zero impressions
  for the new campaign. Reporting latency does not change the explicit pause
  state or constitute permission to activate.
- Read-only baseline/final inspection: TERMO campaign `24027143907` remains
  ENABLED, EUR 2/day, own budget, existing `TARGET_SPEND`, presence targeting,
  Search Partners on/Display off. Its goal config remains CUSTOMER. No TERMO
  campaign, conversion, callback, source file, analytics property or budget was
  written. Change-event records available at inspection showed only the new
  QUANTUM campaign/resources; the log has propagation latency and is not claimed
  as immediate exhaustive proof of every last operation.
- Early in the wizard an existing generic `Campaign #1` draft was resumed rather
  than a fresh campaign. Its observed original settings were restored (all
  countries/languages, both networks on, presence-or-interest, Maximize
  conversions, no click cap) and it was left unpublished. No TERMO campaign was
  resumed. To avoid accidentally publishing a wizard draft, subsequent creation
  used explicit PAUSED bulk rows. This is recorded rather than claiming the
  entire account was untouched.
- Local checks: 14/14 analytics tests; 131/131 full Node tests; SEO validation
  passed for 85 published sections. These do not replace remote attribution or
  consent verification.
- Browser evidence used rendered Safari DOM/SVG and native file selection;
  account APIs were read-only. No tokens, cookies, passwords or key values were
  inspected. Temporary bulk-upload CSVs contain ad configuration only, no secrets.
- No new source release, commit, push or deployment in this preparation task.

## Reversal / safe continuation

Keep campaign `24369162368` paused. Reversal can remove only its new ad/group,
keywords/negatives/campaign and independent budget after inspection, or simply
leave them paused. Do not change or delete any TERMO or generic pre-existing
draft resource. If abandoning measurement preparation, unmark only QUANTUM
`section_complete` and remove only link `16155308729`, after checking dependencies.
No reversal has been executed. Do not reset shared defaults or clear test data
without a separate scoped request.

References: [bulk uploads](https://support.google.com/google-ads/answer/10702525?hl=en),
[budget limits](https://support.google.com/google-ads/answer/6385083?hl=en),
[campaign goals](https://support.google.com/google-ads/answer/9143218?hl=en),
[GA4 conversions](https://support.google.com/google-ads/answer/10632359?hl=en).
