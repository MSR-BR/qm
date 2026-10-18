# C15-018 — rendered exercise export and owner-authorized closure

## Authorization and scope

On 2026-10-18 the owner supplied a screenshot showing raw LaTeX in an exported
exercise and requested rendered equations, closure of C15 and clean CPD. Only
QUANTUM is authorized; TERMO is untouched. Starting HEAD `5152211`; preserve and
include the three pending documentation files from the preceding exercise test.

Closure is conditional on fixing the export. It supersedes C15's remaining
manual-review gate; it does not prove every physical-device, screen-reader,
200% zoom or scientific/editorial check was executed. C31's accessibility
follow-up remains independently tracked. No database, credentials, environment,
provider, reward or model changes; no new paid AI call or learner data writes.

## Cause and correction

The modal used MathJax, but export sent `buildExercisePlainText` to jsPDF's
`doc.text`, which cannot typeset TeX. Removed that path and unused jsPDF loader.
Export now opens a local print view synchronously from the click, formats the
saved fields with the existing safe renderer, awaits MathJax SVG typesetting,
copies SVG styles/global glyph definitions, and enables **Print / Save as PDF**.
The browser produces a vector PDF with A4 margins, statement, solution, metadata
and canonical source link. The learner chooses Save as PDF in the native dialog;
the application does not falsely claim an automatic file save.

Metadata is escaped; source URLs are canonical-only; external TeX SVG links are
removed. The print view has no scripts, analytics, opener or remote upload.
Temporary rendering nodes are cleared. Rendering failures and blocked pop-ups
show an explicit error instead of silently exporting raw LaTeX.

Skills: PDF (render and inspect every tested page), Vercel verification (saved
content → export → math → print/PDF), deployment/CLI (scoped staged release).
Actual host model/reasoning identifier is not independently exposed; no model
switch or subagent. SVG cache handling follows the
[MathJax documentation](https://docs.mathjax.org/en/v3.2/options/output/svg.html).

## Validation

- 131 Node tests passed, including four new export contract/security cases.
- Content/privilege contract, SEO, AI renderer and diff whitespace checks passed.
- Anonymous disposable Chrome fixture used the real formatter and exporter:
  standard photoelectric exercise had 11 rendered equations; long pagination
  fixture had 31. Both had zero math errors, raw delimiters or missing glyph
  references; no scripts/opener in the print view.
- Chromium's actual print pipeline produced 1-page and 3-page A4 PDFs. All four
  pages rendered with Poppler and were visually inspected: fractions, subscripts,
  units, inline/display math render without clipping; toolbar excluded. Prose is
  text, equations vector paths: selectable math/certified accessible PDF is not
  claimed. Evidence: `/private/tmp/qm-c15-export/`; reproducible browser runner:
  `scripts/test-qm-exercise-export-browser.mjs`.
- Malformed fraction and blocked-popup tests passed. Initial negative fixture
  used an unknown macro, which MathJax's noundefined extension renders rather
  than raising a parser error; replaced it with a genuinely malformed fraction.
  Second run passed; no app change to suppress a failing assertion.
- This is a fixture-based export regression, not a new authenticated save test.
  The real account save/favorite test is in `generated-exercise-review-2026-10-18.md`.

## Release

Pending staged deployment, canonical verification and CPD receipt. Target
Vercel `qm`, `prj_A9ZEdGd9hXOqAsacRPtIcKUaU8tq`, team
`team_jQuUBnU7RDJh0O3XASyu1WeS`, confirmed with CLI project inspection. Connector
returned not-found for that explicit target; existing scoped CLI works. No
protection, credentials or project link was changed.

Rollback: promote previous `dpl_GriGLpHqep8VkCcv8W82CS47NQHB`; no database rollback
or learner deletion needed, but that version reintroduces raw-LaTeX export.
