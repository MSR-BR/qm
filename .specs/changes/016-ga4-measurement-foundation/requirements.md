# Requirements

- Begin only after C13-C14 are stable and the owner has explicitly authorized C16.
- Use only a Measurement ID from the GA4 property created or selected by the owner; never invent an ID or expose account credentials.
- Implement the approved, non-PII event contract for reading, search, simulators, exercise generation, assessments, sign-in intent, ratings, favorites, and the external book preview.
- Optional analytics must be opt-in. Do not load GA4, queue events, or write first-party events before affirmative consent.
- Keep Google ad storage, ad user data, and ad personalization denied.
- Do not send learner identity, e-mail addresses, raw search text, report text, feedback text, answers, generated content, OAuth data, campaign query data, or unrestricted URL parameters.
- Validate event names and every property again on the server before a service-role-only Supabase write.
- Keep first-party events for at most 90 days and configure the GA4 property for 14-month event-data retention.
- Verify the configured production stream in GA4 DebugView before C16 is accepted.
- The book must continue to operate when analytics is disabled, blocked, or unavailable.
