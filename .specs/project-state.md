# Quantum Mechanics — project state

## Classification

`INTERACTIVE_BOOK + EDUCATIONAL_MATERIAL + BOOK_OR_CHAPTER + APP`

## Current state

- Canonical branch: `main`.
- Last published learning baseline: C33 production integration on 2026-10-02; see its release receipt for the exact deployment and acceptance evidence.
- The public application is in English; project collaboration may be in Portuguese.
- Chapters 1–7 are reviewed and published. Chapters 8–13 are under editorial review and must not expose learning content, exercises, or indexed SEO pages.
- Production uses replacement Supabase `crasnnvdvujzxudmbakv` and a dedicated QUANTUM Google OAuth client. The old `plqiofznjlbpfufigpcp` project is paused and is not the production target. Any new remote mutation requires its own scoped authorization.

## Authoritative status and next work

- **C33 complete and published.** Its 2026-10-02 receipt is the source of truth for release, Google-only authentication, security and rollback. The owner confirmed public login, Personal Area, session persistence after reload and sign-out. This is owner testimony, not an agent-observed authenticated browser run.
- **C21, C22 and C27–C32 were integrated and released through C33.** The prior “local only”, migration-history and old-project PAM blockers below are historical. C32 learning-email **delivery remains disabled** pending a separate sender/enablement gate. C31's manual screen-reader/200% zoom review is still open.
- **C15 owner detailed review remains open.** The current run reconciles C15 findings and reviews public desktop/mobile journeys; exhaustive authenticated owner/device acceptance is not implied by the C33 login smoke.
- **C16 GA4 DebugView visual confirmation, C26 affected-URL Search Console inspection/canonical validation, and C18 Ads launch decision** remain separate work. C18 requires explicit owner approval. Off-site/continuous backup remains an operational follow-up before broader rollout.
- **TERMO is out of scope in this checkout.** A final cross-project parity audit follows only after both projects independently stabilize; no QUANTUM change authorizes modifying TERMO.

## Completed integration

### C33 completed — production release and owner acceptance, 2026-10-02

The approved configuration and promotion now serve the replacement backend and
dedicated Google client at the public domain. Login is Google-only; email/password
and learning-email delivery remain disabled. Runtime commit `041de5e`, deployment
`dpl_5jG4jC9bVvbBjEu4GTKF8gSv5vWz` READY. 86 tests, HTTP audit (99 URLs,
65 assets, 9 API boundaries) and 12 fresh-browser scenarios pass. Internal source
URLs return 404. Owner confirmed login/sign-out, then answered “sim” to the
explicit public-site Personal Area and reload/session-persistence check.
C33 is complete with owner-confirmed authenticated browser acceptance. No new
change is started automatically. Off-site backup remains an operational follow-up.
Post-push
deployment `dpl_57wHRqRPvkn94tjhEsiHNzRSGzx2` at `f355191` was READY and
passed the repeated HTTP audit, with Git clean/synchronized. Current evidence/rollback/security
limits: `changes/033-unified-learning-release-integration/release-receipt-2026-10-02.md`.
Earlier pending-variable/rejection/cutover entries below are historical.

## Historical C33 checkpoints — superseded by the completed release above

The following dated entries preserve decision and diagnostic history. Words such as
“current”, “pending”, “blocked” and “next” in their original headings or text
describe their former checkpoint, **not the state on 2026-10-03**. Use the C33
release receipt and the authoritative status above for current decisions.

### C33 current — Google-only applied and verified, 2026-10-02

Owner explicitly authorized disabling email/password. Replacement Supabase now
advertises Google as its sole enabled provider; password login returns HTTP 422
`email_provider_disabled`, Google authorize uses the dedicated client/new
callback, and all unrelated Auth settings remain unchanged. 634/634 managed
access checks still pass. The leaked-password Advisor warning remains visible
but password login is disabled; reopening that provider requires review.
The previously rehearsed SQL plus fourteen PDFs have a durable encrypted local
archive outside Git; Keychain key, decryption/hash and tamper checks verified.
Off-site/continuous backup is not claimed. The detailed fresh manifest can now
be regenerated and verified mechanically. C33 production cutover/CPD remains
pending; any renewed Production-variable request must go through approval review
with this new evidence, without bypassing the earlier rejection.

### C33 latest — Google production and authenticated Preview verified, 2026-10-02

