# C35 — measurement baseline and evidence

Read-only GA4 query on 2026-10-19, approximately 19:11 BRT. Property
`554204628`, timezone `America/Sao_Paulo`. The connected account returned this
QUANTUM property; no property settings, filters or historical data were changed.

## Direct observation

GA4 Data API compatibility/size checked, then queried 2026-10-18 through 2026-10-19
by `dateHourMinute`, `eventName`, `sessionSourceMedium`, `sessionCampaignName`,
metric `eventCount`, exact event filter `section_complete`, ascending minute.
Three processed rows returned; full query and result are in
`read-only-snapshot-2026-10-19.json`.

| Local timestamp | Source / medium | Campaign | Count | Evidence classification |
| --- | --- | --- | --- | --- |
| 2026-10-18 12:28 | accounts.google.com / referral | (referral) | 1 | Probably internal C15 testing; inference |
| 2026-10-18 21:33 | accounts.google.com / referral | (referral) | 1 | Internal pre-fix QA; direct historical match to section 1.1 test at 21:33:29 in C18 |
| 2026-10-18 22:17 | codex_qa / qa | quantum_c18_validation | 1 | Explicit internal QA, excluded from paid decisions |

The 2026-10-19 ~11:40 QA completion is **not confirmed in the processed report**
at this read. C18 recorded its live transport and Realtime intake; absence here
does not prove transport failure or prove processing will complete at a specific
time. No new event was generated to fill the gap. These rows are not paid campaign
conversions or evidence of organic learner success.

## Baseline R5

Use only activity from **2026-10-18 22:13 BRT onward**, the recorded release of
`dpl_8PKH1ta448yxdEJK7tVYFz5pgPg9`, and exclude `codex_qa / qa` and the controlled
QA campaign. The timestamp/deployment boundary is from the C18 release record;
the rows above were reread directly today. Keep the older records as history with
these annotations, rather than rewriting their stored attribution. A non-QA
segment alone is insufficient: unlabeled owner/manual traffic can remain inside it.
The three returned rows yield no demonstrated paid study outcome.

## Metric hierarchy R6

1. Consented GA4 sessions matching `google / cpc / quantum_international_en_search_pilot`
   in the clean period; use the share of these sessions containing at least one
   `section_complete` as the study activation rate. Do not divide total completions
   by sessions and call it a percentage of activated sessions: one session can
   complete several sections. Record the post-C35 counting boundary after deployment.
2. Google Ads clicks, spend and search terms to judge traffic quality and budget use.
3. Imported Ads conversions as a secondary, lower-bound measure, not an exhaustive
   count of learners or a revenue proxy. The action has value zero and ONE_PER_CLICK.

Advertising measurement is separate, default-off opt-in in basic consent mode.
Click identifiers and advertising storage require that choice. Analytics itself
also requires opt-in, so the primary GA4 sample is not the entire visitor population.
Do not change consent defaults or add modeled claims to compensate for missing data.

The 24-hour C18 wait was a conservative observation decision, not a guaranteed
Google deadline. Fourteen clean days concern budget optimization, not a universal
minimum imposed by Google to launch a pilot. Any launch decision must explicitly
consider the unresolved processing evidence and the final C35 release/panel checks.
