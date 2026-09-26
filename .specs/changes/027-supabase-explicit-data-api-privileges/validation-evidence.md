# Validation evidence

Validated locally on 2026-09-25:

- `npm run check`: passed; 13 chapter files plus 13 tables, 9 functions, 2 sequences, and 17 migrations checked.
- `node --test tests/*.test.mjs`: 39/39 tests passed.
- `npm run validate:book-corpus`: 85 eligible sections; 10 deferred sections retained.
- `npm run validate:book-topics`: 85 sections and 74 curated topics passed.
- `npm run validate:book-topic-index`: passed.
- `npm run audit:exercise-sources`: passed; Chapters 1–7 only; no remote request.
- `npm run validate:seo`: 85 published sections passed.
- math, AI renderer, and AI context smoke tests: passed.
- Pó Mágico security fast check (`worktree`): 144 files inspected, both sensitive migrations detected, no findings, `PASS`.
- `git diff --check`: passed.
- Attached handoff and repository copy SHA-256: identical (`1edd947cd12252e7837c85a188b3b5741f0516bc4dec694fb6e9839502811ad9`).
- Disposable local Supabase CLI `2.117.0` start: all 17 migrations applied after temporary compatibility normalization of two historical replay defects.
- Disposable `supabase db reset --local --no-seed`: passed; the entire normalized chain replayed a second time.
- Effective table grants: exactly 18 role/object rows matching the machine contract; no unplanned table privilege was present for `anon`, `authenticated`, or `service_role`.
- Effective routine grants: only `private.is_qm_exercise_validator()` for `authenticated`/`service_role`, plus the three server-only routines for `service_role`.
- Effective sequence checks: `service_role` has `USAGE/SELECT` and not `UPDATE` on the two identity sequences; `anon` and `authenticated` have none.
- RLS catalog inspection: enabled on all 13 project tables.
- `supabase db lint --local --schema public,private --level error --fail-on error`: no schema errors.

Historical limitation:

- A direct reset from the canonical filenames remains blocked before C27 by duplicate legacy version `20260531` and, after aliasing, by an older unconditional revoke of an optional function. These defects predate C27 and were not rewritten because the same history may already be recorded remotely.

Not run by design:

- remote migration, advisors, `npm run audit:supabase`, disposable remote users, deployment, and production smoke tests: require explicit authorization and were not performed.
