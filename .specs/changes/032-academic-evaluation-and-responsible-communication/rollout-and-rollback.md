# Rollout and rollback

## Authorized rollout order

1. Resolve migration-history blocker `QM-SEC-006`.
2. Release and prove C21/C27/C29/C30 in their recorded order.
3. Review and apply the C32 forward migration to the exact QUANTUM project.
4. Prove grants/RLS/RPC behavior with anonymous, own-user, second-user, owner and
   service identities; prove opt-in/off/pause/unsubscribe/caps/quiet hours.
5. Configure a strong server-only unsubscribe secret and provider key; verify
   the sender and test only the responsible account.
6. Keep `QM_LEARNING_EMAIL_DELIVERY_ENABLED` off while validating preview and
   failure behavior.
7. Obtain a separate explicit authorization before enabling production delivery.
8. Add any scheduler or provider webhook only through another reviewed Change.

## Rollback

- Disable `QM_LEARNING_EMAIL_DELIVERY_ENABLED` first; learning remains available.
- Remove no learner evidence during incident response.
- Keep opt-out state effective even if the delivery subsystem is disabled.
- Roll application code back independently; the additive C32 schema may remain.
- Use a new forward migration for schema correction. Do not rewrite applied
  history or drop append-only communication evidence ad hoc.
