# Requirements

This Change inherits the shared learning/gamification contract for learner-facing semantics and the Pó Mágico `S3_SENSITIVE` security overlay for authentication, consent, saved exercise data, and release. It must not implement competing point, mastery, assessment, or communication rules.

## Header and sharing

- Present `Points`, `Book preview`, `Sign in` or account identity, and `Send` as a coherent responsive action group with real button affordances and accessible touch targets.
- Keep the point total live without turning the header into a dense scoreboard.
- Use one English-only share-message builder for the index and content pages.
- Test Web Share, mail, and clipboard fallbacks.

## Assessments

- Rebuild the chapter-assessment page with the QUANTUM design system, semantic form controls, responsive question cards, visible progress, loading/disabled states, and one status region.
- Prevent duplicate submissions and repeated copies of the same error.
- Keep source links and issue reporting available after submission.
- Do not present chapter assessment as the Daily Challenge; they are separate learning modes.

## Exercises and mathematics

- Make a saved or favorite exercise card open a keyboard-accessible modal or detail surface containing the complete statement and solution.
- Resolve exercise lookup across saved and favorite collections rather than assuming a favorite is also loaded in the saved list.
- Render supported mathematics through the existing safe formatter and MathJax pipeline.
- Use a safe, readable summary on list cards instead of exposing raw `\\(...\\)` delimiters.
- Preserve favorite, share, report, and close actions in the detail surface.

## First-login privacy and communication

- Show a versioned first-login privacy/communication step before account-only learning features are used.
- Separate required acknowledgement from optional learning-update e-mail consent.
- Optional marketing or engagement e-mail consent must be unchecked by default and require an affirmative action.
- Essential transactional messages must not be represented as optional marketing consent.
- Consent withdrawal must be as easy as consent and must remain editable in Personal Area.

## Accessibility and responsive behavior

- Support 320 px mobile width, text zoom, reduced motion, keyboard navigation, visible focus, and screen-reader labels.
- Keep all learner-facing copy in English.

## Risks

- Rendering generated text as HTML can introduce unsafe markup unless the existing sanitization boundary is preserved.
- A preselected optional communication checkbox would create invalid or ambiguous consent in international use.
- A visual-only assessment redesign could hide unresolved C21 storage failures; C22 depends on C21 for save behavior.
