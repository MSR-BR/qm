# Requirements

- Search must expose only Chapters 1–7 marked published in the canonical content registry.
- SEO generation must use the build date rather than a manually fixed date/version.
- Published reading pages must retain a canonical URL, indexable robots directive, and `LearningResource` JSON-LD.
- Chapters 8–13 must remain absent from public sitemaps and the search index.
- `npm run validate:seo` must fail when those publication boundaries are violated.
