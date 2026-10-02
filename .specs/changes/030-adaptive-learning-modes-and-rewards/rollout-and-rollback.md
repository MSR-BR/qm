# Rollout and rollback — authorization required

1. Resolve QM-SEC-006 and verify the exact remote migration history/project before
   any SQL. Freeze a candidate SHA and reviewed policy/graph versions.
2. Apply C21/C27/C29/C30 in the reviewed dependency order to a disposable managed
   environment. Prove explicit grants, private schema exposure, RLS and RPC behavior
   with anonymous, own-user, cross-user, owner and service roles.
3. Run the complete real historical dry run. Reconcile only approved legacy reward
   records; never transform old attempts, opens or self-reports into mastery.
4. Confirm the exact reward caps around São Paulo midnight and rolling seven-day
   boundaries in managed Postgres. Verify duplicate/offline retry behavior.
5. Deploy only the matching application after separate CPD authorization. Verify
   assessment, review, retry, Daily Challenge, simulator stages, Journey/profile,
   consent, mobile accessibility and logs with real authorized test accounts.

## Non-destructive rollback

- Before release, rollback is simply to withhold remote SQL and deployment.
- After additive migration, roll the application back to the prior approved build;
  preserve evidence/ledger rows and do not rewrite migration history.
- If awards must stop, use a new authorized forward migration to revoke the relevant
  service-role RPC execution grants. Keep read-only profile access available when safe.
- Never delete or decrement learner history to undo a reward policy. Correct future
  projections with an audited compensating event/migration after investigation.
- Retain no secrets, raw answers, e-mails or production learner snapshots in Git.
