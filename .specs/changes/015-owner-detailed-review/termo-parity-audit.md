# TERMO → QUANTUM operational feature audit

**Date:** 2026-09-10  
**Reference:** production-oriented code and migrations in the local TERMO and QUANTUM repositories.  
**Scope:** operational learner, owner, data, authorization, and delivery functionality. Content quality is out of scope.

## Audit conclusion

QUANTUM has secure foundations for authentication, private exercises, progress, learning rewards, reviewed assessments, simulator activity, and editorial validation. The main gap is not a missing database foundation for the three learner features reviewed here; it is incomplete presentation and incomplete product workflows relative to the older TERMO app.

C15 now connects the existing QM private progress/reward services to visible learner controls. The remaining TERMO-only workflows must be implemented as complete vertical slices, including their schema, RLS, server handlers, interface, and owner controls. They must not be represented by inactive or cosmetic menu items.

## Capability matrix

| Capability | TERMO | QUANTUM before C15 corrections | C15 result / next action |
| --- | --- | --- | --- |
| Google / Supabase sign-in and private account state | Operational | Operational | Parity; header explicitly says **Sign in**. |
| Saved AI exercises | Operational | Operational | Parity. |
| Favorite pages and generated exercises | Operational | Available only in personal lists/modal | Star added to the generated exercise itself; uses existing account-scoped saved-exercise record. |
| Section completion record | Local learner marker in index | Supabase-backed qm_study_progress | QM is the stronger data model; section cards now display **Studied** / **Not studied** from it. |
| Points, level, and streak | Full journey profile and header points | Secure profile/event foundation, only partially visible | Header now shows real points. The richer TERMO journey remains a separate parity implementation. |
| Chapter assessments | Operational | Operational | QM includes reviewed chapter assessments and private history. |
| Daily challenge / guided quiz recovery | Operational | Not implemented | Implement as a complete assessment-gamification slice. |
| Simulator activity | Operational | Operational private activity | Parity for current QM catalog. |
| Exercise validation report | Operational | Operational | Parity. |
| Owner validation review | Operational | Secure API existed but was hidden in learner area | Dedicated **Administration** group for the allowed responsible account. |
| AI exercise/source index | Operational | Existing reference page | Exposed from Administration. |
| App ratings and owner ratings dashboard | Operational | Implemented in C16 | Anonymous rating prompt, service-only storage, and responsible-account dashboard. |
| Email test/campaign delivery | Operational | Implemented in C16; sender configuration pending | Owner-only test/campaign handlers, opt-in audience selection, campaign and recipient logs. Requires a verified Resend sender and RESEND_API_KEY before any delivery can occur. |
| Legal preferences / consent | Operational | Implemented in C16 | Account-scoped preferences, explicit acknowledgement, and editable learner screen. |
| Book access | External preview link | Implemented in C16 | The app deliberately does not host or deliver a PDF. It links to the existing Google Books preview instead. |
| First-party analytics events | Operational | Schema prepared; measurement configuration pending | GA4 measurement ID and an approved event/retention policy are required before collection is enabled. |
| Canonical SEO, robots, sitemap, Search Console | Operational | Operational | Parity; sitemap accepted for the production domain. |

## Security findings

- qm_study_progress uses account ownership policies for select, insert, update, and delete.
- qm_gamification_profiles and qm_gamification_events are not writable from the browser. The reward endpoint verifies the Supabase access token, checks that the chapter item is published, and de-duplicates events server-side.
- The administration drawer is a convenience only. The validation administration endpoint independently verifies the session and allowed e-mail on the server.
- No authorization decision relies on editable user metadata.
- Ratings and campaigns now use server-side authorization and restricted tables. Book access is deliberately an external Google Books preview, never a hosted PDF.

## C15 implementation record

1. Header points control reads the signed-in user's qm_gamification_profiles row and updates after a reward event.
2. Each published section card derives its label from the account-owned progress record: **Studied** when completed, otherwise **Not studied**.
3. The generated-exercise block receives a star after persistence. It toggles only the saved exercise owned by the signed-in user.
4. Administration exposes only already implemented owner functions: pending validation review and the AI exercise index.

## Required parity changes after C15

1. **Rich learning journey parity:** missions, badges, level detail, assessment recovery, and daily challenge, backed by reviewed QM assessment content.
2. **Ratings and feedback:** completed in C16.
3. **Communication and legal preferences:** completed in C16 at the application and database layers. Live delivery awaits only Resend sender-domain verification and RESEND_API_KEY in Vercel.
4. **Book access:** deliberately completed as an external Google Books preview; no PDF delivery will be added.
5. **First-party measurement:** schema is ready; GA4 measurement ID and an approved retention/event policy remain required before activating collection.
6. **External quality audit:** authenticated and anonymous desktop/mobile test passes after the owner completes the detailed review.

## Acceptance evidence for this audit

- Source inventory compared API routes, browser assets, server handlers, migrations, and owner interfaces in both repositories.
- QUANTUM foundations inspected: qm_study_progress, qm_gamification_profiles, qm_gamification_events, saved exercises, validation reports, chapter quiz attempts, and simulator activity.
- TERMO-only routes identified: ratings, campaign/test email, legal preferences, book PDF delivery, richer gamification profile/event services, and analytics event infrastructure.
