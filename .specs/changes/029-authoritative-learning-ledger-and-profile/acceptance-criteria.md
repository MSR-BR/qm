# Acceptance criteria

- [x] Concurrent retries and completion undo/re-completion cannot award twice locally.
- [x] Reward XP/count reconcile with the ledger; mismatches block new awards and are visible in the profile.
- [x] Browser clients cannot authoritatively set points, mastery, badges or message eligibility.
- [x] Anonymous/cross-user denial and own/admin-metadata/service behavior proven in isolated PostgreSQL.
- [x] Profile/ledger omit hidden answers, tokens and e-mails; provider errors are sanitized.
- [x] Synthetic historical dry run and count report reviewed before local test import; replay imports zero historical learners automatically.
- [x] Remote migration/deploy remain separately authorized; no remote writes this turn.
- [ ] Real historical dry run, authorized import and managed Supabase/production proof.

Streaks are behavioral legacy projections, not mastery. Assessments are recorded
atomically as limited evidence with zero new C30 rewards. Concepts/due reviews are
insufficient-evidence, missions/badges pending C30; these are not fabricated zeros
or claims that adaptive mechanics have shipped.
