# Notes

C22 repairs the learner-facing defects documented in C15. It does not create new reward, mastery, Daily Challenge, assessment-selection, or communication-frequency semantics. Those remain governed by the shared contract and C28–C32.

The first-login choice must not preselect optional learning updates. Essential account/security communication remains a separate purpose.

## Local implementation — 2026-09-25

- Unified the four header actions with 44 px responsive controls and a live point label.
- Consolidated index and content sharing through the existing shared helper and removed mixed Portuguese/English copy.
- Rebuilt `assessments.html` as a responsive semantic QUANTUM surface with source links, single status regions, duplicate-request guards, retry, reporting, and explicit separation from the Daily Challenge.
- Fixed favorite exercise opening by resolving IDs across both saved and favorite collections; added focus return, Escape handling, focus trapping, safe summaries, and retained MathJax detail rendering.
- Added a versioned first-authenticated-use privacy gate. Required document acknowledgement and optional email consent are distinct; optional email starts unchecked.
- Corrected the server normalization and local database migration so missing/legacy implicit email consent is not treated as an opt-in. Explicit timestamped opt-ins are preserved.
- Added public Terms information and retained later preference withdrawal in Personal Area.

No points, mastery, Daily Challenge, mission, badge, assessment-selection, or communication-frequency policy was changed. Those remain governed by C23 and C28–C32.

No Supabase migration, deployment, commit, push, or production mutation was performed.
