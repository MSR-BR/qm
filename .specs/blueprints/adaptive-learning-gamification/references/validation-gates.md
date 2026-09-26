# Validation gates

Do not report a learning-gamification Change complete until the relevant gates pass.

## Pedagogy and editorial

- Recommendation purpose is explicit.
- Every game element has an approved mechanism card and begins with a reviewed learning objective.
- Correct, incorrect, low-confidence, hinted, and solution-revealed paths are defined.
- Mastery requires evidence across sessions.
- Exercises, feedback, and simulator mappings cite reviewed sources.
- Locked/unreviewed content is excluded.
- An editor or responsible professor can review and correct generated material.
- Points cannot buy answers, grades, exemptions, easier scoring, or mastery.
- Public individual ranking is off by default; any exception is opt-in, pseudonymous, bounded, reversible, and monitored.

## Data integrity

- Award and mastery operations are atomic and idempotent.
- Duplicate requests, refreshes, and retries cannot farm points.
- Projection/profile values reconcile with the event ledger.
- Historical repair has a dry run, bounded target, duplicate protection, and evidence.
- Client clocks and mutable client fields cannot authoritatively assign rewards.

## Security and privacy

- RLS and explicit grants are tested separately.
- Anonymous, own-row, other-row, admin, and server paths are verified.
- Tokens, keys, answers, and personal data do not appear in logs or analytics.
- Optional communication is affirmative opt-in and withdrawal is tested.
- AI receives only eligible reviewed sources and minimized learner evidence.

## Product and accessibility

- Study Journey has one consistent snapshot and a safe empty state.
- Every recommendation explains why and offers an alternative.
- Daily Challenge, assessment, remediation, and simulator activity are distinct and comprehensible.
- Mobile 320 px, text zoom, keyboard, focus, screen reader, and reduced-motion checks pass.
- Loading, offline, retry, duplicate-click, and partial-failure states are tested.
- Learner-facing text is in the product's declared language.
- Simulator learning paths test prediction, meaningful interaction, comparison/reflection, and delayed retrieval rather than page opening alone.

## Automated coverage

- Unit tests cover scheduling, mastery, points, caps, and recommendation explanations.
- Database tests cover grants, RLS, idempotency, atomicity, and reconciliation.
- Handler tests cover authenticated success and all expected failure classes.
- Browser tests cover a complete authenticated learning loop.
- Contract tests verify TERMO/QUANTUM adapters against the shared event and profile versions.
- Tests verify mechanic eligibility, exposure, action, opt-out, and duplicate suppression.

## Academic evaluation

- Primary learning, behavioral, experience, and equity/safety outcomes are defined separately.
- Baseline knowledge and implementation fidelity are measured before interpreting an intervention.
- Learning claims use performance evidence and include delayed or changed-form checks when retention or mastery is claimed.
- Evaluation records sample size, assignment method, attrition, missing data, effect size, uncertainty, and negative effects.
- Attitude or engagement evidence is not reported as academic achievement.
- Retracted studies and metadata-only discovery reports cannot support a release claim.

## Release evidence

Record:

- exact revision and migration version;
- actual model/reasoning route when available;
- fallbacks or correction cycles;
- test and browser evidence;
- production smoke results;
- data-repair counts;
- open owner-review or external configuration gates.

A visual smoke test alone is not sufficient for an authenticated learning release.
