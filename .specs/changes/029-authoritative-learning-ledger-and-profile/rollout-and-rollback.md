# Rollout and rollback — authorization required

1. Resolve QM-SEC-006 and the Supabase access incident separately. Compare exact
   remote/local history read-only first. Do not rename historical migrations ad hoc.
2. Freeze the candidate SHA, migrations, policy and reviewed allowlist; obtain
   scoped approval for the exact QM project and backup/recovery plan.
3. Apply approved prerequisites and C29 in dependency order in a disposable managed
   environment first. Validate explicit grants, RLS, PostgREST and two real identities.
4. Obtain a complete, narrowly scoped export of reward profiles/events/ledger only
   with authorized access. Keep it outside Git. Use the offline planner, review all
   mismatches and export completeness. Pseudonymous reports are still private data.
5. After explicit approval, call the operator-only `reconcile_qm_legacy_rewards`
   for each reviewed account with expected count/XP. Recheck ledger totals. It adds
   provenance records only, does not invent points or erase balances. Missing
   historical section rewards remain a separate C21 reconciliation decision.
6. Only after database and history gates pass, deploy the matching application
   with separate CPD authorization. Verify actual login, persisted completion,
   duplicate requests, profile freshness, assessments and simulator records.

## Reconciliation input

`node scripts/plan-qm-ledger-import.mjs /private/path/snapshot.json`

Shape: `{complete:true, profiles:[...], rewardEvents:[...], ledger:[...]}`.
Each array must cover the same complete actor scope (not a paginated first page).
Required projection fields: user_id/xp_total/level/studied_items_count. Reward
fields: id/user_id/event_type/chapter_id/item_id/page_path/xp_delta. Ledger fields:
user_id/event_type/legacy_reward_id/content_id/xp_delta. See synthetic fixture.
No `--apply` mode and no network access in the planner. Real dry-run remains pending.

## Non-destructive rollback

- Do not delete/rewrite reward events or ledger entries to reverse a deployment.
- Roll back application to the previously approved build; C29 keeps the legacy
  reward signature and projection compatible. Leave additive schema and triggers.
- If awarding must be halted, obtain authorization to revoke service-role EXECUTE
  on `record_qm_section_completion_reward(uuid,text,text,text,text)`; reading progress
  remains available and saved. Re-grant only after investigation and fresh gates.
- An authorized restoration of DB contents requires its own reviewed backup plan;
  never silently restore old profiles over newer learner events.
- Preserve support evidence without tokens, answers, e-mails or real snapshots in Git.
