# Requirements

## Confirmed production defects

- Authenticated assessment submission currently returns `500` with `Could not save your assessment attempt.`
- Assessment history currently returns `500`.
- Section reward submission currently returns `500` with `Your learning profile could not be prepared.`
- Simulator activity can be inserted through an authenticated browser session, but simulator pages do not reliably initialize the shared authentication runtime, so activity is not recorded from the real UI.
- Learners may already have completed study-progress rows without the corresponding gamification event or profile points.

## Data and security

- Add an auditable Supabase migration with the minimum explicit table/function grants required by the server-side `service_role` workflows.
- Preserve row-level security for browser roles and do not expose the service-role credential to the client.
- Replace the non-atomic event-then-profile reward update with an idempotent, server-authoritative database operation.
- Define one idempotency key for each awardable learning event.
- Reconcile eligible historical section completions once, without awarding duplicates.
- Keep chapter availability rules authoritative: locked Chapters 8–13 must not produce assessments, rewards, or simulator recommendations.

## Runtime behavior

- Assessment creation, save, and history must succeed for an authenticated learner.
- A successful section completion must create exactly one reward event and update the aggregate profile exactly once.
- Simulator pages must initialize or await the shared authentication client and record an exploration event once per meaningful session.
- Failure messages must be singular, actionable, and safe to retry.

## Testing

- Add handler tests for authenticated assessment save/history and reward idempotency.
- Extend the Supabase audit to cover study progress, gamification profiles/events, chapter attempts, simulator activity, grants, and RLS boundaries.
- Add a browser test for one section completion, one simulator exploration, and one assessment submission.
- Record production evidence without logging tokens, keys, e-mail addresses, or assessment answers.

## Risks

- Incorrect grants could broaden Data API access.
- A non-idempotent reconciliation could double learner points.
- A simulator event recorded on every page refresh could inflate progress.
- Schema repair without an end-to-end authenticated test could reproduce the current false-positive release state.
