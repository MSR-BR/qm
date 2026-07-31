# QM — separation from the TERMO Supabase project

## Decision

Create a dedicated Supabase project for Quantum Mechanics (QM). Keep TERMO on the existing shared project. The paused Bola/Tree project remains untouched.

Implemented project: `quantum_mechanics` (`plqiofznjlbpfufigpcp`), hosted in South America (São Paulo), `sa-east-1`.

## Why

- QM will store private book and solution PDFs used by its server-side exercise generator.
- QM and TERMO need independent database schemas, Storage buckets, Auth configuration and security review.
- Future QM changes must not risk TERMO data or authentication.

## Scope

### Included

1. Create a new Supabase project for QM in the selected organization and region. **Done.**
2. Apply the QM migration history and verify tables, RLS and the private `qm-book-sources` Storage bucket. **Done.**
3. Configure Google Auth and QM redirect URLs in the new project. **Done.**
4. Add the new QM URL, publishable key and server-only service key to the QM deployment environment. **Done.** The service key remains server-only and is never exposed to the browser.
5. Upload the six Chapter 1–3 theory and solution PDFs to the private bucket, with integrity metadata.
6. Move only QM-owned data needed by the live app (not TERMO data), after an inventory and backup.
7. Point the QM deployment to the new project and run authenticated exercise-generation and validation checks.
8. Preserve the old shared QM records until the new deployment is validated and a rollback window has passed.

### Explicitly excluded

- Changes to TERMO schema, credentials, deployments or user data.
- Reactivating, deleting or modifying the paused Bola/Tree project.
- Deleting QM data from the existing shared project during the initial migration.

## Data inventory before copying

| Resource | Current role | Migration action |
| --- | --- | --- |
| `qm_exercise_validation_reports` | QM professor/AI validation history | Export and import after schema is created |
| QM saved-exercise tables, if present | User-owned QM study data | Export/import only after confirming ownership and RLS fields |
| Auth users | Shared identity system | Do not copy passwords; configure Google login in QM and require a fresh sign-in |
| Existing shared Storage | Not yet confirmed as QM-owned | Do not copy by default |
| New book PDFs | QM-only private sources | Upload only to the new project's `qm-book-sources` bucket |

## Rollout order and rollback

1. Create and configure new project without changing production QM.
2. Validate schema, RLS, Storage, Google Auth and six PDF uploads in isolation.
3. Update QM deployment environment variables and deploy. The public production variables have been updated; deployment remains deliberately pending.
4. Test login, exercise generation, validation report submission and private source lookup.
5. Keep the previous QM environment values documented for immediate rollback.
6. Only after a successful review window, decide whether legacy QM rows in the TERMO project should be archived or deleted.

## Acceptance criteria

- QM and TERMO use different Supabase project URLs.
- No QM service-role key is sent to the browser.
- `qm-book-sources` is private and contains six verified PDFs.
- QM exercise generation reports a canonical book reference and passes the math-format contract.
- TERMO continues to function without schema or credential changes.
- All public/exposed QM tables have RLS enabled and appropriate policies.

## Remaining decision

- Whether existing QM user-owned saved exercises should be migrated. Because the dedicated project has new Auth user IDs, this requires an explicit one-off migration after the affected user signs in to QM; it must not copy old UUIDs blindly.

## Audit snapshot — 2026-07-31

### Verified

- The public production configuration served by `qm-beta.vercel.app` points to the dedicated QM project.
- The Google OAuth authorization endpoint returns a Google redirect using the QM callback URL.
- Anonymous access is denied for `qm_saved_exercises` and `qm_book_sources`; the latter remains private as intended.
- The content structure check and the book-context and math-contract smoke tests pass.

### Blocks before authenticated end-to-end tests

1. Apply the versioned migration `20260731_add_qm_saved_exercise_source_metadata.sql` before the next production deployment. The client remains backward-compatible during this short rollout window, but the migration enables permanent storage of provenance metadata.
2. The canonical corpus and thematic index are validated for the 44 mapped pages of Chapters 1–3. Additional chapters need their own reviewed PDF-to-page mappings before they can claim the same canonical-source coverage.

### Authenticated RLS audit — completed

The reviewer address was confirmed as `marioreis@id.uff.br`. With two temporary, password-confirmed QA users (created and removed by `npm run audit:supabase`), the following all passed against the dedicated QM project:

- private bucket server access;
- QA password login;
- create/read ownership isolation for `qm_saved_exercises`;
- rejected cross-user insert into `qm_saved_exercises`;
- create and ownership isolation for `qm_exercise_validation_reports`;
- denied access to private book-source metadata.

The local `.env.local` public URL and publishable key were also changed from the former shared TERMO project to the dedicated QM project.

### Exercise-generator hardening — completed locally

- The server now constructs a QM context package with a safe local HTML reader, canonical corpus, topic index, difficulty-aware supporting fragments and solution-convention guidance.
- The LaTeX normalizer and validator cover QM notation, including wave functions, \(\hbar\), hats, bras, kets, inner products and operator notation. Nested delimiters, dollar delimiters and raw equations are rejected or normalized before display.
- The endpoint returns source references, context-package metadata, math-contract diagnostics and the model-attempt record.
- The browser saves this provenance when the new columns are available; otherwise it performs one safe legacy insert so study data is not lost during rollout.
- `npm run check`, corpus/index validators, context and math smoke tests, and a local visual check of Chapter 3 item 3.11 all passed.
