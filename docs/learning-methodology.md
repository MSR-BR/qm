# How learning works in QUANTUM

**Public methodology guide · policy `qm-learning-policy-2026-09-25.1` · updated 26 September 2026**

This guide explains the learning design used by the QUANTUM interactive Quantum Mechanics book. It describes product intent and evidence-informed principles; it is not a claim that the app's effectiveness has been established in a controlled study. Features that save account-based records require sign-in and may be staged while operational changes are rolled out.

## Learning activities and their purposes

- **Reading and reviewed sections** introduce concepts and provide worked explanations. Opening or completing a section is useful progress tracking, but is not by itself evidence of durable understanding.
- **Practice and guided review** help retrieve ideas and address gaps. A wrong answer, a request for help, or uncertainty should lead to explanatory feedback, a useful hint and another opportunity—not punishment. A correct answer with low confidence can still be worth revisiting.
- **Chapter assessments** sample understanding across reviewed material and link questions to their source sections. They are assessments, not the Daily Challenge; a score is one signal and does not by itself establish mastery.
- **Daily Challenge** is an optional short retrieval activity based on reviewed material the learner has studied. It can prioritize recent difficulty, prerequisites, delayed retrieval and interleaving. There is no missed-day penalty and no extra point bonus just for completing the daily activity.
- **Simulators** support prediction, meaningful manipulation, comparison and reflection. Opening a simulator is only an activity. A guided cycle provides richer evidence, but a single cycle is not mastery and simulator interaction does not directly award points.

## How a next activity is chosen

Recommendations use the learner's eligible reviewed content and available learning evidence, such as prior responses, requests for help, confidence when collected, elapsed time since retrieval, prerequisites and simulator reflections. A gap or recent error can prompt guided review and a focused retry; success can lead to a later retrieval or a different representation. The aim is to balance targeted practice with revisiting material over time—not to label a learner from one answer.

Recommendations are suggestions. Learners can choose another available reviewed activity. The app should explain why an activity is suggested and should not use points, badges or streaks to gate access to explanations, correct answers or learning content.

## What counts as learning evidence

The design distinguishes **activity** (for example, opening a page), **performance** (a response on a particular attempt), and **evidence consistent with learning** (successful retrieval on more than one occasion, without help, after time has passed and in more than one representation). Evidence accumulates; no single score, streak, badge or simulator event is a diagnosis or proof of mastery.

When an answer is incorrect, feedback should help the learner understand the relevant idea and offer a next step. Hints should be graduated: orient attention first, then offer more specific support, while leaving room for the learner to do the reasoning. Correctness after revealing a solution should not be treated as unaided retrieval.

## Points, badges and streaks

Points and badges are motivational feedback for eligible learning actions, not grades, money, a measure of intelligence, or proof of understanding. QUANTUM separates those rewards from learning evidence. Repeated or automated activity should not create unlimited rewards. No points are awarded merely for opening a simulator, and the Daily Challenge has no extra daily completion bonus. If a points total is unavailable or under reconciliation, the app should say so rather than inventing or silently resetting a total.

## Role and limits of AI

Where an AI feature is offered, it may help organize or suggest eligible reviewed activities. It does not replace editorial review, determine a learner's worth, independently certify mastery, or override the reviewed-content and safety rules. Learners should be able to inspect the source section and report a questionable question, explanation or recommendation. An AI-generated draft is not a reviewed exercise until it passes the applicable review process.

## Data and privacy

When account-based learning features are enabled, the app may use a learner's own activity records—such as section progress, responses, assessment attempts, help use, confidence when supplied, simulator stages and reward records—to show a private study journey and inform recommendations. These records are not a public leaderboard. Sign-in is required for personal persistence; optional learning email is a separate affirmative preference, off by default. The server applies a maximum of one message per local day and two in seven days, 21:00–07:00 quiet hours, no-send when the time zone is unknown, pause and one-click unsubscribe. A message can only link to reviewed eligible content and must explain its non-coercive reason. Consult the [Privacy and communication settings](../index.html?view=preferences) and [Privacy information](../index.html#privacy) for current controls and notices. Do not include passwords, access tokens or sensitive personal information in a support report.

## Evaluation boundaries

Evaluation separates learning, behavior, experience, implementation fidelity, and equity/safety. Retention, transfer, or mastery claims require baseline evidence plus delayed retrieval or a changed representation. GA4 and privacy-sanitized product analytics describe behavior only: they cannot award points, establish mastery, or determine message eligibility. Reports must name their population, sample, denominator, mechanism exposure, attrition, missing data, effect size when justified, uncertainty, adverse effects, and limitations. The current operational report is descriptive unless a separate prespecified comparison design supports a causal analysis.

## Evidence behind the design

The principles below are informed by research, but findings vary by learner, course, activity and timescale. They do not establish the effectiveness of QUANTUM itself.

1. Retrieval practice can improve delayed retention compared with repeated study, although the result depends on when retention is measured ([Roediger & Karpicke, 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)).
2. Spacing effects are robust across many experiments, while the useful interval depends on the intended retention period ([Cepeda et al., 2006](https://pubmed.ncbi.nlm.nih.gov/16719566/)).
3. In two semester-long randomized studies, adding badges and leaderboards did not improve academic performance; rewards should not be mistaken for learning ([Balci et al., 2022](https://eric.ed.gov/?id=EJ1346201)).
4. A small physics gamification study reported engagement-related outcomes but does not establish a reliable quiz-performance benefit or generalize to QUANTUM ([Richter & Kickmeier-Rust, 2025](https://doi.org/10.17083/ijsg.v12i1.858)).
5. A classroom gamification study reported learner perceptions, not a direct measure of physics learning ([Gaurina et al., 2025](https://doi.org/10.3390/educsci15010104)).
6. The app's evaluation should therefore separately measure learning, behavior, user experience, equity and safety, and should not use engagement alone as an effectiveness claim.

## Report a problem

Use the Support link in the app to report an incorrect exercise, inaccessible content, a broken save, or a recommendation that does not make sense. Include the page or section title and what happened; avoid sharing another learner's data or credentials.

## Governance

This public guide follows policy `qm-learning-policy-2026-09-25.1`, updated 26 September 2026. Product values and rollout status may change through versioned changes; research principles are not product thresholds. For a correction to this methodology, contact [QUANTUM support](mailto:marioreis@id.uff.br).
