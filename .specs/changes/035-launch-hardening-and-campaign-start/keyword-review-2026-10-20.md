# C35 — owner-added keyword review, 2026-10-20 ~07:35 BRT

Audit only. Owner explicitly prefers useful reach over aggressive restrictions.
No Ads mutations, keyword removals, added negatives, budget/strategy changes,
TERMO edits, commit, push or deployment.

## Observed

- 33 positive keywords in the existing Quantum Mechanics Study group: 25 BROAD,
  4 EXACT, 4 PHRASE. All ENABLED. Compared with the previous eight-keyword snapshot,
  the 25 broad terms are now present. The earlier audit is a dated snapshot, not
  proof against the owner's later additions.
- Seven original keywords ELIGIBLE, one original rarely served. Of the 25 new
  terms, 22 PENDING / reason12 (under review), three NOT_ELIGIBLE / reasons10,12
  (rarely served and under review). No disapproval reason returned.
- The scoped change-event query returned no Oct20 rows at this read; actual
  criteria establish the additions. Do not infer absence of edits from event lag.
- Campaign ENABLED/LEARNING; same partial-day 2 impressions, zero clicks/cost.
  The new keywords cannot yet be credited with results.
- Google-suggested provenance is owner-reported, not independently returned by API.
- Existing eleven phrase negatives have no literal text conflict with the new
  keywords; none returned reason3 (campaign negative override). Related search
  expansions may still intersect negatives; no full auction-coverage claim.

## Insertion and reach verdict

Insertion is correct for broad match: keywords are stored separately, with clean
text and no embedded quote/bracket mistakes or concatenated list. Broad match can
reach related searches beyond the wording. More similar broad terms need not
produce proportionally more reach. No reason to convert all terms to exact/phrase.

Keep the learning/self-study, exercises and physical simulator terms as useful
exploration candidates. Course/beginner terms are adjacent intent worth testing;
the ad must keep describing an interactive book, without promises of a certified
course. Several near-synonymous broad terms are redundant but not insertion errors;
there is no need to delete them now.

Watch rather than automatically remove: the three simulation-theory variants
may attract simulation-hypothesis or computing research traffic; the Python term
may attract code-library seekers; one-lesson wording may imply a shallower lesson.
These are semantic hypotheses, not evidence of wasted clicks. Use actual search
terms and consented study outcomes to decide, not the keyword wording alone.

Google recommends pairing broad match with Smart Bidding. This pilot currently
uses Maximize Clicks, which optimizes clicks rather than conversions; therefore
the broad expansion is exploratory, not a verified conversion-optimized setup.
Do not silently switch bidding or raise the approved caps. Preserve the owner's
reach preference and evaluate relevant visits before making targeted restrictions.

## New keywords

- `learn quantum physics` — PENDING; reasons [12]
- `quantum mechanics online course` — PENDING; reasons [12]
- `quantum physics simulation` — PENDING; reasons [12]
- `learn quantum physics online` — PENDING; reasons [12]
- `study quantum mechanics` — PENDING; reasons [12]
- `learn quantum physics from scratch` — PENDING; reasons [12]
- `learn quantum mechanics online` — PENDING; reasons [12]
- `quantum mechanical simulation` — PENDING; reasons [12]
- `teach me quantum physics` — PENDING; reasons [12]
- `best way to learn quantum mechanics` — PENDING; reasons [12]
- `i want to learn quantum physics` — PENDING; reasons [12]
- `quantum physics course for beginners` — PENDING; reasons [12]
- `best online course for quantum mechanics` — NOT_ELIGIBLE; reasons [10, 12]
- `best online quantum mechanics course` — PENDING; reasons [12]
- `self study quantum mechanics` — PENDING; reasons [12]
- `quantum simulation theory` — PENDING; reasons [12]
- `quantum mechanics simulation theory` — PENDING; reasons [12]
- `quantum mechanics simulation python` — NOT_ELIGIBLE; reasons [10, 12]
- `quantum mechanics and simulation theory` — PENDING; reasons [12]
- `learn quantum mechanics from scratch` — PENDING; reasons [12]
- `learn quantum physics in one lesson` — PENDING; reasons [12]
- `learning quantum mechanics on your own` — NOT_ELIGIBLE; reasons [10, 12]
- `quantum physics exercises` — PENDING; reasons [12]
- `quantum harmonic oscillator simulation` — PENDING; reasons [12]
- `quantum tunneling simulation` — PENDING; reasons [12]

## Sources and limits

- [Google keyword matching](https://support.google.com/google-ads/answer/7478529?hl=en):
  syntax, broad expansion, similar keywords and recommendation to use Smart Bidding.
- [Google criterion reason enum](https://raw.githubusercontent.com/googleapis/googleapis/master/google/ads/googleads/v23/enums/ad_group_criterion_primary_status_reason.proto):
  10 rarely served; 12 under review; 9 disapproved (not observed).
- API read only; no browser login required. No new study event or ad click.
- Digital Discovery Audit used to distinguish review status, match type, relevant
  reach and actual performance. No performance winner claimed with two impressions.

## Pó Mágico checkpoint

Source: local canonical po-magico README; current version v20261019.001.
Checked 2026-10-20 for resume/classification/analysis/delivery: router, path guard,
interactive-book context, Change system, approval boundaries and interaction loop.
Existing C35 retained. Adopted delta from pinned v20260924.001: current checkpoint
record and explicit read-only analysis boundary; no unrelated blueprint migration.
Canonical catalog points to Documents/Developer/qm; old GitHub checkout untouched.
Classification INTERACTIVE_BOOK + EDUCATIONAL_MATERIAL + APP, campaign audit only.
Executed by current Codex session, no subagents or model switch; exact model ID
not separately exposed by execution metadata. No archive evolution/closure invoked.
