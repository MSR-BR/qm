# C17 findings

## C17-001 — Reading-page heading semantics

- **Severity:** medium accessibility and document-structure defect.
- **Observed:** reviewed section pages visually styled their page title as a `div`, leaving direct section routes without a semantic `h1`.
- **Correction:** all generated reading pages now use `h1.hdr-title`; Chapter 1, 2, and 7 generators were aligned so regeneration preserves the fix.
- **Verification:** 105 slide files contain `h1.hdr-title`; zero retain `div.hdr-title`. The browser audit requires exactly one visible `h1` in every selected journey.

## C17-002 — Missing global favicon

- **Severity:** low, but produced a real network error on direct entry.
- **Observed:** pages without an explicit icon requested `/favicon.ico`, which returned 404.
- **Correction:** a valid 64 × 64 Windows icon was generated from the approved QUANTUM logo at the repository root. Simulator pages also declare the shared SVG explicitly.
- **Verification:** the repeated local browser audit completed with no console or network errors.

## C17-003 — Owner campaign confirmation mismatch

- **Severity:** high operational blocker for the owner-only campaign workflow.
- **Observed:** the English UI required `SEND`, while the server handler still accepted only the Portuguese legacy token `ENVIAR`.
- **Correction:** the handler now requires `SEND`, matching the interface and its error message.
- **Verification:** the new operational test exercises the complete mocked opt-in audience and Resend delivery contract.

## C17-004 — Missing defensive response headers

- **Severity:** medium security hardening gap.
- **Observed:** production already sent HSTS but did not declare the application-level nosniff, framing, referrer, and browser-permission policies.
- **Correction:** Vercel now configures `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy`.
- **Verification:** the production auditor enforces all four headers after deployment.

## External acceptance gates

These are not code defects and are intentionally not represented as complete:

1. The owner explicitly changed the order on 2026-09-16: complete and publish the non-destructive C17 technical audit first, then perform the exhaustive C15 desktop/mobile review.
2. Signed-in visual confirmation in GA4 DebugView remains an external C16 evidence gate.
3. A real authenticated learner/admin browser journey remains part of the owner's manual review because no dedicated test credentials were supplied and the available authenticated browser could not be attached safely.
4. Live Resend delivery remains disabled until sender-domain verification and `RESEND_API_KEY` configuration. C17 did not send a campaign.
