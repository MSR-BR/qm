# C33 — Fresh installation evidence (2026-09-26)

## Authorization and bounded destination

Owner's “Segue” after successful project creation authorizes preparation,
installation and validation of the replacement. Only `crasnnvdvujzxudmbakv`,
`quantum_rebuild`, Free org `farevhlbtnmkuewoxhry`. No TERMO mutation, old-project
deletion, historical learner import, Vercel cutover, CPD or C18 execution.

## Pre-install gate: PASS for empty-target schema installation only

- Exact candidate: `supabase/fresh/supabase/migrations/20260926204825_qm_clean_baseline.sql`.
- SHA-256: `dca627488716f50e826edae5d5cc023b1c18892a9221a495a6a07ad3db931730`.
- CLI-generated unique version, deterministic mapping of 21 preserved sources.
- Local PostgreSQL 17 fresh replay, **without** the optional helper stand-in:
  525 table and 66 function privilege assertions; 12-way concurrent award
  deduplication; isolation; assessment/review/retry/daily/simulator flows;
  reward caps; rollback; communication opt-out/caps/concurrency; account erasure;
  aggregate evaluation SQL all passed.
- Managed read-only preflight: zero QM tables, zero Auth users, zero stored
  objects; optional `public.rls_auto_enable()` absent. Exact project healthy.
- Separate linked workdir; root project's old CLI link unchanged.
- Recovery boundary: empty replacement has no learner data; baseline runner
  applies schema/history transactionally. Stop on failure and inspect, never
  repair history or delete projects automatically. Provider database remains
  isolated from production app credentials until separate cutover readiness.

This gate is **not** a production-app PASS. Managed grants/API/Auth proof,
Google callback setup, private source provisioning and app release remain open.

## Managed execution

- CLI `db push --dry-run --linked --project-ref crasnnvdvujzxudmbakv
  --workdir supabase/fresh --skip-vault` listed exactly the one baseline.
- Authorized CLI push succeeded. Read-only remote history contains exactly
  `20260926204825 / qm_clean_baseline`; no historical migration repair needed.
- Managed catalog matches all **634 assertions**: 525 table privileges, 25 RLS
  states, 66 function privileges, 18 sequence privileges. No mismatches.
- Security Advisor: zero ERROR/WARN items; eight INFO `rls_enabled_no_policy`
  entries correspond to deliberately server-only tables. They deny browser
  access and rely on narrowly granted server access, not missing learner policies.
- Two disposable managed Auth accounts signed in by password, then exercised
  real PostgREST: own progress/simulator persistence, cross-user denial,
  browser reward/RPC/aggregate denial, 12 concurrent requests award only once,
  assessment 67%/30 XP, guided review 10 XP, retry 10 XP. Total 70 XP including
  the single 20-XP section award. Daily Challenge requires studied content and
  awards zero XP; ordered simulator stages persist with zero XP. Single-session
  success remains insufficient mastery evidence. Missing email consent denies
  communication reservation. No email sent.
- Test sessions revoked and only created account IDs deleted; post-run query
  confirms zero users, ledger rows and learning attempts. Real Auth/REST proof
  does **not** establish Google sign-in or deployed browser behavior.
- Private `qm-book-sources` populated from existing local sources: 14 PDFs,
  8,987,391 bytes, theory/solutions for reviewed Chapters 1–7 only. No Chapters
  8–13 uploaded, no learner data imported, no public PDF delivery.
- Each uploaded PDF re-read through server Storage and checked against metadata
  byte count/SHA-256; all 14 matched, page counts present. Public downloads and
  anonymous source metadata denied; disposable authenticated user also denied
  source metadata and private download. Post-run: 14 objects/metadata entries,
  zero users/ledger rows. Final CLI migration dry-run reports up to date.
- Auth URLs and existing Google client ID prepared on the new project; original
  redirect allowlist preserved and email confirmation remains required. Google
  provider remains disabled: old API config did not provide a safely verified
  reusable client-secret value. Credential-copy attempts stopped **before PATCH**;
  no invalid/placeholder secret installed, no old credential rotated.

