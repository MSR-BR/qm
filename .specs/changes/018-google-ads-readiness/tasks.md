# Tasks

- [x] Collect campaign objective, audience, geography, language, daily budget, and conversion priorities; final spend-envelope approval remains below.
- [x] Audit final-domain landing pages, C15 acceptance, C16 measurement, and C17 quality-audit readiness; see launch-review-2026-10-19.md for verified results and remaining gates.
- [x] Draft campaign architecture and keyword plan.
- [x] Draft ads, assets, negative keywords, conversion and consent plan.
- [x] Review the countries, budget and campaign plan with the user; the owner explicitly authorized activation on 2026-10-19, subject to technical launch gates.
- [x] Configure only the approved account items while paused; see the scoped setup and conversion reports.
- [ ] Launch only after the remaining attribution-processing and Ads-access gates in `activation-gates-2026-10-19.md` are satisfied.

## Paused preparation — 2026-10-18

- [x] Confirm MSR-BR Ads account, currency and existing TERMO boundaries read-only.
- [x] Link only QUANTUM GA4 to the existing Ads account, with personalized advertising and Analytics-feature access from Ads disabled.
- [x] Create QUANTUM Search campaign with an independent EUR 2/day budget, paused from creation.
- [x] Configure English, UK/Ireland, presence-only, Google Search only, Maximize clicks and EUR 0.25 maximum CPC.
- [x] Owner follow-up: expand the same paused campaign to 17 countries, rename it International, and verify unchanged EUR 2/day, English criterion, presence-only, CPC ceiling and network settings. See country-expansion section in setup report.
- [x] Create one responsive search ad, eight exact/phrase keywords and eleven campaign-only phrase negatives; verify campaign/group/ad/positive keywords are paused through the API.
- [x] Mark existing `section_complete` as a QUANTUM GA4 key event; validate a real authenticated completion once in DebugView and its persistence after reload.
- [x] Run 14 focused analytics tests, all 131 Node tests, and SEO validation (85 sections).
- [x] Prove source/medium for the controlled signed-in landing/navigation/completion journey: real section completion received once in DebugView with QA source/medium/campaign. Fresh OAuth round-trip and real paid-click/session-report attribution are not proven by this test.
- [x] Implement, test and publish separate opt-in advertising measurement and privacy copy; existing analytics consent never grants ads consent. Production anonymous smoke and the authorized authenticated conversion gate passed below.
- [x] Complete Ads conversion setup after the measurement gate: on 2026-10-19 action 7855071770 was imported/reused, ENABLED, ONE_PER_CLICK, secondary globally, always value zero. See conversion-setup-2026-10-19.md.
- [x] Replace QUANTUM's inherited account-default goals with its isolated goal: custom goal 6459537936 contains only section_complete; QUANTUM uses CAMPAIGN goals, all its standard goals biddable=false. TERMO/account defaults were not edited.
- [x] Review ad policy approval, inherited manual account assets, landing/mobile experience, internal/developer segmentation and Search Console evidence; findings and unresolved gates recorded in launch-review-2026-10-19.md, not silently accepted.
- [x] Obtain a separate explicit activation instruction from the owner on 2026-10-19. This does not waive technical release gates or increase the budget.

Evidence and rollback: `paused-campaign-setup-2026-10-18.md`. C18 remains open; no commit, push, deployment or activation in this preparation run.

## Conversion follow-up — 2026-10-18

- [x] Owner separately approved publishing the tested consent/attribution correction.
- [x] Publish scoped frontend update; confirm production byte match and READY deployment.
- [x] Configure and verify QUANTUM-only campaign UTM suffix; campaign remains paused.
- [x] Validate 139 Node tests, 22 focused analytics tests, 3 browser widths, content/SEO, including late failed request after consent withdrawal.
- [x] Verify real anonymous production collection: no pre-consent request, analytics-only vs ads consent, `npa=1`, QA source/medium and withdrawal.
- [x] Owner authorized additional test; section 1.4 completed once at 22:17:46 BRT, persisted after reload, received once in GA4 with QA source/medium/campaign and non-personalized ads. No paid conversion claimed.
- [x] Finish isolated conversion/goal configuration after the above gate; completed and verified remotely on 2026-10-19, without changing account defaults.
- [x] Retry the Ads import UI: the 2026-10-18 browser blockage was overcome on 2026-10-19. The wizard was restricted to property 554204628 before saving. Campaign remains PAUSED, EUR 2/day; TERMO baseline unchanged.

## Conversion configuration closure — 2026-10-19

- [x] Verify reuse of existing GA4 action, no duplicate action or direct event snippet installed.
- [x] Verify custom goal membership and campaign-only assignment through read-only Ads API.
- [x] Verify campaign, ad group and ad remain PAUSED; ad policy APPROVED; CPC ceiling EUR 0.25 and budget EUR 2/day unchanged.
- [x] Verify TERMO campaign and conversion baseline unchanged; no TERMO code/panel mutations.
- [x] Complete launch review (2026-10-19); publication accepted, advertising activation withheld. See launch-review-2026-10-19.md.
- [x] Validate a fresh authenticated OAuth round-trip, one collected GA4 event with retained QA labels, and persisted section completion. Minute-level report places the two old Google referrals before the correction; see `activation-gates-2026-10-19.md`.
- [x] Document and run a repeatable non-QA GA4 report segment; recheck manual and automated ad-asset associations. The internal filter remains in Testing, and Ads access still requires a working authorized browser session.
- [x] Obtain separate explicit activation approval on 2026-10-19.
- [ ] Confirm the new 2026-10-19 completion in the processed GA4 attribution report and an adequate clean observation window; enable only QUANTUM delivery entities after the final checks. C18 remains open; no paid-click attribution is yet proven.

Current configuration, limitations and scoped rollback: `conversion-setup-2026-10-19.md`.

Detailed follow-up evidence, limitations and rollback: `conversion-readiness-2026-10-18.md`.
