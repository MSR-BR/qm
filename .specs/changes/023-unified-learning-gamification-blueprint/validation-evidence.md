# Validation evidence

## 2026-09-23 blueprint and skill package

- Versioned package: `.specs/blueprints/adaptive-learning-gamification/`.
- Personal installation: `/Users/marioreis/.codex/skills/adaptive-learning-gamification/`.
- Validator: Codex `skill-creator/scripts/quick_validate.py`.
- Source-package result: `Skill is valid!`.
- Installed-package result: `Skill is valid!`.
- Included contracts: pedagogy and recommendation policy, product policy, technical contract, privacy and communication, and release validation gates.
- Research boundary: evidence-backed principles are explicitly separated from configurable intervals, weights, point values, and thresholds.
- Project boundary: no QUANTUM or TERMO application behavior, database, deployment, or production configuration was changed in this documentation/skill pass.

## Audit evidence carried into the implementation backlog

- Authenticated assessment save/history and reward failures were reproduced against production with a temporary test account, then the account was removed.
- Direct Data API probes showed missing explicit `service_role` privileges for the affected assessment/gamification tables while the legal-preferences table, which has an explicit grant, remained available.
- An authenticated browser-role insert into simulator activity succeeded, while source inspection showed the simulator UI does not initialize the auth runtime expected by its recorder.
- Favorite-detail, raw-math preview, mixed-language share, and duplicate assessment error causes were traced to their exact client code paths.

These findings are documented in C15. C21/C22 address the immediate repair layers; the canonical C28–C32 program adopts the methodology. C24/C25 were superseded before execution and remain only as planning history.

## 2026-09-23 academic evidence revision

- Added `references/evidence-and-evaluation.md` and routed academic-design work through it.
- Appraised three supplied full-text studies: Richter and Kickmeier-Rust (2025), Balci, Secaur, and Morris (2022), and Gaurina, Alajbeg, and Weber (2025).
- Classified the supplied Research Starter report as a metadata-only discovery map: it reports zero extracted full-text items and includes at least one retracted record, so it cannot independently support product claims.
- Added outcome separation, mechanism cards, implementation-fidelity events, a physics-specific learning cycle, concept-graph/noisy-evidence rules, assessment-fairness limits, and conservative leaderboard policy.
- Added academic evaluation gates for baseline knowledge, assignment/exposure, attrition, delayed/transfer outcomes, effect sizes, uncertainty, and adverse effects.
- Source-package validation result after the revision: `Skill is valid!`.
- Installed-package validation result after synchronization: `Skill is valid!`.
- Added `.specs/handoffs/TERMO_UNIFIED_GAMIFICATION_HANDOFF.md` as the independent execution package for the TERMO repository. It preserves existing T49 and T30, proposes T50–T54, and explicitly forbids the TERMO task from modifying QUANTUM.
