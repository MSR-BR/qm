# Tasks

- [x] Inventory the exact operations used by the assessment, gamification, study-progress, and simulator handlers.
- [x] Add the narrow Supabase grants and atomic reward function in a versioned migration.
- [x] Update the server handlers to call the atomic function and distinguish authentication, validation, and storage failures.
- [x] Make simulator progress initialize the authentication runtime reliably and debounce duplicate exploration events.
- [x] Add an idempotent historical reconciliation planner and an explicit-confirmation apply mode.
- [x] Add local handler, migration-contract, reconciliation, and simulator-runtime regression tests.
- [x] Add a scoped temporary-user Supabase audit for the affected tables, RPC, and RLS boundaries.
- [ ] Reconcile the linked QM migration history before applying the new migration.
- [ ] Apply the migration to the QM Supabase project only after explicit scoped authorization.
- [ ] Run dry-run reconciliation, inspect counts, and apply the approved candidate set once.
- [ ] Run the Supabase audit and authenticated production browser flow; attach sanitized evidence.
