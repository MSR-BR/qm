# C15 — generated exercise and Favorites technical review, 2026-10-18

## Scope and authorization

Owner explicitly requested the generated-exercise/save/favorite technical test
and remaining manual checklist, without altering TERMO. One UI generation on a
reviewed Chapter 1 source is authorized for this verification, including the
app's existing bounded provider retry/math-refinement behavior; do not run a
generation loop. No schema, credentials, environment, model selection, email,
report submission, deployment or commit/push changes are requested this turn.

Starting checkout `5152211`, main, clean. Published runtime `4121cfc` from the
preceding correction release. Target canonical QUANTUM / quantum_rebuild only.
Owner completed Google login in an isolated headed Chrome profile. Browser
tool initialization failed; reused the documented loopback-only CDP fallback.
No login secret or token is recorded. Account baseline: 0 saved exercises,
0 exercise favorites, 110 XP. Existing chapter-page favorite is not an exercise.

Story: reviewed source → generate UI → existing Gemini handler → automatic
owner-scoped Supabase save → favorite toggle → My exercises/Favorites detail
and MathJax → reload persistence → sign-out privacy boundary.

Skills: adaptive-learning-gamification validation gates, Supabase security and
Vercel full-story verification. Fifteen focused UI/authenticated-flow tests,
exercise-source governance, math-contract and renderer smoke passed before the
live test. Model route of this Codex run is not independently exposed; no
subagents or routing change. Report the generator's observed response metadata
separately without claiming it proves the number of internal provider calls.

## Observations

### Generated exercise and persisted provenance — passed

- One UI `POST /api/exercicio`, HTTP 200, Medium difficulty, from
  `/slides/chapter-01/photoelectric-effect.html`. No generation loop or second
  UI generation. Observed model metadata: `gemini-flash-latest`;
  `mathContractOk`, `mathRefinementApplied`, `bookContextApplied` all true.
  This is not a count of internal provider/refinement calls.
- Exercise `EX-01-16-B947001341`, “Stopping Potential and Threshold Frequency
  Analysis”, automatically saved once to My exercises. Saved statement and
  solution exactly match the response. Owner-scoped read also confirms persisted
  model, source references and nonempty context-package metadata.
- Primary book source: Chapter 1, item 1.6, pages 16–17; teaching source is the
  reviewed photoelectric-effect HTML above. Open page in the detail modal returns
  to that exact section; it does not automatically generate another exercise.
- Show solution renders mathematical notation. Basic numerical consistency was
  checked (work function 1.5 eV, threshold frequency 0.6 of the original frequency);
  professor/editorial acceptance and quality of other AI outputs are not certified.

### Favorites, reloading and responsive detail — passed

- Favorite from the generator persisted. A full Favorites page load displayed
  the exercise, and opening it directly from that list rendered the complete
  statement and solution (32 MathJax containers, zero detected MathJax errors).
- A fresh My exercises page load found exactly one matching saved record; its
  detail modal also rendered 32 math containers without detected math errors.
- Removing the exercise favorite retained the saved exercise (1 saved, 0 exercise
  favorites). Re-adding it and fully reloading Favorites restored it (1 saved,
  1 exercise favorite). The pre-existing page favorite remains (1 page item).
- Desktop and 390/320 px screenshots were visually inspected. No document/modal
  horizontal overflow or raw math delimiters were detected in the tested detail;
  statement/solution remain readable with vertical scrolling. This emulation is
  not a real-device touch/Safari acceptance test.
- Modal opening focuses Close exercise. A scripted Escape event from the focused
  control closes it and restores the card focus. This does not replace manual
  keyboard/screen-reader testing. Send/Export controls were present, not executed;
  no external share, report or email was submitted.
- XP and ledger XP remained 110: generation, saving, favoriting and reopening did
  not award learning points. The generated exercise and favorite are deliberately
  retained in the test account for the owner's review; older QA data are preserved.

### Session boundary

UI sign-out completed and returned no authenticated session. After a full reload
of Favorites, the list returned `not_authenticated`, zero records and zero
exercise cards; the private exercise code was absent. The isolated test browser's
cookies and QUANTUM origin storage were cleared and that browser was closed.
No ordinary Chrome or Safari profile was modified.

## Local verification

- `node --test tests/qm-c22-ui-contract.test.mjs tests/qm-authenticated-learning-flow.test.mjs`: 15 passed.
- `npm run audit:exercise-sources`: passed (85 reviewed sections / seven chapters;
  Chapters 8–13 excluded).
- `npm run smoke:math-contract`: passed.
- `npm run smoke:ai-renderer`: passed.

Screenshots are disposable local evidence, not repository artifacts:
`/private/tmp/qm-c15-exercise-generated-20261018.png`,
`/private/tmp/qm-c15-exercise-favorite-390-20261018.png`,
`/private/tmp/qm-c15-exercise-solution-320-20261018.png`.

## Remaining owner acceptance

Historical checkpoint, superseded later on the same day by the owner's explicit
closure instruction after the export correction. See `export-release-2026-10-18.md`;
the checks below were not retroactively recorded as executed.

The bounded generated-exercise/save/favorite technical flow passes. C15 remains
open for the owner's real desktop/mobile experience, real-device touch/scroll,
200% zoom and screen-reader/keyboard acceptance, scientific/editorial review and
clarity of the assessment, daily challenge, simulator and Journey methodology.
Do not equate this technical sample with complete pedagogical acceptance.

Only QUANTUM documentation changed. No application code, migration, credentials,
deployment, commit or push; TERMO was not changed. The learning skill kept the
check focused on source provenance and no reward for passive save/favorite actions.
