# Model route

TASK_CLASS: Supabase authorization and migration hardening
PLANNED_MODEL: gpt-6-sol
PLANNED_REASONING: high
RATIONALE: Cross-cutting SQL, RLS, handler, migration, and regression analysis requires a strong coding route.
ALLOWED_FALLBACK: gpt-6-astra / high for unresolved authorization interactions; gpt-5.6-sol / high if the primary route is unavailable.
ESCALATION_TRIGGERS: two non-improving validation attempts, an unexplained privilege mismatch, migration-order conflict, or evidence of cross-user access.
ACTUAL_MODEL: GPT-5 Codex family; exact SKU not exposed
ACTUAL_REASONING: not exposed
FALLBACK_OBSERVED: no
TOKENS: not exposed
LATENCY: not measured
COST: not exposed
EVIDENCE_SOURCE: runtime system identity and local validation records
