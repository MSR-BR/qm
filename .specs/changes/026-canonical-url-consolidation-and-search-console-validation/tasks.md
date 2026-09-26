# Tasks

1. Export or inspect the Search Console example URLs for `Alternate page with proper canonical tag`; classify each as intentional or actionable.
2. Inventory every emitted `/index.html` URL in HTML, JavaScript, JSON-LD, manifests, sitemap generators, tests, and documentation used at runtime.
3. Define and test the canonical route map for home, public views, chapters, sections, simulators, search results, and non-indexable private states.
4. Replace avoidable internal `/index.html` links with canonical root-query URLs and align source/runtime canonical generation.
5. Add a permanent `/index.html` to `/` redirect with query preservation after authentication/navigation compatibility tests pass.
6. Regenerate and validate the sitemap, robots rules, structured data, share URLs, GA4 location behavior, and public navigation.
7. Run local and production HTTP/browser regression gates, publish only with explicit CPD authorization, then request Search Console validation and record the outcome.
