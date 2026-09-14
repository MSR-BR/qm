import {
  ensureSupabaseServerConfig,
  jsonResponse,
  parseJsonBody,
  supabaseRestRequest
} from "./qm-server-shared.mjs";

export const ANALYTICS_CONSENT_VERSION = "qm-analytics-consent-v1";
export const ANALYTICS_RETENTION_DAYS = 90;
export const PRODUCTION_HOST = "quantummechanicsbook.app";

export const ANALYTICS_EVENT_PROPERTIES = Object.freeze({
  session_start: ["language", "timezone", "viewport_group"],
  home_study_cta_click: ["surface", "destination", "chapter_id"],
  chapter_start: ["chapter_id", "entry_method"],
  section_open: ["chapter_id", "item_id", "page_slug"],
  section_complete: ["chapter_id", "item_id", "page_slug", "completed"],
  simulator_open: ["simulator_id", "entry_method"],
  assessment_start: ["chapter_id", "question_count"],
  assessment_complete: ["chapter_id", "question_count", "correct_count", "score_percent"],
  exercise_generate: ["chapter_id", "item_id", "difficulty"],
  exercise_solution_open: ["chapter_id", "item_id", "difficulty"],
  exercise_validation_submit: ["chapter_id", "item_id", "has_reported_issue"],
  favorite_changed: ["kind", "active", "count"],
  auth_open: ["surface"],
  login_success: ["provider"],
  rating_prompt_shown: ["visit_band", "content_view_band"],
  rating_submitted: ["rating", "has_feedback"],
  book_preview_open: ["provider", "surface"],
  search_submit: ["query_length_bucket", "result_count"],
  search_result_open: ["chapter_id", "item_id", "result_rank"]
});

const EVENT_NAMES = new Set(Object.keys(ANALYTICS_EVENT_PROPERTIES));
const SAFE_QUERY_KEYS = new Set(["view", "chapter", "sim"]);
const LOCAL_HOST_PATTERN = /^(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

function headerValue(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) || "");
  return String(headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || "");
}

function normalizeHost(value) {
  return String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
}

export function requestIsAllowed(headers = {}, env = process.env) {
  const forwardedHost = normalizeHost(headerValue(headers, "x-forwarded-host") || headerValue(headers, "host"));
  const origin = headerValue(headers, "origin");
  let originHost = "";
  try {
    originHost = origin ? new URL(origin).host.toLowerCase() : "";
  } catch {
    return false;
  }

  if (String(env.VERCEL_ENV || "").toLowerCase() === "production") {
    return forwardedHost === PRODUCTION_HOST && originHost === PRODUCTION_HOST;
  }

  return (
    forwardedHost === PRODUCTION_HOST ||
    originHost === PRODUCTION_HOST ||
    LOCAL_HOST_PATTERN.test(forwardedHost) ||
    LOCAL_HOST_PATTERN.test(originHost)
  );
}

export function normalizeAnalyticsPagePath(value) {
  try {
    const url = new URL(String(value || "/"), `https://${PRODUCTION_HOST}`);
    const safeParams = new URLSearchParams();
    for (const key of SAFE_QUERY_KEYS) {
      const raw = url.searchParams.get(key);
      if (raw) safeParams.set(key, raw.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 40));
    }
    let pathname = "/";
    try {
      const decodedPath = decodeURIComponent(url.pathname || "/");
      if (/^\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]*(?:\.html)?$/i.test(decodedPath)) {
        pathname = decodedPath || "/";
      }
    } catch {
      pathname = "/";
    }
    const query = safeParams.toString();
    return (pathname + (query ? "?" + query : "")).slice(0, 240);
  } catch {
    return "/";
  }
}

const ENUM_VALUES = Object.freeze({
  viewport_group: new Set(["small", "medium", "large"]),
  surface: new Set(["header", "footer", "home", "content", "navigation", "hero", "sign_in_dialog"]),
  destination: new Set(["chapters", "simulators", "search", "favorites", "progress", "assessments", "home", "index"]),
  entry_method: new Set(["section_page", "standalone_page"]),
  difficulty: new Set(["easy", "medium", "hard"]),
  kind: new Set(["saved_item", "exercise"]),
  provider: new Set(["google", "google_books", "elsevier", "sciencedirect", "amazon"]),
  visit_band: new Set(["0-1", "2-3", "4-7", "8+"]),
  content_view_band: new Set(["0-1", "2-3", "4-7", "8+"]),
  query_length_bucket: new Set(["1-2", "3-5", "6-10", "11-20", "21+"])
});
const BOOLEAN_PROPERTIES = new Set(["completed", "has_reported_issue", "active", "has_feedback"]);
const INTEGER_LIMITS = Object.freeze({
  question_count: [0, 100],
  correct_count: [0, 100],
  score_percent: [0, 100],
  count: [0, 100000],
  rating: [1, 5],
  result_count: [0, 1000],
  result_rank: [1, 1000]
});

