# QUANTUM conversion setup — 2026-10-19

## Outcome and scope

The owner authorized continuation of the paused QUANTUM conversion preparation.
The Oct 18 real persisted section completion/GA4 DebugView/consent evidence met
the digital-discovery-audit skill's import gate. No new completion or paid click
was generated today. This work changes only QUANTUM advertising resources and
local specification records, not application code, TERMO, billing or budgets.

Conversion configuration is complete; campaign activation is NOT authorized.
C18 remains open for the remaining launch checks and explicit owner approval.

## Production account changes verified through the Ads API

Account: MSR-BR, customer 3838359068, EUR. Verification at approximately
11:03 America/Sao_Paulo on 2026-10-19.

| Resource | Previous state | Verified final state |
| --- | --- | --- |
| GA4 conversion 7855071770, QUANTUM (web) section_complete | HIDDEN, MANY_PER_CLICK, default value 1 | ENABLED, GOOGLE_ANALYTICS_4_CUSTOM, ONE_PER_CLICK, primary_for_goal=false, default value 0, always_use_default_value=true |
| Custom goal 6459537936, QUANTUM \| Section completed | Did not exist | ENABLED; contains only customers/3838359068/conversionActions/7855071770 |
| Campaign 24369162368 goal config | CUSTOMER; no custom goal | CAMPAIGN; customers/3838359068/customConversionGoals/6459537936 |
| QUANTUM standard campaign goals | Inherited account defaults | PAGE_VIEW/WEBSITE, ENGAGEMENT/WEBSITE, ENGAGEMENT/YOUTUBE_HOSTED and YOUTUBE_FOLLOW_ON_VIEWS/YOUTUBE_HOSTED all biddable=false |

The action stays secondary globally. Its explicit custom-goal membership is
intended for this campaign only; the campaign still uses Maximize clicks, not
conversion-based bidding. No new conversion was duplicated, no purchase event
was imported, and no separate Google Ads event snippet was installed.

The wizard initially preselected Mapa da Pesquisa (550650234). An execution
safety check stopped continuation while that wrong source remained displayed.
Reopened only the source chooser, removed the wizard preselection, selected
QUANTUM (554204628), verified the displayed source, and only then saved. No
Mapa property/link/goal configuration was changed. Category: Engagement; the
secondary role was set before import so account-default optimization was not
expanded to this action.

## Preservation checks

- QUANTUM campaign 24369162368: PAUSED, independent EUR 2/day budget,
  TARGET_SPEND/Maximize clicks, CPC ceiling EUR 0.25.
- Campaign-only suffix unchanged:
  `utm_source=google&utm_medium=cpc&utm_campaign=quantum_international_en_search_pilot`.
- Ad group 199601244925 PAUSED; ad 828563447756 PAUSED, policy APPROVED.
- TERMO campaign 24027143907 remains ENABLED, EUR 2/day, TARGET_SPEND, empty
  suffix, CUSTOMER goals, no custom goal. TERMO action 7705181678 remains
  ENABLED, primary, ONE_PER_CLICK, value 0. No TERMO files were edited.
- Existing Mapa custom goal 6459352879 still contains only action 7825220596;
  it was not edited or assigned to QUANTUM.
- No account-default goal edits. Read-only final account snapshot:
  PAGE_VIEW/WEBSITE=false; ENGAGEMENT/WEBSITE=true;
  ENGAGEMENT/YOUTUBE_HOSTED=true; YOUTUBE_FOLLOW_ON_VIEWS/YOUTUBE_HOSTED=false.
- No activation, new spend, budget increase, credential/environment change,
  deployment, commit or push in this continuation.

## Evidence and remaining limits

The browser wizard and campaign editor were used for scoped writes; read-only
GAQL verified conversion identity/type/settings, custom-goal membership,
campaign goal configuration, standard goal flags, ad approval and preserved
campaign/budget/bidding state. A reload resolved another transient editor error
before the campaign-specific goal was saved.

The Oct 18 test proves a controlled authenticated production completion and
GA4 intake, not attribution from a real paid ad click. Historical debug events
must not be presented as Google Ads conversions attributed to a campaign.
Aggregate/session attribution, developer-traffic segmentation, the remaining
Search Console/landing/C15–C17 launch evidence and account-level asset review
must be checked before launch. Ad policy approval is confirmed, not assumed.
Maintain the skill's 14-day clean-baseline requirement before budget optimization.
No need to generate another completion merely to repeat the passed import gate.

Priority: configuration blockers are closed with high-confidence remote
evidence; launch readiness remains conditional on the outstanding checklist.
Campaign and its delivery entities must stay paused until separate approval.

## Scoped rollback

1. Keep QUANTUM campaign/ad group/ad paused throughout.
2. For exact campaign-goal rollback, restore only campaign 24369162368 to its
   previous CUSTOMER goal config with no custom goal. This restores the old
   cross-app default dependency, so it is not a launch-safe fallback.
3. Remove/deactivate only the QUANTUM custom goal after detaching it if abandoning
   this setup. Never alter the Mapa goal or account defaults.
4. If abandoning conversion measurement, remove the QUANTUM import via its
   conversion UI and verify the resulting status; do not promise restoration
   to internal HIDDEN status, which may not be user-settable. The previous
   MANY_PER_CLICK/value=1 settings were unconfigured defaults, not desirable
   settings to reintroduce.
5. Do not delete the GA4 property/key event, change TERMO, remove site consent
   controls, or activate delivery as part of rollback.

Local validation: documentation-only follow-up; `git diff --check`. App tests
and published frontend verification remain recorded in the Oct 18 report; no
new application test run or redeployment is claimed here.
