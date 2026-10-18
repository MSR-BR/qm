# Companion header button — 2026-10-18

Owner requested replacing the unattractive TERMO banner with a button matching
Send / Book preview, clean CPD, and reciprocal instructions for TERMO. This is
a scoped C22 visual follow-up, not reopening the accepted C15 review.

## Change

- Reuse `header-action` for a native TERMO link after the four existing actions.
- Remove the secondary banner, its label and obsolete styles. Keep the book
  icon, compact TERMO label and external-link indicator.
- Accessible name/title identify thermodynamics, Portuguese and the new tab;
  decorative icons are hidden from assistive technology. The link keeps
  `target="_blank" rel="noopener noreferrer"`, with no trackers or query data.
- On the existing mobile two-column grid, this last button spans both columns.
  Shared styles preserve 44px touch targets and keyboard focus.
- Update unit/browser contracts and the reciprocal handoff in
  `.specs/handoffs/TERMO_QUANTUM_HEADER_ANNOUNCEMENT.md`.
- TERMO files/services, authentication, backend, learning policy and data are
  untouched. No paid API calls or credential/environment changes.

## Validation before release

- 131 Node tests passed, including three updated companion-button contracts.
- Content structure (13 chapters), SEO (85 published sections), diff whitespace
  passed. Public unauthenticated TERMO destination returned HTTP 200.
- All 20 anonymous disposable Chrome audit scenarios passed locally, no errors
  or warnings; companion checks cover 320/390/1440px, destination attributes,
  shared action row, banner removal, touch bounds and keyboard focus.
- Inspected real 320px/1440px screenshots: intact two-column mobile actions plus
  full-width TERMO button; desktop has all five actions on one line. Evidence:
  `/private/tmp/qm-companion-button-local/`. This is not physical-device or
  screen-reader certification and does not close C31's manual follow-up.

## Release / rollback

Authorized target: Vercel `msr-brs-projects/qm`, project
`prj_A9ZEdGd9hXOqAsacRPtIcKUaU8tq`, verified via CLI project inspection.
Prior canonical READY deployment: `dpl_H5BBXR4dF8T2DBoirjX4bHQzyba1`.
Rollback is promotion of that prior deployment (restores the banner); no data
rollback or migration is involved.

Runtime commit `908a070`, version `v20261018.2244`, deployed as staged production
`dpl_2mreoBMfRBy2D7DrSutZhYkMb42S` (READY, build 2s), then promoted to
`https://quantummechanicsbook.app/`. Candidate URL:
`https://qm-a0z95sqdi-msr-brs-projects.vercel.app`.
Authenticated staged HTML check confirmed the native button, safe destination
and absence of the banner before promotion. Canonical release metadata matches.
All 20 production Chrome scenarios passed with zero warnings/errors; the 390px
public screenshot was visually inspected and matches the intended layout.
Evidence: `/private/tmp/qm-companion-button-production/` and
`/private/tmp/qm-companion-browser-production.json`.
The deployment's error-level log query for the preceding five minutes returned
no entries; this is bounded observation, not a long-term monitoring guarantee.
Final documentation-only commit/push follows this receipt; Git integration can
create a further deployment of the identical runtime, which must be checked
against the canonical version/button before reporting clean CPD.

Vercel deployment/CLI skills governed target verification and release checks;
verification skill scoped testing to the native link and preserved header.
