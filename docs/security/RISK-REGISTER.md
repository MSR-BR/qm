# QUANTUM security risk register

Current C33 amendment (2026-10-02): the owner's Google-only decision has been
applied and verified on the replacement target. Password authentication returns
`email_provider_disabled`; all other Auth settings remain unchanged. The
leaked-password Advisor WARN remains visible but is not an active login surface;
future password enablement requires review. Google Audience is In production,
authenticated Preview/profile and 634 managed access checks pass. Rehearsed SQL
and verified source PDFs now have a durable encrypted local recovery archive
with a Keychain-held key. Off-site/continuous backup is not provided. Production
cutover and production-domain smoke remain pending; earlier OAuth/setup/recovery
observations below are historical. See C33 current preflight.

Fresh-target amendment (2026-09-26): owner authorized replacement without old
learner-data migration. New `crasnnvdvujzxudmbakv` has working API/CLI SQL;
old `plqiofznjlbpfufigpcp` is paused, not repaired/deleted. QM-SEC-006's old PAM
and production-history mapping are not fresh-target prerequisites. Fresh baseline
`20260926204825` resolves version/helper bootstrap defects without editing old
history, and CLI reports up to date. QM-SEC-006 is **MITIGATED FOR FRESH TARGET**.
QM-SEC-001/002/007/008 database layer: 634 managed catalog checks and disposable
Auth/REST ownership/concurrent-points/adaptive tests pass. QM-SEC-007 historical
import is N/A, but app-level balances still require cutover smoke. QM-SEC-003/009:
schema installed and no-consent denial proven; delivery remains disabled and
provider/unsubscribe production checks remain open. QM-SEC-010 SQL fix is now
installed, not just local. Google OAuth secret/callback, browser/app target
configuration, production recovery and publication approval remain blockers.
Private source hashes/access controls verified; no test users remain. See C33
`fresh-installation.md`. The rows below preserve the earlier risk history.

C33 access update (2026-09-26) for QM-SEC-006: CLI account/project identity
confirmed, but both direct CLI history and Management API SQL fail PAM (28000).
The connector has a different organization scope. Backup metadata returns no
backup entries and PITR disabled; recoverability remains unverified. Read-only
next check and unsent support draft are recorded in C33; no remote repair run.

| ID | Severity | Asset | Evidence | Impact / preconditions | Remediation and validation | Status |
|---|---|---|---|---|---|---|
| QM-SEC-001 | High | Supabase learning flows | C21/C27 migrations are local and production has not been checked after them. | Assessment/reward persistence can fail until an authorized migration is applied. | Verify exact project, review SQL, apply only with authorization, then run anonymous/own/other/admin/service smoke tests. | OPEN — release blocker, not a local-spec blocker |
| QM-SEC-002 | Medium | Data API privilege drift | Older migrations relied partly on historical defaults and one identity sequence lacked an explicit grant. | Fresh installations or post-default objects can become unreachable or overprivileged. | C27 centralizes exact grants; `npm run check:supabase-privileges` blocks unclassified tables/functions/sequences. | MITIGATED LOCALLY |
| QM-SEC-003 | Medium | Optional communication consent | C32 locally changes silence/default to off, requires timestamped versioned consent and time zone, and adds pause plus signed unsubscribe. | Production can still behave differently until the forward migration and exact environment are proven. | Apply only in the authorized migration sequence; prove opt-in/off/pause/unsubscribe using own and second test identities before enabling delivery. | MITIGATED LOCALLY; OPEN release gate |
| QM-SEC-004 | Medium | Learning claims and learner model | C30/C32 separate activity, evidence, reward, mastery and five evaluation families; operational reports refuse a causal effect size without a prespecified design. | Future copy or analysis could still overstate descriptive evidence or uncalibrated thresholds. | Keep conservative labels, exact denominators/limitations, and require a governed evaluation design before an efficacy claim. | MITIGATED LOCALLY; ongoing governance |
| QM-SEC-005 | Low | Remote audit cleanup | The authorized audit script uses service-role deletion only for disposable validation reports. | Overbroad use of the service key would bypass RLS. | C27 grants only `DELETE` on that audit table; keep the script local, owner-authorized, bounded, and never log the key. | ACCEPTED FOR LOCAL TOOLING; review before remote run |
| QM-SEC-006 | High | Migration reproducibility | C33 inventories duplicate versions `20260531`, `20260731`, `20260803`; old SQL also unconditionally revokes `public.rls_auto_enable()`. Connector identity read denied and CLI history read failed PAM (28000) on 2026-09-26. | Canonical replay cannot reconstruct history and actual remote mapping is unknown; isolated SQL proof does not resolve that ambiguity. | C33 records hashes, read-only metadata query and conditional forward/baseline procedure. Obtain real history, verify catalog equivalence, rehearse canonical reset and authorize exact repair before mutation; never rename applied history ad hoc. | OPEN — release blocker |
| QM-SEC-007 | High | C29 ledger cutover and historical balances | Local ledger is new; actual production profiles/events have not had an authorized complete dry run. | Deploying without reconciliation can block awards; inventing evidence or resetting points would corrupt history. | C29 refuses unbalanced awards, imports only through an operator-only guarded function, and exposes reconciliation-required status. Review complete real snapshot and exact managed role/API behavior before cutover. | MITIGATED LOCALLY; OPEN release gate |
| QM-SEC-008 | High | C30 adaptive evidence and reward rollout | C30 adds server-only instructional RPCs, seven learner-owned evidence tables and private reviewed contracts, but the forward migration exists only locally. | Deploying the application without the exact schema breaks assessments/Daily/review/simulator persistence; applying SQL without history and role proof risks privilege drift or incorrect balances. | Release C21/C27/C29/C30 only in reviewed order after history reconciliation; prove exact grants/RLS with anonymous, own, other, owner and service identities; run real dry run and candidate smoke tests. | MITIGATED LOCALLY; OPEN release blocker |
| QM-SEC-009 | High | C32 communication and aggregate evaluation rollout | C32 adds preference fields, one append-only server table, two service-only RPCs, an owner-only report and a provider delivery path. All exist only locally; no sender, secret, webhook or production flag was activated. | Deploying code before schema breaks preferences/reporting; enabling delivery without the strong unsubscribe secret and identity/provider proof could send outside the intended policy or lose delivery-state fidelity. | Release only after C21/C27/C29/C30, apply C32 with exact grant/RLS proof, configure secrets server-side, verify sender and unsubscribe, keep delivery flag off through testing, then obtain separate authorization to enable it. | MITIGATED LOCALLY; OPEN release blocker |
| QM-SEC-010 | High | C32 executable schema and communication correctness | C33 replay failed on missing communication `sent` column; review found swapped mechanic/communication event semantics and provider deduplication key shared across recipients. | Migration rollback prevents C32 schema installation; report misstates exposure; shared provider key can suppress distinct recipients when delivery is enabled. | Corrected unpublished SQL, separated delivery from unmeasured reading, HMAC-scoped provider key per learner, versioned-consent/fail-closed preview. Full SQL execution, concurrency and 80 Node tests pass. | FIXED LOCALLY in C33; remote proof/activation still gated by QM-SEC-009 |
