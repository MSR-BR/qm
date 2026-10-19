# C18 — conversion readiness follow-up, 18 October 2026

## Authorization and scope

Owner requested completion of QUANTUM conversion preparation, specification
updates, campaign remaining paused, and no TERMO changes. Owner separately
authorized publishing only the consent/attribution correction after tests.
No activation, shared-goal change, shared budget change, purchase, or TERMO edit.

Working checkout: `Documents/Developer/qm`, base `a380b2a`. The legacy
`Documents/GitHub/qm` checkout was inspected read-only and not edited.
Files named `termo-auth.js` and `termo-seo.js` below belong to QUANTUM itself.

## Implemented and published

- `assets/qm-analytics.js` v1018.3: separate advertising-measurement choice,
  default off, without upgrading existing analytics consent into ads consent.
- Basic opt-in: no Google tag before analytics consent. All four Google consent
  signals default denied before configuration. Analytics-only leaves advertising
  signals denied. Advertising measurement grants `ad_storage`/`ad_user_data`
  only after its own choice; personalization remains denied in all cases.
- Google Signals, advertising personalization and URL passthrough remain off.
  Ads data redaction is enabled while advertising measurement is denied.
- Revocation disables subsequent GA collection and clears measurement cookies,
  queued first-party events and campaign storage. Auth/study storage is untouched.
  Consent changes are observed across tabs.
  A consent epoch also prevents late failed requests from resurrecting pre-
  withdrawal events after a subsequent regrant (regression tested).
- Known campaign tuples, not arbitrary UTM text, are accepted as GA4 campaign
  source/medium/name. Only campaign name and expiry are kept in sessionStorage
  after analytics consent, for up to 30 minutes. New unknown campaigns clear old
  attribution. Query tokens, fragments and referrer paths/query are not forwarded.
- Click IDs are accepted on the landing page only after ads consent; QUANTUM
  does not copy them into custom storage, first-party event records or logs.
  Real paid-click attribution is NOT proven by this non-paid QA journey.
- Updated privacy copy explains pseudonymous identifiers, separate Ads use,
  retention and withdrawal. Preferences are accessible on the privacy page.
- Three QUANTUM loaders use the new asset version. The consent panel now has
  explicit border-box sizing and bounded scrolling, including 320px screens.

First production deployment: `dpl_5BWoLCpaxntxgz1FYRvXJAozJ2bB`, READY,
`https://qm-abal0szn0-msr-brs-projects.vercel.app`, at 22:07 BRT.
Final follow-up deployment, including late-request revocation protection:
`dpl_8PKH1ta448yxdEJK7tVYFz5pgPg9`, READY, 22:13 BRT,
`https://qm-jnqdzuuf5-msr-brs-projects.vercel.app`, canonical
`https://quantummechanicsbook.app/`.
Target verified by existing CLI context: project `qm`,
`prj_A9ZEdGd9hXOqAsacRPtIcKUaU8tq`, team `team_jQuUBnU7RDJh0O3XASyu1WeS`.
MCP project lookup failed with 404; authenticated CLI inspection confirmed the
correct existing project before deployment. No relinking or credential change.
Source is base commit plus this working diff, not a committed release. No push.
The existing general release label was not regenerated for this scoped patch.
Production JS SHA-256 equals local:
`f695ff95a30f527e36de087a6ad6c9edbf890ec039934cc287165e47a6b40df0`.
Post-deploy error-level log query returned no logs, not proof of zero future errors.

## Campaign-only remote change

Campaign `24369162368`, QUANTUM International, remains PAUSED at EUR 2/day.
Saved and re-read through Google Ads API its final URL suffix:

`utm_source=google&utm_medium=cpc&utm_campaign=quantum_international_en_search_pilot`

Previous suffix was empty; tracking template remains empty. Account auto-tagging
was already on and was not changed. No ad was clicked to manufacture attribution.

## Verification

- `npm run test:analytics`: 22/22, including eight executable VM runtime tests.
- `node --test tests/*.test.mjs`: 139/139.
- `npm run check`: content and privilege-contract validation passed.
- `npm run validate:seo`: 85 published sections passed.
- `git diff --check`: passed.
- Isolated Chromium script `scripts/test-qm-analytics-browser.mjs`: passed at
  320, 390, 1440px, testing the actual consent controls, navigation, opt-in and
  withdrawal. All external endpoints stubbed, no fake production conversion.
  First run exposed overflow; explicit border-box fixed it and all widths passed.
- Real production, fresh anonymous Chromium: zero Google collection requests
  before consent. Analytics-only page_view sent to `G-X5Y1C68QMN` with
  `cs=codex_qa`, `cm=qa`, `cn=quantum_c18_validation`, `gcs=G101`, `npa=1`.
- Separate production test with explicit ads-measurement choice: page_view had
  `gcs=G111`, `npa=1`, same QA source/medium/campaign. Withdrawal returned denied
  analytics and false advertising measurement. No paid click IDs used.
- One initial production smoke timed out because it clicked the privacy settings
  control before analytics initialization; retry waited for initialization and
  passed. No account, credentials or study records used by anonymous smoke tests.
- GA4 Data API attribution report (section_complete, session source/medium/campaign,
  Oct 18–19) returned zero rows at check time. This is not evidence of a correct
  attributed conversion; reporting latency and debug filtering remain possible.
- Existing earlier signed-in durable completion evidence remains in the paused
  setup report, but predates this correction. It must not be presented as an
  end-to-end test of this new release.

## Historical open items at 2026-10-18 — superseded where noted

The import/custom-goal blockers in items 2–4 were resolved on 2026-10-19. See
`conversion-setup-2026-10-19.md` for remotely verified current state. Launch and
real paid-click attribution remain separate gates; campaign stays paused.

