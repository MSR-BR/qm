import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isChapterPublished } from "./qm-content-registry.mjs";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), "..");

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
  return supabaseUrl && publishableKey && serviceRoleKey
    ? { supabaseUrl, publishableKey, serviceRoleKey }
    : null;
}

async function readRequestBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

async function authenticatedUser(config, accessToken) {
  const response = await fetch(config.supabaseUrl + "/auth/v1/user", {
    headers: {
      apikey: config.publishableKey,
      Authorization: "Bearer " + accessToken
    }
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
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data };
}

function normalizeChapterId(value) {
  return String(value || "").replace(/\D/g, "").padStart(2, "0").slice(-2);
}

function normalizePath(value) {
  return String(value || "").split(/[?#]/)[0].replace(/^\/+/, "");
}

export function sectionCompletionIdempotencyKey({ chapterId, itemId, pagePath }) {
  return ["section", normalizeChapterId(chapterId), String(itemId || "").trim(), normalizePath(pagePath)].join(":");
}

async function isKnownPublishedItem(chapterId, itemId, pagePath) {
  if (!isChapterPublished(chapterId)) return false;
  const filePath = path.join(rootDir, "data", "chapter-" + chapterId + ".json");
  try {
    const chapter = JSON.parse(await readFile(filePath, "utf8"));
    return (chapter.topics || []).some(function (topic) {
      return String(topic.id || "") === String(itemId || "") &&
        normalizePath(topic.url) === normalizePath(pagePath);
    });
  } catch {
    return false;
  }
}

function responseProfile(row) {
  return {
    xpTotal: Number(row?.xp_total || 0),
    level: Number(row?.level || 1),
    currentStreak: Number(row?.current_streak || 0),
    bestStreak: Number(row?.best_streak || 0),
    studiedItemsCount: Number(row?.studied_items_count || 0)
  };
}

function rewardStorageError(result) {
  if (result?.data?.code === "22023") {
    return jsonResponse(422, { error: "This learning event is not eligible for a reward." });
  }
  return jsonResponse(503, { error: "Your learning reward could not be saved. Please try again." });
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

  if (input.eventType !== "section_completed" || !chapterId || !itemId || !pagePath) {
    return jsonResponse(422, { error: "Invalid learning-reward event." });
  }

  if (!await isKnownPublishedItem(chapterId, itemId, pagePath)) {
    return jsonResponse(422, { error: "This section is not eligible for learning rewards." });
  }

  const idempotencyKey = sectionCompletionIdempotencyKey({ chapterId, itemId, pagePath });
  const suppliedKey = String(input.idempotencyKey || "").trim();
  if (suppliedKey && suppliedKey !== idempotencyKey) {
    return jsonResponse(422, { error: "The learning-reward identifier does not match this section." });
  }

  const result = await rest(config, "rpc/record_qm_section_completion_reward", {
    method: "POST",
    body: JSON.stringify({
      p_user_id: user.id,
      p_idempotency_key: idempotencyKey,
      p_chapter_id: chapterId,
      p_item_id: itemId,
      p_page_path: pagePath
    })
  });

  if (!result.ok) return rewardStorageError(result);

  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!row || typeof row.awarded !== "boolean") return rewardStorageError(result);

  return jsonResponse(200, {
    ok: true,
    awarded: row.awarded,
    deduped: !row.awarded,
    xpDelta: Number(row.xp_delta || 0),
    profile: responseProfile(row)
  });
}
