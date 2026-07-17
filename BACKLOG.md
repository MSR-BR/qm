# QM Book-App Backlog

## Changes To Implement

### Change 1 - Review all HTMLs for future AI exercise use

Review every content HTML with the assumption that students will later use each page as preparation for AI-generated exercises.

Status: done locally, not committed or deployed.

Scope:

- Increase conceptual continuity where the page is too short or too result-oriented.
- Avoid pages that only display final highlighted equations without the reasoning that leads to them.
- Add intermediate equations when they help the student follow the physics.
- Add enough explanatory text for a student to answer conceptual and calculation-based questions.
- Keep the current Chapter 1 layout style, but improve the depth and fluency of the content.

Acceptance criteria:

- Each non-introductory page has a clear story: physical setup, mathematical path, main result, interpretation and limits.
- Equations are connected by text rather than placed as isolated formulas.
- The page has enough material to support future exercises.

### Change 2 - Enable AI exercise support selectively

Reactivate the AI exercise package for the QM project, following the same general idea used in the Termo app, but adapted to QM.

Scope:

- Enable AI exercise generation only on pages with enough content.
- Keep AI exercises disabled on purely introductory or navigational pages.
- Use QM-specific prompts, levels, terminology and table names.
- Preserve project separation from Termo in Supabase, using QM-prefixed data structures where needed.

Acceptance criteria:

- Exercise buttons/widgets appear only where pedagogically useful.
- Introductory chapter-opening pages remain without exercise generation unless later approved.
- Existing login, favorites and saved progress continue working.
- No Termo content, labels or database names appear in the student-facing QM flow.

### Change 3 - Global content revision and quality pass

Perform a full review after the HTMLs and exercise hooks are in place.

Scope:

- Re-read all active Chapter 1, 2 and 3 pages.
- Fix weak explanations, abrupt transitions, missing definitions and unclear equation chains.
- Check consistency of notation, especially hats on operators, expectation values, variances and uncertainty products.
- Confirm figures, captions and copyright notices are clear and not visually cropped.
- Check that each page fits the app role: a practical study notebook, not a replacement for the textbook.

Acceptance criteria:

- The reader can follow the physics without needing to infer missing steps.
- Figures support the text rather than merely decorate the page.
- Copyright/caption notices are present for textbook-derived figures.
- The content remains concise enough for a book-app page, but not superficial.

### Change 4 - Queue gamification package for later

Keep the gamification feature on hold until the external Termo-side work is ready and committed or otherwise available for review.

Scope:

- Do not clone anything from `termo` now.
- Do not copy uncommitted gamification code from another local directory yet.
- Later, review the source implementation and adapt it to QM rather than copying blindly.
- Plan for English UI labels, QM chapter/section identifiers and QM-specific Supabase separation.

Acceptance criteria:

- Gamification remains a queued feature, not an active implementation.
- When implemented later, it should coexist with login, favorites, progress and AI exercises.
- The QM app should not depend on Termo tables or Termo-specific Portuguese labels.
