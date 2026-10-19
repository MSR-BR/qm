# Acceptance criteria

Checkpoint 2026-10-19: local implementation and automated validation complete;
production authentication/byte checks, complete launch evidence, owner activation
confirmation and post-launch monitoring remain open. See `validation-evidence.md`
and `tasks.md`. This Change is not yet closed.

- Supabase JS is pinned to an exact version; a signed-in production check (owner
  performs the Google login) shows login, reload persistence and logout working.
- Un-mark/re-mark of a section yields at most one `section_complete` from that
  browser; database progress and points behave exactly as before. Covered by tests.
- Attribution TTL slides with consented activity and is still cleared on revocation.
  Covered by tests.
- `npm run test:analytics`, all Node tests, `npm run check`, `npm run validate:seo`,
  the stubbed browser consent script and `git diff --check` pass.
- Clean baseline and metric hierarchy are documented (R5–R6).
- `CODEX_CONTEXT.md` and `project-state.md` reflect the real C18/C35 status.
- Before activation, a read-only Ads snapshot matches every expected value in
  `tasks.md`; the owner confirmed activation in the executing session.
- After activation, readback shows QUANTUM keywords, ad, ad group and campaign
  ENABLED; TERMO and account defaults unchanged; landing/consent verified live.
- Monitoring plan, stop rules and rollback are recorded with timestamps.
