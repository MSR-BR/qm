# Owner review findings

## C15-001 — Header sign-in affordance

- **Status:** corrected and verified locally.
- **Observed:** the signed-out header control was labeled `Save progress`, which obscured that it was the entry point for account authentication.
- **Expected:** an explicit `Sign in` control should be visible in the primary header, consistent with the TERMO authentication pattern.
- **Correction:** the shared authentication trigger now renders `Sign in` with the sign-in icon while signed out, preserves the signed-in avatar/name state, and continues to open the same Google/Supabase modal. The JavaScript asset version was renewed across the public chapter pages to prevent stale browser caches.
- **Verification:** local configuration reports `authEnabled: true`; the root page and a Chapter 1 page serve the new asset version.
