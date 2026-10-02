# Tasks

- [x] Freeze and consume C28 eligibility/semantics without activating C30.
- [x] Design forward-only ledger, private reviewed allowlist and snapshot migration.
- [x] Implement atomic/idempotent section rewards and the authenticated profile endpoint.
- [x] Build offline historical dry-run, counts, eligibility checks and operator-only import.
- [x] Prove anonymous/own/cross/admin-metadata/service behavior locally.
- [x] Replay SQL and test concurrency/rollback in isolated PostgreSQL with synthetic managed schemas.
- [x] Record rollback and production release order.
- [ ] Authorized real-history dry run, exact Supabase/PostgREST proof and release gates.

Local implementation completed on 2026-09-26. Production remains blocked, not completed.

## C28 handoff constraints

- Use `../028-unified-learning-contract-and-adapter/event-inventory.md` and the versioned adapter/event map as the current-state baseline.
- Verify persisted completion and reviewed identity before new section awards; client status alone is not sufficient authority.
- Preserve legacy rewards and unknown evidence explicitly. Do not manufacture concepts, sessions, help state or retroactive mastery from self-report, opens or analytics.
- Unify the four independent Study Journey reads with per-domain freshness/unavailable states; history limited to 20 assessments is not an all-time total.
- A policy version change or completion undo must not reset semantic reward caps.
