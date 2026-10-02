# C33 — Candidate release runbook

Fresh target: QUANTUM `crasnnvdvujzxudmbakv` / `quantum_rebuild`.
Old target `plqiofznjlbpfufigpcp` is paused and must not receive migrations.
Public alias `https://quantummechanicsbook.app` switched successfully on 2026-10-02.
TERMO and Google Ads are out of scope. See `provider-replacement.md`.

Current release evidence: `release-receipt-2026-10-02.md`. Runtime commit
`041de5e` and deployment `dpl_5jG4jC9bVvbBjEu4GTKF8gSv5vWz` passed public
HTTP and isolated-browser smoke. Owner authenticated public-browser acceptance
is still pending. The earlier preparatory sequence below is historical.

## Current fresh-target sequence (supersedes original runbook below)

1. COMPLETE: unique baseline `20260926204825` installed through
   `--workdir supabase/fresh`; remote CLI reports up to date. Never apply the
   root's historical duplicate versions to this project or rewrite its baseline.
2. COMPLETE: 634 managed privilege/RLS checks, isolated policy tests, disposable
   Auth/REST exercises and source isolation/integrity. Accounts removed; 14
   private PDFs remain. See `fresh-installation.md`.
3. COMPLETE: QUANTUM-only Google Web client, callback to the replacement
   Supabase project and provider setup were completed separately from TERMO.
   The owner screenshot at 17:47 on 2026-10-02 confirms Google Audience is
   External and **In production**. Client secret values are intentionally not
   recorded here.
4. COMPLETE FOR PREVIEW: Preview uses only the replacement Supabase project and
   dedicated Google client. Deployment `dpl_FQycaHgdZ32m3qCVwVCyauhA69P1`
   built successfully after consolidating API handlers to satisfy the Hobby
   12-function limit. Authenticated learning-profile request returned the
   expected `learning-profile-v1`; disposable test accounts were removed and
   cleanup verified. This does not constitute production cutover or Google
   browser OAuth proof on the public domain.
5. PENDING: durable recovery evidence, final security review, exact candidate
   manifest/commit, and authenticated production-domain smoke. Production
   environment still points to the old paused Supabase project. Do not switch
   it or push a commit that auto-deploys until release gates pass and the
   production variable change is explicitly cleared by the approval system.

Fresh filesystem candidate is `fresh-candidate-manifest.json`. Verify with:
`node scripts/inspect-qm-release-candidate.mjs --fresh-target --verify
.specs/changes/033-unified-learning-release-integration/fresh-candidate-manifest.json`.
The historical manifest below is retained, not the current candidate.

Current recovery: old project is retained paused; schema can be reconstructed
from preserved baseline, and private PDFs remain local with hashes. There are no
learner records on the replacement. Do not claim this is a tested production
backup: establish/verify backup and restore before admitting real learner data.
Frontend rollback alone cannot make the paused old backend available.

Recovery rehearsal update (2026-10-02): the new project now has one real owner
account. A restricted temporary SQL snapshot (`schema`, `data`, `roles`, and
`supabase_migrations` schema/data) was successfully restored into a clean local
Supabase stack; the owner count and reviewed-source counts matched. Raw
`pg_dump`/`psql` restoration was **not** sufficient to preserve least privilege:
the fresh stack's default ACLs granted excess access to newly created tables.
After local-only application of
`node scripts/build-qm-restore-privileges.mjs | psql ...`, the local
`scripts/audit-qm-local-restoration.mjs` passed all 634 contract checks.
Any future recovery must repeat this ACL repair and audit before network
exposure. The restored local volume was deleted. The SQL snapshot is temporary
and contains private Auth data; secure, durable, encrypted/off-site retention
and Storage-object preservation remain separate release gates. Never commit the
dump or treat it as a managed Supabase backup. Exact evidence is in the C33
CPD preflight.

The original procedures below require a fresh-target revision before execution:
old history/import gates are superseded by the owner's empty-launch decision;
clean bootstrap, new OAuth/secrets, explicit security and app proof remain.
The existing manifest preserves the previous candidate/target receipt, not a
release approval for the replacement. Regenerate destination-bound evidence
after the bootstrap changes. Do not execute the old runbook unchanged.

## Candidate identity

`candidate-manifest.json` records the base Git commit, every release-input file
hash, aggregate payload hash and all migration hashes. This is a local snapshot,
not a new commit. Re-run `node scripts/inspect-qm-release-candidate.mjs --verify
.specs/changes/033-unified-learning-release-integration/candidate-manifest.json`
before requesting publication. Any mismatch requires a new manifest and affected
checks. Bind the eventual commit SHA and exact deployment ID to this receipt.

## Backend application order, after history resolution

