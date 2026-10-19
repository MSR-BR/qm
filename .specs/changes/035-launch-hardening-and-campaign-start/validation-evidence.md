# C35 — implementation and validation, 2026-10-19

## Checkpoint

Corrections committed, pushed and published with owner authorization on 2026-10-19.
Production bytes verified; owner production login/reload/logout acceptance remains
open. No database migration, provider configuration or Ads mutation. Campaign paused.
The initial implementation-only evidence below is retained chronologically.

## Preflight and routing

- Physical checkout: `/Users/marioreis/Library/CloudStorage/Dropbox/Mac (6)/Documents/Developer/qm`.
- Origin: `https://github.com/MSR-BR/qm.git`; branch `main`.
- Starting HEAD and local `origin/main`: `e04b1074ebe8b677c58bdef2cbced3bcffe61ebf`.
- No tracked changes at entry; the owner-supplied C35 directory was untracked and preserved.
- Runtime identifies Codex based on GPT-6. GPT-6 Astra / high was recommended before
  execution, but the exact serving alias/effort is not independently exposed by the
  runtime; do not report the recommendation as measured execution metadata.
- No subagents. Skills read and used: Digital Discovery Audit (consent, attribution,
  evidence and launch boundaries), Supabase (dependency pin/security compatibility).
- Execution used read-only connector APIs for external observations. Local command
  execution needed escalation because a configured writable root traverses a symlink.
  No credentials or `.env*` values were inspected or printed.

## Corrections

### R1 — stable authentication dependency

Pinned `assets/termo-auth.js` to
`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm`.
Both the old unversioned ESM URL and pinned URL returned HTTP 200, `x-jsd-version:
2.118.0`, 12,500 bytes, SHA-256
`be49b0f06dd2c3335141d95bf951120a3d2e5389d401fc98b2ee839aa85d0964`
on 2026-10-19 at about 19:10 BRT. This pins the same delivered module, not a model
or auth-provider migration. The returned module's Supabase submodule preload
references also use exact 2.118.0 versions.

Auth implementation, PKCE, persistence, refresh, OAuth redirect construction and
logout are unchanged. Cache revision `1019.1` propagates through all three shared
loaders, HTML consumers and chapter generators. The large HTML diff is mechanical
cache invalidation; no teaching content or publication locks changed.

