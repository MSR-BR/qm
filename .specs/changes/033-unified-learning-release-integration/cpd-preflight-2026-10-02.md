# C33 — Authorized CPD preflight, 2026-10-02

## Superseding outcome

Production cutover and public smoke completed; see
`release-receipt-2026-10-02.md` for authoritative current status, exact artifact,
recovery limitations and outstanding owner browser acceptance. The sequence
below preserves historical preflight evidence, not current blockers.

## Current execution — production configuration prepared; deployment pending

The same scoped four-variable Production operation was resubmitted for approval
with Google-only Auth, authenticated Preview, 634 access checks, restored SQL
and verified encrypted recovery evidence. It was approved and executed; this
supersedes the earlier rejection/pending-variable checkpoints below. Production
configuration now selects `crasnnvdvujzxudmbakv`, its publishable/server keys and
the dedicated QUANTUM Google client. The public client-ID variable required
removing/recreating that single Vercel variable as public config; no OAuth client
or secret was revoked. Secret values stayed in memory/stdin and provider storage.
Email delivery remains disabled. TERMO and the old database were not modified.

The incumbent public deployment is still `dpl_FcudtUG1p2vKyfW4W4Y3tDmq8gMR`;
environment preparation does not mutate its runtime. Build the committed
candidate with Production settings and `--skip-domain`, inspect/test that exact
artifact, then promote only after those checks pass. Rollback can restore that
frontend deployment, but its old paused backend is NOT a working data rollback;
preserve the new backend and use the rehearsed recovery procedure if needed.

Packaging review excludes specs, administrative scripts, migrations, source PDFs,
tests and local env files. Two public help/reference documents remain included.
Server modules remain in the function bundle but `/lib/:path*` must return 404
through a deny handler; test the deployed behavior rather than assuming rewrite
precedence. Twelve API entrypoints remain within the current plan limit. All
85 Node tests, content/privilege checks, SEO checks and diff whitespace checks
pass. Regenerate the fresh manifest after final source changes. Full public
Google browser login/reload/logout is still distinct from managed API proof.

## Latest — owner authorized Google-only Auth; recovery preserved

The owner explicitly chose “so google sem email/senha”. A scoped Management
API PATCH changed only `external_email_enabled` to false on `quantum_rebuild`
(`crasnnvdvujzxudmbakv`). All other Auth settings compared equal. The first
public read was still propagating; a subsequent read confirmed Google is the
only enabled provider. Password login returns HTTP 422 /
`email_provider_disabled`; Google authorize returns 302 with the dedicated
client and the replacement project's callback. Existing identities remain one
Google owner. No password users were removed and no email was sent.

Post-change catalog audit: 634/634 PASS; one owner, zero ledger rows, fourteen
sources/objects. Advisor still reports `auth_leaked_password_protection` WARN
and eight expected server-only INFO items. The password warning is inapplicable
to the current verified Google-only login surface, not a cleared Advisor
finding. Re-enabling password Auth requires a new security review. The remote
password-fixture audit now stops before creating users when email Auth is off;
do not re-enable it solely to rerun fixtures. Earlier successful managed-flow
and authenticated Preview evidence remains recorded.

The rehearsed SQL snapshot (2026-10-02 17:10:43 BRT) and all fourteen private
PDFs are now preserved in a durable AES-256-GCM archive outside the repository:
`/Users/marioreis/Library/Application Support/QUANTUM/backups/c33-2026-10-02.qmbak`.
SHA-256: `54ac798337290b397cf410d7ffc5e9717dbfdfc31a01d8518e6874a03d5c3f1e`.
The key is in macOS Keychain, service `QUANTUM recovery archive`, account
`crasnnvdvujzxudmbakv-c33-2026-10-02`; no key is recorded in Git/logs.
`node scripts/archive-qm-recovery.mjs --verify` decrypts and verifies all five
SQL files and fourteen PDFs, and rejects tampering. `--extract` prepares a new
restricted temporary recovery directory; it never restores a remote database.
The SQL restore/ACL rehearsal is documented below. This is durable local
recovery, not a managed/off-site backup or continuous backup; device loss and
writes after the snapshot are not covered. Off-site retention remains an
operational follow-up, not evidence fabricated for this empty-launch release.

