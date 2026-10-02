import { readFileSync } from "node:fs";
import { eligibleQmSection, policy } from "./qm-learning-adapter.mjs";
import { deriveChapterMastery, deriveConceptStates } from "./qm-adaptive-engine.mjs";

const simulatorDeclarations = JSON.parse(readFileSync(new URL("../data/qm-simulator-evidence.v1.json", import.meta.url)));
const knownSimulators = new Set(simulatorDeclarations.simulators.filter(s => s.opened).map(s => s.slug));
const simulatorPaths = JSON.parse(readFileSync(new URL("../data/qm-learning-simulator-paths.v1.json", import.meta.url))).simulators;
function simulatorSlug(row) {
  if (typeof row.page_path !== "string" || !row.page_path.startsWith("simulators/")) return null;
  const url = new URL(row.page_path,"https://local.invalid/");
  const canonical = url.pathname.slice(1) + (url.searchParams.has("sim") ? "?sim=" + url.searchParams.get("sim") : "");
  return simulatorPaths.find(s => s.pagePath === canonical && knownSimulators.has(s.slug))?.slug || null;
}
const unavailable = { status: 503, body: { error: "Your learning profile is temporarily unavailable. Your records have not been reset.", freshness: { status: "unavailable" } } };

export function buildLearningProfile(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.progress) || !Array.isArray(snapshot.simulators)
    || !Number.isInteger(snapshot.assessments?.total) || !snapshot.generated_at
    || !Number.isInteger(snapshot.ledger_xp) || !Number.isInteger(snapshot.ledger_sections)
    || !Number.isInteger(snapshot.unreconciled_rewards)
    || !Number.isFinite(Date.parse(snapshot.generated_at))
    || !(snapshot.assessments.best_score === null || Number.isInteger(snapshot.assessments.best_score))) throw new Error("Invalid snapshot");
  const attemptItems = Array.isArray(snapshot.attempt_items) ? snapshot.attempt_items : [];
  const remediationCycles = Array.isArray(snapshot.remediation_cycles) ? snapshot.remediation_cycles : [];
  const storedBadges = Array.isArray(snapshot.badges) ? snapshot.badges : [];
  const simulatorLearning = Array.isArray(snapshot.simulator_learning) ? snapshot.simulator_learning : [];
  const records = snapshot.progress.filter(p => eligibleQmSection({ chapterId: p.chapter_id, sectionId: p.item_id, pagePath: p.page_path }))
    .map(p => ({chapter_id:p.chapter_id,item_id:p.item_id,page_path:p.page_path,status:p.status,last_opened_at:p.last_opened_at}));
  const completed = records.filter(p => p.status === "completed").length;
  const latest = records.toSorted((a,b) => Date.parse(b.last_opened_at) - Date.parse(a.last_opened_at))[0];
  const stored = snapshot.rewards;
  const rewardData = stored ? {
    xp_total: stored.xp_total, level: stored.level, current_streak: stored.current_streak,
    best_streak: stored.best_streak, studied_items_count: stored.studied_items_count,
    last_active_on: stored.last_active_on
  } : { xp_total: 0, level: 1, current_streak: 0, best_streak: 0, studied_items_count: 0, last_active_on: null };
  const consistent = snapshot.unreconciled_rewards === 0 && rewardData.xp_total === snapshot.ledger_xp
    && rewardData.studied_items_count === snapshot.ledger_sections && rewardData.level === Math.floor(rewardData.xp_total / 100) + 1;
  // Streak is behavior, not mastery; old inactive streaks must not look current.
  const today = new Date(snapshot.generated_at).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const dayGap = (Date.parse(today) - Date.parse(rewardData.last_active_on)) / 86400000;
  if (!rewardData.last_active_on || dayGap > 1) rewardData.current_streak = 0;
  const sims = [...new Set(snapshot.simulators.map(simulatorSlug).filter(Boolean))];
  const concepts = deriveConceptStates(attemptItems, snapshot.generated_at);
  const due = concepts.filter(item => ["needs_review", "due"].includes(item.status));
  const chapters = deriveChapterMastery(concepts);
  const activeCycle = remediationCycles.find(cycle => !cycle.retry_attempt_id) || null;
  const simulatorGoals = simulatorLearning.filter(event => event.stage === "goal_completed");
  const missions = [
    due.length ? { id: "retrieve_due", title: "Retrieve a due concept", progress: 0, target: Math.min(2, due.length), href: "/daily-challenge.html" } : null,
    activeCycle ? { id: "guided_recovery", title: activeCycle.review_completed_at ? "Complete the focused retry" : "Complete guided review", progress: 0, target: 1, href: "/assessments.html" } : null,
    !due.length && !activeCycle ? { id: "reviewed_reading", title: "Continue a reviewed section", progress: 0, target: 1, href: latest ? "/" + latest.page_path : "/index.html?view=chapters&chapter=01" } : null
  ].filter(Boolean);
  const nextAction = activeCycle
    ? { type: activeCycle.review_completed_at ? "focused_retry" : "guided_review", href: "/assessments.html", reason: "A recent error has a source-linked correction cycle ready. You can choose another reviewed activity instead." }
    : due.length ? { type: "daily_challenge", href: "/daily-challenge.html", reason: "Reviewed concepts are due or need a changed retrieval. The challenge is optional and missing a day has no penalty." }
      : { type: latest ? "resume_reading" : "start_reading", href: latest ? "/" + latest.page_path : "/index.html?view=chapters&chapter=01",
        reason: latest ? "Resume your most recently opened reviewed section. This is a reading suggestion, not a mastery diagnosis." : "Start a reviewed section; there is not enough evidence for an adaptive recommendation." };
  return {
    profile_version: "learning-profile-v1", policy_version: policy.policyVersion,
    generated_at: snapshot.generated_at,
    progress: { status: "available", records, completed, evidence: "self_reported_reading_not_mastery" },
    rewards: { status: consistent ? "available" : "reconciliation_required", ...rewardData, ledger_xp: snapshot.ledger_xp },
    concepts: { status: concepts.some(item => item.evidence_count > 0) ? "available" : "insufficient_evidence", items: concepts,
      chapters, reason: "Mastery requires repeated unaided success in separate sessions, changed representations and a delay of at least 24 hours." },
    due_reviews: { status: due.length ? "available" : concepts.some(item => item.evidence_count > 0) ? "none_due" : "insufficient_evidence", items: due },
    assessments: { status: "available", total: snapshot.assessments.total, best_score: snapshot.assessments.best_score, evidence_status: "insufficient_evidence" },
    simulators: { status: "available", opened: sims.length, slugs: sims, meaningful_interactions: simulatorLearning.filter(event => event.stage === "meaningful_interaction").length,
      completed_goals: simulatorGoals.length, evidence: "guided_cycle_is_learning_evidence_but_not_mastery" },
    missions: { status: "available", items: missions }, badges: { status: "available", items: storedBadges },
    next_action: nextAction,
    freshness: Object.fromEntries(["progress","rewards","assessments","simulators"].map(key => [key, { status: key === "rewards" && !consistent ? "reconciliation_required" : "available", as_of: snapshot.generated_at }]))
  };
}

