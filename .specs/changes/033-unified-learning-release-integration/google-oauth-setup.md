# C33 — Google OAuth setup follow-up, 2026-09-26

## Latest release evidence — Audience published and replacement-target Preview, 2026-10-02

Owner screenshot confirms Google Audience for the dedicated QUANTUM project is
External / **In production**. The earlier Testing observations in this file
are historical and superseded. The dedicated `QUANTUM web` client points only
to `https://quantummechanicsbook.app` and the new Supabase callback; the new
project's Google provider was configured with its current secret. Secret values
are intentionally omitted.

Google identity/sign-in was independently confirmed on the replacement backend.
In addition, Vercel Preview deployment
`dpl_FQycaHgdZ32m3qCVwVCyauhA69P1` accepted an authenticated learning-profile
request against that backend. Disposable identities were cleaned up and
verified. This closes the OAuth publication and Preview backend-profile gates,
but is not a Google redirect-and-callback browser test on the production domain.
The production app still uses the old paused backend; no production settings or
TERMO resources were altered. See `cpd-preflight-2026-10-02.md` for the remaining
release gates and the production-switch approval rejection.

## Latest follow-up — Google sign-in recorded; local preferences route repaired

2026-10-02: owner reached the local first-login privacy dialog, which reported
that preferences could not load. Root cause was the agent's ephemeral runtime:
its route allowlist omitted `/api/qm-legal-preferences`; the underlying normal
dev server also has no handler for that route. This is not evidence of a Google
secret failure or a missing database migration.

Corrected the temporary wrapper only to dispatch GET/PUT for that exact path to
the existing `handleLegalPreferencesRequest`. The handler verifies the bearer
against the new project's Auth API and scopes preferences to that user. Host,
origin, private-file and other-operation restrictions remain. PUT bodies capped
at 8 KiB; logs contain method/status only, never tokens or preference values.
Restarted the local process (current session 64776). Email dispatch stays blocked;
the agent did not accept terms or choose optional consent on the owner's behalf.

Read-only new-target Auth inspection found one account; its individual record
confirms Google provider/identity and a completed sign-in on 2026-10-02. The list
endpoint omitted identities, so its initial zero identity count was not treated
as a failed Google login. No account identifiers or personal fields logged.
This establishes Google sign-in at the new backend, not all release gates.

Verification: preferences GET/PUT without a token and GET with an invalid token
return 401; private file and communication-dispatch probes return 403. Eighteen
operational/communication unit tests pass. Await owner reload and authenticated
preferences GET/save, then reload/session/profile/logout checks. Production,
TERMO, Google/provider settings and database schema were not changed in this
follow-up. Supabase skill guided verified-session and least-privilege boundaries.

## Latest checkpoint — dedicated provider configured, 2026-10-02

Supersedes the creation/rotation-pending and disabled-provider observations below.
The owner provided a new local Desktop JSON (`client_secret_2_...json`). Its Web
client, dedicated Google project, sole origin and callback matched the intended
QUANTUM target. The replacement secret was distinct from both earlier credentials;
no secret value was printed, copied into the checkout or added to Git.

- Reverified `quantum_rebuild` / `crasnnvdvujzxudmbakv`, expected organization,
  and ACTIVE_HEALTHY before mutation.
- Management API PATCH changed only `external_google_enabled` to true,
  `external_google_client_id` to the dedicated `1091169926547-...` client above,
  and `external_google_secret` to the owner-supplied replacement.
- Readback confirmed enabled/dedicated provider and a populated secret. Comparison
  of every other returned configuration field found no changes. Site/return URLs,
  email confirmation and nonce settings were preserved.
- First authorize probe without a public API key returned HTTP 400. A subsequent
  correctly keyed probe returned HTTP 302 to `accounts.google.com`, with the exact
  dedicated client ID and new Supabase callback, requesting `email profile`.
  This establishes redirect configuration, NOT successful secret exchange/login.
- No Google client, shared `termo-web`, TERMO, production environment or deployment
  was changed. Neither previous-secret retirement nor Google audience membership
  was independently verified in this step.

