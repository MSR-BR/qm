# Pedagogy and recommendation policy

## Evidence-backed principles

1. **Retrieval over passive review.** Practice should require the learner to recall, choose, derive, explain, or predict before seeing the answer. Retrieval practice improves long-term retention compared with repeated study ([Roediger & Karpicke, 2006](https://pubmed.ncbi.nlm.nih.gov/16507066/)).
2. **Spacing over massing.** Return to concepts across sessions. Distributed practice has a robust benefit, while the best interval depends on the desired retention interval ([Cepeda et al., 2006](https://pubmed.ncbi.nlm.nih.gov/16719566/)).
3. **Successive relearning.** Require successful retrieval again after a delay instead of treating one success as mastery ([Rawson & Dunlosky, 2022](https://www.psychologicalscience.org/journals/current-directions/09637214221100484/)).
4. **Feedback after an attempt.** Correct errors, but also give feedback after low-confidence correct answers because feedback can improve their retention ([Butler, Karpicke, & Roediger, 2008](https://pubmed.ncbi.nlm.nih.gov/18605878/)).
5. **High retrieval success with support.** If an item is too difficult, use prerequisites, cues, worked steps, or a simpler near-transfer item rather than repeating unproductive failure. Retrieval benefits depend on achieving adequate retrieval success ([Pastötter & Bäuml, 2020](https://pubmed.ncbi.nlm.nih.gov/32418183/)).

These principles constrain the design. Exact weights, point values, thresholds, and intervals below are configurable product defaults, not universal scientific constants.

## Academic interpretation boundary

Read `evidence-and-evaluation.md` before translating a gamification study into product policy. Structural elements such as points, badges, rankings, timers, and streaks may change attention or motivation without improving conceptual performance. Report the outcome that was actually measured.

Use a mechanism chain for each feature:

`reviewed learning objective -> authentic learner action -> game element -> psychological mechanism -> evidence -> separate learning measure -> risk/fallback`.

The chain must begin with the learning objective. Do not begin with a desired mechanic.

## Physics exercise sequence

Prefer items that make physical reasoning observable:

1. prediction or qualitative expectation;
2. model, assumptions, basis or representation;
3. one justified calculation, derivation, comparison, or simulator action;
4. feedback tied to reviewed material;
5. interpretation with units, limiting cases, normalization, probability, or measurement meaning;
6. changed near-transfer retry when evidence is weak;
7. later retrieval in another problem form.

Use concept and prerequisite identifiers to support non-linear paths. Treat a single response as noisy evidence: an incorrect answer may be a slip or misconception, and a correct multiple-choice response may be a guess.

## Evidence recorded per concept

Maintain evidence at the concept or skill level, not only at chapter level:

- reviewed source and prerequisite identifiers;
- attempt time and learning mode;
- correctness or rubric outcome;
- learner confidence when requested;
- hint level used;
- whether the solution was revealed;
- response duration only when useful and disclosed;
- session identifier and due date;
- provenance and validation state for generated items;
- representation or problem form;
- prediction and post-activity reflection when the mode is a simulator;
- mechanic exposure when evaluating a badge, mission, ranking, or other intervention.

Do not infer personality, intelligence, disability, or high-stakes aptitude from these observations.

## Recommendation priority

Rank eligible activities using this order:

1. overdue concepts with recent errors, solution reveal, or low confidence;
2. missing prerequisites for the learner's current goal;
3. concepts answered correctly but not yet retrieved successfully in a later session;
4. due stable concepts for maintenance;
5. a bounded interleaved challenge from reviewed material;
6. optional new material only when prerequisites and editorial availability permit it.

Use a configurable mixture rather than an all-error queue. A useful starting policy is approximately half weak/overdue evidence, one quarter prerequisites, and the remainder spaced successful material plus interleaving. Tune with outcome data.

## Scheduling defaults

- After an error: give feedback, offer graduated help, and schedule a changed near-transfer retry in the same session. Also schedule a later retrieval.
- After a low-confidence correct answer: give concise feedback and schedule an earlier check than for a confident correct answer.
- After a confident unaided correct answer: lengthen the interval.
- After two or more successful unaided retrievals in separate sessions: move toward maintenance intervals.
- Suggested starting intervals are same session, about 1 day, 3–7 days, and 14–30 days. Project adapters must tune these to course cadence and retention goals.
- Learners may override or defer recommendations. Preserve their chosen learning goal.

## Mastery

Mastery requires repeated, unaided success across separate sessions and, for important concepts, more than one representation or problem form. A simulator visit, page completion, or one multiple-choice response is evidence of activity, not mastery.

When evidence is sparse, report `insufficient evidence` rather than a precise mastery percentage.

## Collaboration and challenge calibration

Prefer cooperative missions, peer explanation, and shared goals when social learning is appropriate. Competition is never required. Calibrate difficulty so the learner can succeed with support; repeated unsupported failure is not desirable challenge.