The full generated fresh manifest was successfully regenerated and verified;
the previous failed whole-file patch no longer blocks preparation. The previous
Production-variable rejection must be respected: submit the same bounded
operation for review with these new results; never use an alternate mutation
path to evade the review. No public-domain switch is implied by these results.

## Latest execution — Google production status and authenticated Preview, 17:55 BRT

The owner's screenshot now confirms Google Auth Platform → Audience is
**In production**, user type External, with 0/100 users. This supersedes the
earlier Testing/disabled-Publish checkpoint below and closes the OAuth audience
publication gate. The dedicated QUANTUM client and replacement-Supabase callback
are configured; no TERMO client/configuration was changed.

Preview deployment `dpl_FQycaHgdZ32m3qCVwVCyauhA69P1` was built with the
replacement project and dedicated public client settings. Because the Hobby
plan permits 12 Serverless Functions, five learning endpoints are consolidated
behind `api/qm-learning.js` and Vercel rewrites preserve their public paths. The
deployment built successfully. A protected Preview call to
`/api/qm-learning-profile` using a disposable authenticated identity returned
the expected `learning-profile-v1` payload. The fresh-Supabase acceptance audit
completed with `complete=true`, `cleanupVerified=true`, two disposable users,
and `previewAuthenticatedProfile=true`; the two test accounts were removed.
No JWT, client secret, or Supabase secret is recorded here.

This proves the authenticated API/profile path against the new backend from
Preview, not the real Google browser redirect on the public domain and not the
production domain's configuration. Production Vercel variables still point to
the old paused project. A prior request to update four Production variables was
rejected by the approval reviewer because the production cutover and recovery
gates were not yet proven. Do not retry through another mechanism. Keep CPD
open until durable recovery/security review, final manifest/commit, and
production-domain authenticated smoke are addressed and any required approval
is granted.

The API consolidation and rewrites are local candidate changes. Validation
after this addition: `node --test tests/*.test.mjs` 85/85 PASS;
`npm run check` PASS; `npm run validate:seo` PASS for 85 sections;
`git diff --check` PASS. The exact fresh candidate manifest must be regenerated
after all code changes.

## Sequencing update — Google Audience published

The owner reports the dedicated QUANTUM project's Google Auth Platform →
Audience now reads **In production** (screenshot at 17:47, 2026-10-02), with
user type External. This closes the Google Audience publishing gate. It does
not by itself prove OAuth callback exchange on the replacement backend or app
production readiness; complete the authenticated browser and deployment checks.

Proceed with the remaining C33 recovery, security, authenticated-flow and
exact-candidate checks under the owner's existing CPD authorization. No TERMO
change is in scope.

## Historical checkpoint (superseded) — Branding completed; Audience was Testing

The owner reports that the Google Branding links have been entered, but a
direct owner readback of Google Auth Platform → Audience still says **Testing**.
This is not public OAuth publication. The Codex computer-control runtime failed
before it could attach to the authenticated browser because an unrelated
symlinked writable root was rejected; the available Google Cloud CLI session
cannot read or publish the regular OAuth Audience state. The owner has been
asked to use **Publish app** on the dedicated QUANTUM project's Audience page.
Do not infer publication from successful Branding save or from the owner's
test-user login. Verify **In production** before public cutover; do not touch
TERMO's Google project/client.

The C33 local candidate passes `npm run check`, `npm run validate:seo`,
`git diff --check`, and all **83** Node tests, including the new
restore-privilege regression test. Read-only managed audit
still passes 634/634 grants/RLS checks, with eight expected server-only INFO
items and one `auth_leaked_password_protection` WARN. Official Supabase guidance
states leaked-password protection is a Pro-and-above feature; the Free project
cannot clear that warning by merely changing the current setting. Password
Auth is enabled on the new target, although the public app currently uses
Google OAuth. Read-only Auth config confirms `external_email_enabled=true`,
`external_google_enabled=true`, `password_hibp_enabled=false`, and signup is
not globally disabled. Read-only `auth.identities` counts show exactly one
Google identity and no email/password identity. The owner has been asked for a
specific choice about disabling the unused email/password provider. No Auth
method was disabled and no paid-plan purchase was made.

### Recovery rehearsal, local only

