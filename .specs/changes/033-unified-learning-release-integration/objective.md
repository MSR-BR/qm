# C33 — Unified learning release integration

## Current execution checkpoint, 2026-10-02

Google-only Auth, recovery and the approved production cutover are complete.
Deployment `dpl_5jG4jC9bVvbBjEu4GTKF8gSv5vWz` is live and public HTTP /
fresh-browser smoke passes. See `release-receipt-2026-10-02.md` for current
evidence and recovery limitations. Owner confirmed login/logout and subsequently
confirmed Personal Area / reload persistence in response to the explicit
public-site test request. C33 acceptance is complete; this browser evidence is
owner-reported, not agent-observed. Historical rejection and pending-cutover
checkpoints below are superseded by the current receipt.

## Scope amendment — owner authorized completion and CPD, 2026-10-02

Owner requested “conclua de uma vez por todas e depois cpd limpo”. This authorizes
completion of C33 and commit/push/production deployment of the validated QUANTUM
candidate. The earlier missing-CPD-authorization gate is superseded. It does not
waive failed release/security checks, authorize TERMO changes, activate C18/email
delivery or authorize deletion of existing work to obtain a clean checkout.
Current execution evidence and concrete remaining blockers are in
`cpd-preflight-2026-10-02.md`; do not ask for the same CPD permission again.

## Scope amendment — dedicated Google OAuth resumption, 2026-10-02

The owner ended the infrastructure pause and authorized configuration/testing
of a QUANTUM-only Web client in existing `quantum-book-auth-20260926` and its
Google provider in `quantum_rebuild` / `crasnnvdvujzxudmbakv`. Inspect current
state first; secrets only in panels/secure storage. Do not modify TERMO or its
shared client. The owner later authorized completing the OAuth setup and C33,
including CPD, on 2026-10-02. That authorization remains subject to the actual
release gates; the app must not cut over while Audience remains Testing. Execute
available preparation and report concrete blockers. Do not restart the general
cloud audit. This supersedes the pause and old shared-client instructions, not
the C33 release/security requirements.

## Scope amendment — authorized provider replacement, 2026-09-26

The owner subsequently authorized pausing/deleting only old QUANTUM and creating
a fresh Free project, stating old learner data need not be retained. The
recoverable pause option was used. New `crasnnvdvujzxudmbakv` has successful
API/CLI read-only SQL proof; old `plqiofznjlbpfufigpcp` is paused, not deleted.
See `provider-replacement.md`. This bounded provider operation is an exception
to the original local-only scope below, not authorization to publish an
unvalidated application, modify TERMO or purchase a plan. Old data/history
reconciliation is no longer a prerequisite for the empty replacement, but clean
bootstrap, explicit grants/RLS, role/learning proof and release gates still are.

Subsequent “Segue” authorized fresh schema/auth preparation and tests. The new
baseline is installed and managed role/learning tests pass; private reviewed
source PDFs are provisioned. The dedicated Google client/provider is configured,
the owner-confirmed Audience is In production, and target-bound Preview has
passed an authenticated profile request with verified disposable-account
cleanup. See `fresh-installation.md` and `cpd-preflight-2026-10-02.md`.
Production app connection switch and clean CPD remain pending on explicit
recovery/security/production-smoke gates; a production environment update was
rejected by the approval reviewer and must not be retried through another path.

Prepare one reviewable QUANTUM release candidate covering C21/C22/C27–C32,
preserving the shared pedagogical policy, existing learner records and TERMO's
independent execution. Local implementation is not production acceptance.

## Requirements and scope

- Inventory the exact local candidate with SHA-256 hashes, migration order and
  duplicate versions; do not rename previously applied history without evidence.
- Compare remote history read-only if account access permits it. A denied read
  is a blocker, not proof that a migration is missing or applied.
- Replay the integrated SQL in isolated PostgreSQL, including C32 communication
  and evaluation. Repair diagnosed defects in unpublished local code and test
  the repaired behavior. No learner data is used in these tests.
- Prepare backend-before-frontend rollout, identity/role matrix, historical
  reconciliation, recovery requirements and post-release acceptance checks.
- Keep communication delivery disabled through the first release.
- Preserve the established gamification policy; do not start C18 or modify TERMO.
- Owner authorized commit/push/deploy after C33 gates pass; that authorization
  is not itself evidence that the gates passed.

## Tasks / acceptance

- [x] Identify and fingerprint candidate and migration dependencies.
- [x] Record remote read outcome and concrete history reconciliation procedure.
- [x] Validate all SQL and C32 functions with synthetic data.
- [x] Record focused regression and security results.
- [x] Prepare rollout/rollback, environment names and role/learning matrix.
- [x] Update canonical project state; state remaining production gates explicitly.

Overall C33: **completed, 2026-10-02. Production cutover, managed security and
recovery checks, CPD and public smoke passed. Owner confirmed the remaining
Google login / Personal Area / reload / logout acceptance flow.** Off-site
backup remains a separately recorded operational follow-up.

## Risks

Duplicate historical versions prevent CLI replay; an invented mapping could
mark unapplied SQL as applied. Missing production grants or schema break learner
flows. Unreconciled legacy balances corrupt rewards. Provider acceptance cannot
prove learner exposure. Unknown backup/restore state blocks production repair.

## Model route

Planned: `gpt-6-astra / high`. Fallback: `gpt-6-sol / xhigh`.
Actual: GPT-6 family stated by runtime instructions; exact variant and reasoning
tier are not exposed. No model switch or delegated agent execution asserted.
Reference: `.specs/po-magico-reference.md`; `S3_SENSITIVE`.
