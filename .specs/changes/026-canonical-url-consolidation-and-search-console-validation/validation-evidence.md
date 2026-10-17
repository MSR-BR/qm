# Validation evidence

## Planning evidence — 2026-09-23

- Google Search Console notice: `Alternate page with proper canonical tag`.
- Live read-only checks found `200` responses for both `/` and `/index.html` with equivalent page content.
- The sitemap uses root-query canonical URLs, while runtime/internal references still include `/index.html?view=...` forms.
- Google Search Central documents redirects as a strong canonicalization signal, `rel=canonical` as a strong signal, sitemap inclusion as a weaker signal, and consistent internal linking as a supporting signal.

## Execution evidence

### 2026-10-17 — implemented; release verification follows below

Owner authorized execution and clean CPD. No TERMO changes, OAuth provider
changes, paid AI calls, email activation or Ads spending.

Canonical map:

| State | Canonical/indexing |
| --- | --- |
| Main catalogue, tracking aliases | `https://quantummechanicsbook.app/` |
| Reviewed chapter 01–07 | `/?view=chapters&chapter=NN` |
| Simulator catalogue | `/?view=simulators` |
| Published reading sections and standalone simulators | Their existing published path |
| Landing / search / help / legal pages | Their existing .html path; search query is not a new canonical |
| Saved, favorites, Journey, ratings, validation review | Root canonical; noindex,nofollow,noarchive |
| Chapters 08–13 | Locked fallback; noindex,nofollow,noarchive; excluded from sitemap |
| Legacy /index.html | 308 to root, query preserved; no longer emitted by internal runtime links |

`assets/qm-index-seo.mjs` is shared by the initial response
(`api/app.js`) and browser navigation. Public query-state pages no longer
receive root-only metadata before JavaScript runs. A Vercel early route is
required: an initial Preview showed ordinary rewrites lose to the static index
at filesystem resolution. The corrected Preview proved chapter-specific source
canonicals, private/locked noindex and the query-preserving 308. No production
deployment used the failed candidate.

Internal navigation/share/learning-action URLs were consolidated mechanically;
physics text and learning rules were not rewritten. Existing canonical sitemap
URLs already matched the desired map; no artificial lastmod bump was made.
Client and server analytics normalize the legacy path and exclude auth/query
secrets. The catalogue generator now merges chapter redirects while preserving
security routes, API rewrites, headers, functions and the legacy redirect.
Direct access to the internal app renderer is denied before filesystem routing.

Local evidence:

- 99/99 Node tests, including seven new canonical/generator/analytics/HTTP tests.
- Content and local access-contract checks, 85-section SEO,
  source governance, book corpus, topic taxonomy/index, math/context/renderer smoke
  and git diff whitespace checks pass. Managed grants/RLS: 634/634.
- Twelve fresh Chrome scenarios pass at desktop, 390px and 320px; 200% font-size
  and reduced-motion smoke, keyboard focus, MathJax, simulator, assessment,
  Daily Challenge, Help, Journey signed-out and locked chapter. Initial/runtime
  canonical and robots agree after legacy redirect. Evidence screenshots:
  `/private/tmp/qm-c26-browser-20261017-final`.
- Synthetic isolated PostgreSQL fresh-baseline replay passes: 525 table and
  66 function privilege checks, 12 concurrent requests/one award, guided review,
  changed-form retry, Daily Challenge, simulator stages, caps/time zone, cross-user
  isolation, mastery guard, rollback, communication opt-out and evaluation.
  Disposable container removed; no production learner records changed.
- Preview `dpl_2C8JbMpR6tqEFfRS42AQeDWnQsVD` proved query/metadata behavior;
  final direct-renderer deny and generator regression were checked in the next
  candidate before production. Preview's host-wide noindex is Vercel protection,
  distinct from application robots metadata.

Open external gates:

- GSC Wizard returned zero connected properties. No affected example URL,
  Google-selected canonical or indexing outcome is inferred from source code.
  No Search Console validation request submitted. Intentional alternates remain
  expected; do not blindly request their indexing.
- GA4 DebugView visual confirmation is still unavailable. Public configuration
  and normalizer tests are not evidence of property-side event receipt.
- HTTP callback parameters, navigation and existing authorization contracts pass;
  this run does not replace C15's real Google-account full learning loop and
  manual screen-reader review. Existing production Google provider is unchanged.

References used: Google Search Central,
https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls ;
Vercel routing, https://vercel.com/docs/routing/redirects .
Operational/backup decisions: `operations-2026-10-17.md`.

## Production receipt — 2026-10-17

- Runtime commit: `29f8526ffc93abe173342620861465f5361419e1`, pushed to `origin/main`.
- Production: `dpl_76Pmrk1B1qWZV629PVL9xSLZxXRQ`, READY. Deployment metadata
  matches the commit and lists `quantummechanicsbook.app` among its aliases.
- `node scripts/audit-qm-production.mjs`: PASS, 99 sitemap URLs, 85 reviewed
  search sections, 65 assets, nine API boundaries, no warnings/errors.
- `node --experimental-websocket scripts/audit-qm-browser.mjs`: PASS, twelve
  public scenarios on the canonical production domain, no warnings/errors.
  Screenshots: `/private/tmp/qm-c26-production-20261017`.
- Independent HTTP probes confirm chapter 01/07 and simulators source canonicals,
  Journey/locked chapter 08 noindex, and `/index.html?view=favorites&code=opaque%2Bfixture`
  returning 308 with the query intact. The code value is a synthetic fixture,
  not a credential. Direct `/api/app` and `/lib/qm-server-shared.mjs` return 404.
- Final Preview before promotion: `dpl_ECt1jiJFZicbunqMA24ws1RSqaaA`; direct
  renderer denial, query metadata and legacy redirect verified with authenticated
  CLI access without changing deployment protection.
- Rollback target, if required: prior production
  `dpl_Apzj1Sm56tnUZtQVkjTMDwFDEDXR`, runtime `1e048ac`. Restore its production
  aliases via the existing deployment rollback workflow; no database rollback
  is needed because this release did not migrate production schema or data.
  Do not revert the replacement backend or dedicated Google client.

This closes the technical deployment work, not GSC indexing, GA4 DebugView or
the detailed authenticated/manual C15 gates. TERMO was not changed. A subsequent
documentation-only commit records this receipt; its SHA is intentionally not
self-referenced inside the document. No paid AI calls or campaign activation.