An ephemeral test runtime is listening only on `http://127.0.0.1:4173` (process
session 61240 for this execution). It uses the existing application/handlers with
new-target public/server keys held in process memory, neutralizes `.env.local`
loading and disables analytics. The temporary wrapper is outside the repository;
it serves approved public files and only public-config/profile read APIs. Other
API operations, dotfiles, Git metadata and private source paths are denied. It is
an OAuth/profile test, not the complete learning-release environment.

Verified HTTP: index/auth asset/config 200, unauthenticated profile 401, `.env.local`,
`.git/config` and private source request 403. Public config contains the new target
and dedicated client with authentication enabled and analytics disabled. Existing
Auth return logic derives its origin from the HTTP page, so local login returns
locally; no source override was needed. Codex opened the actual local app;
accessibility showed its title and rating dialog (`Not now` / `Send rating`).
Automatic browser control is unavailable: no full visual/console or completed
Google-login claim is made. Owner must dismiss the rating prompt and perform the
Google account selection/consent, then session, reload and logout can be checked.

Remaining: real Google consent/token exchange, new-target session/profile proof,
reload/logout, remaining C33 integration/recovery checks, then exact production
cutover proposal for separate owner approval. Earlier catalog/82-test results
were not rerun in this provider-only step. C18 remains deferred.

Reversal: stop the isolated test runtime and, if provider rollback is necessary,
disable Google ONLY on `crasnnvdvujzxudmbakv`. Do not restore/enable the shared
client, re-enable exposed secrets or touch TERMO. Production has not switched.
Supabase, environment-isolation and verification skills informed target checks,
secret handling and test boundaries; agent-browser verification could not run
because its executable/control was unavailable, so HTTP and read-only native
accessibility evidence are explicitly distinguished from end-to-end verification.

## Historical checkpoint — owner created dedicated client, 2026-10-02

Supersedes the empty-inventory/creation-pending checkpoint below. Owner supplied
creation screenshots and a local downloaded JSON. Only nonsecret metadata was
printed during validation:

- Google project: `quantum-book-auth-20260926`.
- Web client: `QUANTUM web`, ID
  `1091169926547-94qapsmdmtg38hbognu8dapl1j8lpimd.apps.googleusercontent.com`.
- Sole JavaScript origin: `https://quantummechanicsbook.app`.
- Sole callback: `https://crasnnvdvujzxudmbakv.supabase.co/auth/v1/callback`.
- Creation screenshot reports testing-audience restrictions; full login remains
  untested. This client must not be recreated merely because older notes say absent.

The supplied screenshot visibly includes the newly issued client secret. Treat
that secret as exposed and replace it before provider activation. No secret value
is recorded here, no supplied credential was installed, and no remote mutation
occurred in this follow-up. The JSON remains at its owner-supplied location; it
was not copied into the checkout or deleted. No evidence of credential misuse
was observed; exposure is not proof of unauthorized access.

Next: rotate only this QUANTUM client's secret, securely retain the replacement
without attaching its contents/screenshots, disable the exposed secret, then
configure only `quantum_rebuild` and execute the existing isolated login gates.
Keep the same client ID/origin/callback. Never rotate shared `termo-web`.
The agent's embedded-browser form interaction limitation remains; owner action
or restored browser control is required for Google secret rotation. Production
cutover remains unauthorized. Prior catalog/test evidence is unchanged, not rerun.

## Current checkpoint — resumed 2026-10-02

This section supersedes historical pending/paused steps below.

### Owner's execution instruction

- End the 26/09 pause and conclude the prepared/tested separation of QUANTUM
  Google OAuth, preserving TERMO without interruption.
- Audit handoff supplied by the owner: shared client ID on 28/09; on 30/09,
  `termo-web` callbacks served TERMO and old QUANTUM. These are supplied
  observations, not newly queried facts in this session.
- Work only in this checkout, existing dedicated Google project
  `quantum-book-auth-20260926` under `mario.reis.junior@gmail.com`, and replacement
  Supabase `crasnnvdvujzxudmbakv` / `quantum_rebuild`.
