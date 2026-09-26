# Model routing record

- Task class: multi-surface front-end repair, accessibility, and privacy UX.
- Planned primary route: `gpt-6-sol / medium`; escalate to `gpt-6-sol / high` for authentication, consent-state, or cross-surface state defects.
- Allowed fallback: `gpt-6-astra / high` for unresolved security/architecture interactions; `gpt-5.6-sol / high` if the primary family is unavailable.
- Required checks: React/JavaScript quality as applicable, browser verification, accessibility, and English-copy audit.
- Actual implementation route: `gpt-6-sol / medium`.
- Fallbacks: none.
- Escalation triggers observed: none.
- Local gates: passed; authenticated production evidence and remote release were intentionally not executed.

The implementation stayed within the planned bounded UI/consent route and did not modify learning or reward semantics.
