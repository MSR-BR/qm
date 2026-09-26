# Model route

TASK_CLASS: High-risk database, authorization, ledger, and projection implementation
PLANNED_MODEL: gpt-6-astra
PLANNED_REASONING: high
RATIONALE: Atomic state transitions, migration safety, and cross-user isolation warrant the strongest available reasoning route.
ALLOWED_FALLBACK: gpt-6-sol / xhigh; gpt-5.6-sol / xhigh
ESCALATION_TRIGGERS: reconciliation mismatch, cross-user leakage, non-idempotent award, or two failed migration tests
ACTUAL_MODEL: not executed
ACTUAL_REASONING: not executed
FALLBACK_OBSERVED: not executed
TOKENS: not measured
LATENCY: not measured
COST: not measured
EVIDENCE_SOURCE: pending execution record
