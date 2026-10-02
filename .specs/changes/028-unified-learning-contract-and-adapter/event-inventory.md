# C28 — observed state and adoption map

Audit date: 2026-09-25. Base: `f667621fd4bd646f4c79844899a95342171b594e` plus local C28 artifacts. Evidence is repository code, not a fresh production audit. C21/C22/C27 local repairs remain unpublished pending the remote database/release gates.

Machine-readable authorities: `data/qm-learning-event-map.v1.json`, `data/qm-learning-policy.v1.json`, `data/qm-learning-mechanisms.v1.json`, `data/qm-simulator-evidence.v1.json`. Shared helper: `lib/learning-policy-contract.mjs`; QUANTUM loader: `lib/qm-learning-adapter.mjs`. No app entry point imports the adapter. These files describe and validate the future contract; they do not accept network events or execute rewards.

## Current paths, counters and storage

| Surface / producer | API or persistence | Observed semantics | C29/C30 disposition |
| --- | --- | --- | --- |
| `QMStudyProgress.recordOpen`, `setCompletion`, `listProgress` in `assets/qm-study-progress.js` | Own-user `qm_study_progress` upsert/read | Mutable status, first/last open and completed timestamps. Completion may be undone. | Preserve reading state; explicit completion is activity, never retrieval/mastery. Verify identity/content and persisted completion server-side before a new award. |
| `QMGamification.recordSectionCompletion` | `POST /api/qm-gamification-event` → `record_qm_section_completion_reward` → events/profile | Only `section_completed`; C21 local RPC atomically awards 20, locks profile, dedupes user/key and user/type/path. Level = floor(XP/100)+1. | Preserve earned balances and original identities. Add evidence/version fields and explicit semantic keys, not fabricated historical attempts. C21 handler validates reviewed topic but RPC does not independently read completion state. |
| Header Points / `QMGamification.listProfile` | Direct own-user read of `qm_gamification_profiles` | XP, level, current/best streak, studied count, last active day | Replace composition with one consistent authoritative snapshot in C29. Level/points never imply mastery. |
| `renderStudyJourney` in `index.html` | Four independent requests: progress, rewards, latest 20 quiz attempts, simulator rows | Completed/total sections, continue-last-page, XP/streak, best recent score, row count of opened simulators | Error/unavailable must remain distinct from zero; unify freshness and account snapshot. Resume reading is not an adaptive scheduler. |
| Assessment page / `assets/qm-assessments.js` | `GET/POST /api/qm-chapter-quiz`; `qm_chapter_quiz_attempts` | One question per chapter 1–7 in `lib/qm-chapter-quiz-catalog.mjs`. Server grading, saved answers/feedback, review links; no XP, focused retry or mastery transition. History limited to 20. | Expand reviewed question coverage, idempotent attempts, diagnostic review and changed retry. 80% completion suggests an assessment; it never locks manual access. |
| Simulator catalogue / standalone pages | `assets/qm-simulator-progress.js` → own-user `qm_simulator_activity` | Read/increment/write open_count with sessionStorage dedupe. No prediction/manipulation/reflection evidence. Non-atomic counter can race. External PhET cannot confirm completion. | Declare all 15 catalogue capabilities; migrated opens stay activity only. C30 adds supported evidence stages, not inferred engagement. Preserve query variant in simulator identity. |
| Generated exercises and solution reveal | `/api/exercicio`, `assets/ai-exercises.js`, `lib/exercicio-handler.mjs` | Source/context-constrained generation; statement/solution delivery. No graded learner response or durable hint/reveal event. Solution-open analytics is optional. | Generation/saving is not solving. Add attempt/help/representation evidence and provenance validation before recommending or awarding; do not reconstruct help use from analytics. |
| Saved exercises / favorites | `assets/termo-user-data.js` → `qm_saved_exercises` | Own-user statement, solution, model/source metadata and favorite flag; fallback can omit provenance for legacy schema | Stored material is not verified performance. Revalidate provenance for future adaptive use. Retain favorite/detail behavior. |
| Page/chapter favorites and bookmark | `TermoAuth`/`TermoUserData`, Auth user metadata | Mutable navigation preferences | Never trusted for role, points or mastery. Names retained for compatibility; no TERMO dependency. |
| Exercise quality reports | `/api/exercicio-validacao`, `/api/exercicio-validacao-admin`; `qm_exercise_validation_reports` | Learner issue report and owner editorial decision | Safety/editorial evidence only, separate from correctness evidence. |
| Privacy / first login | `/api/qm-legal-preferences`; `qm_user_legal_preferences` | Versioned terms/privacy and timestamped optional email choice; C22 default-off migration still local | Keep separate from reward ledger; never reward consent. C32 checks consent again at send time. |
| Ratings | `/api/qm-app-rating`; `qm_app_ratings` | Satisfaction, optional text; admin report/delete | Experience, never physics achievement. |
| Owner communications | `/api/qm-email-test`, `/api/qm-email-campaign`; campaigns/deliveries | Manual audience/test/send, opted-in audience, Resend acceptance and failure; no due-practice engine or webhook proof of learning | C32: caps, timezone/quiet hours, pause, one-click unsubscribe, delivery/exposure separation. `return_reminder` schema enum alone is not an implemented scheduler. Provider configuration remains gated. |
| GA4 / first-party metrics | `assets/qm-analytics.js`, `/api/qm-analytics-event`; `qm_analytics_events` | 19 allow-listed optional events; consent required, sanitized properties, 90-day first-party retention | All explicitly non-authoritative; missing consent or dropped analytics must not affect learning. |
| Source catalogue | `qm_book_sources`, content registry, exercise manifest | Publication and source provenance | Eligibility requires exact chapter + section + path + reviewed references; Chapters 8–13 and unknown items fail closed. |