Owner screenshot confirms the dedicated QUANTUM Google OAuth audience is
**External / In production**. This supersedes the older Audience=Testing notices
below. The replacement-target Preview deployment
`dpl_FQycaHgdZ32m3qCVwVCyauhA69P1` built after learning API handler
consolidation for the Vercel Hobby 12-function limit. The authenticated
`/api/qm-learning-profile` path returned `learning-profile-v1`; the remote
acceptance audit created two disposable users and verified their cleanup.
`node --test tests/*.test.mjs` passes 85/85, `npm run check` passes, SEO
validation passes for 85 sections, and `git diff --check` passes.

This is target-bound Preview/API proof, not public-domain OAuth redirect/browser
proof or production cutover. Production Vercel still points to the old paused
Supabase target. A requested four-variable production switch was rejected by
the approval reviewer while recovery/security/cutover gates remained incomplete;
do not retry by another path. C33/CPD remains open pending durable recovery
evidence, security disposition for the Free-plan leaked-password warning, exact
candidate fingerprint/commit and production authenticated smoke. Owner's CPD
authorization is recorded and must not be requested again; it does not override
the release gates. No TERMO, email-delivery, or old-project changes are in scope.

### Historical C33 checkpoint — restore rehearsal passed; public OAuth Testing

Owner entered the new public legal URLs in dedicated Google Branding, but
Google Auth Platform → Audience still reports **Testing** on owner readback;
public OAuth publication is not confirmed. A linked, read-only Supabase audit
again passed 634/634 privilege/RLS checks; the remaining leaked-password
protection WARN is a Free-plan limitation requiring a release decision, not a
silent zero-warning claim. A temporary, restricted logical snapshot of the
new project was restored into a clean local Supabase stack. Counts matched
(1 owner, 14 sources/Storage metadata, 85 reviewed sections, 0 ledger rows,
1 migration), and a required post-restore ACL repair passed 634/634 local
checks. The disposable restored volume was deleted; the SQL snapshot remains
only in `/private/tmp`, so durable encrypted/off-site retention is still open.
Storage object bytes were separately hash-verified. See C33
`cpd-preflight-2026-10-02.md`. No C33 commit/push/cutover; the legal-only
production deployment below is unchanged. The app loop and production-target
smoke also remain unproven. Do not label this clean CPD.

### C33 public legal pages released separately, 2026-10-02

The QUANTUM Privacy and Terms of Use pages are now public at
`https://quantummechanicsbook.app/privacy.html` and
`https://quantummechanicsbook.app/terms.html`. A legal-only production package
was built from the exact C17 production code snapshot, keeping the backend
configuration unchanged. Vercel deployment `dpl_FcudtUG1p2vKyfW4W4Y3tDmq8gMR`
is the verified custom-domain target; both pages, their CSS and landing/app
links returned 200. The production audit passed 98 sitemap routes, 62 local
assets and 9 API boundary checks without warnings. This is **not** C33 cutover,
Google Audience publication, C18 activation, or clean CPD of the candidate.
Use the verified public URLs in dedicated Google Branding; Audience remains
unverified until Google readback confirms publication.

### C33 current — CPD authorized; Google publication/recovery gates open

2026-10-02: owner explicitly authorized finishing C33 followed by clean CPD.
Earlier statements that production/CPD authorization is absent are superseded;
readiness gates are not waived. Read `cpd-preflight-2026-10-02.md` under C33.
Current checks: 82 tests, 634 managed privilege checks, content/SEO, unchanged
377-file fingerprint and fresh isolated SQL replay PASS. Owner preferences have
GET/PUT/subsequent GET 200 evidence. Google Audience remains Testing, with
Publish app disabled until Branding is completed; native Save did not establish
success. New password-protection Advisor warning requires review; real backup
restore, complete app/logout proof and deployment smoke remain pending. No
Vercel writes/commit/push/deploy/cutover occurred. Preserve the owner account and
all existing work. TERMO and C18 remain out of scope.

### C33 latest follow-up — Google sign-in confirmed; onboarding verification pending

2026-10-02: new Supabase individual Auth record confirms Google identity and
completed sign-in. Owner's local privacy dialog failed because the temporary
test wrapper omitted its preferences endpoint, not because OAuth failed.
Wrapper now routes authenticated GET/PUT to the existing preferences handler;
401/403 boundary checks and 18 relevant unit tests pass. Await owner reload/save,
then profile/session/reload/logout verification. No choices made for the owner,
no emails, production cutover, TERMO changes or schema/provider changes.
See C33 OAuth runbook for current evidence and runtime limitations. Earlier
full-login-pending observations below describe the previous checkpoint.

### C33 latest — dedicated Google provider enabled; full login pending, 2026-10-02

