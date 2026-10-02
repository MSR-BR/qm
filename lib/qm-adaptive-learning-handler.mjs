import { deriveConceptStates, selectDailyChallenge } from "./qm-adaptive-engine.mjs";
import { grade, hintForQuestion, publicQuestion, questionById } from "./qm-chapter-quiz-catalog.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POLICY_VERSION = "qm-learning-policy-2026-09-25.1";
function reply(status, body) { return { status, body }; }
function tokenOf(headers = {}) { return String(headers.authorization || headers.Authorization || "").match(/^Bearer\s+(\S+)$/i)?.[1] || ""; }
function bodyOf(value) { if (value && typeof value === "object") return value; try { return JSON.parse(value || "{}"); } catch { return {}; } }
function configOf(env) {
  const url = String(env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const publicKey = String(env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "");
  const serviceKey = String(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "");
  return url && publicKey && serviceKey ? { url, publicKey, serviceKey } : null;
}
async function call(config, path, options, fetchImpl) {
  const result = await fetchImpl(config.url + "/rest/v1/" + path, { ...options, signal: AbortSignal.timeout(8000), headers: {
    apikey: config.serviceKey, Authorization: "Bearer " + config.serviceKey, "Content-Type": "application/json",
    Prefer: "return=representation", ...(options?.headers || {}) } });
  let data = null; try { data = await result.json(); } catch { data = null; }
  return { ok: result.ok, data, status: result.status };
}
async function userOf(config, token, fetchImpl) {
  const result = await fetchImpl(config.url + "/auth/v1/user", { signal: AbortSignal.timeout(8000), headers: { apikey: config.publicKey, Authorization: "Bearer " + token } });
  return result.ok ? result.json() : null;
}
function value(data) { return Array.isArray(data) ? data[0] : data; }
function localDate() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date()).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function dailyQuiz(issue) {
  const questions = issue.item_ids.map(questionById).filter(Boolean);
  return { quizKey: `qm-daily-${String(issue.issued_at).slice(0, 10)}`, itemSetVersion: "qm-reviewed-question-set-2026-09-26.1",
    chapterId: issue.chapter_id, title: "Daily Challenge", mode: "daily_challenge", questions };
}
function normalizeAnswers(quiz, entries) {
  if (!Array.isArray(entries) || entries.length !== quiz.questions.length) return null;
  const ids = new Set(quiz.questions.map(question => question.questionId)); const seen = new Set(); const result = [];
  for (const entry of entries) {
    const questionId = String(entry?.questionId || ""); const choice = String(entry?.choice || "").toLowerCase();
    const confidence = ["low", "medium", "high"].includes(entry?.confidence) ? entry.confidence : "unknown";
    if (!ids.has(questionId) || seen.has(questionId) || !["a", "b", "c", "d"].includes(choice)) return null;
    seen.add(questionId); result.push({ questionId, choice, confidence });
  }
  return result;
}

