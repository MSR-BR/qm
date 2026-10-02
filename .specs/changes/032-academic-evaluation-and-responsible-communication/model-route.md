# Model route

TASK_CLASS: Academic evaluation, consent, privacy, scheduler, and communication
PLANNED_MODEL: gpt-6-sol
PLANNED_REASONING: high
RATIONALE: Evaluation validity and consent-sensitive server logic require strong interdisciplinary reasoning.
ALLOWED_FALLBACK: gpt-6-astra / high for experimental-design conflicts; gpt-5.6-sol / high
ESCALATION_TRIGGERS: ambiguous consent, outcome conflation, privacy leak, or two failed eligibility/delivery test cycles
ACTUAL_MODEL: unavailable from runtime metadata
ACTUAL_REASONING: unavailable from runtime metadata
FALLBACK_OBSERVED: none observed
TOKENS: not measured
LATENCY: not measured
COST: not measured
EVIDENCE_SOURCE: local C32 validation-evidence.md; runtime does not expose a trustworthy exact model/reasoning identifier
