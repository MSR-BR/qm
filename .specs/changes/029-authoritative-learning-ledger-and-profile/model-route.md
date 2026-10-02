# Model route

TASK_CLASS: High-risk database, authorization, ledger, and projection implementation
PLANNED_MODEL: gpt-6-astra
PLANNED_REASONING: high
RATIONALE: Atomic state transitions, migration safety, and cross-user isolation warrant the strongest available reasoning route.
ALLOWED_FALLBACK: gpt-6-sol / xhigh; gpt-5.6-sol / xhigh
ESCALATION_TRIGGERS: reconciliation mismatch, cross-user leakage, non-idempotent award, or two failed migration tests
ACTUAL_MODEL: host-selected Codex model; exact variant not exposed to this execution
ACTUAL_REASONING: not exposed to this execution
FALLBACK_OBSERVED: none observed; no model-switch tool was used
TOKENS: not measured
LATENCY: not measured
COST: not measured
EVIDENCE_SOURCE: 2026-09-26 local implementation and validation-evidence.md; planned route is not claimed as actual runtime metadata

Two initial SQL-test fixtures omitted existing required progress fields
(`page_title`, then `completed_at`). All migration SQL had replayed successfully;
the fixture setup failed before transaction tests. The complete baseline schema
was inspected, fixtures corrected, and validation expanded to exact privilege and
rollback checks. No validation bypass or weakened schema was introduced.
