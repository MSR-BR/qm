# Acceptance criteria

- GA4 is loaded only after opt-in, only with a validated configured Measurement ID, and only on the final production host.
- DebugView receives the approved event set without personal data or learner-generated content.
- The first-party dataset contains no learner identity column and accepts only approved server-sanitized events.
- First-party event retention is limited to 90 days; GA4 event-data retention is configured to 14 months.
- Event names, parameters, product questions, and exclusions are documented.
- Consent can be granted, denied, and reopened from the privacy interface.
- Core public pages continue to work when analytics is unavailable, blocked, or not configured.
- Automated contract checks, repository gates, and a real-browser consent journey pass.
