# Risks

| Risk | Control | Status |
|---|---|---|
| Activity or points are misrepresented as mastery | Separate stores/states; delayed, unaided, varied retrieval rule; simulator/Daily rewards are zero | Mitigated locally; C32 calibration pending |
| Reward farming or duplicate requests | Server scoring, idempotency, once-per-chapter awards, local-day and rolling caps, atomic ledger projection | Verified in isolated PostgreSQL |
| Cross-user evidence leakage or forgery | Verified identity, server-only RPCs, RLS, explicit grants, own-user tests | Verified locally; managed Supabase proof pending |
| Locked/unreviewed content enters practice or AI | Exact reviewed graph/source contracts and fail-closed eligible-ID filter | Verified locally |
| Optional AI changes pedagogy or invents content | AI may only reorder existing eligible IDs; deterministic fallback is authoritative | Verified by unit tests; provider remains inactive |
| Historical data is promoted to mastery | Legacy history remains behavioral history; operator-only reconciliation never invents mastery | Mitigated locally; real dry run pending |
| Migration is deployed against unreconciled history | C21/C27/C29/C30 and QM-SEC-006 remain explicit release blockers | Open release blocker |
| Evidence policy overclaims educational effect | Public wording distinguishes policy from proven efficacy; C32 owns calibration/evaluation | Open — C32 |