On 2026-10-02 a fresh-target logical export succeeded through the linked CLI:
schema, data (including Auth and Storage metadata), roles, and separate
`supabase_migrations` schema/data. Files are in a mode-0700 temporary directory
`/private/tmp/qm-c33-backup.dXLQcr`; each SQL file is mode 0600. This is a
**temporary local snapshot, not durable/off-site backup**. The SQL contains
private owner Auth/session data; never commit, attach, print or upload it
unencrypted. Storage object bytes are not part of the database dump. The 14
private PDFs were independently re-read from the new project and all byte
counts/SHA-256 hashes matched the local source inventory (8,987,391 bytes).
The roles export is retained for recovery review; the clean local Supabase
stack already provisioned its managed roles, so that file was not replayed.

A first data replay onto a baseline-seeded local stack failed on duplicate
reviewed-question IDs and rolled back atomically. A second, clean local
Supabase stack accepted `schema.sql`, `data.sql`, migration-history schema and
history data, each in a transaction. Readback showed 1 Auth user, 14 book
sources, 14 Storage object metadata rows, 85 reviewed sections, 0 ledger rows
and 1 migration record. A crucial security finding: a raw logical restore into
the fresh local stack inherited broad default ACLs, even though the remote
source was least-privilege. `scripts/build-qm-restore-privileges.mjs` now emits
post-restore ACL repair from the versioned access contract; after applying it
**only to the disposable local copy**, `scripts/audit-qm-local-restoration.mjs`
passed 634/634 table/function/sequence grant and RLS assertions. The local
restore stack and its owner-data volume were then stopped/deleted; the remote
project was not mutated. Recovery requires this ACL step and a fresh audit,
not just `pg_dump`/`psql` success. A durable encrypted/off-site copy and an
actual production-target rollback/smoke plan are still pending.

No commit, push, full candidate deployment, production environment switch, or
TERMO change occurred at this checkpoint. The earlier legal-only deployment
below remains the public version. C33 is **not** clean CPD yet.

The isolated local server's public config points only to the replacement ref,
has a public key and dedicated Google client, and keeps analytics disabled.
Automated browser smoke reached the book and anonymous Study journey; the
profile endpoint denied unauthenticated access with HTTP 401. This does not
replace authenticated browser/reload/logout proof or exact deployment smoke.

## Later legal-only production release — 2026-10-02

After this preflight, the owner confirmed that Google Branding saved the
application homepage without the privacy/terms fields. To provide real public
URLs without releasing the unfinished C33 candidate, an isolated package was
assembled from Git revision `7a2a3cf`, whose public home/index/CSS/SEO asset
hashes matched the then-current production deployment. Only home/index footer,
sitemap/audit count, and new legal pages/CSS changed. Preview
`dpl_FupNRj9JRt5LjhFYRy9mBtGqVFLn` passed 200 checks. A production-target
build used `--skip-domain`; its `/api/public-config` hash matched the incumbent
production response, demonstrating no public backend configuration switch.
After removing an unavailable help-page link from the legal-only package,
production deployment `dpl_FcudtUG1p2vKyfW4W4Y3tDmq8gMR` was tested and
promoted to `quantummechanicsbook.app`. Direct readback found both legal pages,
CSS, and landing/app links HTTP 200 with the correct canonicals; the public
privacy page hash matched the final deployed file. The post-release production
audit passed: 98 sitemap URLs, 85 reviewed search sections, 62 assets, 9 API
boundaries, zero warnings and zero errors. No TERMO, Google provider, Supabase
schema, Vercel environment variable, or QUANTUM backend target changed. The
owner can now enter the two verified URLs in Google Branding. Google Audience
publication, remaining recovery/security gates and C33 clean CPD are still open.

## Decision and scope

Owner authorized completing C33 followed by clean commit, push to main and
production deployment. Authorization is now present; readiness is not implied.
Do not touch TERMO, weaken security gates, activate learning email/C18, erase
worktree changes or report clean CPD without matching commit/deployment evidence.

## Evidence collected in this execution

- Existing candidate remains exact: base `f667621fd4bd646f4c79844899a95342171b594e`,
  377 payload files, SHA-256
  `bee86b08ab55a651dd690c4ba058c18076eefd5b032854a444df1cbfb30d8f2e`.
- All 82 Node tests pass. Content/privilege check passes (25 tables, 22 functions,
  2 sequences, 21 historical migrations). SEO validation passes for 85 published
  sections. `git diff --check` passes.
- New-target read-only catalog audit passes 634 checks. Installed history remains
  the single `20260926204825 / qm_clean_baseline`. One owner account, zero ledger
  rows, 14 book-source records and 14 private objects are present.
