# Notes

- Official Supabase guidance confirms that grants control object reachability while RLS controls rows; both are required.
- The 30 October 2026 platform change affects future `public` objects on existing projects. C27 also removes historical implicit privileges so the repository contract remains exact on fresh and existing installations when applied.
- `service_role DELETE` is retained only for `qm_exercise_validation_reports`, because the owner-authorized disposable audit uses it to clean its own temporary report. It is not used by public or learner handlers.
- The migration was generated with Supabase CLI `2.117.0` after reading `migration new --help`.
- The attached handoff and repository copy were identical in substance.
- A disposable local Supabase replay exposed two pre-existing migration-history defects: duplicate `20260531` version prefixes and an unconditional revoke of `public.rls_auto_enable()` when that optional helper is absent. The validation copy used unique timestamp aliases and a guarded revoke only in `/tmp`; no canonical migration was renamed or rewritten.
- After those compatibility-only transforms, a clean start and a second `db reset --local --no-seed` both applied all 17 migrations, including C21 and C27. Effective table, routine, and sequence privileges matched the access contract; all 13 tables retained RLS; `db lint` returned no schema errors.
- C27 is locally implemented, but it is not release-complete until migration-history reconciliation and the separately authorized remote proof are complete.
