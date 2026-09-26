# Acceptance criteria

## Local implementation gate

- [x] Assessment save/history use the verified learner and return only that learners summary data in automated handler tests.
- [x] Section completion is server-authoritative and calls one atomic, idempotent reward RPC.
- [x] The reconciliation planner includes only eligible completed sections without an existing reward.
- [x] Simulator pages initialize the shared auth runtime and deduplicate exploration within one browser session.
- [x] Chapters 8–13 remain ineligible in the handler, migration, and reconciliation contracts.
- [x] Local content, corpus, source, SEO, math, renderer, and automated-test gates pass.

## Remote production gate

- [ ] Reconcile the linked migration history and apply the C21 migration to QM project `plqiofznjlbpfufigpcp` only.
- [ ] Run the reconciliation in dry-run mode successfully, inspect the candidate count, then run an explicitly confirmed apply once.
- [ ] Run the temporary-user Supabase audit and confirm grants plus RLS boundaries for attempts, progress, rewards, and simulator activity.
- [ ] Verify in the deployed app that an authenticated assessment is saved and appears in the same learners history.
- [ ] Verify that repeating the same section-completion request does not increase XP twice.
- [ ] Verify that opening a simulator increases the Study Journey simulator count once per meaningful session.
- [ ] Record production evidence without tokens, keys, e-mail addresses, assessment answers, or other learner content.
