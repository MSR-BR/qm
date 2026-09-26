# Privacy and communication

## First authenticated use

Present a short, versioned onboarding step before account-only learning features:

1. required acknowledgement of the current privacy/terms notice;
2. a plain-language description of learning data used for progress and recommendations;
3. a separate optional choice for learning-update e-mails;
4. links to details and a later preferences screen.

Do not preselect the optional e-mail choice. The European Commission states that valid consent requires an affirmative act and that pre-ticked boxes are not valid consent ([information for individuals](https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en); [legal grounds for processing](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data_en)).

Keep essential account/security messages separate from optional learning-engagement messages.

## Data minimization

- Store evidence needed to resume learning and explain recommendations.
- Avoid raw free-text responses when a rubric outcome or bounded feature is sufficient.
- Do not use learning data for advertising profiles.
- Do not place sensitive performance detail in URLs, e-mail subjects, push previews, or general analytics.
- Define retention, deletion, export, and account-close behavior.
- Let the learner inspect and reset recommendation history where feasible without corrupting immutable audit needs.

## Explainability and control

Every recommended activity should answer:

- Why am I seeing this?
- Which reviewed source or prior activity is it based on?
- How long should it take?
- Can I choose something else or defer it?

Do not present a probabilistic estimate as a diagnosis. Use `needs more evidence` when appropriate.

## E-mail and notifications

- Require explicit opt-in for optional learning messages.
- Use meaningful triggers: due review, learner-requested continuation, or milestone.
- Default cap: one optional message per day and two per seven days, configurable per project after measurement.
- Respect local timezone, quiet hours, pause, and one-click unsubscribe.
- Avoid guilt, loss framing, and deceptive urgency.
- Include a direct route to reviewed content and a concise explanation of the recommendation.
- Record eligibility, send, delivery, bounce, unsubscribe, and subsequent learning action without storing message bodies in analytics.
- Keep a no-email path to every core feature.

## AI privacy

- Send only the minimum source and learner evidence needed for the bounded task.
- Prefer concept-level features to complete histories.
- Record the provider/model route and policy version without logging prompts that contain personal data.
- Provide deterministic fallback when the AI provider is unavailable or consent does not cover the operation.
