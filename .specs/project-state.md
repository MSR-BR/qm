# Quantum Mechanics — project state

## Classification

`INTERACTIVE_BOOK + EDUCATIONAL_MATERIAL + BOOK_OR_CHAPTER + APP`

## Current state

- Canonical branch: `main`.
- Last published baseline before this change: `d87b7f8`.
- The public application is in English; project collaboration may be in Portuguese.
- Chapters 1–7 are reviewed and published. Chapters 8–13 are under editorial review and must not expose learning content, exercises, or indexed SEO pages.
- The QM Supabase project reference `plqiofznjlbpfufigpcp` was read-only verified on 2026-09-03. Any remote database mutation still requires its own scoped authorization.

## Active change

- `001-content-availability-and-canonical-registry` — implemented locally; awaiting its CPD decision.
- `002-exercise-source-governance-and-index-audit` — implemented locally; awaiting its CPD decision.

## Non-negotiable content contract

- Follow the Reis *Quantum Mechanics* text exactly; do not invent notation, concepts, equations, conclusions, or derivations.
- Math content must render with MathJax. Long dynamic LaTeX must use `String.raw`.
- Preserve the slide/card teaching pattern used by the reviewed chapters.
- A `cpd` request means commit, push to `main`, and production deployment; no commit otherwise.
