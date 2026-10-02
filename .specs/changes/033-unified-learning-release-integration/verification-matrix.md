# C33 — Integrated acceptance matrix

Synthetic PostgreSQL roles do not establish production Auth/PostgREST behavior.
Each remote cell requires authorized disposable identities and cleanup receipts.
All public/protected HTML/API flows must use the exact deployed candidate.

| Surface | Anonymous | Learner A / own | Learner B targeting A | Responsible account | Server role |
|---|---|---|---|---|---|
| Book / Help / reviewed catalog | Public, Chapters 1–7 | Same | Same | Same | No privilege needed |
| Profile / progress / favorites | Reject private read/write | Read/write permitted subset | Deny or zero rows; no identity override | No implicit bypass of learner API | Exact grants / verified actor only |
| Assessment, Daily, review, retry | Cannot submit private evidence | Persist, reload, duplicate-safe | Deny forged actor, attempt or review IDs | Same learner boundaries | Narrow atomic RPCs; unaided evidence rules |
| Simulator cycles | Public simulator; no private save | Prediction → interaction → reflection → completion persists | No other actor's activity | Same learner boundaries | Source allowlist, order and duplicate checks |
| Points / ledger / badges | No direct awards | Read own; cannot manufacture awards | No cross-user mutation | No profile mutation through learner API | Reconcile ledger/profile; legacy guards; immutable evidence |
| Academic aggregate report | Deny | Deny | Deny | Allow via verified Auth identity | Aggregate RPC only; no individual response |
| Communication preview/dispatch | Deny | Deny | Deny | Preview allowed, delivery-off dispatch rejected | Versioned consent, caps, time zone, pause, reviewed source |
| Signed unsubscribe | Valid active-consent token only | Same token semantics | Old/tampered token cannot alter other/current consent | No bypass | Narrow preference update; XP unaffected |

Required database checks: exact 25-table/22-function/2-sequence access contract,
RLS flags/policies, explicit PUBLIC denial on privileged routines, no client access
to private source/scoring tables. Re-count from contract if snapshot changes.

Required learning journey: first login → required notices and optional unchecked
email → reviewed section completion → one award → refresh/no duplicate award →
assessment wrong/correct/hinted outcomes → linked review → changed-form retry →
Daily eligibility from studied reviewed material → simulator cycle → consistent
Journey snapshot → favorite statement/solution with rendered math.

Mastery requires separate sessions, delay, changed representations and unaided
success under the unchanged C28 policy. No reward for consent, no loss for errors,
no mastery from page opens. Locked Chapters 8–13 must be rejected at every layer.

Communication tests: missing/stale consent, timezone unknown, pause, 20:59/21:00,
06:59/07:00, same-day/rolling-seven-day cap, concurrent reservations, duplicate
request, opt-out after preview, stale unsubscribe after re-opt-in, provider key
separation per recipient, provider error, delivery flag off, no raw message body
or recipient in event storage. Delivery and reading are measured separately.

UI: 320 px and desktop, 200% text zoom, keyboard/focus, reduced motion, screen
reader review, loading/offline/retry. Reuse C31 checks where unchanged, but obtain
real authenticated production evidence after publication. Record unavailable
checks as NOT_CHECKED rather than accepted.