New owner-supplied local credential validated and installed only on
`quantum_rebuild` / `crasnnvdvujzxudmbakv`. Google provider now enabled with
dedicated `QUANTUM web` client `1091169926547-...`. Readback confirms unrelated
Auth settings unchanged. Keyed authorize probe returns 302 to Google with the
dedicated client and new callback. This is NOT completed OAuth login evidence.
An isolated local app at `http://127.0.0.1:4173/index.html` is prepared in Codex,
with new-target-only runtime credentials, no analytics, read-only application
APIs and private-file denials. Native accessibility confirms the app/rating modal.
Await owner Google account selection, then session/profile/reload/logout proof.
Details, limitations and provider-disable rollback are recorded in C33
`google-oauth-setup.md`. No TERMO/shared client, production configuration, deploy
or CPD changes. Full release remains pending; C18 stays deferred. This supersedes
earlier secret-pending/disabled-provider notes; existing worktree is preserved.

### C33 historical — dedicated OAuth client created by owner, 2026-10-02

Owner created `QUANTUM web` in `quantum-book-auth-20260926`. Supplied JSON
metadata validates client ID
`1091169926547-94qapsmdmtg38hbognu8dapl1j8lpimd.apps.googleusercontent.com`,
canonical app origin and new Supabase callback. Do not create a duplicate.
The supplied screenshot exposes its secret: replacement is required before
activation. No credential installed or remote change in this follow-up; provider
configuration/full login remain pending. Rotate only the dedicated client secret,
not TERMO; keep production untouched. See latest C33 OAuth checkpoint. This
supersedes the earlier empty-inventory/form-creation blocker below.

### C33 resumed — dedicated OAuth only — 2026-10-02

Owner explicitly ended the 26/09 pause and authorized the dedicated QUANTUM Web
OAuth client/provider configuration and isolated login tests through the browser
inside Codex. Production cutover, CPD, billing changes and TERMO/shared-client
mutations remain unauthorized. Do not reopen the general infrastructure audit.

Current checkpoint: Google project `quantum-book-auth-20260926` read-only verified
ACTIVE; new Supabase `crasnnvdvujzxudmbakv` verified ACTIVE_HEALTHY. Its Google
provider is still disabled with the shared client ID staged. All 634 managed
catalog/grant/RLS checks and 82 local Node tests pass again; no remote writes.
Follow-up live accessibility inspection of Codex's embedded browser confirms
Gmail identity, QUANTUM project and **No OAuth clients to display**. The dedicated
create-client form is now open in Codex. However, accessibility click/press and
focus/keyboard attempts do not operate its controls; no client was created and
no provider PATCH was sent. Native browser automation and `agent-browser` remain
unavailable. This is a form-interaction blocker, not missing audit/authorization.
Do not silently switch to Safari. After credential creation, configure only the
new backend, prove full login, then present any production switch for approval.
See C33 `google-oauth-setup.md` for exact scope and rollback/acceptance checks.

### Owner-requested pause / resume checkpoint — 2026-09-26

Historical checkpoint, superseded by the bounded resumption above.
The owner will first resolve Google Cloud account/project organization in the
separate Infrastructure project and then return to QUANTUM. Pause execution
here; do not autonomously resume OAuth, provider changes or publication.
C33 remains unfinished, not accepted as a production release.

On return, obtain the Infrastructure decisions/handoff and revalidate project
IDs, access, billing and OAuth metadata before any mutation. Do not recreate
projects/clients that Infrastructure may have configured or undo its work.
Resume C33: dedicated Google OAuth and new-Supabase callback/login proof →
target-bound application environment and end-to-end learning/security checks →
recovery/release gate → owner-authorized CPD. Do not repeat the installed clean
baseline. Preserve all existing worktree changes and gamification rules.

C28–C32 are locally implemented; fresh Supabase installation/managed tests have
passed as recorded below. Application publication remains pending. C26 SEO,
owner C15 review and C16 GA4 visual confirmation remain tracked separately;
C18 stays deferred until the owner's review and explicit launch approval.
No remote action or commit/push/deploy was performed to record this pause.

Current next action: **C33 — integrated release preparation**. C28–C32 have local
implementations; none of the open remote gates is satisfied by those local
milestones. The historical "next" notes below describe their completion order.
Production cutover is held on Google OAuth, target-bound app validation/recovery
and exact release approval. Fresh database installation and managed role/learning
tests have passed. The old-history dependency is superseded for
the fresh target by the owner's explicit no-data-preservation decision below.

