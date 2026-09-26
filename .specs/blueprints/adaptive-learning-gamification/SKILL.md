---
name: adaptive-learning-gamification
description: Design, audit, or implement evidence-informed learning gamification for interactive books and educational apps. Use for points, rewards, missions, badges, Study Journey, chapter assessments, Daily Challenge, adaptive exercise selection, feedback, hints, mastery, learning notifications, and cross-project parity. Do not use for unrelated entertainment-game mechanics.
---

# Adaptive Learning Gamification

Build learning systems in which rewards reflect verified learning activity. Do not add points, streaks, notifications, or AI recommendations before the underlying event and learner-state contracts are trustworthy.

## Required workflow

1. Classify the request as audit, product design, implementation, migration, or release validation.
2. Read `references/pedagogy-and-recommendations.md` before making learning-policy decisions.
3. Read `references/evidence-and-evaluation.md` before selecting game mechanics, interpreting studies, making learning claims, or defining an experiment.
4. Read `references/product-policy.md` before changing points, assessments, Daily Challenge, hints, missions, mastery, or Study Journey.
5. Read `references/technical-contract.md` before changing code, APIs, schemas, events, or analytics.
6. Read `references/privacy-and-communication.md` before changing onboarding, learner modeling, e-mail, notifications, or AI personalization.
7. Read `references/validation-gates.md` before claiming completion or release readiness.
8. Inspect the project's reviewed-content registry, source manifest, authentication model, current event schema, and active Change record. Never infer parity from matching labels alone.
9. Separate research-backed principles from configurable product defaults. Record the rationale and version for every project-specific deviation.

## Non-negotiable principles

- Use retrieval, feedback, spacing, and successive relearning; do not treat passive page visits as mastery.
- Treat content-linked instructional activity as primary and structural gamification as secondary.
- Separate learning, behavior, experience, and equity outcomes; engagement is not evidence of mastery.
- Require a mechanism card for every point, badge, mission, timer, streak, or leaderboard.
- Use both errors and successful retrievals when scheduling future practice.
- Do not mark mastery after one correct answer.
- Provide graduated help before revealing a full solution, unless accessibility or learner choice requires immediate access.
- Never subtract learning points for an error and never reward repeated identical requests.
- Never let points purchase answers, assessment exemptions, grades, or easier scoring.
- Do not use a public individual leaderboard by default; social comparison must be optional, pseudonymous, bounded, and monitored for discouragement.
- Keep the server authoritative for awards, mastery transitions, and message eligibility.
- Keep an immutable, idempotent learning-event ledger and derive profiles from it.
- Explain each adaptive recommendation in learner-facing language.
- Restrict AI to reviewed, eligible source material and retain provenance.
- Keep locked or unrevised content out of search, practice, recommendations, and messages.
- Require affirmative opt-in for optional communications; do not preselect optional marketing or engagement consent.
- Measure whether the learner was actually exposed to a mechanic before evaluating its effect.

## Outputs

For an audit, report observed behavior, code/data evidence, severity, affected learner state, and the smallest safe repair sequence.

For a design, specify learning modes, eligibility, evidence, scheduling, feedback, rewards, privacy, event contracts, fallbacks, and measurable outcomes.

For implementation, create or update the project's governed Change first, implement one diagnosed layer at a time, and attach validation evidence. Prefer deterministic rules before optional AI ranking or generation.

For a release decision, require the gates in `references/validation-gates.md`; do not substitute a successful UI render for data-integrity or authenticated-flow verification.