function normalizeProperty(key, value) {
  if (BOOLEAN_PROPERTIES.has(key)) return typeof value === "boolean" ? value : null;

  if (Object.hasOwn(INTEGER_LIMITS, key)) {
    const number = typeof value === "number" ? value : Number.NaN;
    const [minimum, maximum] = INTEGER_LIMITS[key];
    return Number.isInteger(number) && number >= minimum && number <= maximum ? number : null;
  }

  if (Object.hasOwn(ENUM_VALUES, key)) {
    const normalized = String(value || "").trim().toLowerCase();
    return ENUM_VALUES[key].has(normalized) ? normalized : null;
  }

  const cleaned = typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim()
    : "";

  if (key === "chapter_id") return /^\d{1,2}$/.test(cleaned) ? cleaned.padStart(2, "0") : null;
  if (key === "item_id") return /^\d{1,2}(?:\.\d{1,2})?$/.test(cleaned) ? cleaned : null;
  if (key === "language") return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i.test(cleaned) ? cleaned.slice(0, 16) : null;
  if (key === "timezone") return /^[a-z0-9_+./-]{1,64}$/i.test(cleaned) ? cleaned : null;
  if (key === "page_slug" || key === "simulator_id") {
    return /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(cleaned) ? cleaned : null;
  }

  return null;
}

export function normalizeAnalyticsEvent(candidate = {}) {
  const eventName = String(candidate.eventName || candidate.event_name || "").trim().toLowerCase();
  if (!EVENT_NAMES.has(eventName)) return null;

  const allowedProperties = ANALYTICS_EVENT_PROPERTIES[eventName];
  const sourceProperties = candidate.properties && typeof candidate.properties === "object" && !Array.isArray(candidate.properties)
    ? candidate.properties
    : {};
  const properties = {};

  for (const key of allowedProperties) {
    const normalized = normalizeProperty(key, sourceProperties[key]);
    if (normalized !== null) properties[key] = normalized;
  }

  return {
    event_name: eventName,
    page_path: normalizeAnalyticsPagePath(candidate.pagePath || candidate.page_path || "/"),
    properties,
    consent_version: ANALYTICS_CONSENT_VERSION
  };
}

export async function handleAnalyticsEventRequest({
  method,
  headers = {},
  body,
  env = process.env
}) {
  const startedAt = Date.now();
  const requestId = headerValue(headers, "x-vercel-id").slice(0, 120);

  if ((method || "GET").toUpperCase() !== "POST") {
    return jsonResponse(405, { error: "Use POST." });
  }

  if (!requestIsAllowed(headers, env)) {
    return jsonResponse(403, { error: "Analytics events are accepted only from the QUANTUM app." });
  }

  if (!/^G-[A-Z0-9]{6,16}$/i.test(String(env.PUBLIC_GA_MEASUREMENT_ID || "").trim())) {
    return jsonResponse(503, { error: "Analytics collection is not active." });
  }

  const input = parseJsonBody(body);
  if (input.consentVersion !== ANALYTICS_CONSENT_VERSION || input.analyticsConsent !== true) {
    return jsonResponse(400, { error: "Active analytics consent is required." });
  }

  const receivedEvents = Array.isArray(input.events) ? input.events : [];
  if (receivedEvents.length < 1 || receivedEvents.length > 10) {
    return jsonResponse(400, { error: "Provide one to ten valid analytics events." });
  }
  const candidates = receivedEvents.slice(0, 10);
  const rows = candidates.map(normalizeAnalyticsEvent).filter(Boolean);
  if (!rows.length || rows.length !== candidates.length) {
    return jsonResponse(400, { error: "Provide one to ten valid analytics events." });
  }

  const config = ensureSupabaseServerConfig(env);
  if (!config) {
    return jsonResponse(503, { error: "Analytics storage is not configured." });
  }

  console.log(JSON.stringify({
    level: "info",
    msg: "qm_analytics_start",
    route: "/api/qm-analytics-event",
    requestId,
    eventCount: rows.length
  }));

  try {
    const result = await supabaseRestRequest({
      config,
      path: "qm_analytics_events",
      method: "POST",
      prefer: "return=minimal",
      body: rows
    });

    if (!result.ok) {
      console.error(JSON.stringify({
        level: "error",
        msg: "qm_analytics_failed",
        route: "/api/qm-analytics-event",
        requestId,
        status: result.status,
        ms: Date.now() - startedAt
      }));
      return jsonResponse(503, { error: "Analytics storage is temporarily unavailable." });
    }

    console.log(JSON.stringify({
      level: "info",
      msg: "qm_analytics_done",
      route: "/api/qm-analytics-event",
      requestId,
      eventCount: rows.length,
      ms: Date.now() - startedAt
    }));
    return jsonResponse(202, { accepted: rows.length });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      msg: "qm_analytics_failed",
      route: "/api/qm-analytics-event",
      requestId,
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - startedAt
    }));
    return jsonResponse(503, { error: "Analytics storage is temporarily unavailable." });
  }
}
