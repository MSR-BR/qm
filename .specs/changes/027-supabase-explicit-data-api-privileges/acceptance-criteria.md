# Acceptance criteria

- [x] All 13 tables, 9 active functions, and 2 identity sequences have an explicit decision.
- [x] `service_role` receives exactly `SELECT/INSERT/UPDATE` on reward profiles, `SELECT/INSERT` on reward events, and `SELECT/INSERT` on assessment attempts.
- [x] `qm_analytics_events_id_seq` has explicit `USAGE/SELECT` for server inserts.
- [x] No new browser write access is introduced; RLS remains enabled on every public table.
- [x] C21 no longer grants unused service-role access to simulator activity.
- [x] Static checks fail when a future migration adds an unclassified table, function, or sequence.
- [x] Unit checks bind handler operations to the privilege contract.
- [x] No remote mutation or deployment occurred.
- [x] C21/C27 SQL replays and resets successfully in a disposable local stack after documented temporary normalization of two pre-existing migration-history defects.
- [x] Effective grants match the contract; all 13 project tables retain RLS; database lint reports no schema errors.
- [ ] The canonical migration directory resets without compatibility aliases. This is blocked by duplicate historical `20260531` migration versions and an older unconditional revoke of an optional helper; applied history must not be rewritten casually.
- [ ] Authorized remote application and post-migration proof are complete.