1. Authenticated measurement gate PASSED at 22:17:46 BRT on Oct 18 after explicit
   owner authorization. See controlled-journey evidence below. This does not prove
   a paid Google click or eliminate the clean-baseline/launch gates.
2. Only after that gate: import/enable QUANTUM section_complete with ONE_PER_CLICK,
   no fabricated monetary value, secondary globally, then bind a custom goal only
   to QUANTUM. Never modify account-default or TERMO goal settings.
3. Latest action `7855071770` still HIDDEN, secondary, MANY_PER_CLICK, category
   DEFAULT, default value 1. Those inherited unconfigured values are a blocker;
   no conversion export was enabled during this follow-up.
4. QUANTUM still inherits account-default Engagements. The campaign must remain
   paused until replaced by its isolated, verified custom goal.
5. Complete launch checks from the setup report and obtain separate activation
   approval. No claim that real paid-click conversion attribution has been tested.

TERMO baseline checked read-only: `24027143907` ENABLED, EUR 2/day, suffix empty;
`7705181678` study_activation ENABLED, primary, ONE_PER_CLICK, value 0. Unchanged.
Final QUANTUM metrics read: zero impressions, zero clicks, zero spend today;
PAUSED, EUR 2/day and campaign-only suffix verified again through the Ads API.

## Rollback

- Keep campaign PAUSED. Restore only QUANTUM's campaign URL suffix to empty if
  abandoning this setup. Do not touch shared/default or TERMO settings.
- App rollback target: previous READY deployment `dpl_HfE1EKPNaRJ3emrkqLZpPBhdYgmH`
  / `https://qm-pi3tx3d9d-msr-brs-projects.vercel.app`; rolling back must keep Ads
  conversion import/launch blocked because old code does not provide the separate
  advertising choice or new attribution handling.
- Reverting these scoped frontend changes does not require a database migration,
  secret rotation or model change. Do not revert unrelated working-tree files.

## Primary references

- [Google consent implementation](https://developers.google.com/tag-platform/security/guides/consent)
- [Google privacy controls](https://developers.google.com/tag-platform/security/guides/privacy)
- [GA4 campaign and page configuration](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)

The digital-discovery-audit skill kept conversion import gated on real production
measurement/consent evidence. Vercel deployment skills required target inspection
and a verified READY deployment rather than assuming publishing succeeded.

## Authorized authenticated follow-up — 22:16–22:21 BRT

- Owner explicitly authorized the additional advertising-measurement choice and
  one more section completion in the existing signed-in Safari test session.
- Enabled the separate checkbox through the published preferences UI. Reopened
  preferences afterwards: checkbox remained checked and asset was v1018.3.
- Entered `home.html` with QA tuple `codex_qa / qa / quantum_c18_validation`,
  followed the real Start with Chapter 1 link, then section 1.4, **Cathode rays
  and the electron**. Acquisition parameters were not re-added to the section;
  only `analytics_debug=1` was used there to inspect the event in DebugView.
- Before action: section 1.4 Not studied; account had 130 points. Clicked Mark as
  completed exactly once, at 22:17:46 BRT. UI showed +20 points and Section
  completed. Reload showed the persisted completed state, with no second click.
- QUANTUM GA4 DebugView displayed exactly one `section_complete`, one key event,
  timestamp 22:17:46, and subsequent reload page_view. Expanded event parameters
  separately and verified `source=codex_qa`, `medium=qa`,
  `campaign=quantum_c18_validation`, canonical section page_location without
  acquisition/authentication query, and `non_personalized_ads=1` user property.
- This closes the controlled production action/consent/source-medium gate for
  preparing the Ads import. It is not a paid conversion, revenue or learning-
  mastery claim. Aggregated session attribution reports may lag; no fake gclid,
  direct analytics event injection or AI exercise generation was used.
- Campaign API before this test: QUANTUM PAUSED, EUR 2/day. TERMO and account
  goal settings were inspected read-only, not modified.

## Ads follow-up limitation — 22:25 BRT

- Attempted to open Create conversion action after passing the measurement gate.
  The Ads tab's web content stopped answering DOM reads. A scoped reload of that
  tab and native accessibility inspection did not restore access; the native
  Safari window remained accessible. This is a browser/tool access limitation,
  not evidence that Google rejected the event or of an Ads service outage.
- Read-only Ads API verification after the attempt: action `7855071770` remains
  HIDDEN, secondary, MANY_PER_CLICK, default value 1. No import or conversion
  configuration change succeeded. QUANTUM campaign `24369162368` remains PAUSED,
  EUR 2/day, with CUSTOMER-level goals and no custom goal.
- TERMO campaign `24027143907` remains ENABLED, EUR 2/day, CUSTOMER goals with no
  custom goal. TERMO action `7705181678` remains ENABLED, primary, ONE_PER_CLICK,
  value 0. No TERMO or shared account-default settings were changed.
- Next action: retry the conversion import in a responsive Ads UI, reuse the
  existing QUANTUM GA4 event/action, configure one conversion per click and no
  monetary value, keep it secondary globally, then assign a QUANTUM-only custom
  goal. Verify remotely before clearing either pending task; keep campaign paused.
- This turn changed only these evidence/specification records locally, enabled
  the explicitly authorized preference in the test session, and recorded one
  real section completion. No new app deployment, commit/push, paid ad click,
  activation or second completion. Existing frontend changes remain reviewable.
- `git diff --check` passed. Earlier code/browser test results above remain the
  applicable validation for the already-published frontend; no claim of another
  full code-test run in this documentation-only follow-up.