- Inspect current clients before creating resources. Use the browser inside
  Codex, not Safari. Configure a dedicated Web client with the canonical origin
  and the callback shown by new Supabase. Keep secrets in panels/secure storage,
  never chat, Git, screenshots containing secrets or logs.
- Never alter/revoke `termo-web`, its secrets or callbacks, or TERMO's project.
- No QUANTUM production switch before real login plus C33 release criteria.
  Present concrete changes and test results for final owner approval.
- Do not reopen the general service audit.

### Verification actually performed

- Dedicated Google project read by CLI using the explicit Gmail account:
  `ACTIVE`, name QUANTUM, number `1091169926547`. No account/config switch.
- Management API target check: exact new Supabase ref, expected name and org
  `farevhlbtnmkuewoxhry`, `ACTIVE_HEALTHY`.
- Auth readback: Google disabled; staged client remains
  `81434140400-5kp0f25t57pqgbl8c6t3dlemn2nlgqd3.apps.googleusercontent.com`.
  This is the shared client and must be replaced only on new QUANTUM, not enabled.
- Site URL `https://quantummechanicsbook.app`; existing return allowlist:
  `https://quantummechanicsbook.app/**`, `https://qm-beta.vercel.app/**`,
  `http://127.0.0.1:4173/**`, `http://localhost:4173/**`.
  Email confirmation still required. No secrets printed from Auth readback.
- `node scripts/audit-qm-fresh-supabase.mjs --catalog`: 634 checks, no failures;
  one baseline `20260926204825 / qm_clean_baseline`; zero Auth users/ledger rows;
  14 source records/14 objects. Advisor findings are eight expected server-only
  RLS/no-policy INFO entries; no ERROR/WARN.
- `node --test tests/*.test.mjs`: 82 passed, zero failed.
- Reviewed current Supabase changelog and official Google-provider docs. Latest
  items include OrioleDB beta and Middleware 1.0; no OAuth setup change identified.
  No database upgrade or unrelated provider work is authorized here.

### Concrete execution blocker

Follow-up after the owner's explicit continuation: macOS accessibility exposed
the actual Codex embedded browser. Navigating back to this thread made the
QUANTUM tab readable. Live page evidence now confirms the account
`mario.reis.junior@gmail.com`, project selector QUANTUM and client-table empty
state **No OAuth clients to display**. The earlier NOT_CHECKED inventory is
superseded. Read access is available; effective form control is not.

Accessibility click/press, coordinate click and focus/keyboard attempts did not
change the client list. No success was inferred from commands returning without
an error. Opening the official create-client URL through `open_in_codex`, then
navigating to this thread, did load **Create OAuth client ID** in the same
dedicated project/account. Its **Application type** combo is present, but the
attempted accessibility click does not open it. No form was submitted.

The native browser automation tool remains absent, as does `agent-browser`.
Do not keep retrying ineffective input methods or silently switch to Safari.
No hidden browser credentials or private Console APIs were accessed. No OAuth
client/secret was created, no provider PATCH was sent and full Google login
remains untested. No production/local environment or TERMO change. The remaining
blocker is form interaction, not account selection, audit or owner authorization.

### Next execution and acceptance (not yet performed)

1. Restore effective form interaction in the owner-requested Codex browser, or
   have the owner complete the open creation form. Identity/project and empty
   inventory were verified above; recheck inventory if resuming later to avoid
   duplicates. Reuse a suitable dedicated client if one has since been created.
2. Use origin `https://quantummechanicsbook.app`. Read callback from replacement
   provider panel and compare with standard expected URI
   `https://crasnnvdvujzxudmbakv.supabase.co/auth/v1/callback`. Stop on mismatch.
3. Keep only basic OpenID/email/profile scopes for login. Preserve nonce checks
   and unrelated Auth settings. Configure ID/secret on the replacement only;
   store the secret securely before dismissing any one-time issuance dialog.
