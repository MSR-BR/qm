# C16 event contract

## Collection boundary

Collection is optional and begins only after affirmative consent. The browser never submits a user ID, account ID, e-mail address, raw search text, answers, generated exercises or solutions, report text, feedback text, OAuth parameters, UTM parameters, or unrestricted query strings.

GA4 and the first-party endpoint receive only the event-specific properties below. The server validates names, types, ranges, enumerations, origin, consent version, and page-path parameters again before storage.

| Event | Allowed properties | Meaning |
| --- | --- | --- |
| `session_start` | `language`, `timezone`, `viewport_group` | One consented browser session began. Sent only to first-party storage because GA4 creates its own session event. |
| `home_study_cta_click` | `surface`, `destination`, `chapter_id` | A study call to action on the home page was selected. |
| `chapter_start` | `chapter_id`, `entry_method` | The first reviewed section of a chapter was opened in the current browser session. |
| `section_open` | `chapter_id`, `item_id`, `page_slug` | A reviewed reading section was opened. |
| `section_complete` | `chapter_id`, `item_id`, `page_slug`, `completed` | The learner explicitly marked a reviewed section completed. |
| `simulator_open` | `simulator_id`, `entry_method` | A catalogued simulator was opened. |
| `assessment_start` | `chapter_id`, `question_count` | A reviewed chapter assessment was loaded. |
| `assessment_complete` | `chapter_id`, `question_count`, `correct_count`, `score_percent` | An authenticated assessment submission was accepted. No answer is sent. |
| `exercise_generate` | `chapter_id`, `item_id`, `difficulty` | A generated exercise request completed successfully. |
| `exercise_solution_open` | `chapter_id`, `item_id`, `difficulty` | The generated solution was intentionally revealed. |
| `exercise_validation_submit` | `chapter_id`, `item_id`, `has_reported_issue` | A possible exercise issue was submitted. No report text is sent. |
| `favorite_changed` | `kind`, `active`, `count` | A page or saved exercise favorite changed. |
| `auth_open` | `surface` | The sign-in or account surface was opened. |
| `login_success` | `provider` | The browser returned from a user-initiated Google sign-in with a valid session. No account identifier is sent. |
| `rating_prompt_shown` | `visit_band`, `content_view_band` | The anonymous app-rating prompt became eligible and was shown. |
| `rating_submitted` | `rating`, `has_feedback` | A rating was accepted. Only the score and presence of optional text are sent. |
| `book_preview_open` | `provider`, `surface` | The external book preview or publisher link was opened. |
| `search_submit` | `query_length_bucket`, `result_count` | A public reviewed-content search ran. The query itself is never sent. |
| `search_result_open` | `chapter_id`, `item_id`, `result_rank` | A reviewed search result was selected. |

## URL policy

Only the path and the navigation parameters `view`, `chapter`, and `sim` may be measured. OAuth parameters, hashes, search terms, campaign parameters, and all other query values are removed in both the browser and server layers.

## Consent and advertising policy

- Unknown or denied consent: no GA script, no event queue, and no first-party write.
- Granted consent: `analytics_storage` may be granted.
- `ad_storage`, `ad_user_data`, and `ad_personalization` remain denied.
- Google Signals and ad-personalization signals remain disabled.
- Revocation stops new events immediately.
