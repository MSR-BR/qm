# Validation

- `npm run test:learning-help` — required static policy/copy, academic caveat, route, fragment, and contextual-link checks.
- `npm run validate:seo` — required generated canonical/sitemap/structured-data checks.
- `npm run audit:browser` — assess page load and available responsive/route checks; any unavailable production/browser coverage must be recorded as unverified.
- Manual browser checks remain required for desktop/mobile, 320 px, 200% zoom, keyboard/focus and screen-reader output.
- C31 is local-only: no database mutation, provider configuration, commit, push, or deploy is authorized by this Change.

## Execution record

- `npm run test:learning-help` — PASS, 4/4.
- `node scripts/build-seo-artifacts.mjs` — PASS; updated 96 HTML files, `robots.txt`, and primary sitemap artifacts. The regenerated SEO asset version is `seo-20260926`.
- `npm run validate:seo` — PASS for 85 published sections; Help canonical, indexability, WebPage JSON-LD, and app-sitemap entry validated.
- `node --check` on SEO builder, simulator progress script, and C31 test — PASS.
- `QM_AUDIT_BASE_URL=http://127.0.0.1:4173 npm run audit:browser` — PASS, 12 local Chromium scenarios, zero warnings/errors. Help checked at 320×720 with 200% text scaling; no horizontal overflow, missing accessible names/alt text, duplicate IDs, error overlay, or missing keyboard focus was reported. Evidence screenshot: `/var/folders/hm/q79h9c595l58tkvjr63kmcsr0000gn/T/qm-c17-browser/learning-help-mobile-zoom.png`.
- Visual screenshot review — page remains readable and wraps at 320 px/200%; the screenshot is captured while the keyboard audit focuses the visible skip link.
- Human screen-reader review — NOT RUN; remains a manual follow-up.
- Runtime model/reasoning — not exposed in this task's metadata; planned route remains `gpt-6-luna / high`, and actual routing is not asserted.
- Remote Supabase, production, commit, push, and deploy — NOT RUN.