4. Test through an isolated runtime with new-backend-only public/server keys and
   the dedicated public Google client ID. Do not edit deployed config or allow
   `.env.local`'s old credentials to mix with the new target. Existing localhost
   allowlist permits a local return; verify actual return before login.
5. Prove redirect client ID and callback, completed Google consent/token exchange,
   new-target user/session validation, reload/session behavior and logout. Check
   learner isolation and protected APIs. Redact all tokens, codes and secrets.
   Do not silently downgrade to fixture/password login as OAuth evidence.
6. Run remaining C33 integration/recovery gates and present the exact environment
   changes/candidate for owner approval; no automatic production switch.

### Reversal boundary

- Current step made no remote writes, so there is nothing remote to roll back.
- Before a later provider change, retain its nonsecret configuration and securely
  preserve any credential needed for restoration; do not assume a masked API
  response is a reusable secret.
- If isolated OAuth tests fail, stop the test runtime and revert only new QUANTUM
  provider settings to the recorded pre-change state (Google disabled). Do not
  enable the old shared client as a fallback, touch TERMO or delete Google clients
  automatically. Keep any newly issued dedicated credential in secure storage.
- Production configuration remains untouched. Moving a future production release
  back to the paused old backend is NOT a proven recovery plan; full C33 recovery
  approval is still required.

### Governance

Continue C33, do not create a competing change. Existing planned route is
`gpt-6-astra / high`, fallback `gpt-6-sol / xhigh`; exact runtime model/reasoning
is not independently attested here. No model switch or sub-agent used. Applied
Supabase and agent-browser skill instructions; browser skill's executable was
unavailable. Accessibility fallback provided live inventory evidence but could
not operate the form. The requested browser, existing dirty worktree and applied
baseline are preserved.

Release remains BLOCKED. The owner pause is ended; the present blocker is tool
capability, not missing authorization for the bounded setup/test request.

## Requested scope

Owner requested “Configure o Google e tudo que vc conseguir”. Configure QUANTUM
only, preserve TERMO, no production app cutover before login validation.

## Verified observations

- Native CUA remains unavailable because the configured writable root contains a
  symlink. No sandbox/security settings were changed. Existing Safari automation
  through AppleScript and DOM inspection works with current OS permissions.
- Google Cloud Console is signed in as `mario.reis.junior@gmail.com`, currently
  on `project-53cb0003-f6ce-41f8-96f` / “My First Project”.
- QUANTUM's existing public Google client ID matches the client's **termo-web**
  entry in that project. The client is shared; do not rotate its secret, remove
  redirects or modify TERMO to fix QUANTUM.
- Attempted creation of a separate OAuth client “QUANTUM web” in the existing
  project, origin `https://quantummechanicsbook.app`, callback
  `https://crasnnvdvujzxudmbakv.supabase.co/auth/v1/callback`.
- Google displayed **Domain limit exceeded**: the shared OAuth application has
  exceeded ten unverified authorized domains and requires verification for those
  domains. Creation was cancelled at the warning; no client secret was issued
  or copied, and no existing client was changed.
- CLI account `marioreis@id.uff.br` requires reauthentication; explicitly selecting
  the existing `mario.reis.junior@gmail.com` CLI account works for the relevant
  read-only project listing. Global gcloud account/config was not switched.

## Earlier blocked action — superseded by explicit authorization below

Proposed dedicated Google Cloud project: **QUANTUM**,
ID `quantum-book-auth-20260926`, under the personal Gmail account, no billing
association, no organization/folder specified, no paid resources, no global
default-project switch. Its purpose is an independent QUANTUM OAuth application.

Automatic approval review rejected the project-create command before execution:
the owner's general Google-configuration request was judged insufficiently
explicit for creation of a persistent Cloud resource and its financial scope.
Do not retry via UI/API or another account to bypass this decision. Obtain the
owner's specific approval first; no new Google project exists from this action.

## Next after explicit owner approval

1. Verify exact project ID does not already exist; create only the approved
   dedicated project without billing, organization changes or paid resources.
