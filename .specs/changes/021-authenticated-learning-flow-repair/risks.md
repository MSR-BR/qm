# Risks and controls

| Risk | Control | Release evidence |
| --- | --- | --- |
| Explicit grants broaden browser access | Grants are limited to `service_role`; browser RLS remains in place; the reward RPC is revoked from `public`, `anon`, and `authenticated`. | Static migration test plus temporary-user RLS audit. |
| Migration-history drift applies SQL in the wrong order | Inspect the linked migration list and reconcile history before any push. The migration timestamp is newer than the latest observed remote migration. | Supabase CLI migration listing attached to the production gate. |
| Historical reconciliation awards duplicate XP | Candidate selection excludes existing idempotency keys; apply calls the same atomic RPC; apply requires the exact QM project confirmation. | Dry-run counts, second-run zero/duplicate result, profile/event comparison. |
| Concurrent section requests double-award | The RPC locks the profile row and inserts a unique idempotency key before updating the aggregate. | Handler test plus repeated production request. |
| Simulator refreshes inflate Study Journey | Browser-session key deduplicates one user/path exploration per session; the server table retains its uniqueness constraints and RLS. | Runtime test plus production simulator count. |
| Server errors expose database details | Handlers return fixed retryable messages and do not return Supabase error payloads. | Handler failure tests. |
| A production audit leaks learner data | The audit creates temporary users, reports only counts/status, and deletes the users in `finally`. | Sanitized audit output review. |

## Rollback boundary

Before production application, rollback is simply to withhold the migration and deployment. After application, rollback must be a new audited migration that revokes the added grants and drops the RPC only after handlers are reverted; historical reward events must never be deleted automatically.
