# C30 design — evidence before rewards

## Instructional cycle

```text
reviewed study source
  -> assessment or due Daily Challenge
  -> server-scored evidence (correctness + confidence + help state)
  -> guided explanation and graduated hints when needed
  -> changed-form focused retry
  -> delayed, interleaved retrieval
  -> concept state and next-action recommendation
```

The engine distinguishes behavior, practice evidence, reward and mastery. Points
motivate participation but never substitute for the evidence rule. Daily Challenge,
chapter assessment and simulator activity have distinct contracts and interfaces.

## Source and selection boundary

- Only reviewed Chapters 1–7 and exact source-manifest identities are eligible.
- The versioned graph records concepts, prerequisites and representations.
- Daily Challenge draws only from reviewed sources already completed by the learner.
- Priority order is deterministic: unresolved errors, prerequisites, successful
  retrieval lacking delay/variation, due retrieval, then interleaving.
- Every recommendation includes reason, source, expected duration and alternative.
- Optional AI can only reorder a bounded eligible-ID set and must fall back to the
  deterministic order. It has no scoring, unlocking, reward or mastery authority.

## Mastery and reward boundary

One answer is never mastery. A concept needs two correct unaided retrievals across
two sessions and two representations, separated by at least 24 hours. A chapter
needs the three represented assessment concepts. Hint use, solution reveal,
simulator opening and legacy history are retained as evidence or activity but do not
meet that mastery rule.

Rewards are inserted in the same transaction as evidence and projection updates,
using server-created identities and idempotency. Review caps use the learner-facing
São Paulo local day and a rolling seven-day chapter window. There are no negative
points or public individual leaderboards.

## Simulator boundary

A simulator cycle records prediction, at least two meaningful input interactions,
comparison/reflection and goal completion in order. These stages produce no XP or
mastery. They make the activity interpretable and available to later academic
evaluation instead of treating an iframe/page open as learning.

## Security boundary

The browser never writes instructional evidence directly. Verified server handlers
call narrowly granted RPCs. RLS and explicit object privileges remain separate
controls; private contracts are not browser-readable. Raw answers, explanation text,
tokens and provider errors are not stored in the C30 ledger evidence. Remote
application remains a separate S3 release decision.
