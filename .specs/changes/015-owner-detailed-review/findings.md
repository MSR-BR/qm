# Owner review findings

## C15-001 — Header sign-in affordance

- **Status:** corrected and verified locally.
- **Observed:** the signed-out header control was labeled `Save progress`, which obscured that it was the entry point for account authentication.
- **Expected:** an explicit `Sign in` control should be visible in the primary header, consistent with the TERMO authentication pattern.
- **Correction:** the shared authentication trigger now renders `Sign in` with the sign-in icon while signed out, preserves the signed-in avatar/name state, and continues to open the same Google/Supabase modal. The JavaScript asset version was renewed across the public chapter pages to prevent stale browser caches.
- **Verification:** local configuration reports `authEnabled: true`; the root page and a Chapter 1 page serve the new asset version.

## C15-002 — Administration menu for the responsible professor

- **Status:** corrected locally; awaiting explicit CPD.
- **Observed:** the QM app contained the server-authorized editorial validation review, but exposed it incorrectly inside the learner Personal Area and did not present an Administration group for the responsible account.
- **Correction:** added a dedicated `Administration` drawer group, shown only after the signed-in account is recognized in the public validator allow-list. It now includes `Pending validations` and the existing `AI exercise index` reference.
- **Security:** client-side visibility is only a convenience; the validation API independently verifies the Supabase access token and allow-listed e-mail before returning or changing reports. Ratings and communication were intentionally not added because QM does not yet implement their corresponding data or delivery flows.


## C15-003 — Learner affordances and TERMO feature parity audit

- **Status:** corrected locally; awaiting CPD.
- **Observed:** the QUANTUM database and secure endpoints already recorded section completion and points, but the header and section cards did not expose them consistently. The generated-exercise card also lacked an immediate favorite control.
- **Correction:** the header now displays account points, published section cards show **Studied** or **Not studied**, and a generated exercise gains a favorite star after it is saved to the learner's account.
- **Data protection:** all three controls use existing account-scoped storage; no browser-side authorization or new public write access was introduced.
- **Audit:** the complete TERMO-to-QUANTUM operational matrix is recorded in termo-parity-audit.md. Missing TERMO capabilities are explicitly staged as full backend-and-UI workflows rather than placeholder menu entries.
