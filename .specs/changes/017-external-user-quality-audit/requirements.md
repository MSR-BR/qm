# Requirements

- The original sequence required C15 owner acceptance first. On 2026-09-16 the owner explicitly authorized a sequencing exception: complete and publish the non-destructive C17 technical audit, then perform the exhaustive manual review. This exception does not imply C15 acceptance. C16 instrumentation is stable; its signed-in DebugView visual confirmation remains external.
- Test public routes: home, reading-app menu, published chapters, section navigation, search, sitemap-facing pages, simulators, and locked Chapters 8–13.
- Test authenticated journeys with a non-administrator learner account where available: sign-in, return URL, study progress, favorites, simulator activity, exercises, assessments, and learner report submission.
- Separately test administrator access to validation history without exposing it to ordinary learners.
- Test keyboard navigation, visible focus, headings, labels, color-independent states, and responsive layouts at common narrow and wide viewport sizes.
- Check network errors, API authorization failures, broken links, JavaScript parse failures, console errors, and key performance indicators without using production data destructively.
- Record evidence, failures, severity, and remediation recommendations. Do not modify learner records or submit artificial reports unless explicitly authorized.
