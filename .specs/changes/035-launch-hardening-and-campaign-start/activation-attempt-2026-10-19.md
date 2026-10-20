# C35 — activation history (Firefox activation completed)

Latest checkpoint: campaign enabled on 2026-10-19 at approximately 21:52:37 BRT.
The failed attempts below are historical. See the successful follow-up at the end
and `launch-2026-10-19.md` for the current state and eligibility caveat.

2026-10-19, approximately 20:15 BRT. The owner confirmed AI Max, text customization
and final URL expansion are disabled, and explicitly authorized QUANTUM activation
without TERMO changes. This supersedes the previous instruction to keep the campaign
paused, but no activation was completed in this attempt.

## Evidence

- Owner-reported panel confirmation closes the automation-settings evidence gap;
  this is not an agent screenshot or an inference from a null API field.
- Fresh read-only API checks matched the expected EUR 2 independent daily budget,
  EUR 0.25 CPC ceiling, Google Search only, PRESENCE, English, 17 locations,
  eight paused exact/phrase keywords and eleven campaign phrase negatives.
- Ad 828563447756 remained PAUSED and APPROVED with only the canonical final URL.
  Group 199601244925 and campaign 24369162368 remained PAUSED.
- Campaign-only goal 6459537936 contains only enabled action 7855071770,
  GA4 section_complete, secondary, ONE_PER_CLICK, default value zero.
- No campaign assets or enabled account-level assets were returned. TERMO and
  account-default goals were read as preservation references only; no changes made.
- GA4 compatibility/size checked and report rerun: still the same three processed
  historical rows, including one labeled QA completion on Oct 18 at 22:17.
  The Oct 19 completion is not yet in this report. Earlier collection/Realtime
  evidence remains distinct from processed attribution; no guaranteed deadline.

## Operational attempt — no Ads mutations

The native Safari session was accessible via AppleScript after the Codex browser
controller had failed. Located the existing Ads tab, navigated to QUANTUM, and
opened its Keywords view using the rendered navigation. Google Ads displayed
“Turn off ad blockers” and “Something went wrong”. Its empty keyword table did not
match the API's eight paused criteria. One normal UI reload did not restore the
table. No guessed selectors, backend mutations, security bypass or blocker-setting
changes were attempted. No entity status was changed.

Readback at that checkpoint: campaign PAUSED, cost zero. The initial suggestion
to disable a site-specific content blocker was a hypothesis, not a confirmed cause;
the follow-up below supersedes that proposed owner action.
Activation authorization is already present; do not request it again unless the
scope, budget or risk decision changes. Fresh safe readback is still required.

Digital Discovery Audit was used to keep consent, attribution and launch evidence
separate. A successful app login or an approved ad does not prove processed
attribution. No new test event or paid click was generated. TERMO untouched.

## Follow-up after owner screenshots and autonomous retry

2026-10-19, after the owner's 20:46 BRT screenshot and request to try independently.

- The owner showed Safari Websites > Content Blockers reporting **No Active
  Content Blockers**. Do not keep asking to disable those blockers or infer that
  Safari's generic Google Ads warning establishes the cause.
- A fresh API query returned group `199601244925`, **Quantum Mechanics Study**,
  with both status and primary status `PAUSED`, under campaign `24369162368`.
  The UI's correctly applied Status: Paused filter returned no matches. The
  underlying group exists; recreating it would risk duplication.
- Native Safari AppleScript control succeeded. Cleared only the QUANTUM table
  filter and opened the known group directly. The header resolved **Quantum
  Mechanics Study**, but group controls/data still failed to render. No status
  controls were changed. Date-selector clicks did not expose a usable picker.
- Opened a regular Google Chrome tab to the scoped QUANTUM campaign as another
  diagnostic. Chrome's AppleScript JavaScript execution is disabled; that setting
  was left unchanged. The tab redirected to `access.workspace.google.com` with
  page title **Serviço não permitido**. Retrying with the intended personal
  account in the URL did not resolve it. This is an observed access blocker,
  not proof of the exact organizational policy or account responsible.
- The integrated Codex browser had separately failed to initialize because of
  a symlinked writable-root configuration. No Codex security configuration,
  browser security setting, Workspace policy, token or credential was changed.
- The available Google Ads connector supports read-only reporting, not entity
  status mutations. No hidden backend endpoint or credential extraction was used.
- Final API preservation check: QUANTUM **PAUSED**, independent budget
  `15962079046` EUR 2/day, TARGET_SPEND, CPC ceiling EUR 0.25. TERMO **ENABLED**,
  independent budget `15717335910` EUR 2/day, TARGET_SPEND, no CPC ceiling,
  unchanged from the reference. No Ads delivery entity was mutated in this retry.

Activation remains authorized but not performed. Resume requires an operable
Ads administrator session/control path; do not claim a successful launch or ask
the owner to recreate existing entities. No deploy, paid API call, new conversion
event, commit or push was performed in this retry.

## Successful Firefox follow-up — 2026-10-19, 21:52 BRT

The owner logged into Firefox and explicitly requested QUANTUM activation without
TERMO changes. Native Firefox accessibility exposed the rendered Ads controls.
The global view filter **Ad group status: Enabled** was hiding the paused group;
the table-level Status filter could not override it. Applied **Enabled, Paused**
to the view, returned to campaign 24369162368, and the existing entities appeared.
This establishes a visibility-filter cause for the empty tables; Safari's generic
blocker warning was not proof of a content blocker. No duplicate entities created.

Enabled group 199601244925, approved ad 828563447756, then the eight existing
positive keywords, with API readbacks after each step; campaign remained PAUSED
throughout those changes. Finally selected campaign **Enabled** at approximately
21:52:37 BRT. API and Firefox confirmed campaign ENABLED. All mutations were
normal rendered UI status controls, not private endpoints or credential access.

Readbacks: group and ad ELIGIBLE, ad APPROVED, seven keywords ELIGIBLE and one
low-search-volume keyword enabled but NOT_ELIGIBLE. The initial campaign aggregate
remained NOT_ELIGIBLE with reasons [9,16,18] (bidding learning, keywords paused,
ads paused), inconsistent with fresh child statuses. Likely propagation delay is
an inference, not proven serving. Do not claim impressions or successful paid
attribution from activation alone. Exact receipts: `activation-readback-2026-10-19.json`.

EUR 2 independent average daily budget, EUR 0.25 CPC ceiling, networks, countries,
English, negatives and campaign-only goal preserved. TERMO baseline and account
default goals reread unchanged. Canonical landing with approved UTMs returned
HTTP 200 without an ad click or gclid. No new study event, deploy, commit or push.
The Oct 19 processed QA reporting gap remains a measurement follow-up. No
automatic monitor was created. Only QUANTUM campaign pause is the scoped rollback.

Execution: current Codex session; no model switch or delegated agent. Digital
Discovery Audit kept collected events, processed attribution and actual serving
separate. No browser-security, account-policy or TERMO changes.
