# Validation evidence

Date: 26 September 2026

C33 integration correction: the original checks below were static/unit-only.
Real SQL replay subsequently found an invalid aggregate CTE (`sent` missing).
C33 corrected the unpublished migration, event semantics and recipient-scoped
provider deduplication, then executed all 21 SQL files and the report successfully.
Use C33 `validation-evidence.md` for the current candidate and release decision.

## Verified locally

- `npm run check`: content structure and explicit Supabase privilege contract pass
  with 25 tables, 22 functions, 2 sequences and 21 local migrations.
- `npm run test:learning-contract`: 7/7 pass.
- `npm run test:learning-profile`: 7/7 pass.
- `npm run test:adaptive-learning`: 6/6 pass.
- `npm run test:learning-help`: 4/4 pass.
- `npm run test:learning-evaluation`: 8/8 pass.
- `npm run test:operational`: 8/8 pass.
- `npm run test:supabase-privileges`: 4/4 pass.
- Focused syntax checks pass for communication, evaluation, preferences and local
  server handlers.
- Pó Mágico security fast check `--mode worktree`: PASS; 203 files inspected and
  seven sensitive triggers classified before the final documentation-only edits.

## Covered behavior

- opt-in off, timestamped consent, valid time zone and pause;
- reviewed-source-only due-review planning;
- quiet hours, daily and rolling caps, and SQL transaction lock;
- signed current-consent unsubscribe token with bounded input and strong secret;
- RFC one-click unsubscribe headers and non-coercive fixed template;
- generic free-form bulk send disabled;
- descriptive five-family outcome report and analytics authority separation;
- explicit grants and owner-only aggregate reporting;
- production delivery disabled without a separate flag.

## Not checked / not authorized

- Applying C32 or any earlier pending migration to managed Supabase.
- Managed Supabase/PostgREST role behavior and two-user isolation.
- Real sender, provider sandbox/production delivery, webhook or bounce behavior.
- Environment secrets, scheduler, deployment, commit or push.
- Causal efficacy, confidence intervals or transfer beyond the reviewed in-app
  evidence. The operational report intentionally returns no effect size.
