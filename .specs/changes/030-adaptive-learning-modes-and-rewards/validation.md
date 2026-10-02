# Validation

- Deterministic fixtures for selection, spacing, evidence weighting, prerequisites, and mastery.
- Reward/idempotency and own/cross-user tests through C29.
- Source/provenance and fail-closed tests for AI and locked content.
- Simulator capability tests for open/predict/interact/reflect/complete distinctions.
- Browser tests at 320 px, zoom, keyboard, focus, screen reader announcements, reduced motion, offline/retry, and duplicate actions.

## Local result — 2026-09-26

- Deterministic engine/catalog tests: passed.
- Full Node suite: 66/66 passed.
- Project/content/access contract: passed (13 chapter files; 24 tables, 20
  functions, 2 sequences and 20 migrations classified).
- Isolated PostgreSQL transaction suite: passed, including 504 table and 60
  function privilege assertions, concurrent deduplication, São Paulo day-boundary
  and rolling seven-day reward caps, cross-user isolation, rollback and mastery guard.
- Browser audit: 11/11 scenarios passed with no warnings or errors, including the
  Daily Challenge and simulator cycle at mobile widths and assessment at 320 px / 200% text size.
- Content corpus/topic/source/SEO, math and AI rendering/context gates: passed.
- Pó Mágico security fast check (`worktree`): PASS, 70 files inspected, four
  sensitive triggers classified. `git diff --check`: passed.

Not checked by design: managed Supabase/PostgREST behavior, actual learner history,
real authenticated production sessions, production observability, remote migration,
commit, push or deployment.
