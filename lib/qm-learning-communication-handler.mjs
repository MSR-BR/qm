import {
  ensureSupabaseServerConfig,
  fetchAuthenticatedUser,
  jsonResponse,
  parseJsonBody,
  readBearerToken,
  supabaseRestRequest
} from "./qm-server-shared.mjs";
import { PRIVACY_VERSION, TERMS_VERSION } from "./qm-legal-preferences-handler.mjs";
import { buildLearningProfile } from "./qm-learning-profile-handler.mjs";
import {
  LEARNING_EMAIL_CONFIRMATION,
  buildLearningEmail,
  createUnsubscribeToken,
  evaluateLearningMessageEligibility,
  learningProviderIdempotencyKey,
  verifyUnsubscribeToken
} from "./qm-learning-communication.mjs";

const ADMIN_EMAIL = "marioreis@id.uff.br";
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_RECIPIENTS = 100;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function value(payload) {
  return Array.isArray(payload) ? payload[0] : payload;
}

async function resolveAdmin(headers, env) {
  const config = ensureSupabaseServerConfig(env);
  const token = readBearerToken(headers);
  if (!config || !token) return { config, user: null };
  const user = await fetchAuthenticatedUser({ supabaseUrl: config.supabaseUrl, publishableKey: config.publishableKey, accessToken: token });
  const expected = normalizeEmail(env.QM_EMAIL_ADMIN || ADMIN_EMAIL);
  return { config, user: normalizeEmail(user?.email) === expected ? user : null };
}

async function fetchAuthUsers(config) {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: { apikey: config.serviceRoleKey, Authorization: `Bearer ${config.serviceRoleKey}` }
  });
  if (!response.ok) return null;
  const payload = await response.json().catch(() => null);
  return Array.isArray(payload?.users) ? payload.users : Array.isArray(payload) ? payload : null;
}

async function candidateRows(config) {
  const preferences = await supabaseRestRequest({
    config,
    path: "qm_user_legal_preferences",
    params: {
      select: "user_id,email_updates_opted_in,email_updates_opted_in_at,learning_email_consent_version,learning_email_paused,timezone,terms_version,terms_accepted_at,privacy_version,privacy_acknowledged_at",
      email_updates_opted_in: "is.true",
      email_updates_opted_in_at: "not.is.null",
      learning_email_paused: "is.false",
      terms_version: `eq.${TERMS_VERSION}`,
      terms_accepted_at: "not.is.null",
      privacy_version: `eq.${PRIVACY_VERSION}`,
      privacy_acknowledged_at: "not.is.null",
      limit: MAX_RECIPIENTS
    }
  });
  if (!preferences.ok) return null;
  const users = await fetchAuthUsers(config);
  if (!users) return null;
  const byId = new Map(users.map(user => [String(user.id || ""), normalizeEmail(user.email)]));
  return (Array.isArray(preferences.payload) ? preferences.payload : [])
    .map(preference => ({ preference, email: byId.get(String(preference.user_id || "")) }))
    .filter(candidate => candidate.email);
}

async function learningProfile(config, userId) {
  const result = await supabaseRestRequest({
    config,
    path: "rpc/read_qm_learning_snapshot",
    method: "POST",
    body: { p_user_id: userId }
  });
  if (!result.ok) return null;
  try { return buildLearningProfile(value(result.payload) || result.payload); } catch { return null; }
}

async function recentEvents(config, userId) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const result = await supabaseRestRequest({
    config,
    path: "qm_learning_communication_events",
    params: { select: "event_type,occurred_at", user_id: `eq.${userId}`, occurred_at: `gte.${since}`, order: "occurred_at.desc", limit: 20 }
  });
  return result.ok && Array.isArray(result.payload) ? result.payload : null;
}

async function plans(config, now) {
  const candidates = await candidateRows(config);
  if (!candidates) return null;
  const output = [];
  for (const candidate of candidates) {
    const profile = await learningProfile(config, candidate.preference.user_id);
    const events = await recentEvents(config, candidate.preference.user_id);
    const decision = !profile || !events ? { eligible: false, reason: "evidence_unavailable" }
      : evaluateLearningMessageEligibility({ preference: candidate.preference, profile, recentEvents: events, now });
    output.push({ ...candidate, decision });
  }
  return output;
}

async function recordCommunicationEvent(config, row) {
  return supabaseRestRequest({
    config,
    path: "qm_learning_communication_events",
    method: "POST",
    prefer: "return=minimal,resolution=ignore-duplicates",
    body: row
  });
}

