import { getQuiz, publicQuiz, grade } from "./qm-chapter-quiz-catalog.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POLICY_VERSION = "qm-learning-policy-2026-09-25.1";

function response(status, body) { return { status, body }; }
function bodyOf(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try { return JSON.parse(body); } catch { return {}; }
}
function tokenOf(headers = {}) {
  return String(headers.authorization || headers.Authorization || "").match(/^Bearer\s+(\S+)$/i)?.[1] || "";
}
function configOf(env) {
  const url = String(env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const publicKey = String(env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "");
  const serviceKey = String(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "");
  return url && publicKey && serviceKey ? { url, publicKey, serviceKey } : null;
}
async function authUser(config, token, fetchImpl) {
  const result = await fetchImpl(config.url + "/auth/v1/user", { signal: AbortSignal.timeout(8000), headers: { apikey: config.publicKey, Authorization: "Bearer " + token } });
  return result.ok ? result.json() : null;
}
async function serviceRequest(config, path, options, fetchImpl) {
  const result = await fetchImpl(config.url + "/rest/v1/" + path, {
    ...options, signal: AbortSignal.timeout(8000), headers: { apikey: config.serviceKey, Authorization: "Bearer " + config.serviceKey,
      "Content-Type": "application/json", Prefer: "return=representation", ...(options?.headers || {}) }
  });
  let data = null;
  try { data = await result.json(); } catch { data = null; }
  return { ok: result.ok, status: result.status, data };
}
function chapterIdOf(value) { return String(value || "").replace(/\D/g, "").padStart(2, "0").slice(-2); }
function normalizeAnswers(quiz, value) {
  if (!Array.isArray(value) || value.length !== quiz.questions.length) return null;
  const allowed = new Set(quiz.questions.map(question => question.questionId));
  const seen = new Set();
  const answers = [];
  for (const entry of value) {
    const questionId = String(entry?.questionId || "");
    const choice = String(entry?.choice || "").toLowerCase();
    const confidence = ["low", "medium", "high"].includes(entry?.confidence) ? entry.confidence : "unknown";
    if (!allowed.has(questionId) || seen.has(questionId) || !["a", "b", "c", "d"].includes(choice)) return null;
    seen.add(questionId); answers.push({ questionId, choice, confidence });
  }
  return answers;
}
function safeFailure(action = "save") {
  return response(503, { error: action === "history" ? "Your assessment history could not be loaded. Please try again."
    : "Your assessment attempt could not be saved. Please try again." });
}
function rpcValue(data) { return Array.isArray(data) ? data[0] : data; }

export async function handleQmChapterQuiz({ method, headers = {}, body = {}, query = {}, env = process.env, fetchImpl = fetch }) {
  const input = bodyOf(body);
  const chapterId = chapterIdOf(input.chapterId || query.chapterId);
  const action = String(input.action || query.action || "assessment");
  const config = configOf(env);

  if (method === "GET" && query.history) {
    const token = tokenOf(headers);
    if (!config) return response(503, { error: "Assessment service is not configured." });
    if (!token) return response(401, { error: "Sign in to view assessment history." });
    const user = await authUser(config, token, fetchImpl).catch(() => null);
    if (!user?.id) return response(401, { error: "Your session could not be verified." });
    const result = await serviceRequest(config, "qm_learning_attempts?user_id=eq." + encodeURIComponent(user.id)
      + "&activity_type=in.(assessment,retry)&select=id,activity_type,chapter_id,score,correct_count,question_count,occurred_at"
      + "&order=occurred_at.desc&limit=50", { method: "GET" }, fetchImpl).catch(() => null);
    return result?.ok ? response(200, { attempts: Array.isArray(result.data) ? result.data : [] }) : safeFailure("history");
  }

  if (method === "GET" && action === "retry") {
    const token = tokenOf(headers);
    if (!config) return response(503, { error: "Assessment service is not configured." });
    if (!token || !UUID.test(String(query.cycleId || ""))) return response(401, { error: "Sign in to continue guided retry." });
    const user = await authUser(config, token, fetchImpl).catch(() => null);
    if (!user?.id) return response(401, { error: "Your session could not be verified." });
    const found = await serviceRequest(config, "qm_learning_remediation_cycles?id=eq." + encodeURIComponent(query.cycleId)
      + "&user_id=eq." + encodeURIComponent(user.id) + "&select=id,chapter_id,concept_ids,review_completed_at,retry_attempt_id",
      { method: "GET" }, fetchImpl).catch(() => null);
    const cycle = found?.ok && Array.isArray(found.data) ? found.data[0] : null;
    if (!cycle || !cycle.review_completed_at || cycle.retry_attempt_id) return response(409, { error: "Complete guided review before retrying." });
    const retryQuiz = getQuiz(cycle.chapter_id, { retryConceptIds: cycle.concept_ids });
    return retryQuiz?.questions.length ? response(200, { quiz: publicQuiz(retryQuiz), cycleId: cycle.id }) : response(404, { error: "No reviewed retry is available." });
  }

  const quiz = getQuiz(chapterId);
  if (!quiz) return response(404, { error: "No reviewed assessment is available for this chapter." });
  if (method === "GET") return response(200, { quiz: publicQuiz(quiz) });
  if (method !== "POST") return response(405, { error: "Use GET or POST." });
  const token = tokenOf(headers);
  if (!config) return response(503, { error: "Assessment service is not configured." });
  if (!token) return response(401, { error: "Sign in to use chapter assessments." });
  const user = await authUser(config, token, fetchImpl).catch(() => null);
  if (!user?.id) return response(401, { error: "Your session could not be verified." });

  if (action === "review") {
    if (!UUID.test(String(input.cycleId || ""))) return response(422, { error: "A valid guided-review cycle is required." });
    const stored = await serviceRequest(config, "rpc/complete_qm_learning_review", { method: "POST", body: JSON.stringify({
      p_user_id: user.id, p_cycle_id: input.cycleId, p_idempotency_key: "review:" + input.cycleId,
      p_highest_hint_level: Number(input.highestHintLevel || 4), p_solution_revealed: input.solutionRevealed !== false
    }) }, fetchImpl).catch(() => null);
    return stored?.ok ? response(200, { review: rpcValue(stored.data) }) : safeFailure();
  }

  let selectedQuiz = quiz;
  let cycle = null;
  if (action === "retry") {
    if (!UUID.test(String(input.cycleId || ""))) return response(422, { error: "A valid guided-review cycle is required." });
    const found = await serviceRequest(config, "qm_learning_remediation_cycles?id=eq." + encodeURIComponent(input.cycleId)
      + "&user_id=eq." + encodeURIComponent(user.id) + "&select=id,chapter_id,concept_ids,review_completed_at,retry_attempt_id",
      { method: "GET" }, fetchImpl).catch(() => null);
    cycle = found?.ok && Array.isArray(found.data) ? found.data[0] : null;
    if (!cycle || !cycle.review_completed_at || cycle.retry_attempt_id || cycle.chapter_id !== chapterId) return response(409, { error: "Complete guided review before retrying." });
    selectedQuiz = getQuiz(chapterId, { retryConceptIds: cycle.concept_ids });
  }
  const answers = normalizeAnswers(selectedQuiz, input.answers);
  if (!answers) return response(422, { error: "Answer every assessment question once and report confidence before submitting." });
  if (!UUID.test(String(input.sessionId || "")) || !UUID.test(String(input.idempotencyKey || ""))) {
    return response(422, { error: "This attempt needs a valid session and idempotency identifier." });
  }
  const graded = grade(selectedQuiz, answers);
  const evidence = graded.feedback.map(item => ({ questionId: item.questionId, correct: item.correct, confidence: item.confidence }));
  const stored = await serviceRequest(config, "rpc/record_qm_learning_activity", { method: "POST", body: JSON.stringify({
    p_user_id: user.id, p_idempotency_key: input.idempotencyKey,
    p_activity_type: action === "retry" ? "retry" : "assessment", p_chapter_id: selectedQuiz.chapterId,
    p_session_id: input.sessionId, p_item_set_version: selectedQuiz.itemSetVersion, p_evidence: evidence,
    p_issue_id: null, p_remediation_cycle_id: cycle?.id || null
  }) }, fetchImpl).catch(() => null);
  if (!stored?.ok) return safeFailure();
  return response(200, { quiz: publicQuiz(selectedQuiz), result: graded, attempt: rpcValue(stored.data), policyVersion: POLICY_VERSION });
}
