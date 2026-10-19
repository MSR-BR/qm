# C18 — final launch review, 2026-10-19

## Decision

**Technical publication accepted; advertising activation withheld.** The owner
requested final review, specification records and clean commit/push/deploy, while
explicitly retaining the paused campaign and leaving TERMO untouched. This report
supersedes the readiness/status statements in the historical Oct 18 preparation
report, not its historical evidence. C18 remains open for the release gates below.

No Google Ads, GA4, Search Console or TERMO settings were changed in this review.
No new learner completion, paid API generation or ad click was generated. CPD
includes the already-authorized consent/attribution correction and its tests,
plus these records; it does not activate advertising or change models/secrets.
The digital-discovery-audit skill kept received QA events separate from actual
paid conversions and prevented an unconditional ready-to-launch conclusion.

## Verified evidence

### Delivery and conversion isolation — Google Ads read-only API

- Account 3838359068, EUR. Campaign 24369162368 is PAUSED with independent
  EUR 2 average daily budget, Maximize clicks and EUR 0.25 CPC ceiling.
- Google Search only; partners/display off; presence targeting; English 1000.
  Exactly the 17 countries in `paused-campaign-setup-2026-10-18.md` remain.
  Eight positive exact/phrase keywords are PAUSED; eleven campaign-only phrase
  negatives remain. No shared negative list or shared budget was changed.
- Ad 828563447756 is PAUSED and policy APPROVED. Current API snapshot contains
  **eight headlines and three descriptions**; do not infer four descriptions
  from an earlier draft. Destination is https://quantummechanicsbook.app/.
  Copy advertises English reading, reviewed chapters, exercises, simulators,
  progress and daily challenges, and explicitly mentions Google sign-in. It
  does not promise mastery, credentials, institutional endorsement or a fully
  reviewed thirteen-chapter book. The approval is not evidence of performance.
- Campaign UTM suffix remains
  `utm_source=google&utm_medium=cpc&utm_campaign=quantum_international_en_search_pilot`.
- Oct 18–19 API metrics: **0 impressions, 0 clicks, EUR 0 cost**.
- Campaign uses CAMPAIGN goals and only custom goal 6459537936; conversion
  7855071770 is the isolated QUANTUM GA4 section_complete action described in
  `conversion-setup-2026-10-19.md`. It is secondary globally, ONE_PER_CLICK,
  always value zero. No revenue or mastery inference is valid.
- TERMO campaign 24027143907 still uses CUSTOMER goals and no custom goal.
  Nothing was written to the TERMO repository or its panels.
- Manual asset review: no campaign_asset rows. Two customer-level sitelinks
  (211723829310, external WordPress; 212167698599, YouTube) both PAUSED.
  No enabled manual inherited assets found. This is not a complete attestation
  of every Google automated-asset surface; recheck those before activation.

### GA4 attribution — aggregate evidence, not an Ads conversion

Property 554204628, America/Sao_Paulo; Oct 18–19 report with dimensions date,
eventName, sessionSourceMedium, sessionCampaignName and metric eventCount,
filtered to section_complete. Compatibility and row estimate were checked.

| Date | Session source / medium | Session campaign | Events |
| --- | --- | --- | ---: |
| 2026-10-18 | codex_qa / qa | quantum_c18_validation | 1 |
| 2026-10-18 | accounts.google.com / referral | (referral) | 2 |

The controlled test now has both DebugView and aggregate source evidence. The
two OAuth-domain referrals are a **potential attribution contamination**, not
proof that the current fix fails: this day-level report cannot distinguish
before/after the correction, fresh login vs existing session, or user journeys.
Do not remove them, reclassify them as ad acquisitions or silently change GA4
referral configuration. A fresh OAuth round-trip with controlled campaign labels
is still required to establish the current behavior.

Exclude/segment `codex_qa / qa` + `quantum_c18_validation` from acquisition
results. The previously recorded Internal Traffic filter is in Testing, not a
proven exclusion of every developer session. Confirm a reliable segmentation
rule before using production totals for paid decisions. No real paid-click
attribution is claimed while delivery remains paused.

### Search Console — signed-in rendered UI

Domain property `sc-domain:quantummechanicsbook.app`:

- Settings: **You are a verified owner**; robots.txt all files valid.
- Sitemap `https://quantummechanicsbook.app/sitemap-index.xml`: Success,
  submitted Sep 8, last read Oct 16, **99 discovered pages**, zero videos.
- Page indexing, last updated **Oct 11**: 42 indexed, 79 not indexed. Reasons:
  75 discovered/currently not indexed, 3 redirects, 1 alternate proper canonical.
  These are all-known-URL counts, not an assertion about 99 submitted URLs.
  They are delayed evidence, not proof of a new deployment regression.
