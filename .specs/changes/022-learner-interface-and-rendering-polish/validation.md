# Validation

- Run syntax, project structure, full Node, content/source/SEO, math-rendering, and Pó Mágico security checks.
- Exercise every changed surface at 320 px, desktop width, keyboard-only navigation, text zoom, reduced motion, and screen-reader semantics.
- Verify English-only sharing through Web Share, mail, and clipboard fallbacks.
- Verify assessment duplicate suppression and one safe status message on success/failure.
- Verify every favorite opens complete content and renders supported math safely.
- Verify required acknowledgement and separate unchecked optional communication consent on first authenticated use and later withdrawal in Personal Area.
- Do not mutate Supabase, provider configuration, or production without separate authorization.

## Local evidence — 2026-09-25

- `node --check` passed for the new preference and assessment clients and the changed shared/server modules.
- `npm run check` passed: 13 chapter files and the explicit Supabase privilege contract (13 tables, 9 functions, 2 sequences, 18 migrations).
- `node --test tests/*.test.mjs` passed: 44/44.
- SEO validation passed for 85 published sections.
- Math contract and AI-renderer smoke gates passed.
- Local CDP browser audit returned no warnings or errors across desktop, 390 px, and 320 px scenarios.
- The 320 px assessment scenario also applied 200% root text size and reduced-motion emulation without horizontal overflow; keyboard focus remained visible.
- Manual local accessibility inspection confirmed the semantic assessment form, source link, single submit status, and sign-in handoff.
- A targeted S3 review found no new client secret, raw HTML injection path, anonymous database privilege, or client-controlled identity. The preference endpoint continues to derive identity from the verified bearer session and the migration creates no new exposed object.

Not run by design: authenticated production favorites/consent journey, remote migration, provider mutation, commit, push, or deploy.

## Release gate — 2026-09-25

- Result: `BLOCKED` for push/deploy.
- Candidate scope: C21, C22, C23/C28–C32 governance, and C27 accumulated local work on `main` over `7a2a3cf`.
- Deterministic worktree security check: `PASS`, 157 files inspected, three sensitive-surface triggers classified.
- Blocking dependencies: `QM-SEC-001` (required C21/C27 database contract not verified/applied remotely) and `QM-SEC-006` (canonical migration history is not directly reproducible because of duplicate historical versions and a legacy function-revoke assumption).
- Rollback before publication: withhold push and deployment; no production state changed.
- Smallest next gate: authorize a read-only local/remote migration-history comparison, approve the exact forward reconciliation and C21/C27/C22 SQL application, then run anonymous/own-user/cross-user/admin/service proof before a production deployment.
- Read-only comparison attempt: `npx supabase migration list --linked` with CLI `2.118.0` returned `403` because the current CLI account lacks the required project privilege. No database command ran and no remote state changed. Temporary or permanent project access must be restored before the comparison can be repeated.
