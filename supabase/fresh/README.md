# QUANTUM replacement database workdir

Target: `crasnnvdvujzxudmbakv` / `quantum_rebuild`, organization
`farevhlbtnmkuewoxhry`. Never use this baseline on TERMO or an existing QUANTUM.

The CLI-created migration `20260926204825_qm_clean_baseline.sql` composes the
21 historical source files without renaming them or fabricating their remote
history. `baseline-manifest.json` maps every source hash. The only compatibility
change guards an optional managed helper; pedagogical rules are unchanged.

Validate with `node scripts/build-qm-fresh-baseline.mjs` and
`node scripts/test-qm-learning-ledger-postgres.mjs --fresh-baseline` from the
repository root. The latter uses isolated PostgreSQL and synthetic Auth/Storage,
not the managed services. Managed role/API tests remain separately required.

For this destination all future migrations belong in this workdir. Generate them
with `supabase migration new NAME --workdir supabase/fresh`. Never regenerate an
already-applied baseline to change live schema; use a new forward migration.
Keep the root historical tree as evidence, not as the fresh project's CLI path.

Use explicit `--workdir supabase/fresh --project-ref crasnnvdvujzxudmbakv` when
the command supports both. Verify project identity and migration history before
every push. Do not put passwords, API keys or linked CLI caches in Git.

No source-PDF objects, learner records or Auth accounts are imported by baseline.
This workdir does not switch Vercel or authorize application deployment.
