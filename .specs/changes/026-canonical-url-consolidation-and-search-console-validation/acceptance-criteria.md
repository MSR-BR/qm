# Acceptance criteria

- [ ] Search Console affected examples are recorded and classified individually.
- [x] Every public indexable state has one documented canonical URL.
- [x] Internal runtime links and share URLs no longer emit avoidable `/index.html` forms.
- [x] `/index.html` permanently redirects to `/` while preserving query strings.
- [x] Initial and client-updated canonical signals do not conflict.
- [x] Sitemap, structured data, and internal links use the same canonical route set.
- [x] Chapters 8–13 and private/authenticated views remain unavailable to public indexing.
- [ ] Authentication callbacks, navigation, chapters, simulators, search, and shared links pass desktop/mobile regression tests.
- [ ] GA4 and first-party telemetry do not double-count `/` and `/index.html` as separate logical pages.
- [x] Production status codes, redirect chains, canonical tags, robots directives, and sitemap contents are recorded.
- [ ] Search Console validation is requested only after the corrected revision is live.
- [x] Intentional alternate-page exclusions are documented as expected rather than misreported as application errors.