async function unsubscribe(input, env) {
  const config = ensureSupabaseServerConfig(env);
  const secret = String(env.QM_UNSUBSCRIBE_SECRET || "");
  if (!config || secret.length < 32) return jsonResponse(503, { error: "One-click unsubscribe is not configured." });
  const decoded = verifyUnsubscribeToken(input.token, secret);
  if (!decoded) return jsonResponse(400, { error: "This unsubscribe link is invalid." });
  const current = await supabaseRestRequest({
    config,
    path: "qm_user_legal_preferences",
    params: { select: "user_id,email_updates_opted_in_at", user_id: `eq.${decoded.u}`, limit: 1 }
  });
  const preference = current.ok ? value(current.payload) : null;
  if (!preference || String(preference.email_updates_opted_in_at || "") !== decoded.c) {
    return jsonResponse(200, { unsubscribed: true, alreadyInactive: true });
  }
  const now = new Date().toISOString();
  const updated = await supabaseRestRequest({
    config,
    path: "qm_user_legal_preferences",
    method: "PATCH",
    params: { user_id: `eq.${decoded.u}` },
    prefer: "return=minimal",
    body: { email_updates_opted_in: false, email_updates_opted_out_at: now, learning_email_paused: true, learning_email_paused_at: now }
  });
  if (!updated.ok) return jsonResponse(503, { error: "Your preference could not be changed now." });
  const last = await supabaseRestRequest({
    config,
    path: "qm_learning_communication_events",
    params: { select: "message_kind,context_id,content_id", user_id: `eq.${decoded.u}`, order: "occurred_at.desc", limit: 1 }
  });
  const previous = last.ok ? value(last.payload) : null;
  if (previous?.content_id) {
    await recordCommunicationEvent(config, { user_id: decoded.u, event_type: "opted_out", message_kind: previous.message_kind,
      context_id: previous.context_id, content_id: previous.content_id, reason_code: "learner_unsubscribed",
      idempotency_key: `opted-out:${decoded.c}`, policy_version: "qm-learning-policy-2026-09-25.1", occurred_at: now });
  }
  return jsonResponse(200, { unsubscribed: true });
}

export async function handleQmLearningCommunication({ method, headers = {}, body, query = {}, env = process.env }) {
  if (method !== "POST") return jsonResponse(405, { error: "Use POST." });
  const input = parseJsonBody(body);
  if (input.action === "unsubscribe" || query.token) return unsubscribe({ token: input.token || query.token }, env);

  const { config, user } = await resolveAdmin(headers, env);
  if (!config) return jsonResponse(503, { error: "Learning communication is not configured." });
  if (!user?.id) return jsonResponse(403, { error: "This area is available only to the responsible QUANTUM account." });
  if (!["preview", "dispatch"].includes(input.action)) return jsonResponse(400, { error: "Choose preview or dispatch." });

  const now = new Date();
  const prepared = await plans(config, now);
  if (!prepared) return jsonResponse(503, { error: "The eligible audience could not be evaluated." });
  const reasons = prepared.reduce((counts, item) => { const key = item.decision.reason; counts[key] = (counts[key] || 0) + 1; return counts; }, {});
  const eligible = prepared.filter(item => item.decision.eligible);
  if (input.action === "preview") {
    return jsonResponse(200, { productionDeliveryEnabled: env.QM_LEARNING_EMAIL_DELIVERY_ENABLED === "true", evaluated: prepared.length,
      eligible: eligible.length, reasons, policy: { dailyCap: 1, rollingSevenDayCap: 2, quietHours: "21:00–07:00 local", unknownTimezone: "do_not_send" } });
  }

  if (env.QM_LEARNING_EMAIL_DELIVERY_ENABLED !== "true") {
    return jsonResponse(409, { error: "Production learning email delivery is disabled. A separate release authorization is required." });
  }
  if (input.confirmationText !== LEARNING_EMAIL_CONFIRMATION) return jsonResponse(400, { error: `Type ${LEARNING_EMAIL_CONFIRMATION} to confirm.` });
  const apiKey = String(env.RESEND_API_KEY || "");
  const secret = String(env.QM_UNSUBSCRIBE_SECRET || "");
  if (!apiKey || secret.length < 32) return jsonResponse(503, { error: "Provider delivery and one-click unsubscribe must both be configured." });

  let sent = 0;
  let failed = 0;
  let suppressed = 0;
  for (const item of eligible) {
    const plan = item.decision.plan;
    const key = `due-review:${now.toISOString().slice(0, 10)}:${plan.contextId}`;
    const reserved = await supabaseRestRequest({ config, path: "rpc/reserve_qm_learning_message", method: "POST", body: {
      p_user_id: item.preference.user_id, p_message_kind: plan.messageKind, p_context_id: plan.contextId,
      p_content_id: plan.contentId, p_reason_code: plan.reasonCode, p_idempotency_key: key
    } });
    const reservation = reserved.ok ? value(reserved.payload) : null;
    if (!reservation?.allowed || reservation.deduped) { suppressed += 1; continue; }
    const token = createUnsubscribeToken({ userId: item.preference.user_id, optedInAt: item.preference.email_updates_opted_in_at, secret });
    const baseUrl = String(env.QM_PUBLIC_BASE_URL || "https://quantummechanicsbook.app").replace(/\/+$/, "");
    const unsubscribeUrl = `${baseUrl}/unsubscribe.html#token=${encodeURIComponent(token)}`;
    const oneClickUrl = `${baseUrl}/api/qm-learning-communication?token=${encodeURIComponent(token)}`;
    const email = buildLearningEmail({ plan, destination: item.email, baseUrl, unsubscribeUrl, oneClickUrl });
    const providerKey = learningProviderIdempotencyKey({ userId: item.preference.user_id, reservationKey: key, secret });
    const response = await fetch(RESEND_ENDPOINT, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": providerKey }, body: JSON.stringify(email) });
    const provider = await response.json().catch(() => ({}));
    await recordCommunicationEvent(config, { user_id: item.preference.user_id, event_type: response.ok ? "sent" : "delivery_failed",
      message_kind: plan.messageKind, context_id: plan.contextId, content_id: plan.contentId, reason_code: plan.reasonCode,
      idempotency_key: `${response.ok ? "sent" : "failed"}:${key}`, policy_version: "qm-learning-policy-2026-09-25.1",
      provider_message_id: response.ok ? String(provider?.id || "") || null : null });
    if (response.ok) sent += 1; else failed += 1;
  }
  return jsonResponse(200, { sent, failed, suppressed, evaluated: prepared.length, eligible: eligible.length });
}