- Local runtime logs now show authenticated preference GET 200, PUT 200 and
  subsequent GET 200. No tokens, identity or consent values are logged. The prior
  individual Auth read established actual Google sign-in at the new target.
- Docker Desktop started; existing isolated `qm-c29-disposable-20260926` container
  resumed. Fresh-baseline replay passes again: 525 table and 66 function checks,
  12 concurrent awards deduplicated to one, assessment/review/retry/daily,
  simulator stages, isolation, mastery guards, timezone/day/week caps,
  communication opt-out/erasure and transaction rollback. Test database:
  `qm_c29_1790968026025`. This is synthetic replay, NOT a remote backup restore.
- Vercel REST identity verified: project `qm`,
  `prj_A9ZEdGd9hXOqAsacRPtIcKUaU8tq`, team
  `team_jQuUBnU7RDJh0O3XASyu1WeS`, GitHub `qm`, production branch `main`.
  Existing production is READY: `dpl_Bt6LNWEzW6bh6gyoedCF7vx4cJ2j`,
  `qm-fpqw4asva-msr-brs-projects.vercel.app`. No environment values printed.
  Connected Vercel tool has contradictory parameter schemas; authenticated
  official REST read succeeded instead. Cached CLI 62.2.0 is available.

## Resolved release blocker: Google public audience

At the earlier checkpoint, the owner-provided screenshot confirmed **Branding
changes saved** with the application homepage `https://quantummechanicsbook.app`;
the privacy-policy and terms-of-service fields remained empty. The QUANTUM checkout now has public,
linkable `privacy.html` and `terms.html` pages, visible links on the landing and
reading-app footer, SEO canonicals, and sitemap entries. Local HTTP returned 200
for both pages; `npm run seo`, `npm run validate:seo`, `npm run check`, and the
learning-help tests passed. Both public URLs still returned HTTP 404 before
deployment. Do not enter them in Google Branding or claim Audience publication
until a release serves both pages publicly and their response/content is checked.

At that earlier checkpoint, read through the Codex embedded browser in the
dedicated Google project:

- Audience status: **Testing**, user type **External**.
- **Publish app** is disabled (native accessibility `enabled=false`).
- Google explicitly requires completing configuration on the Branding page.
- Branding has app name QUANTUM and existing support/developer email, but
  application homepage and privacy-policy URL were empty when inspected.
- A native-accessibility attempt entered the homepage and invoked Save, but
  returning to Audience still showed Testing, disabled publication and the same
  incomplete-Branding notice. Do not infer persistence from input/click success.
  Browser form control remains unreliable; no successful Google publication is
  claimed. No secret/client/callback was rotated or changed in this execution.

Need complete and save the dedicated project's Branding, resolve any displayed
validation errors, then publish Audience and verify **In production**. Do not
claim all Google users are served based solely on the owner's successful login.
Do not fabricate a policy URL or reuse TERMO branding/client as a workaround.

## Other gates still pending / observations

- Confirmed additional Security Advisor warning:
  `auth_leaked_password_protection` (WARN); password HIBP setting false and email
  provider enabled. Eight server-only RLS/no-policy INFO items remain expected.
  Do not silently accept the warning, disable authentication methods, buy a plan,
  or claim zero security warnings. Review applicability/remediation before release.
- A recoverable remote snapshot and restore rehearsal still need proof. Synthetic
  SQL replay/transaction rollback is not a production-data restore. The new owner
  account must now be preserved; the old paused backend is not a usable rollback.
- End-to-end app/profile/logout and exact deployment smoke still need completion.
  The temporary OAuth test runtime deliberately does not serve all learning APIs.

## Actual outcome / continuation

No Vercel environment mutation, commit, push, deployment, database mutation,
TERMO modification or production cutover in this preflight. Existing work stays
intact. Do not label the repository clean or C33 complete.

Resume from Google Branding/publication, security/recovery gates, same-target
staging and app proof; freeze the validated candidate, then perform the already
authorized CPD and record commit/deployment/alias/readback. Preserve scoped
secrets in memory/provider storage and keep communication delivery disabled.
Skills used: Supabase; Vercel environment, deployment, CLI/API, verification and
browser guidance. Exact runtime model variant is not independently attested;
no model switch or delegated agent execution was performed.
