# Requirements

1. Published Chapters 1–7 remain accessible.
2. Chapters 8–13 are visibly unavailable in the catalogue, with English-only status copy.
3. Locked chapters must not be indexed or present in sitemap output.
4. Direct requests for locked chapter slide paths must route to the unavailable chapter state.
5. The exercise API must reject requests for chapters that are not exercise-eligible.
6. Publication state must be defined once and consumed by browser, build, SEO, hosting, and server code.
7. No remote Supabase change is part of this change.