export async function handleQmAdaptiveLearning({ method, headers = {}, body = {}, query = {}, env = process.env, fetchImpl = fetch }) {
  const config = configOf(env); const token = tokenOf(headers); const input = bodyOf(body);
  if (!config) return reply(503, { error: "Adaptive learning is not configured." });
  if (!token) return reply(401, { error: "Sign in to use adaptive learning." });
  const user = await userOf(config, token, fetchImpl).catch(() => null);
  if (!user?.id) return reply(401, { error: "Your session could not be verified." });

  if (method === "GET") {
    const snapshotResult = await call(config, "rpc/read_qm_learning_snapshot", { method: "POST", body: JSON.stringify({ p_user_id: user.id }) }, fetchImpl).catch(() => null);
    if (!snapshotResult?.ok) return reply(503, { error: "The Daily Challenge is temporarily unavailable." });
    const snapshot = value(snapshotResult.data) || snapshotResult.data;
    const states = deriveConceptStates(snapshot.attempt_items || [], snapshot.generated_at);
    let plan = null;
    for (const chapterId of ["01", "02", "03", "04", "05", "06", "07"]) {
      const completed = (snapshot.progress || []).filter(row => row.chapter_id === chapterId && row.status === "completed").map(row => row.item_id);
      const candidate = selectDailyChallenge({ conceptStates: states, completedSectionIds: completed, generatedAt: snapshot.generated_at, itemCount: 3 });
      const sameChapter = candidate.questions.filter(question => question.chapterId === chapterId).slice(0, 3);
      if (sameChapter.length === 3) { plan = { ...candidate, questions: sameChapter, chapterId }; break; }
    }
    if (!plan) return reply(200, { challenge: { status: "insufficient_studied_content", questions: [], expectedMinutes: 5,
      explanation: "Complete reviewed sections from at least three checkpoint concepts in one chapter first.", alternative: "/index.html?view=chapters" } });
    const issued = await call(config, "rpc/issue_qm_daily_challenge", { method: "POST", body: JSON.stringify({ p_user_id: user.id,
      p_idempotency_key: "daily:" + localDate(), p_chapter_id: plan.chapterId, p_question_ids: plan.questions.map(question => question.questionId) }) }, fetchImpl).catch(() => null);
    if (!issued?.ok) return reply(503, { error: "The Daily Challenge could not be issued." });
    const issue = value(issued.data);
    const byId = new Map(plan.questions.map(question => [question.questionId, question]));
    return reply(200, { challenge: { status: issue.completed_at ? "completed" : "available", issueId: issue.id, chapterId: issue.chapter_id,
      issuedAt: issue.issued_at, expiresAt: issue.expires_at, expectedMinutes: plan.expected_minutes, noMissedDayPenalty: true, points: 0,
      questions: issue.item_ids.map(id => ({ ...publicQuestion(questionById(id)), selectionReason: byId.get(id)?.selection_reason || "Spaced retrieval of studied reviewed material." })),
      alternative: plan.alternative, policyVersion: issue.policy_version } });
  }
  if (method !== "POST") return reply(405, { error: "Use GET or POST." });
  const action = String(input.action || "");

  if (action === "hint") {
    if (!UUID.test(String(input.issueId || "")) || !questionById(input.questionId)) return reply(422, { error: "Invalid hint request." });
    const hint = hintForQuestion(input.questionId, input.level);
    const stored = await call(config, "rpc/record_qm_daily_help", { method: "POST", body: JSON.stringify({ p_user_id: user.id,
      p_issue_id: input.issueId, p_question_id: input.questionId, p_hint_level: hint.level, p_solution_revealed: hint.solutionRevealed }) }, fetchImpl).catch(() => null);
    return stored?.ok ? reply(200, { hint }) : reply(409, { error: "This hint cannot be revealed yet." });
  }
  if (action === "submit_daily") {
    if (!UUID.test(String(input.issueId || "")) || !UUID.test(String(input.sessionId || "")) || !UUID.test(String(input.idempotencyKey || ""))) return reply(422, { error: "Invalid Daily Challenge identifiers." });
    const found = await call(config, "qm_learning_activity_issues?id=eq." + encodeURIComponent(input.issueId) + "&user_id=eq." + encodeURIComponent(user.id)
      + "&select=id,chapter_id,item_ids,issued_at,expires_at,completed_at", { method: "GET" }, fetchImpl).catch(() => null);
    const issue = found?.ok && Array.isArray(found.data) ? found.data[0] : null;
    if (!issue || issue.completed_at) return reply(409, { error: "This Daily Challenge is no longer available." });
    const quiz = dailyQuiz(issue); const answers = normalizeAnswers(quiz, input.answers);
    if (!answers) return reply(422, { error: "Answer every Daily Challenge item and report confidence." });
    const result = grade(quiz, answers); const evidence = result.feedback.map(item => ({ questionId: item.questionId, correct: item.correct, confidence: item.confidence }));
    const stored = await call(config, "rpc/record_qm_learning_activity", { method: "POST", body: JSON.stringify({ p_user_id: user.id,
      p_idempotency_key: input.idempotencyKey, p_activity_type: "daily_challenge", p_chapter_id: issue.chapter_id,
      p_session_id: input.sessionId, p_item_set_version: quiz.itemSetVersion, p_evidence: evidence,
      p_issue_id: issue.id, p_remediation_cycle_id: null }) }, fetchImpl).catch(() => null);
    return stored?.ok ? reply(200, { result, attempt: value(stored.data), points: 0 }) : reply(503, { error: "Your Daily Challenge attempt could not be saved." });
  }
  if (action === "mechanic") {
    const stored = await call(config, "rpc/record_qm_mechanic_fidelity", { method: "POST", body: JSON.stringify({ p_user_id: user.id,
      p_mechanism_id: input.mechanismId, p_event_type: input.eventType, p_context_id: input.contextId,
      p_idempotency_key: input.idempotencyKey }) }, fetchImpl).catch(() => null);
    return stored?.ok ? reply(200, { event: value(stored.data) }) : reply(422, { error: "Invalid mechanic event." });
  }
  if (action === "simulator_stage") {
    if (!UUID.test(String(input.activityId || "")) || !UUID.test(String(input.idempotencyKey || ""))) return reply(422, { error: "Invalid simulator activity identifiers." });
    const stored = await call(config, "rpc/record_qm_simulator_learning_stage", { method: "POST", body: JSON.stringify({ p_user_id: user.id,
      p_activity_id: input.activityId, p_simulator_slug: input.simulatorSlug, p_stage: input.stage,
      p_response_code: input.responseCode || null, p_interaction_count: Number(input.interactionCount || 0),
      p_idempotency_key: input.idempotencyKey }) }, fetchImpl).catch(() => null);
    return stored?.ok ? reply(200, { stage: value(stored.data), policyVersion: POLICY_VERSION }) : reply(409, { error: "The simulator learning stage could not be recorded." });
  }
  return reply(422, { error: "Unsupported adaptive-learning action." });
}