## Remaining step — dedicated Google OAuth (updated 2026-10-02)

Latest: replacement credential safely installed on the new project, provider
enabled with the dedicated client, unrelated Auth fields unchanged. Keyed
authorize probe verified HTTP 302 to Google with the new callback. Isolated
local app prepared and opened in Codex; completed Google login/profile/session
verification is still pending owner account selection. No production switch.
See the latest `google-oauth-setup.md` checkpoint for evidence and rollback.
The creation/rotation checklist below is historical where already fulfilled.

Earlier follow-up: owner has created the dedicated Web client. Downloaded JSON
metadata matches the intended project, canonical origin and new callback.
Its secret was visible in an attached screenshot; replace only this client's
secret before installing/enabling the provider. No supplied secret was installed.
See latest `google-oauth-setup.md` checkpoint; creation-pending notes below are
historical. No duplicate client, TERMO change or production cutover is needed.

The owner ended the pause and explicitly authorized configuration/testing of
QUANTUM-only OAuth through the browser inside Codex. The dedicated Google Cloud
project `quantum-book-auth-20260926` already exists. Do not create another Cloud
project or reuse/modify `termo-web`. The earlier instructions to add a callback
to a shared client are superseded and removed from this runbook.

1. Inspect current clients in the dedicated project before creating anything.
   Use an existing suitable QUANTUM-only Web client if present. Otherwise create
   one with origin `https://quantummechanicsbook.app` and the exact callback
   displayed by the new Supabase Google provider. Expected standard callback:
   `https://crasnnvdvujzxudmbakv.supabase.co/auth/v1/callback`.
2. Configure only `quantum_rebuild` with the dedicated client ID/secret. Store the
   secret only in the provider panel/secure storage; no chat, Git or logs.
   Preserve email confirmation, nonce checks and all unrelated Auth settings.
3. Verify Google login against the new backend in an isolated local/preview
   environment, using an already-authorized return URL. Do not return a test
   session to the still-old production application. Password fixtures and a
   successful redirect alone are not a full Google login proof.
4. Preserve `termo-web`, every one of its secrets/callbacks, TERMO's project,
   production QUANTUM environment and shared credentials. Present any eventual
   production switch for the owner's final decision after C33 checks pass.

Read-only revalidation on 2026-10-02: fresh baseline history unchanged, all 634
catalog/grant/RLS checks pass, zero users/ledger rows, 14 private sources and
14 stored objects. New Google provider remains disabled with the shared client
ID staged. No provider mutation or OAuth issuance occurred this turn. Browser
form control is ineffective in this session. A subsequent live accessibility
inspection did verify the dedicated Google account/project and empty client
inventory, and the creation form is open inside Codex. No credential was issued.
See `google-oauth-setup.md` for the exact interaction blocker and remaining
rollback/verification requirements.

Official configuration reference:
https://supabase.com/docs/guides/auth/social-login/auth-google

## Release decision

Local regression: 82/82 Node tests, privilege contract and deterministic baseline
verification pass. Fresh filesystem candidate contains 377 files; digest
`bee86b08ab55a651dd690c4ba058c18076eefd5b032854a444df1cbfb30d8f2e`,
base HEAD `f667621fd4bd646f4c79844899a95342171b594e`. No new commit exists.
Final worktree security fast check: PASS, 223 files and 12 sensitive triggers;
`git diff --check` clean and fresh fingerprint verification matches. Disposable
local PostgreSQL container stopped; its synthetic databases remain recoverable.

**BLOCKED** for application production release: Google OAuth, target-bound app
environment/candidate smoke, operational recovery plan and scoped CPD/cutover
approval remain. Database installation/managed test portion is complete. Preserve
the old paused project and local source PDFs. Do not regenerate the applied
baseline; future schema fixes use new CLI-generated forward migrations in
`supabase/fresh`. Communication delivery remains disabled; C18 stays on hold.