Sources consulted: [Supabase CDN installation](https://supabase.com/docs/reference/javascript/installing),
[changelog](https://supabase.com/changelog), and its
[TLS notice](https://supabase.com/changelog/cbc-tls-ciphers-deprecated).
The latter concerns obsolete OS/browser TLS stacks; it does not require changing
the current JS authentication options. Real production auth acceptance remains pending CPD.

### R2 — section completion deduplication

The successful `qm-study-progress-change` listener now stores a local marker
`qm_analytics_completed_v1:<chapter>:<section>` only with analytics enabled and
consented. Re-marking the same section, reload and another tab share the marker;
different sections remain independent. Chapter `1` and `01` share the marker.
Web Locks serialize concurrent tabs, with consent rechecked inside the lock.
Revoking analytics clears only these markers (and the existing attribution state),
including cross-tab revocation. Revoking advertising alone preserves them.

No learner identity, answers or generated content enter the marker. No progress,
reward code, database write, API contract or event parameters changed. The marker
means the completion was queued, not that GA4 accepted it. Delivery failures can
therefore undercount, as with existing client analytics. The existing relay retry
and consent-epoch protection are unchanged.

Limits: this is per browser profile/origin, not per account across devices. Clearing
site data or withdrawing/regranting analytics starts a new counting history. When
storage is unavailable, only current-document deduplication is possible; without
Web Locks, simultaneous-tab serialization is not guaranteed. No historical events
are edited or retroactively deduplicated.

### R3/R4 — sliding attribution and preserved consent

A consented initial page-view configuration refreshes a known tab campaign for
30 minutes. Subsequent page navigation, app view/chapter/simulator changes and
Back/Forward refresh that expiry; ordinary events or
preference-only config updates do not keep an inactive page's campaign alive.
Expired, malformed, null, unknown and mismatched campaign state fails closed.
Only the same three approved tuples are accepted. Revocation clears attribution.
`index.html` emits an internal navigation notification only when its route changes;
the listener refreshes the tab expiry without sending another GA4 page-view or event.
Google signals, advertising opt-in/defaults, `ad_personalization=denied`, privacy
copy, event names/parameters and `/api/qm-analytics-event` remain unchanged.

### Optional validator-email finding

Deferred, with a correction to the input audit's hypothesis: server authorization
already exists in `lib/exercicio-handler.mjs` (`fetchAuthenticatedUser` followed by
`isValidatorEmail`, returning 401/403). The public `validatorEmails` list currently
controls UI discoverability in `index.html`; simply removing it would hide the
review UI. A private capability lookup and related UI tests would be a separate
change. No server permission was weakened and no additional email was exposed.

## Tests actually executed

| Validation | Before C35 | After corrections |
| --- | --- | --- |
| `npm run test:analytics` | 22/22 pass | 32/32 pass |
| `node --test tests/*.test.mjs` | 139/139 pass | 151/151 pass |
| `npm run check` | pass | pass: 13 chapters; 25 tables, 22 functions, 2 sequences, 23 migrations |
| `npm run validate:seo` | pass | pass: 85 published sections |
| `QM_PLAYWRIGHT_MODULE=/Users/marioreis/node_modules/playwright node scripts/test-qm-analytics-browser.mjs` | prior audit only | pass: 320, 390, 1440 px |
| `git diff --check` | clean baseline | pass |

Scripts were read before execution. Runtime tests use fixtures, a fake clock and
mocked requests. Browser tests intercept every request, including Google and the
first-party relay: no live collection, paid API call, learner progress or reward
write. Browser checks cover consent controls, separate ads choice, sanitized OAuth
return, concurrent-tab completion, reload, revocation and no page errors.

The final review added a consent-epoch guard so a completion queued behind
another tab cannot survive withdrawal/regrant, and covered internal app navigation
as well as full document loads. The full validation suite was rerun after these fixes.

One intermediate full-suite run reported 150/151: the event inventory test caught
the new internal navigation notification missing from the map. Registered it in
`data/qm-learning-event-map.v1.json` as UI infrastructure, with null canonical event
and no award/mastery authority. The final results above include this correction.

Additional regression checks cover the pinned dependency and all HTML/generator
loader references. Changed semantics are exercised for unmark/remark, independent
sections, denied/unknown consent, cross-tab revocation, blocked storage, 20+20 minute
navigation, exact 30-minute expiry, allowlisted tuples and malformed storage.

## Remote observations and remaining gates

See `measurement-baseline-2026-10-19.md`, `launch-2026-10-19.md` and the sanitized
read-only JSON snapshot. GA4 and Ads read access worked without a new login.
No production state changed. Files named `termo-*` edited here belong to QUANTUM;
the TERMO checkout and service configuration were not modified.

Before release: explicit owner CPD. After release: READY deployment, production
bytes equal the committed candidate (root rendered through `lib/qm-index-response.mjs`),
then one owner Google login, reload and logout, without completing another section.
Before Ads activation: resolve remaining panel/report evidence, refresh the scoped
snapshot, present it and obtain separate explicit owner confirmation.

## Authorized release continuation

On 2026-10-19 the owner explicitly authorized commit, push and production deployment
of these corrections, required the QUANTUM campaign to remain paused, and prohibited
TERMO changes. Deployment verification follows the Vercel deployments/CLI skills.
The connected deployment read confirmed project `qm`, repository `MSR-BR/qm`,
production alias `quantummechanicsbook.app`, and previous READY commit `e04b107`.
The project lookup with the locally stored team ID returned 404; a direct read of
the known deployment succeeded. No linking or credentials were changed.
Production auth acceptance remains separate from the publication receipt.

### Publication receipt

- Code commit: `c7c5fb7ae968d19e2c99bbb70aa34325767b8bfc`, pushed to `origin/main`.
- Production deployment: `dpl_9nbDb7LgRmJ3wVLWqRx3uSSK6L3L`, READY;
  `https://qm-br3uhugzg-msr-brs-projects.vercel.app` and canonical domain.
- First deployment remained Initializing for about six minutes, then built successfully.
  One identical-source retry `dpl_AZpxQ8j1pM3zxDUjQ1wfciWzxN3q` was queued.
  Cancellation of the first returned 400 because it had already completed; the
  redundant queued retry was canceled successfully. Neither operation removed production.
- Canonical `/` (using `renderIndexResponse`) and `assets/termo-auth.js`,
  `qm-analytics.js`, `termo-seo.js`, `qm-simulator-catalog.js` at revision 1019.1
  returned HTTP 200 and exact local/committed bytes after publication. Before READY
  the same checks correctly detected the previous version; they were not reported as passes.
- Full Node suite repeated at CPD: 151/151 pass; content, privilege and SEO checks pass.
- Read-only Ads recheck: campaign 24369162368 PAUSED, EUR 2/day, zero impressions,
  clicks and spend. No campaign/account mutations; TERMO unchanged.
- Browser control failed during initialization. Owner asked to perform Google login,
  reload/session persistence and logout in Safari, without another section completion.
  This remains pending and will be recorded as owner-reported, not automated observation.
- Deployment skills guided target/provenance confirmation and public byte checks.
- Bounded production error-log query (`--level error --since 10m --limit 20`) returned
  no entries. This is not a substitute for authenticated interaction testing.
- The canceled duplicate wrote a canceled/failure Vercel status against the code SHA
  in GitHub, despite the original deployment being READY and serving correct bytes.
  The documentation receipt is a separate subsequent commit/deployment, not a code fix.

## Rollback procedure

Before publication, review/revert only the C35 diff while preserving the supplied
specs and any unrelated owner edits. After publication, prepare a scoped revert or
promote the previously verified production deployment with owner authorization;
do not reset the worktree or touch TERMO. No schema rollback is necessary. If the
future pilot has been activated and its stop rules trigger, pause only QUANTUM
campaign `24369162368` and inspect the evidence before further changes.