All 13 locally defined public tables are classified in the event map. All seven emitted browser CustomEvent names are classified separately from persisted actions; a browser callback never proves server authority. The 19 analytics names are frozen independently and compared against the handler allow-list in tests. A new name fails classification until reviewed.

## Mechanics and missing evidence

- Current structural mechanics: section points, level, streak and five derived achievements. Streak day is fixed to America/Sao_Paulo; it advances on a newly awarded section, with no daily-return bonus. It does not remove earned XP, but needs timezone/pause semantics in C30.
- Existing achievement predicates: one completed section, ten completed sections, first assessment, score >=80%, and streak >=3. They are assembled in `renderStudyJourney`, not persisted badges. Best score is only over the latest 20 attempts and a one-question quiz can yield 100%; neither supports mastery.
- Daily Challenge, persisted missions/badges, concept graph, mastery, due-practice scheduler, confidence, graduated hint evidence, guided-review completion, focused retry and adaptive AI are not implemented by current operational names. Their implementation belongs to C29/C30.
- Public individual leaderboard and compulsory timer are disabled. Their mechanism cards document the decision rather than activating a feature.
- There is no stored mechanic exposure stream. Eligibility is not exposure, provider acceptance is not delivery, and delivery is not learning. C30/C32 must add fidelity records before evaluating those mechanics.

## Contract decisions and defaults

Preserve the shared adapter values 20/30/10/10/80. Section completion remains an explicit reading self-report; call it activity progress and never mastery. New assessment/review/retry/mastery awards remain inactive until C29/C30. No bonus XP for page opens, simulator opens, email opens, mission badges, level transitions or simply returning daily. Daily Challenge can produce an already-defined remediation/milestone event only when its actual evidence qualifies; reward keys prevent double award across modes.

New configurable starting caps in adapter v1: at most one rewarded remediation cycle per learner/day and two per learner/chapter/rolling seven days; the server creates a cycle only for diagnosed need. Both its 10-point review and 10-point retry are each once per cycle. These are conservative product defaults, not study-derived optimal values. C30 must define/test day-boundary timezone and rolling-window behavior before activation. Policy version is provenance, not a new award namespace.

Mastery requires at least two unaided successes in separate sessions and representations plus delayed retrieval and concept coverage; these minima are necessary checks, not a sufficient universal formula. C30 must validate a reviewed concept graph, rubric and scheduling rules before using a mastery transition. A new session ID alone is not proof of a delay. Chapter percentage or XP alone can never create `chapter_mastery_reached`.

`learning-event-v1` requires server event/user identity, occurred/received times, type, content/chapter/section, concepts/sources, attempt/activity identity, semantic idempotency key, policy version and bounded evidence. C29 owns the validator and transaction. The map only names migration targets; it deliberately does not convert untrusted rows to authoritative envelopes. Legacy unknown concepts, confidence, hints, representation and sessions remain unknown. Do not automatically credit new learning rewards from old analytics, visits, self-report or score alone.

`learning-profile-v1` requires generated time, policy version, progress, rewards, concepts, assessments, simulators, missions, badges, next action and freshness. Empty history means insufficient evidence; failed queries mean unavailable, not an empty success. All recommendations must include why, source, duration and alternative.

## Academic basis and limits

The existing C23 evidence register remains authoritative: `.specs/blueprints/adaptive-learning-gamification/references/evidence-and-evaluation.md` and `pedagogy-and-recommendations.md`. The physics papers support caution about structural elements: engagement/attitudes do not establish learning benefits. Retrieval, feedback, spacing and successive relearning organize the instructional loop. Every mechanism card specifies a separate learning measure, risk, fallback and exposure requirement. This contractual change makes no new efficacy claim and does not reclassify metadata-only or retracted research as evidence.

## Risks, next Changes and execution boundary

| Finding | Owner | Required action |
| --- | --- | --- |
| Fragmented mutable history, incomplete legacy envelope, client completion and simulator writes | C29 | Server-authoritative ledger/profile, dry-run reconciliation, no invented historic evidence, idempotency/atomicity, grants/RLS/two-user tests |
| One-question assessments, sparse concepts and no retention evidence | C30 | Reviewed coverage and concepts; no mastery/backfilled points based solely on old quiz score |
| Non-persisted achievements and absent simulator learning stages | C30 | Versioned criteria and capability-aware instrumentation; fidelity exposure |
| Manual communication lacks adaptive eligibility, frequency/quiet-hour/unsubscribe guarantees | C32 | Affirmative opt-in and independent delivery/evaluation contract |
| User-facing methodological explanations | C31 | English Help and contextual explanations from this contract; show actual deployed capabilities |
| Database access / migration reproducibility | C21/C27 release gates | Resolve remote PAM access and reconcile canonical migration history before production proof; C28 does not change remote state |

C28 is local contract work only. TERMO continues in its own project; its future adapter can import the generic validator with its own values and mappings. Cross-project production parity remains a later audit, not a claim of these local tests. Existing schema, application imports, rewards, content, emails and production are unchanged. Rollback is removal of the unused C28 artifacts and restoration of C28 documentation; no data rollback exists or is needed.
