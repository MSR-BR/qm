# C35 — campaign audit and first serving evidence, 2026-10-20

## Outcome and authority

Owner authorized an autonomous audit, correction of manual changes and campaign
operation today, QUANTUM only. Scope retains EUR 2 average/day and EUR 0.25 CPC
ceiling; no TERMO, shared resources, billing, runtime deploy or budget increase.
Checked approximately 07:08–07:20 BRT, before a full 24 hours after launch.

**Serving is now proven:** campaign 24369162368 is ENABLED / LEARNING, reason [9],
with **2 impressions on Oct 20**, 0 clicks, EUR 0 cost and 0 conversions at the
final read. This closes yesterday's inconsistent NOT_ELIGIBLE aggregate finding.
It proves delivery, not effectiveness, qualified traffic or paid attribution.
No remote mutation was necessary or performed during this audit.

Exact sanitized API receipts: `campaign-audit-2026-10-20.json`.

## Configuration and manual-change audit

- Compared current campaign/group/ad/keyword/target/goal state with Oct 19 receipts.
  No material divergence found in the inspected configuration. Change history
  scoped to this campaign for Oct 19–20 returned only the prior UI activations;
  no later edit appeared in that response. This does not prove that no manual
  action occurred: UI view changes, unsubmitted changes and changes outside the
  queried resource scope are not excluded. No user edits were blindly reverted.
- Change history now supplies the server timestamp of campaign enablement:
  **2026-10-19 21:52:44.893215 BRT**, refining the earlier approximate click time.
- Independent budget 15962079046 EUR 2/day; Maximize Clicks / TARGET_SPEND;
  CPC ceiling EUR 0.25. Group's legacy EUR 0.01 manual CPC field is not evidence
  of an effective automated-bidding ceiling; did not change strategy or bids.
- Google Search only; partners and Display off; geographic PRESENCE; exactly the
  approved 17 countries and English. No schedule restriction or non-keyword
  ad-group audience restriction returned. No shared keyword lists/assets sets.
- Group 199601244925 ELIGIBLE; ad 828563447756 ENABLED, ELIGIBLE, APPROVED,
  no policy topics. Eight approved headlines/three descriptions and canonical
  destination unchanged. Ad-strength PENDING is not ad disapproval.
- Eight positive keywords ENABLED; seven ELIGIBLE, exact
  `quantum mechanics interactive book` low search volume. Eleven campaign phrase
  negatives preserved. No search-term rows available yet; do not equate that
  absence to zero impressions or fabricate profitable terms.
- Auto-tagging true; campaign UTM suffix intact; no tracking-template override or
  keyword final-URL override. Canonical landing with suffix returned HTTP 200.
- TEXT_ASSET_AUTOMATION OPTED_OUT. AI Max field again null, not proof of OFF;
  latest explicit AI Max/final-URL-expansion OFF evidence remains the owner's
  Oct 19 panel confirmation. Current UI reconfirmation was unavailable.
- No campaign assets or enabled account-level assets returned. Sitelinks/callouts
  remain an optional quality enhancement, not a blocker to today's delivery.
- TERMO status, independent EUR 2 budget, strategy, networks and suffix match
  baseline. Account-default goal flags unchanged. No TERMO writes.

## Measurement

Campaign-only custom goal 6459537936 is ENABLED and contains only action
7855071770 (`QUANTUM (web) section_complete`), ENABLED, GA4 custom,
ONE_PER_CLICK, globally secondary, zero value. Standard campaign goals remain
biddable=false, protecting this campaign from unrelated account goals. Did not
change global primary flags or import a duplicate conversion.

After compatibility/size checks, GA4 processed report for Oct 18–20 now returns
the **Oct 19 QA completion exactly once** under `codex_qa / qa` and
`quantum_c18_validation`. The Oct 18 labeled QA row also remains once; the two
old referral events are historical pre-fix/internal evidence, not paid results.
Yesterday's missing processed Oct 19 row is therefore resolved. No new event
was generated. No genuine paid completion is yet observed; zero clicks means
this is not evidence of a broken conversion funnel. Keep QA excluded from KPIs.

## Findings and decisions

| Priority | Evidence / impact | Decision / closure proof | Confidence |
| --- | --- | --- | --- |
| P1 resolved | Yesterday's campaign NOT_ELIGIBLE contradicted enabled children | Now LEARNING with two real impressions; no status repair needed | High |
| P1 resolved | Oct 19 controlled completion absent from processed GA4 yesterday | Now one processed QA-labeled row, not a paid conversion | High |
| P2 | Only two impressions and no clicks; no search-term sample | No performance-based budget/geography/creative optimization yet; observe a clean baseline | High |
| P2 unverified | Current AI Max/URL expansion panel state cannot be reread | Retain owner-confirmed OFF evidence with date; do not infer OFF from API null | High on limitation |
| P3 | One low-volume keyword; seven eligible | Leave unchanged; not a campaign-wide block | High |
| P3 | No sitelinks/callouts | Optional campaign-only enhancement after UI access; not required to serve | High |

The current structure is suitable for the approved controlled pilot. It is not
proven optimal. Keep Maximize Clicks and existing caps/targeting while collecting
qualified traffic. No evidence supports removing user-approved countries,
raising CPC/budget, broadening keywords, switching to conversion bidding, or
replacing the approved ad today. Do not promise clicks or conversions by a date.

## Verification and access limits

- `npm run test:analytics`: **32/32 pass**, including consent, no PII,
  deduplication, revocation and attribution persistence.
- `npm run validate:seo`: passes, **85 published sections**.
- Canonical landing + UTMs, privacy, terms and sitemap: **HTTP 200**.
- No fresh authenticated journey, mobile rendering or paid-click test performed.
  Prior dated acceptance remains the source; no ad clicked by the agent.
- Codex browser initialization failed twice; the second diagnostic identifies
  an unsupported symlink in an unrelated writable root. No security configuration
  or browser policy was altered. Existing Firefox had no open window. API
  access worked, so no login was needed for the completed checks.
- No new Search Console ownership evidence was collected in this campaign audit;
  do not label this a fresh complete SEO/indexation certification.
- Current Codex session only; no model change/subagent. Digital Discovery Audit
  separated serving, measurement verification and performance claims.

## Follow-up and rollback

Within the first full 24-hour window, inspect status, impressions/clicks/cost,
policy issues and available search terms; inspect clean GA4 paid sessions and
study outcomes after normal reporting latency. Then evaluate daily for seven
days; use at least fourteen clean days before budget optimization. These are
planned checks, **not a scheduled automation**.

Keep qualified study completion as the value KPI; clicks/CTR/CPC are diagnostics,
not proof of learning value. Review manually at EUR 14 spent without a qualified
attributed completion; this is not a hard spend cap. Pause only campaign
24369162368 if landing/auth/consent breaks, destination/goal drifts, or creative
misleads. No rollback needed now because no remote configuration changed.

## Official references

- [Maximize Clicks](https://support.google.com/google-ads/answer/6268626/about-maximise-clicks-bidding): automated bids within budget and optional CPC ceiling.
- [Low search volume](https://support.google.com/google-ads/answer/2616014?hl=en-gb): an individual low-volume keyword does not harm the rest of the account.

Only documentation/evidence changed locally; no CPD requested in this turn,
so no commit, push or deployment. Prior uncommitted documentation preserved.