2. Set up minimal OAuth branding/audience and only basic login scopes. Do not
   accept contractual terms or submit identity/verification attestations for
   the owner; pause if these are requested.
3. Create the dedicated Web client with exact canonical origin/new callback.
   Keep secrets in Keychain/in-memory provider configuration, never logs/Git.
4. Configure new Supabase `crasnnvdvujzxudmbakv` with the new client and verify
   readback and OAuth round-trip. Preserve the shared `termo-web` client.
5. Update the prepared app's public client ID only at the target-bound staging
   step. Actual account authentication/consent may require owner interaction.

Database/source/managed-learning proofs from `fresh-installation.md` are unchanged.
At that earlier checkpoint Google remained disabled on the replacement; app still points at old paused
backend. No Supabase mutation, deployment, commit/push or TERMO mutation in this
follow-up. Application release gate: **BLOCKED** pending explicit project-creation
authorization and the remaining OAuth/app/recovery checks.

## Owner-authorized separation — 2026-09-26 follow-up

After the explicit no-billing project-creation question, the owner requested
creation and separation of QUANTUM from TERMO. The same scoped command was
resubmitted through normal approval review and succeeded; no UI/API bypass of
the earlier rejection was used.

- Created Google Cloud project `quantum-book-auth-20260926`, name **QUANTUM**,
  using `mario.reis.junior@gmail.com`, without an organization/folder or enabled
  Cloud APIs requested by the command. No global account/project switch.
- Billing readback: `billingEnabled: false`, `billingAccountName: ""`.
- The owner's screenshot was an OAuth **client** list, not a Cloud-project list.
  The current old-project list has four clients; the former `Tree Web` entry is
  absent. We did not delete any client or project in this follow-up.
- The `termo-web` warning was inspected directly: `two secrets warning`.
  Google's tooltip says multiple secrets increase security risks and recommends
  disabling/deleting the old one only after verifying the app uses the new one.
  This is not evidence that TERMO login is failing. No TERMO secret, callback or
  client was changed; determining which secret is active is a separate audit.
- In the new project's Google Auth Platform setup, prepared app name QUANTUM,
  support/contact `mario.reis.junior@gmail.com`, External audience (testing).
  These branding fields are a pending form, not a completed OAuth configuration.
- Stopped at **Finish → “I agree to the Google API Services: User Data Policy.”**
  The box remains unchecked. The owner must review/accept the policy and finish
  creation. Safari is left at this step. No policy acceptance on owner's behalf.

Next: owner acceptance → dedicated Web OAuth client → secure Keychain/Supabase
secret configuration → callback/login proof → separately gated app cutover.
Google remains disabled on replacement Supabase, no exclusive client/secret has
yet been issued, and the application still targets the old paused backend.
Project isolation is created; functional login separation is **not complete**.
No commit/push/deploy, billing association or TERMO mutation. Release remains
**BLOCKED** on policy acceptance/OAuth and existing app/recovery/release gates.

## Latest observation and owner pause — 2026-09-26

The subsequent read-only Cloud audit observed **OAuth configuration created!**
on QUANTUM's overview, together with **You haven't configured any OAuth clients
for this project yet**. Initial branding/configuration has therefore been
completed since the earlier paused form. The agent did not accept the policy.
Dedicated client issuance, callback and real login remain unverified/pending;
do not continue asking the owner to complete the now-historical form.

The owner explicitly chose to organize Google Cloud through the separate
Infrastructure project before returning here. QUANTUM execution is paused by
request. No scheduled monitoring or automatic continuation was requested.

Resume only when the owner returns: read Infrastructure's handoff, revalidate
identities/resource IDs and current OAuth state, then continue unfinished C33.
Do not duplicate resources, change billing, touch TERMO credentials or undo
Infrastructure work. Existing C33 baseline and learning/security evidence are
preserved; no production acceptance is implied. App/backend cutover, recovery,
end-to-end proof and scoped CPD approval remain gates. This checkpoint changes
documentation only; no remote mutation, commit, push or deploy.