Latest C33 infrastructure decision (2026-09-26): owner authorized replacing
QUANTUM with no old learner-data preservation requirement. Old project
`plqiofznjlbpfufigpcp` is **paused (`INACTIVE`), not deleted**. New Free-plan
`quantum_rebuild` / `crasnnvdvujzxudmbakv` is `ACTIVE_HEALTHY` in `sa-east-1`,
same organization `farevhlbtnmkuewoxhry`. Clean baseline `20260926204825` installed
through the isolated `supabase/fresh` CLI workdir. All 634 managed catalog checks
and two-user Auth/PostgREST learning tests passed; test users removed. Fourteen
private source PDFs for Chapters 1–7 are provisioned. Password is in
macOS Keychain, never Git. TERMO remains active and untouched. See C33
`provider-replacement.md` for the receipt and credential locator.

Latest Google observation before pause: the overview displayed **OAuth
configuration created!** and **You haven't configured any OAuth clients for
this project yet**. Initial configuration is now complete; the former pending
policy-acceptance step is historical, not the next action. Following explicit
owner authorization, normal approval review allowed creation of the dedicated
`quantum-book-auth-20260926` Google Cloud project; billing readback is disabled
with no billing account. The earlier approval denial was not bypassed.
Existing shared `termo-web` client is untouched; its warning
means two secrets exist, not a confirmed login failure. Dedicated QUANTUM OAuth
client/secret and functional separation are still pending.
See C33 `google-oauth-setup.md`. Google remains disabled until the client/secret
and new callback are safely configured and login proven. Database/source proof
in `fresh-installation.md` is unchanged. No old migration was renamed; use new forward migrations
in `supabase/fresh` for subsequent schema work, never regenerate the applied baseline.
Old CLI link and app/Vercel credentials are deliberately unchanged; the paused
old backend cannot serve authenticated app features. Do not run implicit linked
commands against it; use the new reference explicitly. No commit/push/deploy or
gamification-policy change. Old PAM investigation below is historical, not a
blocker to fresh bootstrap; it is not claimed repaired.

- `033-unified-learning-release-integration` — **completed and published 2026-10-02**. The earlier fresh-install candidate, blocked release and 82-test snapshot belong to the historical 2026-09-26 checkpoint above. The authoritative production target, 86-test release proof, owner acceptance and rollback limits are in `changes/033-unified-learning-release-integration/release-receipt-2026-10-02.md`.

## Change inventory — reconciled on 2026-10-03