- Core Web Vitals: **no field data** for mobile or desktop. No passing field
  performance certification is claimed. Search overview displayed 8 web clicks.
- GSC connector returned no registered properties, so browser evidence was used;
  connector availability must not be confused with ownership failure.

No sitemap submission, indexing request, validation request or GSC setting change
was made. Follow up on discovered/not-indexed URLs for organic growth, not by
removing correct canonical/redirect behavior or treating Google indexing as
instant. Organic indexing completeness is not a paid-delivery failure by itself.

### Application checks repeated on this review

- All Node tests: **139/139 passed**.
- Isolated consent/attribution browser regression: passed at 320, 390 and 1440px;
  every external request stubbed, no real collection from this test.
- Content structure: 13 chapter files valid; SEO: 85 published sections valid.
- Static database privilege contract: 25 tables, 22 functions, 2 sequences,
  23 migrations passed. This is not a new remote database audit/migration.
- Public production audit: **99 sitemap URLs, 85 search sections, 66 local
  assets, 9 unauthenticated API boundaries**; no warnings/errors. Route timings
  min 27ms / p95 573ms / max 808ms are this runner's request observations,
  not LCP, a mobile benchmark or Core Web Vitals.
- Production browser audit: **20 public/signed-out scenarios passed**, including
  320/390/1440px header, menu/Extras, search, rendered math, simulator, assessment,
  challenge, help, Journey login boundary, catalog/filter and locked chapter.
  Keyboard focus visible; no warnings/errors. Minimum-width screenshot inspected.
  Evidence is local under the system temporary directory `qm-c17-browser/`.
- C15 was explicitly closed Oct 18 after export repair, with physical-device
  and editorial checks waived as blockers, not represented as executed. C16
  signed-in DebugView was confirmed Oct 18. C17's old combined checkbox is
  reconciled to those records; no fresh full authenticated journey is claimed.
- `git diff --check` passed. Git fetch showed HEAD and origin/main aligned at
  a380b2a before the CPD. Public hosting project was verified as qm,
  prj_A9ZEdGd9hXOqAsacRPtIcKUaU8tq, team msr-brs-projects; no TERMO target.

## Remaining release gates and follow-up

| Priority | Work | Acceptance evidence |
| --- | --- | --- |
| P1 before activation | Fresh OAuth attribution test and referral diagnosis | Approved test login round-trip preserves controlled source through persisted completion; aggregate report confirms it; investigate referral settings only if needed and scoped to QUANTUM |
| P1 before activation | Developer/QA segmentation | Repeatable exclusion/segment documented without classifying QA completions as campaign outcomes |
| P1 before activation | Final owner approval + ad-surface recheck | Owner accepts copy/17 markets/negatives/budget envelope/stop rules and separately authorizes activation; verify automated assets and all delivery entities first |
| P2 after measurement stabilizes | Clean baseline and performance | At least 14 clean days before budget optimization; segment developer traffic; field CWV currently unavailable, so no field pass claimed |
| P2 organic follow-up | Index coverage | Review representative discovered/not-indexed URLs against canonical/content value; compare updated GSC snapshots, without promising indexing |

Proposed pilot monitoring uses cost per **attributed section completion** (self-
reported study, not mastery), with sessions/clicks as diagnostics. Zero activity
while paused supplies no efficiency estimate. A real paid-attribution check can
only follow separately authorized activation; never click the owner's ads to
manufacture a conversion.

Stop rules for owner approval: immediately pause for broken landing/login,
consent regression, wrong destination/goal or misleading ad; manually review at
EUR 14 spend with no qualified attributed completion before continuing. This
is not an installed automatic EUR 14 cap. EUR 2 is the **average** daily budget,
not a guaranteed daily ceiling (standard envelope up to EUR 4/day and EUR 60.80
per full unchanged-budget month). No increase is authorized. At this small
budget, 17 countries need not receive balanced or statistically useful exposure.

## Publication and rollback

Publish only this tested QUANTUM snapshot, verify READY and canonical production
asset identity, then confirm local HEAD = origin/main and no pending changes.
The tool execution/owner handoff supplies the resulting commit and deployment
receipt; do not infer deployment from a Git push alone.

The consent correction was already live in dpl_8PKH1ta448yxdEJK7tVYFz5pgPg9;
this CPD brings its source/tests/specifications under version control. Keep Ads
paused during publication and rollback. Use the scoped rollback instructions in
the conversion reports for QUANTUM only. Rolling back before the consent fix is
not safe for launching ads; never restore shared TERMO/account-default goals as
a launch workaround. No secrets are included in these reports.
