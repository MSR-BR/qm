import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isChapterPublished } from "./qm-content-registry.mjs";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), "..");
const XP_PER_SECTION = 20;

function jsonResponse(status, body) {
  return { status, body };
}

function readBearerToken(headers = {}) {
  const value = headers.authorization || headers.Authorization || "";
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function serverConfig(env = process.env) {
  const supabaseUrl = String(env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const publishableKey = String(env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "");
  const serviceRoleKey = String(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "");
  return supabaseUrl && publishableKey && serviceRoleKey ? { supabaseUrl, publishableKey, serviceRoleKey } : null;
}

async function readRequestBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try { return JSON.parse(body); } catch { return {}; }
}

async function authenticatedUser(config, accessToken) {
  const response = await fetch(config.supabaseUrl + "/auth/v1/user", {
    headers: { apikey: config.publishableKey, Authorization: "Bearer " + accessToken }
  });
  return response.ok ? response.json() : null;
}

async function rest(config, endpoint, options = {}) {
  const response = await fetch(config.supabaseUrl + "/rest/v1/" + endpoint, {
    ...options,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: "Bearer " + config.serviceRoleKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  return { ok: response.ok, status: response.status, data };
}

function normalizeChapterId(value) {
  return String(value || "").replace(/\D/g, "").padStart(2, "0").slice(-2);
}

function normalizePath(value) {
  return String(value || "").split(/[?#]/)[0].replace(/^\/+/, "");
}

async function isKnownPublishedItem(chapterId, itemId, pagePath) {
  if (!isChapterPublished(chapterId)) return false;
  const filePath = path.join(rootDir, "data", "chapter-" + chapterId + ".json");
  try {
    const chapter = JSON.parse(await readFile(filePath, "utf8"));
    return (chapter.topics || []).some((topic) => String(topic.id || "") === String(itemId || "") && normalizePath(topic.url) === normalizePath(pagePath));
  } catch {
    return false;
  }
}

function dayInSaoPaulo(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

function daysBetween(left, right) {
  const toUtc = (value) => Date.parse(value + "T00:00:00Z");
  return Math.round((toUtc(right) - toUtc(left)) / 86400000);
}

function profilePatch(profile, xpDelta) {
  const today = dayInSaoPaulo();
  const lastActive = profile.last_active_on || "";
  const currentStreak = lastActive === today ? Number(profile.current_streak || 0) : daysBetween(lastActive, today) === 1 ? Number(profile.current_streak || 0) + 1 : 1;
  const xpTotal = Number(profile.xp_total || 0) + xpDelta;
  return {
    xp_total: xpTotal,
    level: Math.floor(xpTotal / 100) + 1,
    current_streak: currentStreak,
    best_streak: Math.max(Number(profile.best_streak || 0), currentStreak),
    last_active_on: today,
    studied_items_count: Number(profile.studied_items_count || 0) + 1
  };
}

async function getOrCreateProfile(config, userId) {
  const existing = await rest(config, "qm_gamification_profiles?user_id=eq." + encodeURIComponent(userId) + "&select=*", { method: "GET" });
  if (!existing.ok) return { ok: false };
  if (Array.isArray(existing.data) && existing.data[0]) return { ok: true, row: existing.data[0] };
  const inserted = await rest(config, "qm_gamification_profiles", { method: "POST", headers: { Prefer: "return=representation,resolution=ignore-duplicates" }, body: JSON.stringify({ user_id: userId }) });
  if (inserted.ok && Array.isArray(inserted.data) && inserted.data[0]) return { ok: true, row: inserted.data[0] };
  const retried = await rest(config, "qm_gamification_profiles?user_id=eq." + encodeURIComponent(userId) + "&select=*", { method: "GET" });
  return Array.isArray(retried.data) && retried.data[0] ? { ok: true, row: retried.data[0] } : { ok: false };
}

function responseProfile(profile) {
  return {
    xpTotal: Number(profile.xp_total || 0),
    level: Number(profile.level || 1),
    currentStreak: Number(profile.current_streak || 0),
    bestStreak: Number(profile.best_streak || 0),
    studiedItemsCount: Number(profile.studied_items_count || 0)
  };
}

export async function handleQmGamificationEvent({ method, headers = {}, body, env = process.env }) {
  if (method !== "POST") return jsonResponse(405, { error: "Use POST." });
  const config = serverConfig(env);
  if (!config) return jsonResponse(503, { error: "Learning rewards are not configured yet." });
  const accessToken = readBearerToken(headers);
  if (!accessToken) return jsonResponse(401, { error: "Sign in to record learning rewards." });
  const user = await authenticatedUser(config, accessToken);
  if (!user?.id) return jsonResponse(401, { error: "Your session could not be verified." });
  const input = await readRequestBody(body);
  const chapterId = normalizeChapterId(input.chapterId);
  const itemId = String(input.itemId || "").trim();
  const pagePath = normalizePath(input.pagePath);
  const idempotencyKey = String(input.idempotencyKey || "").trim();
  if (input.eventType !== "section_completed" || !chapterId || !itemId || !pagePath || !idempotencyKey) return jsonResponse(422, { error: "Invalid learning-reward event." });
  if (!await isKnownPublishedItem(chapterId, itemId, pagePath)) return jsonResponse(422, { error: "This section is not eligible for learning rewards." });
  const profileResult = await getOrCreateProfile(config, user.id);
  if (!profileResult.ok) return jsonResponse(500, { error: "Your learning profile could not be prepared." });
  const duplicate = await rest(config, "qm_gamification_events?user_id=eq." + encodeURIComponent(user.id) + "&idempotency_key=eq." + encodeURIComponent(idempotencyKey) + "&select=xp_delta", { method: "GET" });
  if (!duplicate.ok) return jsonResponse(500, { error: "Your learning event could not be checked." });
  if (Array.isArray(duplicate.data) && duplicate.data[0]) return jsonResponse(200, { ok: true, awarded: false, deduped: true, xpDelta: Number(duplicate.data[0].xp_delta || 0), profile: responseProfile(profileResult.row) });
  const inserted = await rest(config, "qm_gamification_events", { method: "POST", body: JSON.stringify({ user_id: user.id, event_type: "section_completed", idempotency_key: idempotencyKey, chapter_id: chapterId, item_id: itemId, page_path: pagePath, xp_delta: XP_PER_SECTION }) });
  if (!inserted.ok) {
    const raced = await rest(config, "qm_gamification_events?user_id=eq." + encodeURIComponent(user.id) + "&idempotency_key=eq." + encodeURIComponent(idempotencyKey) + "&select=xp_delta", { method: "GET" });
    if (Array.isArray(raced.data) && raced.data[0]) return jsonResponse(200, { ok: true, awarded: false, deduped: true, xpDelta: Number(raced.data[0].xp_delta || 0), profile: responseProfile(profileResult.row) });
    return jsonResponse(500, { error: "Your learning event could not be saved." });
  }
  const patch = profilePatch(profileResult.row, XP_PER_SECTION);
  const updated = await rest(config, "qm_gamification_profiles?user_id=eq." + encodeURIComponent(user.id), { method: "PATCH", body: JSON.stringify(patch) });
  const profile = Array.isArray(updated.data) && updated.data[0] ? updated.data[0] : { ...profileResult.row, ...patch };
  return jsonResponse(200, { ok: true, awarded: true, deduped: false, xpDelta: XP_PER_SECTION, profile: responseProfile(profile) });
}