export async function handleQmLearningProfile({ method, headers = {}, query = {}, env = process.env, fetchImpl = fetch }) {
  if (method !== "GET") return { status: 405, body: { error: "Use GET." } };
  if (Object.keys(query).length) return { status: 400, body: { error: "Profile targeting is not supported." } };
  const token = String(headers.authorization || headers.Authorization || "").match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return { status: 401, body: { error: "Sign in to view your learning profile." } };
  const url = String(env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const service = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key || !service) return unavailable;
  try {
    const auth = await fetchImpl(url + "/auth/v1/user", { signal: AbortSignal.timeout(8000), headers: { apikey: key, Authorization: "Bearer " + token } });
    if (!auth.ok) return auth.status >= 500 ? unavailable : { status: 401, body: { error: "Your session could not be verified." } };
    const user = await auth.json();
    if (!/^[0-9a-f-]{36}$/i.test(user?.id || "")) return { status: 401, body: { error: "Your session could not be verified." } };
    const response = await fetchImpl(url + "/rest/v1/rpc/read_qm_learning_snapshot", { method: "POST", signal: AbortSignal.timeout(8000), headers: {
      apikey: service, Authorization: "Bearer " + service, "Content-Type": "application/json"
    }, body: JSON.stringify({ p_user_id: user.id }) });
    if (!response.ok) return unavailable;
    return { status: 200, body: { profile: buildLearningProfile(await response.json()) } };
  } catch { return unavailable; }
}
