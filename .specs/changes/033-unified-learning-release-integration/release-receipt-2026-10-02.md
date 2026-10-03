# C33 — Production release receipt, 2026-10-02

## Current authoritative status

The technical production cutover is complete. The public domain now uses only
replacement Supabase `crasnnvdvujzxudmbakv` and the dedicated QUANTUM Google
client. Google is the sole enabled login provider; email/password is disabled
by explicit owner choice. TERMO, its client/callbacks and the paused old database
were not modified. Learning-email delivery remains disabled.

**C33 user acceptance completed, 2026-10-02.** Owner first reported
“consegui logar e sair”, then answered “sim” to the explicit request to enter
the public site, open Personal Area, reload and confirm the session remained
connected. Login, Personal Area, reload persistence and sign-out are therefore
owner-confirmed on the requested public-site flow, not agent-observed browser
evidence. This closes the remaining acceptance check. Off-site backup remains
the separately documented operational follow-up, not a completed protection.
Browser control inside Codex failed
before attaching due an unrelated symlinked writable root. No personal browser
cookies/tokens were read and no consent was accepted for the owner.

## Exact release and verification

After the receipt push, GitHub-triggered production deployment
`dpl_57wHRqRPvkn94tjhEsiHNzRSGzx2` (`qm-2ggqrfi7f-msr-brs-projects.vercel.app`)
was READY and served the public domain at commit `f355191cedb1207d8dddb5f916c27d0629690775`.
Post-push backend/client and source-denial smoke plus the full HTTP audit passed;
Git was clean and synchronized with origin/main. The entries below identify the
original manually promoted runtime build, not a contradictory current target.

- Integration commit: `4cb95a82ce9d95f780cc4f31c9cb709ef83abaf2`.
- Runtime fix/released commit: `041de5ee7c160f3b47e04a013d371057fd2f2760`.
- Promoted deployment: `dpl_5jG4jC9bVvbBjEu4GTKF8gSv5vWz`, READY,
  `https://qm-clqkih0kq-msr-brs-projects.vercel.app`.
- Public domain: `https://quantummechanicsbook.app` independently resolved to
  that deployment after promotion.
- Pre-deployment candidate hash (382 files):
  `f52fa9d73566641312e1fd0465d4337650e9e2d080db57b707e3f700eed75a03`.
  Subsequent auditor/docs-only changes have a new repository fingerprint, not
  a claim that those tool changes were already present in this runtime build.
- Build succeeded in the Free/Hobby configuration with 11 API entrypoints.
- 86 Node tests, content/privilege checks, SEO validation and whitespace pass.
- Public HTTP audit: 99 sitemap URLs, 85 reviewed sections, 65 local assets,
  9 API boundaries; zero errors/warnings. The first run expected the prior
  legal-only release's 98 URLs; confirmed the added `/help.html` accounts for
  the 99th, then updated the audit's explicit count/help/legal assertions.
- Automated fresh-Chrome smoke: 12 desktop/mobile/zoom scenarios; zero errors
  or warnings. Includes math, simulator, assessments, daily challenge, help,
  anonymous journey and locked chapter. It is not an authenticated OAuth test.
- Public config selected new backend and dedicated client, with no server-secret
  patterns. New public Auth settings enable Google alone. Google authorization
  returns 302 to accounts.google.com with the exact dedicated client and
  replacement callback. Earlier actual Google sign-in and preference GET/save
  were proven locally; managed/Preview authenticated learning tests and cleanup
  are recorded in the preflight.
- `/lib/qm-chapter-quiz-catalog.mjs`, specs, administrative scripts and migration
  paths return 404 on the promoted domain. Public profile without a session
  returns 401. Both public methodology documents and legal/help pages return 200.
- Error-level Vercel log query for this deployment over the last 20 minutes
  returned no entries. This is a bounded release check, not continuous monitoring;
  no new drain/monitor was configured.

## Packaging finding and repair

The first isolated build `dpl_2AjzxoJSBxszd2vXKUSXVb8rfAKE` served a server
module despite a fallback rewrite. It was NOT promoted to the public domain.
Vercel filesystem precedence was verified against its official configuration
documentation. A terminating `routes` 404 rule now precedes filesystem serving;
the isolated replacement build and promoted domain both prove denial. Specs,
scripts, tests, migrations, local env files and private PDFs are excluded from
the uploaded package. The two linked public docs are intentionally retained.

## Recovery, security and remaining operational limits

All 634 managed catalog/grant/RLS assertions pass. The Advisor password-leak
warning remains visible, but the password provider is verifiably disabled;
reopening it requires review. Eight internal-table INFO items are expected.

The SQL restore was rehearsed on a disposable local stack, including required
post-restore ACL repair and 634 checks. Durable AES-256-GCM archive:
`/Users/marioreis/Library/Application Support/QUANTUM/backups/c33-2026-10-02.qmbak`.
SHA-256 `54ac798337290b397cf410d7ffc5e9717dbfdfc31a01d8518e6874a03d5c3f1e`.
Key is in Keychain (`QUANTUM recovery archive`), not Git. Verification checks all
five SQL files, fourteen PDFs and tamper rejection. Off-site/continuous retention
and device-loss protection are NOT established; writes after the snapshot are
not covered. Arrange an off-site encrypted copy before broader learner rollout.

Previous frontend: `dpl_FcudtUG1p2vKyfW4W4Y3tDmq8gMR`. Rolling back to it
restores its frontend, NOT a usable backend (it points at the paused old project).
Prefer a corrected frontend with the new backend preserved. Database recovery
requires the documented restore/ACL/storage procedure and fresh scoped authority;
do not blindly restore or unpause the old database.

Git push/clean-state verification follows the receipt commit; use Git remote
readback rather than assuming a commit was pushed. Future auto-deploys must be
checked against the same public backend/configuration and security boundaries.

Skills: Supabase, Vercel deployment and routing guidance informed the provider,
release and source-denial checks. No delegated agent or model switch performed.
