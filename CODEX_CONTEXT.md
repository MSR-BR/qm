# QUANTUM Codex Context

Read this file before non-trivial work. It is the concise operational map; detailed decisions live in `.specs/`.

## Product

QUANTUM is an English interactive Quantum Mechanics book for Physics students. Classification: `INTERACTIVE_BOOK + EDUCATIONAL_MATERIAL + APP`. Collaboration may be in Portuguese; all learner-facing interface text is English.

Production: `https://quantummechanicsbook.app`
Canonical branch: `main`

## Content contract

- Chapters 1–7 are reviewed and public. Chapters 8–13 remain locked under editorial review.
- Never expose locked content through navigation, search, SEO, assessments, daily challenges, exercises, or AI context.
- Follow the Reis Quantum Mechanics text. Do not invent notation, equations, derivations, conclusions, or references.
- Use MathJax for mathematics; use `String.raw` for long dynamic LaTex.
- Keep the established chapter/card teaching pattern.
- Book access is an external Google Books preview. Do not add hosted-PDF delivery.

## Architecture

- `index.html`: application shell, navigation, learner and owner views.
- `slides/chapter-*`: reviewed reading pages.
- `simulators/` and `assets/qm-simulator-catalog.js`: simulator surfaces and catalog.
- `data/qm-content-registry.json`: publication/editorial availability.
- `data/qm-exercise-source-manifest.json`: source provenance for exercise-eligible sections.
- `api/`, `lib/`, and `supabase/migrations/`: protected server/data flows.
- `search.html`: public search of reviewed content only.

## Latest Ads operational checkpoint — 2026-10-20, 12:16 BRT

Fresh scoped API read: campaign ENABLED / LEARNING, EUR 2/day, 4 impressions
today, zero clicks/cost/conversions. No immediate corrective action established.
Owner's 25 broad additions were audited separately: 33 positive keywords total,
all enabled at the 07:35 read. Preserve useful reach; do not prune without
relevant search-term/outcome evidence. See C35 `keyword-review-2026-10-20.md`.
Owner requested documentation CPD; see `cpd-2026-10-20.md`. No Ads mutation.

### Earlier follow-up — 2026-10-20, 07:20 BRT

QUANTUM is serving: 2 impressions today, 0 clicks/cost/conversions at this partial
read. Campaign ENABLED / LEARNING; yesterday's aggregate NOT_ELIGIBLE has cleared.
Oct 19 QA section_complete now appears once in processed GA4 with correct QA
labels. No material configuration drift found; no remote change made today.
EUR 2/day and EUR 0.25 CPC cap preserved, TERMO untouched. Current AI Max/URL
expansion panel state not reread (browser unavailable); retain dated owner OFF
confirmation, not API-null inference. Performance optimization needs data.
See C35 `campaign-audit-2026-10-20.md`; no monitor scheduled.

### Historical activation checkpoint — 2026-10-19

Owner-authorized Firefox activation completed: QUANTUM campaign 24369162368,
group 199601244925, approved ad 828563447756 and all eight positive keywords
are ENABLED. EUR 2 average/day and EUR 0.25 CPC ceiling preserved; TERMO and
account-default goals unchanged. This supersedes historical paused/approval-needed
wording below. Initial aggregate status remains NOT_ELIGIBLE despite eligible
group/ad/seven keywords; one keyword has low search volume. Actual serving and
processed paid attribution are not proven. Check C35 launch/activation receipts
before further Ads work. No automated monitor scheduled; no deploy in this turn.

## Security and service rules

- Google/Supabase authentication, private learner data, and owner administration must remain server-authorized.
- Never rely on editable browser metadata for authorization.
- New Supabase tables require RLS and migration evidence.
- Never print, version, or expose secrets.
- Resend delivery remains inactive until the sender domain and `RESEND_API_KEY` are configured.
- C16 is deployed with the GA4 event contract, opt-in policy, real Measurement ID, 90-day first-party retention, production transport, first-party persistence, sanitization, and revocation verified. Signed-in GA4 DebugView acceptance was recorded on 2026-10-18; see the C16 dated receipt.
- C17 technical QA is deployed: canonical routes, locked chapters, API boundaries, security headers, desktop/mobile browser journeys, keyboard focus, headings, MathJax, simulators, assessments, SEO idempotence, and runtime logs pass. C15 closed by explicit owner authorization on 2026-10-18 after rendered exercise PDF export was fixed and released; unexecuted manual-device/editorial checks are recorded as accepted limits, not performed tests. C31 screen-reader/200% zoom follow-up remains open.
- C18 preparation and C35 owner-authorized activation are complete; see the latest checkpoint above. C35 code fixes (`c7c5fb7`) were published and production login/reload/logout confirmed by the owner. Processed Oct 19 QA attribution is now verified; actual paid outcomes remain an observation task. AI Max/URL-expansion OFF is dated owner testimony, not a current API-null inference. Historical pre-fix referrals are internal/likely internal tests, not paid results.

## Change governance

- Read `.specs/po-magico-reference.md` and the relevant Change before work.
- Preserve the existing Change history; do not create duplicates.
- Each Change records actual model/routing evidence, tests, failures, checkpoints, and unresolved human decisions.
- A `cpd` request means commit, push to `main`, and production deployment. Do not commit or deploy otherwise.

## Required validation

Run the relevant subset of:

```bash
npm run check
npm run validate:seo
npm run audit:exercise-sources
npm run validate:book-corpus
npm run validate:book-topics
npm run validate:book-topic-index
npm run smoke:math-contract
npm run smoke:ai-context
npm run smoke:ai-renderer
git diff --check
```

Use targeted syntax, API, authorization, desktop, mobile, keyboard, anonymous-user, authenticated-user, and owner-user checks whenever the Change affects those surfaces.
