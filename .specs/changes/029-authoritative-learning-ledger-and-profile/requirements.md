# Requirements

- Depend on C21, C27, and the C28 adapter.
- Inherit the shared learning contract and the Pó Mágico `S3_SENSITIVE` security overlay without weakening either one.
- Use verified session identity; never trust client-supplied `user_id`.
- Award and project in one transaction/RPC with unique semantic idempotency.
- Keep the ledger immutable; derive profiles and allow dry-run reconciliation.
- Return a versioned profile with evidence, due reviews, assessment/simulator state, rewards, missions, badges, and an explained next action.
- Preserve RLS, least privilege, fixed `search_path`, explicit execute grants, and deterministic rollback.
- Keep migration application, history reconciliation, provider changes, remote audits, and deployment behind separate explicit authorization.
