# Requirements

## Current diagnosis

- Google Search Console reported `Alternate page with proper canonical tag` on 2026-09-23.
- The production root `/` and `/index.html` currently both return `200` with equivalent HTML.
- Internal links still expose `/index.html?view=...` forms while the sitemap uses root-query forms such as `/?view=chapters&chapter=01`.
- The initial HTML canonical points to the root and client code may refine it after navigation. Google can therefore correctly classify duplicate `/index.html` forms as alternate pages.
- The Search Console classification is informational when the excluded URL is an intentional duplicate. The goal is to remove avoidable duplicates, not to force every alternate URL into the index.

## Canonical contract

- Use `https://quantummechanicsbook.app/` as the canonical home URL.
- Use root-query URLs such as `/?view=chapters&chapter=01` for canonical public application states that are intentionally indexable.
- Replace internal links, share URLs, structured-data URLs, generated discovery files, and tests that unnecessarily emit `/index.html`.
- Serve a permanent redirect from `/index.html` to `/`, preserving the query string, only after authentication and navigation compatibility gates pass.
- Keep the sitemap limited to canonical, public, reviewed URLs; never include duplicate `/index.html` forms.
- Keep Chapters 8–13 and private/authenticated application states excluded from public discovery.
- Ensure the canonical in the initial response and any client-side canonical update agree for the same public state. JavaScript must not contradict the source canonical.
- Do not use `robots.txt` blocking as a substitute for canonicalization, because Google must be able to crawl duplicate URLs to observe redirects or canonical signals.

## Investigation and validation

- Inspect the affected example URLs in Search Console before requesting validation and record whether each is intentional or actionable.
- Verify status codes and redirect chains for `/`, `/index.html`, query-state URLs, sitemap URLs, and representative authenticated callbacks.
- Verify canonical tags, robots directives, structured data, internal links, share links, sitemap contents, and query preservation.
- Verify desktop and mobile navigation, login/logout, OAuth/magic-link return paths, chapter opening, simulator opening, search, and shared URLs after consolidation.
- Confirm that GA4 and first-party telemetry retain the intended page location without creating a second logical page for `/index.html`.
- Submit or request Search Console validation only after the corrected revision is live and the affected examples are understood.

## Source of truth

- Follow Google Search Central guidance for duplicate URL consolidation and canonical troubleshooting.
- Record the exact affected URLs, live revision, tests, Search Console action, and outcome in `validation-evidence.md` during execution.
