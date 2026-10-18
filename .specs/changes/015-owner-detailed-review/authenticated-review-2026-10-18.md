# C15 — authenticated technical review, 2026-10-18

Status: **technical browser round executed; two technical findings and owner acceptance remain open**.

## Scope and execution evidence

- User authorized authenticated QUANTUM testing and completed Google login in an isolated headed Chrome profile. TERMO was not inspected or modified.
- Tested canonical production `https://quantummechanicsbook.app` after the C30 release recorded in `../030-adaptive-learning-modes-and-rewards/release-2026-10-18.md`. Local clean starting revision: `8046d1e20b962ee7c7c482d9cfeb38caea20e1db`. This round did not independently re-query Vercel deployment metadata.
- Codex in-app browser failed at initialization because the executor rejected a symlinked writable root. Used a separate Chrome process/profile with loopback-only CDP instead; existing browser sessions were not reused.
- Browser interactions and the application's own read-only profile/list methods exercised the real backend, without retrieving or printing tokens. Desktop viewport was 1200 px. Narrow observations/actions explicitly set 390 or 320 px in the same CDP connection. An initial standalone viewport command did not persist; its following 1200 px result was not counted as mobile evidence.
- User performed login and legal acknowledgement. Optional analytics were declined before login. Existing communication preferences were only read, not changed; the optional email preference was on after the user's login interaction, so this is **not** evidence that its first-login default was on. Source markup starts it unchecked.
- No paid AI call, email dispatch, report submission, migration, application-code correction, commit, push or deploy was performed. No subagents or model changes. Actual provider/model/reasoning route is not independently exposed by the runtime and is not asserted.

## Browser observations

| Flow | Observed result / limit |
| --- | --- |
| Authentication and persistence | User-confirmed Google login; real Journey initially showed zero progress/rewards/attempts. Session remained active across page loads. Sign-out removed private Journey and Favorites content immediately and after reload. |
| Reading | Chapter 1 sections 1.2, 1.3 and 1.5 were explicitly completed using the UI. Progress persisted; each contributed 20 points. Chapter 1 mathematics rendered. |
| Assessment and changed-form recovery | Chapter 1 loaded six questions with source links and partial-coverage warning. Submitted five correct/one deliberately wrong, obtaining 83%. Guided review led to a different question for the missed concept; correct retry gave 100% on that **one-question retry**, not on the original assessment. |
| Rapid duplicate submission | Two immediate submit-button activations created **two assessment attempts**, not one, and left an additional unresolved correction cycle. Reward cap prevented a second 30-point assessment award. See C15-016. This is a failed acceptance check. |
| Rewards | Final authoritative profile and ledger both showed 110 XP: 3 × 20 reading + 30 assessment + 10 guided review + 10 retry. Two criterion badges were present; no chapter mastery claim. Reloads, simulator use and daily retrieval did not add XP. |
| Simulator | Double-slit cycle saved prediction → changes to wavelength and distance → meaningful interaction → comparison/reflection. Journey persisted one opened simulator, one meaningful interaction and one completed goal; reopening did not inflate these counts or points. At 320 px, controls and canvas existed without document overflow. Full cycle was performed at desktop width, not on a physical phone. |
| Daily Challenge | With only one completed source it refused issuance and explained the three-concept eligibility requirement. After three eligible sections, it issued three questions only from those studied sources. At 390 px, displayed a server-provided hint and accepted answers; 2/3 correct yielded 67%, source-linked feedback and no extra points. Result fit 320 px. |
| Favorites | Account had zero saved exercises. Chapter 7 item 7.3 was starred, remained in Favorites after navigation/reload, and its favorite card reopened the correct reading page at narrow width. This does **not** establish the generated-exercise favorite workflow. |
| Math and narrow navigation | Chapter 7 commutation page rendered 31 MathJax containers with no MathJax error nodes; no document overflow at 390/320 px. Journey, preferences, favorites, chapter listing, six-question assessment form and daily result also fit their checked narrow widths. Search remained visible with Chapters expanded; Extras contained Journey, assessments, daily and simulator catalog. This is not physical-device, screen-reader or visual/editorial acceptance. |
| Privacy/preferences | Saved legal and communication choices loaded; choices were not changed or saved by the agent. No assertion of email delivery. |

The assessment card subsequently displayed `2 assessment attempts` and `Best score: 100%`. The two original assessment submissions scored 83%; 100% belongs to the one-question retry. See C15-017, separate from reward correctness.

## Local checks and reproduction

34 focused tests passed:

```sh
npm run test:adaptive-learning
npm run test:learning-profile
node --test tests/qm-learning-adapter.test.mjs tests/qm-learning-help.test.mjs tests/qm-academic-evaluation-and-communication.test.mjs
```

These suites do not cover the duplicate browser-submit race and therefore do not override the observed failure. A temporary no-network Node VM harness extracted the current `submitAssessment` function, invoked it twice before the mocked async session resolved, and captured **two requests with distinct idempotency keys**. It used a synthetic non-credential session value and simulated failure responses, not the real account/API. The root cause is that the `submitting` guard is set only **after** awaiting the session, while a new idempotency key is generated on each request.

## Technical follow-up (agent-owned, not another manual test request)

1. C15-016: acquire the submit lock before any await; release it on every exit. Keep a stable idempotency key for one submission/retry-after-transport-error. Add a concurrent-click browser/client regression and replay tests, then rerun authenticated save/history/review/retry. Do not delete this account's records to conceal the failed test. Any cleanup must be explicit and narrowly scoped.
2. C15-017: align assessment count and best-score populations or label activity types separately. The snapshot counts only assessment attempts but takes the maximum score over assessment, retry and daily activity. Add mixed-mode regression data before changing the query/projection. No migration applied in this round.
3. Exercise generation → save → favorite → formatted detail remains unverified: no eligible saved exercise existed in this account and no paid generation was authorized. Can be tested technically once an existing exercise is supplied/saved or a bounded paid generation is authorized. Do not substitute a synthetic database insert for the UI flow.

## What remains for the owner

- Real phone/tablet usability: touch, scrolling, menu/search, formulas and simulator controls; desktop browser 200% zoom and screen-reader/keyboard usability (with a tester if needed).
- Pedagogical/editorial judgement: clarity, correctness and level of reviewed questions, explanations, hints, changed-form retry and simulator instructions against the book. A short live example is not proof of learning effectiveness.
- Inspect a generated exercise and its solution when available, including its source and scientific/mathematical quality. The agent can then verify save/favorite persistence without asking the owner to debug it.
- Final acceptance after the technical findings are corrected and rechecked. C15 is not closed and full mobile authenticated parity is not claimed.

## Persistent test state and safety

The chosen account now contains three test reading completions, a chapter-page favorite, two assessment attempts from the duplicate-click test, one guided review/retry, one daily retrieval and one simulator guided cycle. The final profile is 110 XP. These are QA-generated records, **not evidence of genuine student learning**, and should be excluded from future learning-effectiveness analysis. No records were deleted. User identifiers, Google secrets and authentication/session values are excluded from this report.
