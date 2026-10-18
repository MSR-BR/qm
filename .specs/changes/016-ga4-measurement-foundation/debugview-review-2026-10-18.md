# C16 — property-side DebugView verification, 2026-10-18

## Scope and authorization

Owner authorized completing C16, requesting manual Google login when needed,
recording evidence and clean CPD afterwards. QUANTUM only; TERMO is excluded.
Starting checkout is clean at `207d05e` in `Documents/Developer/qm`.
This is the existing property-side acceptance gate, not a new analytics redesign,
Ads activation, account linkage, credential change or backend migration.

## Preflight completed

- 14 focused analytics tests and all 131 repository Node tests passed.
- Canonical public configuration returned HTTP 200 with analytics enabled,
  Measurement ID `G-X5Y1C68QMN`, host `quantummechanicsbook.app` and consent
  version `qm-analytics-consent-v1`. No private environment values were read.
- Public release remains `v20261018.2244`.
- Stream and property association subsequently confirmed in the signed-in UI;
  details and acceptance evidence follow below.
- The built-in browser controller failed before attachment due to the existing
  symlinked writable-root environment issue. Opened a separate disposable Chrome
  profile for this task and requested manual Google login. No personal browser
  profile/cookies or credentials were copied or inspected.

## Property-side verification completed

The owner signed in through Safari and asked the agent to perform the remaining
work independently. Safari's rendered page was inspected and operated through
AppleScript after the built-in browser controller failed. No Google cookies,
tokens, passwords or hidden application state were read or copied.

- Analytics account display name: `Google Ads Account`, account `346683903`.
  This is an account label, not evidence of an Ads campaign or permission to
  create/link one. The signed-in Google email was not confirmed.
- Property: `QUANTUM`, property `554204628`.
- Web stream: `QUANTUM production`, `15777520006`, canonical website
  `https://quantummechanicsbook.app`, Measurement ID `G-X5Y1C68QMN`.
- Stream UI reported active collection/traffic in the preceding 48 hours.
- Data retention UI: event data **14 months**, user data **14 months**.
- Data filters UI: one `Internal Traffic` exclusion in **Testing**, not Active.
  No filter, retention, advertising, consent or other property setting changed.

DebugView route inspected:
`https://analytics.google.com/analytics/web/#/a346683903p554204628/admin/debugview/overview?restoreUserState=true`.

### Real public journey received in DebugView

The Safari QA tab already had analytics consent `granted`; that preference was
preserved. Opened the public landing with `analytics_debug=1`, clicked its actual
**Start with Chapter 1** link, then opened the reviewed photoelectric-effect
section with the debug flag. No application login, generated exercise, rating
submission or paid AI call was performed.

The following appeared in the signed-in **DebugView rendered interface**, not
just in the browser request log (times shown by GA4, America/Sao_Paulo):

| Time on 2026-10-18 | Event | Correlation |
| --- | --- | --- |
| 20:07:08 | `page_view` | Landing opened for this journey |
| 20:07:30 | `home_study_cta_click` | Actual landing CTA; expanded `destination=chapters`, `debug_mode=1`, and `page_location=https://quantummechanicsbook.app/home.html` |
| 20:07:35 | `page_view` | Arrival in the reading app |
| 20:08:11 | `page_view` | Reviewed photoelectric-effect section |
| 20:08:26 | `section_open` | Expanded `item_id=1.6` and `page_slug=photoelectric-effect`; accompanying `chapter_start` also present in the stream/top-events list |

The section's browser data layer independently showed `chapter_id=01`,
`item_id=1.6`, `page_slug=photoelectric-effect`, `debug_mode=true` and the correct
Measurement ID. Expanded GA4 parameters were limited to public navigation
context; session identifiers were not expanded or recorded. The landing URL in
the property excluded the debug query. Earlier rating events at 19:47–19:51 were
already present and are **not** claimed as this run's evidence.

### Transport, consent and evidence limits

- Two disposable Chrome runs independently verified zero collection and no
  Google tag before choice; explicit opt-in loaded the tag. Google Collect
  returned 204 for debug page/chapter/section events; first-party ingestion
  returned 202. The visible run also persisted consent revocation as `denied`.
- The first Chrome capture did not include the CTA across navigation. Retaining
  the page for a diagnostic click subsequently showed the real handler emitting
  that event and both endpoints accepting it. This alone was not treated as a
  successful ordinary navigation test. The subsequent **unmodified Safari CTA
  navigation and its received DebugView event** supplied that missing evidence.
  No speculative application fix was made.
- Disposable Chrome traffic was not positively matched to DebugView. The final
  property-side acceptance rests on the time-correlated Safari journey above;
  HTTP 204 was not substituted for it. The reason for the Chrome difference is
  unconfirmed.
- DebugView's device counter displayed zero even while the stream showed these
  events; no device count or fleet-coverage claim is made.
- Evidence was read from rendered UI text/SVG nodes and expanded parameter
  controls. OS screen capture returned wallpaper rather than the Safari window,
  so no valid screenshot is claimed or fabricated.
- This bounded anonymous journey does not rerun all 19 contract events or
  authenticated/paid workflows. Those retain their local contract tests and
  previously recorded feature-specific evidence. QA analytics events were not
  deleted; no database mutation/cleanup was attempted in this task.

## Checks and closure

- `npm run test:analytics`: **14/14 passed**.
- `node --test tests/*.test.mjs`: **131/131 passed**.
- `npm run check`: passed (13 chapter files and privilege contract).
- `npm run validate:seo`: passed (85 published sections).
- `npm run audit:production`: passed (99 sitemap URLs, 66 local assets,
  9 API boundaries; no warnings/errors).
- Public runtime/configuration stayed unchanged during verification.

**C16's remaining property-side acceptance gate is closed.** Only specifications
change in this CPD; no application source, environment, credentials, Google
property configuration, migration, advertising or TERMO resource is changed.
The Git-triggered documentation release must reach READY on the canonical domain
before reporting clean CPD. Reversion, if needed, is a normal revert of this
documentation commit; there is no remote configuration change to reverse.

Reference: [Google Analytics DebugView](https://support.google.com/analytics/answer/7201382).
The digital-discovery-audit skill requires separating repository/transport proof
from property-side evidence; unavailable property evidence is not inferred.
