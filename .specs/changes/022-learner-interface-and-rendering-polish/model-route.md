# Model route

TASK_CLASS: Multi-surface front-end repair, accessibility, and consent UX
PLANNED_MODEL: gpt-6-sol
PLANNED_REASONING: medium
RATIONALE: Coordinated JavaScript/UI repair and browser validation are required; the scope is bounded after inventory.
ALLOWED_FALLBACK: gpt-6-sol / high for authentication or state defects; gpt-6-astra / high for unresolved security architecture; gpt-5.6-sol / high if needed
ESCALATION_TRIGGERS: two non-improving browser cycles, ambiguous consent state, unsafe rendering, or cross-surface state divergence
ACTUAL_MODEL: gpt-6-sol
ACTUAL_REASONING: medium
FALLBACK_OBSERVED: none
TOKENS: not measured
LATENCY: not measured
COST: not measured
EVIDENCE_SOURCE: local source diff, 44 Node tests, content/privilege/SEO/math gates, and local CDP browser audit at desktop, 390 px, 320 px, reduced motion, keyboard focus, and 200% text zoom
