# Operational continuation — 2026-10-17

## Scope and authority

Owner authorized executing the proposed QUANTUM continuation and clean CPD.
TERMO, the paused old backend, Google OAuth settings, paid model calls, campaign
budgets and email activation are outside these changes. No new Change number:
C26 holds canonical implementation; C15 remains the detailed learning acceptance
gate; C16 remains GA4 property-side evidence.

Authoritative checkout: `Documents/Developer/qm`, initially clean at
`1e048ac049715aed72a48ea6277b74c4b1f5a348`, matching origin/main and production.
Old `Documents/GitHub/qm` is preserved with its existing 390 changed entries.
Execution used the current Codex session without subagents or model switches;
the exact underlying model identifier is not available as verified run metadata.

## Backend and local safety

- Read-only managed audit: quantum_rebuild, `crasnnvdvujzxudmbakv`,
  ACTIVE_HEALTHY; 634/634 grants/RLS checks; baseline 20260926204825.
- Aggregate snapshot: 3 users, 6 learning-ledger rows, 14 private source records
  and 14 Storage objects. No user rows or secrets printed.
- Eight server-only RLS-without-policy INFOs remain expected; the existing
  leaked-password-protection WARN remains. Google-only authentication is
  unchanged; this run did not enable password login.
- Ignored local `.env.local` had the paused historical backend. Four backend/
  Google client fields were aligned securely in memory, written mode 0600;
  unrelated Gemini configuration was preserved. No remote environment changed.
- `npm run audit:supabase` now invokes the read-only current-backend catalog.
  The historical mutating password-fixture audit requires an explicit isolated
  localhost target and does not load production credentials from .env.local.
- Local development denies dotfiles and server-source directories. No .env,
  lib source or .git content is served by the local test server.

## Local recovery only — owner decision

Owner chose “Por enquanto, somente backup local” on 2026-10-17.
Archive (outside Git):
`/Users/marioreis/Library/Application Support/QUANTUM/backups/backup-2026-10-17.qmbak`.
SHA-256: `aefe15aa640b450c208858f7421e176bbb6887891bdf215969f34f199eb097ac`.
Snapshot data export timestamp: 2026-10-17T21:11:17.821Z.

Five SQL exports (schema/data/roles/migration history) and fourteen private PDFs,
AES-256-GCM; all embedded hashes and tamper rejection verified. Key remains in
macOS Keychain service “QUANTUM recovery archive”, account
`crasnnvdvujzxudmbakv-backup-2026-10-17`; no key value is recorded here.
The earlier C33 archive remains intact. No external copy or automatic retention
schedule was created. This run verifies encryption and content integrity; it is
not a new full restoration rehearsal of the current snapshot. Device-loss
recovery still requires an independent protected copy and key.

## External evidence limitations

GSC Wizard returned an empty property list. No affected examples were available
and no validation request was submitted. In-app browser automation failed before
opening any page because of a symlinked writable-root executor configuration.
No executor security setting or other project was changed to bypass this error.

GA4 public configuration is enabled with G-X5Y1C68QMN. Browser/handler tests
normalize legacy and root URLs and strip sensitive parameters. They do not prove
GA4 DebugView receipt. C15's real Google-account learning loop and screen-reader
review remain open; public Chrome checks and synthetic SQL tests are separately
identified. No new production user, learning attempt or points award was created
for QA.

The learning policy remains unchanged: reviewed Chapters 1–7, source-backed
activities, no reward for simulator opening, no extra Daily Challenge points,
server-authoritative idempotent ledger and multi-session evidence for mastery.
