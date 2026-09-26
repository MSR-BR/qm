# Supabase access matrix

The machine-enforced source is `data/qm-supabase-access-contract.json`.

| Object | Consumer / role | Operations | RLS or boundary | Responsible migration |
|---|---|---|---|---|
| `qm_saved_exercises` | authenticated browser | S/I/U/D | own `user_id` | C27 |
| `qm_exercise_validation_reports` | anon; authenticated reporter/admin; audit cleanup service | S; S/I/U; D | approved memory, own report, or validator | C27 |
| `qm_book_sources` | service | S/I/U | server-only, private source metadata | C27 |
| `qm_study_progress` | authenticated; reconciliation service | S/I/U/D; S | own `user_id` | C27 |
| `qm_gamification_profiles` | authenticated; reward service | S; S/I/U | own read; server writes | C27 |
| `qm_gamification_events` | authenticated; reward service | S; S/I | own read; immutable server insert | C27 |
| `qm_chapter_quiz_attempts` | assessment service | S/I | user derived from verified session | C27 |
| `qm_simulator_activity` | authenticated browser | S/I/U | own `user_id`; opening is not mastery | C27 |
| `qm_user_legal_preferences` | verified server handler | S/I/U | user derived from session | C27 |
| `qm_email_campaigns` | owner-only server | S/I/U | server authorization | C27 |
| `qm_email_recipient_deliveries` | owner-only server | S/I/U | server authorization | C27 |
| `qm_app_ratings` | rating/admin server | S/I/U/D | pseudonymous write; owner-only read/delete | C27 |
| `qm_analytics_events` | analytics/retention server | S/I | sanitized, non-PII events | C27 |
| trigger helpers | database triggers | no API role | `EXECUTE` revoked from API roles | C27 |
| `private.is_qm_exercise_validator` | authenticated/service | EXECUTE | private schema and allowlist policy | C27 |
| analytics retention RPCs | service | EXECUTE | server-only | C27 |
| section reward RPC | service | EXECUTE | atomic/idempotent server operation | C27 |
| rating/analytics identity sequences | service | USAGE/SELECT | required only for server inserts | C27 |

Legend: S = SELECT, I = INSERT, U = UPDATE, D = DELETE.
