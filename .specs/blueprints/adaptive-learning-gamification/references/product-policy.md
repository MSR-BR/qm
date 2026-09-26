# Product policy

## Instruction first, game layer second

Distinguish:

- **content-linked learning design:** retrieval, prediction, explanation, feedback, near-transfer, simulations, collaboration, and spaced return;
- **structural gamification:** points, badges, missions, levels, timers, streaks, and rankings.

Ship the content-linked loop first. Structural elements may clarify goals or acknowledge evidence, but they cannot rescue a weak or unmeasured learning task. Every structural element requires the mechanism card in `evidence-and-evaluation.md`.

## Learning modes

### Section practice

Purpose: apply the concept immediately after study. Use one or a few source-linked items. Award bounded completion evidence, not mastery.

### Chapter assessment

Purpose: diagnose coverage and provide a chapter-level checkpoint. Offer it manually and when a configured share of reviewed sections is complete; 80% is a reasonable starting trigger. Use a reviewed item set, source links, one clear submission state, guided review, and focused retry.

It is not the Daily Challenge.

### Daily Challenge

Purpose: provide a short spaced-retrieval session, normally 3–5 items or 5–10 minutes. Draw from due and weak reviewed concepts, plus a small interleaved share. Do not make daily participation mandatory or punish missed days.

### Guided remediation

Purpose: repair a specific misconception. Sequence:

1. name what needs attention without revealing the answer;
2. link the reviewed source or prerequisite;
3. offer graduated hints;
4. show feedback or a worked path;
5. request a changed near-transfer retry;
6. schedule later retrieval.

### Simulator activity

Purpose: explore a model, prediction, or parameter relation mapped to a reviewed concept. Count a meaningful interaction, not a page load. Prefer `predict -> manipulate -> compare -> explain`. Record `opened`, `prediction_recorded`, `meaningful_interaction`, `reflection_recorded`, and `completed_goal` separately when the simulator supports them.

## Hint ladder

1. **Orienting cue:** identify the concept or representation.
2. **Strategic cue:** suggest a principle, equation family, or diagram.
3. **Next-step cue:** reveal one justified intermediate step.
4. **Worked support:** show the solution path with explanations.

Record the highest hint used. Do not reduce existing points or shame the learner. Hint use affects future support and mastery evidence, not dignity.

## Rewards

Rewards acknowledge verified learning actions and improvement. They do not purchase correctness.

- Never award points for a raw page view, repeated API call, or refresh.
- Never subtract points for a wrong answer.
- Award once per idempotent eligible event.
- Prefer a small base reward for completing an authentic activity, a correction/review reward, and a bounded mastery or chapter milestone.
- Cap farmable events per item/session/day.
- Keep point values and thresholds in a versioned project adapter.
- Never exchange points for correct answers, option removal, assessment exemptions, grade increases, or a lower mastery threshold.
- Do not use points earned from compliance alone as evidence of physics learning.

A TERMO-compatible starting adapter may preserve existing values while migrating: section completion 20; first chapter assessment 30; guided review 10; focused retry 10; chapter mastery 80. A mere daily return should be replaced by completion of a meaningful Daily Challenge before receiving a daily reward.

## Missions, badges, and streaks

- Missions must name a learning behavior and completion condition, such as `retrieve two due concepts` or `review one corrected misconception`.
- Badges must summarize durable evidence, not status or ability labels.
- Badges must be criterion-referenced, disclose their evidence, and remain distinct from mastery.
- Streaks may celebrate continuity but must allow pauses and must not reset hard-earned mastery or points.
- Always provide a non-streak next action.

## Leaderboards and social comparison

- Do not enable a public individual global leaderboard by default.
- Prefer private self-progress, criterion progress, cooperative goals, or small team progress.
- If an individual leaderboard is justified, require explicit opt-in, pseudonyms, an opt-out path, bounded cohorts and time windows, no grade consequence, accessibility review, and monitoring for discouragement.
- Record both exposure and use. A leaderboard that was never viewed is not a delivered intervention.
- Do not interpret leaderboard preference as evidence of learning benefit.

## Study Journey

Return one consistent account-scoped view containing:

- reviewed-section progress;
- due reviews and weak concepts;
- chapter-assessment state;
- simulator evidence;
- points, level, recent badges, and active missions;
- a ranked next action with `why`, source, estimated time, and fallback choice;
- data freshness and insufficient-evidence states.

Do not assemble contradictory counters from unrelated client requests when one profile endpoint can provide a consistent snapshot.

## Implementation-fidelity surface

For every active mechanic, administrators must be able to inspect eligibility, exposure, completion, reward, duplicate suppression, and opt-out counts. A feature cannot be evaluated if the implementation did not reliably deliver it.

## AI recommendation boundary

Use deterministic eligibility and scheduling first. AI may rank eligible reviewed actions, explain a recommendation, or generate a bounded variant only when:

- sources are reviewed and published;
- notation and scope follow the book;
- source provenance is stored;
- locked content is excluded;
- the output passes automated and editorial validation appropriate to risk;
- a deterministic fallback exists;
- the learner can report an issue.
