# Validation record

Date: 2026-09-24

## Passed locally

- `node --check` passed for the reward handler, assessment handler, simulator runtime, reconciliation library/script, and Supabase audit script.
- Extracted inline JavaScript from `assessments.html` passed `node --check`.
- Focused suite passed: 21 tests.
- Complete suite passed: 35 tests.
- `npm run check`: 13 chapter files valid.
- Book corpus/taxonomy/index: 85 eligible sections and 74 curated topics valid.
- Exercise-source audit: 85/85 eligible sections represented; no errors.
- SEO validation: 85 published sections valid.
- Math contract, AI context package, and AI renderer smoke tests passed.
- Migration contract verifies `security invoker`, valid PL/pgSQL delimiters, server-only execute permission, and Chapters 1–7 eligibility.

## Read-only production observations

- Exact linked QM project: `plqiofznjlbpfufigpcp`.
- The linked migration history contains remote entries not mirrored by the local directory and must be reconciled before applying C21.
- The reconciliation dry-run returned HTTP 403 before migration application. This is expected from the currently missing explicit service-role grants and changed no data.

## Pending remote validation

1. Explicitly authorize and apply the migration to the exact QM project.
2. Run the reconciliation dry-run again and review counts.
3. Explicitly confirm the one-time reconciliation apply.
4. Run `npm run audit:supabase:learning` and confirm temporary-user cleanup.
5. Deploy, then complete authenticated browser checks for assessment save/history, one reward, duplicate suppression, and one simulator exploration.
6. Attach sanitized evidence and only then close C21.