- `001-content-availability-and-canonical-registry` — published.
- `002-exercise-source-governance-and-index-audit` — published in `bbb0325`.
- `003-public-discovery-routes-and-seo-parity` — published in `8732fec`.
- `004-learner-profile-and-study-journey-foundation` — published in `ee3e91a`.
- `005-gamification-and-assessment-foundation` — published in `5ced1e4`.
- `006-reviewed-chapter-assessments` — published in `883a80f`.
- `007-learner-facing-gamification` — published in `5b24041`.
- `008-assessment-editorial-quality` — published in `54cbabd`.
- `009-section-aware-practice` — published in `af8b64e`.
- `010-simulator-integration` — published in `cfe6cb6`.
- `011-search-seo-and-structured-content` — published in `acea642`.
- `012-editorial-review-workflow` — published in `35885e4`.
- `013-production-domain-and-measurement-foundation` — published; final domain, Supabase Auth allow-list, final-domain authenticated session, and legacy fallback policy are verified.
- `014-canonical-seo-and-search-console` — published; ownership is verified, the sitemap is accepted with 96 discovered pages, and the QUANTUM-branded static artifacts are live.
- `015-owner-detailed-review` — active. Historical operational findings have C33 release evidence; the 2026-10-03 anonymous desktop/mobile audit passes, but exhaustive authenticated owner desktop/mobile and manual accessibility acceptance remain open. See its current checklist and review checkpoint. Earlier authorization to begin C16 did not close C15.
- `016-ga4-measurement-foundation` — published; the privacy-first client/server implementation, real Measurement ID, 90-day QM Supabase migration, production consent journey, GA Collect transport, first-party persistence, sanitization, cleanup, and runtime logs are verified. Only the signed-in visual confirmation inside GA4 DebugView remains as an external evidence gate.
- `017-external-user-quality-audit` — technical audit published in `38bbd74` and `2e3176e`; final production route/API/browser/security/log gates pass. The owner's authenticated desktop/mobile review and C16 DebugView visual confirmation remain open.
- `018-google-ads-readiness` — planned; depends on C13–C17 and explicit launch approval.
- `019-operational-parity-completion` — published in `86b2c2b`; live email delivery remains safely inactive until Resend sender verification and `RESEND_API_KEY` are configured.
- `020-po-magico-governance-baseline` — published in `e68e643`; documentation-only governance baseline, no application behavior change.
- `021-authenticated-learning-flow-repair` — integrated and released through C33 against the replacement backend; the old project's failed pre-migration dry run is historical. See C33 managed checks and release receipt.
- `022-learner-interface-and-rendering-polish` — integrated and released through C33. Responsive header, English-only share copy, assessment lifecycle, favorite detail/math rendering and versioned first-login consent are present. Optional email defaults off. The 2026-09-25 local CPD block was superseded by the fresh-target C33 release.
- `023-unified-learning-gamification-blueprint` — blueprint and reusable skill completed on 2026-09-23; the package is versioned under `.specs/blueprints/`, validated, and installed as a personal Codex skill. Its QUANTUM adoption in C21/C22/C28–C32 was released through C33; C24/C25 are superseded planning records.
- `024-adaptive-study-journey-and-daily-practice` — superseded before execution by the smaller, auditable C28–C32 program. Its requirements were preserved and redistributed; it must not be executed as a competing implementation.
- `025-learning-communication-and-reengagement` — superseded before execution by C32. Its consent, frequency, quiet-hours, unsubscribe, and non-coercion requirements were preserved.
- `026-canonical-url-consolidation-and-search-console-validation` — planned from the 2026-09-23 Search Console notice; consolidates `/index.html` alternates into the canonical root-query routes and requires affected-URL inspection before validation.
- `027-supabase-explicit-data-api-privileges` — installed on the replacement backend and included in C33's 634 managed catalog/grant/RLS checks. The old project's migration-history defect is not a current fresh-target release blocker.
- `028-unified-learning-contract-and-adapter` — versioned policy, reviewed-source eligibility, event/store map, mechanism and simulator contracts integrated through C33; the earlier local-only validation remains in its change record.
- `029-authoritative-learning-ledger-and-profile` — append-only account-scoped ledger, atomic/idempotent rewards and private profile integrated through C33. The fresh target had no old learner history to import; this does not imply import was performed on the paused old project.
- `030-adaptive-learning-modes-and-rewards` — guided review, focused retry, distinct Daily Challenge and chapter assessment, simulator evidence, missions/badges and conservative mastery logic integrated through C33. Automated/public smoke and owner login proof do not replace the open C15 full authenticated review.
- `031-learning-methodology-help-and-explainability` — public `/help.html`, contextual explanations and methodology source published through C33. Final manual screen-reader and 200% zoom review remains open; the prior staged-rollout notice is being reconciled in C15.
- `032-academic-evaluation-and-responsible-communication` — outcome dictionary, owner-only aggregate reporting, affirmative consent, frequency/quiet-hour controls and unsubscribe contract integrated through C33. **Actual learning-email delivery remains disabled** until separate sender, operational and owner release gates; do not claim exposure from provider acceptance or analytics.

## Canonical execution order

### Completed product and learning sequence

```text
C22 learner-facing repairs
  -> C28 contract and adapter
  -> C29 authoritative ledger/profile
  -> C30 adaptive modes and rewards
  -> C31 methodology Help and C32 evaluation/communication
  -> C33 integrated candidate, migration-history resolution and release proof
```

The sequence above was released through C33 on the fresh backend. The old
`QM-SEC-006` history problem remains historical to the paused project, not a
reason to repeat migrations on production. New schema/production changes still
require their own gate and evidence.

### Independent discovery sequence

```text
C15 remaining owner journey review
  -> C26 affected-URL inspection, canonical decision and validation
  -> separately authorized publication if code changes are needed
  -> C18 Google Ads readiness only after owner review and explicit launch approval
```

### Remote-only gates

- Any new migration-history repair, provider configuration, disposable remote
  data, Search Console mutation, Git push or deployment.
- Learning-email delivery/sender activation and off-site recovery arrangement.

Each requires explicit authorization for the exact action. The final TERMO/QUANTUM parity audit starts only after both independent programs are stable.

C24 and C25 are historical planning records, not executable competitors. C23, `.specs/blueprints/adaptive-learning-gamification/`, and `.specs/shared/learning-gamification-contract.md` are the methodological authorities for C22 and C28–C32. The Pó Mágico security profile and risk register apply concurrently and cannot be overridden by a product Change.

## Non-negotiable content contract

- Follow the Reis *Quantum Mechanics* text exactly; do not invent notation, concepts, equations, conclusions, or derivations.
- Math content must render with MathJax. Long dynamic LaTeX must use `String.raw`.
- Preserve the slide/card teaching pattern used by the reviewed chapters.
- A `cpd` request means commit, push to `main`, and production deployment; no commit otherwise.
- Remote database mutations, provider changes, audits with disposable remote data, Git push, and deploy require explicit authorization for that exact action.
