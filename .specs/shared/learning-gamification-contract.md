# Shared learning and gamification contract

Policy version: `qm-learning-policy-2026-09-25.1`

This contract governs Changes C28–C32 and supersedes feature-level assumptions in C24 and C25. It derives from the versioned `adaptive-learning-gamification` blueprint and the reviewed academic evidence recorded there.

This contract is normative. Any implementation that conflicts with it fails acceptance even if the UI, analytics, or point counters appear to work. Security is governed concurrently by `docs/security/SECURITY-PROFILE.md`, `docs/security/RISK-REGISTER.md`, and the active Pó Mágico `SECURITY_AND_RESILIENCE` overlay; pedagogical behavior never overrides authentication, least privilege, consent, or release authorization.

## Pedagogical invariants

- Use retrieval, feedback, spacing, interleaving, and successive relearning.
- A page view or simulator opening is activity evidence, not mastery evidence and not independently rewardable.
- Record errors, low-confidence correct answers, assisted answers, solution reveals, and unaided success as different evidence.
- Mastery requires repeated unaided retrieval across sessions and representations; one correct answer is insufficient.
- Errors never subtract learning points. Points never buy answers, grades, easier scoring, exemptions, or mastery.
- Daily Challenge and chapter assessment are distinct. Assessment remains manually available; an approximately 80% chapter-completion prompt is only a configurable starting default.
- Simulator learning follows `predict -> manipulate -> compare -> explain` when supported. Capabilities are declared; unsupported evidence is never inferred.
- Recommendations use reviewed Chapters 1–7 only, explain `why`, source, expected duration, and an alternative, and work deterministically without AI.
- Optional AI may only rank eligible items or generate bounded variants from approved sources with provenance and deterministic fallback.
- Public individual leaderboards remain disabled. Any future social comparison requires a separate approved Change.

## Technical invariants

- Maintain an immutable, idempotent, server-authoritative learning-event ledger.
- Derive learner projections, rewards, mastery, missions, and message eligibility from the ledger; the client may request an action but cannot authoritatively award it.
- Separate learning evidence, behavior analytics, user experience, implementation fidelity, and equity/safety outcomes.
- Version the event allow-list, policy, concept graph, mechanism cards, and recommendation rules.
- Every structural mechanic records eligibility, exposure, action, reward/deduplication, and opt-out where applicable.
- RLS and object privileges are separate controls. Test anonymous, own-user, cross-user, admin, and service behavior with disposable data before release.

## Communication and privacy invariants

- Optional learning communication requires affirmative opt-in; optional consent is never preselected.
- Enforce server-side frequency caps, quiet hours, pause, and unsubscribe.
- Never use threatened point loss, expiring mastery, rank pressure, or artificial urgency.
- Do not place sensitive performance detail in subject lines, previews, logs, or analytics.

## Initial adapter values

These values preserve recognizable TERMO behavior while remaining configurable product defaults rather than scientific claims:

- eligible section completion: 20 points;
- first chapter assessment: 30 points;
- completed guided review: 10 points;
- completed focused retry: 10 points;
- chapter mastery milestone: 80 points.

Every award must be atomic, idempotent, capped against farming, and linked to verified evidence. Mechanism cards may change these defaults only through a governed Change.

## Validation boundary

No Change may claim learning efficacy from engagement, points, page views, satisfaction, or time alone. Claims about retention, transfer, or mastery require delayed or changed-form evidence, implementation-fidelity evidence, denominators, uncertainty, and limitations.
