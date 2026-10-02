# C29 implementation boundary

The C28 artifacts remain the frozen methodology baseline. C29 consumes its exact
reviewed-section eligibility helper on the server; it does not activate C30's
adaptive mechanics or infer mastery from reading, simulator opens or one score.

## Authority and compatibility

- Add an append-only canonical ledger, retaining the legacy reward store and API
  response for compatibility. New section awards write both stores and the existing
  projection in one transaction, serialized by the learner profile row.
- Require a persisted, identity-matching completed progress row and server-side
  manifest eligibility. Deduplication is lifetime user + section path, never policy
  version, browser request UUID or current completion status.
- Existing reward balances must reconcile before new awards. Historical import is
  a separate, explicitly authorized operation after a reviewed dry run; installation
  does not import learner data. Legacy evidence remains unknown, not mastery.
- A single read-only snapshot RPC supplies progress, all-time assessment aggregates,
  simulator activity, reward projection and ledger consistency. The authenticated
  endpoint binds the verified actor and rejects arbitrary user targeting. Failure
  returns unavailable, never fabricated zero progress. No administrative bypass.
- Profile fields for concepts, due reviews, missions and badges explicitly report
  insufficient evidence / pending C30. Deterministic continuation uses reviewed
  reading records only. Points and reading completion are not mastery.

## Release boundary

Local implementation and isolated PostgreSQL tests only. Canonical historical
migration defects and Supabase PAM remain separate blockers. No remote migration,
backfill, commit, push or deployment is authorized by this turn. TERMO is untouched.
