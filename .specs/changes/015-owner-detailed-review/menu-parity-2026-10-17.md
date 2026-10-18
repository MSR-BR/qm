# C15 — owner-reported menu parity correction

Status: implemented locally; no commit, push or deployment requested for this follow-up.

## Objective and diagnosis

Make QUANTUM learning activities as discoverable as TERMO without changing TERMO
or the shared pedagogical policy. The owner supplied mobile screenshots.
Read-only inspection of TERMO's `index.html` confirms Extras contains journey,
Daily Challenge and simulator entry points. QUANTUM has `extraViews = []`, hiding
Extras, while its journey lives under Personal Area. All three accordion
controllers close every `.drawer-group-panel`, including the triggerless Search
and Learning guide panels, leaving empty cards that cannot be reopened.

## Requirements and tasks

- Put points/journey, chapter assessments, Daily Challenge and all simulators in
  Extras, with direct working destinations for signed-out as well as signed-in
  navigation. Protected destinations retain their existing sign-in gates.
- Keep the simulator-by-chapter accordion as a useful shortcut; the all-simulator
  destination uses the existing catalogue with a new all-reviewed-chapter view,
  not a new learning mode. The old renderer forced the first chapter even when
  no chapter was selected; that behavior is removed. Chapter filters remain.
- Move Search into a compact persistent drawer-header link, outside accordions.
- Remove the duplicate large guide card; retain footer and contextual help links.
- Move journey's navigation ownership to Extras; retain its URL/history/profile.
- Keep static fallback links before app initialization and test accordion toggles,
  native link navigation, narrow screens, zoom, keyboard and content locks.

## Scope, risks and acceptance

Only presentation/navigation and tests change. No rewards, exercise selection,
source eligibility, authentication provider, server access, schema, analytics
policy or TERMO files change. Keep English UI. TERMO's protected PDF is NOT
copied: QUANTUM retains its external book preview. Avoid treating matching menus
as proof of complete learning parity. C15's full authenticated/manual review is
still open. Main risks: invalid SPA view IDs for standalone activities, lost
journey deep links, static/runtime disagreement and utility links hidden by
accordion state. Tests must explicitly cover these regressions.

## Model and validation

Current Codex session; exact model/reasoning identifier unavailable. No model
switch or delegated agents. No paid AI calls or production writes.

- TERMO reference: local Developer/termo revision `4a7acf4`, `index.html` static
  Extras and runtime `extraViews`/`renderExtrasMenu`. This is code plus owner
  screenshot evidence, not a new authenticated TERMO production audit. Existing
  unrelated TERMO edits were not changed.
- 105/105 Node tests pass, including six new menu/syntax/catalogue regressions.
  `npm run check`, `npm run validate:seo` (85 sections), and `git diff --check`
  pass. No new migration or authentication policy was introduced.
- Browser correction cycle: the new chapter-filter test caught the public
  "All simulators" return link being erased by `refreshUserState` calling the
  previously empty `renderPanelActions`. The link now derives from the current
  view in that shared renderer, with a repeated-render regression test.
- The first public menu run passed sixteen scenarios. The expanded catalogue
  run exposed the return-link defect above; final seventeen-scenario results
  are recorded below, not inferred from that earlier pass.
- Static fallback and initialized menu use native anchors to the same routes;
  standalone assessment/daily destinations are not mistakenly registered as SPA
  views. Private journey data still requires the original Google session.
- The skill constrains this change to navigation/presentation: no new points,
  unlocks, shortened challenge, mastery criteria or unsupported learning claims.

## Final local verification

Seventeen public Chrome scenarios PASS, with no warnings/errors, after the
return-link correction. Evidence: `/private/tmp/qm-menu-parity-20261017-verified`.
The suite actually clicks all four Extras links and checks their destinations;
cycles Personal Area, Extras, Simulators and Chapters while asserting persistent
Search and one expanded panel; checks all-chapter cards versus chapter 07 only;
rejects locked chapter cards; and verifies desktop, 390px/320px, keyboard focus,
reduced motion and root-font-size smoke. Mobile menu, narrow-screen menu,
desktop all-simulator grid and mobile chapter-filter screenshots were inspected.
Root-font-size smoke is not claimed as real mobile browser zoom or screen-reader
acceptance. No real Google session or learner event was exercised in this run.

Result: owner-reported navigation defects corrected locally. The C15 detailed
authenticated/manual review remains open; publication requires a new CPD request.
