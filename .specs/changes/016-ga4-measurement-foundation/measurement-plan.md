# C16 measurement plan

## Product questions

| Question | Primary signals | Interpretation boundary |
| --- | --- | --- |
| Do visitors move from discovery into study? | `home_study_cta_click`, `chapter_start` | Compare consented trends, not the total audience. |
| Which reviewed chapters and sections are used? | `section_open`, `section_complete` | Completion is an explicit learner action, not proof of mastery. |
| Are simulators supporting the reading journey? | `simulator_open` by simulator and entry method | Opening a simulator does not prove successful use. |
| Are generated exercises useful? | `exercise_generate`, `exercise_solution_open`, `exercise_validation_submit` | Validation reports require editorial review; telemetry cannot judge correctness. |
| Do learners finish reviewed assessments? | `assessment_start`, `assessment_complete`, aggregate score distribution | Do not use analytics as an individual gradebook. |
| Does reviewed-content search lead to content? | `search_submit` result-count distribution and `search_result_open` | The raw query is deliberately unavailable. |
| Is sign-in discoverable? | `auth_open`, `login_success` | Measure aggregate friction only; no account attribution is stored in first-party analytics. |
| Is the app perceived as useful? | `rating_prompt_shown`, `rating_submitted` | Read text feedback only in the separate protected ratings workflow. |
| Is the external book preview discoverable? | `book_preview_open` | This is an outbound interest signal, not a sale. |

## Initial reporting set

1. Consented sessions and chapter starts by day.
2. Section-open and explicit-completion counts by reviewed chapter.
3. Simulator opens by simulator.
4. Exercise generations, solution-open ratio, and issue-report ratio.
5. Assessment start-to-completion ratio and aggregate score bands.
6. Search zero-result rate and result-open ratio.
7. Sign-in open-to-success trend.
8. Rating distribution and rating submission rate.

## Guardrails

- Do not compare telemetry totals with all site visitors without accounting for opt-in.
- Do not create individual learner profiles from first-party analytics.
- Do not treat engagement as learning outcome evidence.
- Do not connect GA4 to Google Ads or mark conversions until C18 is separately approved.
- First-party retention: 90 days.
- Planned GA4 event-data retention: 14 months.
