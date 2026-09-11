# QUANTUM Codex Context

Read this file before non-trivial work. It is the concise operational map; detailed decisions live in `.specs/`.

## Product

QUANTUM is an English interactive Quantum Mechanics book for Physics students. Classification: `INTERACTIVE_BOOK + EDUCATIONAL_MATERIAL + APP`. Collaboration may be in Portuguese; all learner-facing interface text is English.

Production: `https://quantummechanicsbook.app`
Canonical branch: `main`

## Content contract

- Chapters 1–7 are reviewed and public. Chapters 8–13 remain locked under editorial review.
- Never expose locked content through navigation, search, SEO, assessments, daily challenges, exercises, or AI context.
- Follow the Reis Quantum Mechanics text. Do not invent notation, equations, derivations, conclusions, or references.
- Use MathJax for mathematics; use `String.raw` for long dynamic LaTex.
- Keep the established chapter/card teaching pattern.
- Book access is an external Google Books preview. Do not add hosted-PDF delivery.

## Architecture

- `index.html`: application shell, navigation, learner and owner views.
- `slides/chapter-*`: reviewed reading pages.
- `simulators/` and `assets/qm-simulator-catalog.js`: simulator surfaces and catalog.
- `data/qm-content-registry.json`: publication/editorial availability.
- `data/qm-exercise-source-manifest.json`: source provenance for exercise-eligible sections.
- `api/`, `lib/`, and `supabase/migrations/`: protected server/data flows.
- `search.html`: public search of reviewed content only.

## Security and service rules

- Google/Supabase authentication, private learner data, and owner administration must remain server-authorized.
- Never rely on editable browser metadata for authorization.
- New Supabase tables require RLS and migration evidence.
- Never print, version, or expose secrets.
- Resend delivery remains inactive until the sender domain and `RESEND_API_KEY` are configured.
- GA4 activation requires an approved measurement ID, event contract, consent/retention decision, and validation.

## Change governance

- Read `.specs/po-magico-reference.md` and the relevant Change before work.
- Preserve the existing Change history; do not create duplicates.
- Each Change records actual model/routing evidence, tests, failures, checkpoints, and unresolved human decisions.
- A `cpd` request means commit, push to `main`, and production deployment. Do not commit or deploy otherwise.

## Required validation

Run the relevant subset of:

```bash
npm run check
npm run validate:seo
npm run audit:exercise-sources
npm run validate:book-corpus
npm run validate:book-topics
npm run validate:book-topic-index
npm run smoke:math-contract
npm run smoke:ai-context
npm run smoke:ai-renderer
git diff --check
```

Use targeted syntax, API, authorization, desktop, mobile, keyboard, anonymous-user, authenticated-user, and owner-user checks whenever the Change affects those surfaces.