| Order | Change | Migration suffix / purpose |
|---|---|---|
| 0 | Existing history | Confirm all prerequisites through C19/C16, resolve duplicate versions and optional helper |
| 1 | C21 | `20260924125315_repair_qm_authenticated_learning_flows.sql` |
| 2 | C27 | `20260925215027_explicit_data_api_privileges.sql` |
| 3 | C22 | `20260925230000_qm_optional_email_consent_default_off.sql` |
| 4 | C29 | `20260926112057_qm_authoritative_learning_ledger.sql` |
| 5 | C30 | `20260926120250_qm_adaptive_learning_modes.sql` |
| 6 | C32 | `20260926154500_qm_academic_evaluation_and_responsible_communication.sql` |

C28 is contract/data; C31 is public help and explainability. Neither has SQL.
Do not rerun a row classified as applied without reviewing its exact equivalence.
The C32 file was corrected locally in C33 before any known remote application;
if remote history unexpectedly contains its version, stop and use a new forward
migration, never overwrite the recorded applied SQL.

## Gates and operations

1. Establish read access and exact identity; execute metadata preflight. Resolve
   `history-reconciliation.md` using real history, then rehearse the reviewed
   mapping in a disposable Supabase stack, including Data API behavior.
2. Verify current backup/recovery capability and a restore rehearsal covering
   schema, grants and learner evidence. Record backup time, restore point,
   operator, procedure and result privately. The old screenshot's "No backups"
   is not a current recovery guarantee. Never reset production.
3. Review and approve exact SQL/hash set and any history operations separately.
   Preserve current production deployment/commit IDs as rollback targets; neither
   is inferred solely from `main` or the historical version label.
4. COMPLETE on the replacement project: baseline and additive migrations are
   installed; managed catalog, explicit grants/RLS and disposable Auth/REST
   flows passed. Preview's authenticated learning-profile endpoint is also
   proven. Keep the production-specific verification-matrix run pending.
5. Obtain a complete scoped private snapshot of profiles/reward events/ledger.
   Run `plan-qm-ledger-import.mjs` offline; review blocked accounts, counts and XP.
   C29 imports existing rewards with expected-count/XP guards; missing historical
   section awards are a separate C21 repair. Choose and document that sequence
   per snapshot to avoid double credit. No automatic mass repair.
6. Once every DB, recovery, OAuth, security and authenticated-flow gate passes,
   stage the exact candidate, commit, push and publish matching server/client
   together under the owner's existing CPD authorization. Verify the deployed
   commit and alias. A push may auto-deploy, so hold it until the backend is
   proven. Preserve all unrelated local work.
7. Test the real authenticated loop and failure cases on desktop/mobile. Record
   redacted evidence, timestamps, deployment ID, counts and cleanup results.
   Complete the owner's C15 review. C26 remains an independent SEO Change.

## Configuration readiness (names only)

| Setting | First release expectation |
|---|---|
| `PUBLIC_SUPABASE_URL` | Exact QUANTUM project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public key for that same project |
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_KEY` | One valid supported server-only credential; never in browser artifacts |
| `QM_EMAIL_ADMIN` | Responsible verified account or documented default |
| `QM_PUBLIC_BASE_URL` | Canonical HTTPS QUANTUM host |
| `QM_LEARNING_EMAIL_DELIVERY_ENABLED` | Absent or `false`; verify dispatch refuses delivery |
| `RESEND_API_KEY`, `QM_UNSUBSCRIBE_SECRET` | Needed only for separately authorized email activation; secret at least 32 characters |

Delivery activation also requires verified sender `hello@quantummechanicsbook.app`,
authorized test-recipient flow, current-consent and unsubscribe proof, provider
failure/retry tests and audited delivery/bounce evidence. The current code has no
scheduler or webhook; those require scoped implementation. Provider acceptance,
delivery and observed learner exposure are different facts. No exposure claim
may be inferred from transport success.

## Rollback and stop conditions

- Before application: withhold SQL/push/deploy. All historical files remain intact.
- During migration: stop at the first failure. Each new migration is transactional;
  inspect actual committed state before any retry. Do not run a reset or broad
  history repair. Preserve new learner writes.
- After publication: disable learning-email delivery first if relevant; restore
  the previously verified deployment. Keep additive DB tables and immutable
  evidence. Confirm older application compatibility in rehearsal.
- If reward writes are unsafe, narrowly revoke the affected service RPC only
  with authorized SQL; let reads fail visibly or remain available as designed.
  Restore privilege only after fresh checks. Never zero profiles or delete XP.
- Recover data only under a separately reviewed restoration plan that protects
  writes since the backup. Correct schema through a new forward migration.
- Abort on cross-user data, unexpected PUBLIC grants, mismatched project/hash,
  unexplained XP differences, missing backup proof or failed authenticated save.

## Authorization boundary

The owner's C33 completion/CPD authorization permits the eventual scoped release
after all gates pass. It does not waive failed checks, authorize unrelated TERMO
changes, migration-history repair, real-data import, email activation or
destructive changes. Hold provider writes, push and deploy until the release
gates above pass; read-only diagnostics and local preparation may continue.
