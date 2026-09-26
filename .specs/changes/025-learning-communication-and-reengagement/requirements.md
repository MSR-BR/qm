# Requirements

All requirements below are inherited by C32 together with academic evaluation and implementation-fidelity requirements from the shared learning contract.

- Keep optional learning-update e-mail disabled until the learner explicitly opts in.
- Separate essential account/transaction messages from optional engagement messages.
- Send only when there is a meaningful due review, an unfinished learner-requested plan, or a milestone the learner asked to track.
- Default cap: no more than one optional message per day and two per seven-day period; make project adapters configurable.
- Respect the learner's timezone, quiet hours, pause state, and one-click unsubscribe.
- Include a direct route to the recommended reviewed activity and explain why it was selected.
- Never include sensitive performance detail in subject lines or public notification previews.
- Record delivery, bounce, unsubscribe, and learning-action outcomes without storing message content in analytics.
- Treat opens and clicks as delivery or behavior evidence only; evaluate whether messages lead to authentic due practice and whether they increase opt-outs, annoyance, or inequitable access.
- Do not use threatened point loss, expiring mastery, public rank changes, or artificial urgency to drive return visits.
- Keep delivery inactive until sender-domain verification, provider secrets, and production tests pass.

## Risks

- Ambiguous consent or preselected opt-in can invalidate consent.
- Excessive reminders can harm trust and learning motivation.
- Optimizing open or return rates can increase activity without improving retention and can create coercive product behavior.
- E-mail links can disclose learner identifiers unless short-lived, scoped routes are used.
