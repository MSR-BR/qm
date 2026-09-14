import assert from "node:assert/strict";
import test from "node:test";
import {
  ANALYTICS_CONSENT_VERSION,
  ANALYTICS_EVENT_PROPERTIES,
  handleAnalyticsEventRequest,
  normalizeAnalyticsEvent,
  normalizeAnalyticsPagePath,
  requestIsAllowed
} from "../lib/qm-analytics-handler.mjs";
import { handlePublicConfigRequest } from "../lib/public-config-handler.mjs";

const serverEnv = {
  VERCEL_ENV: "production",
  PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
  SUPABASE_SECRET_KEY: "server-secret",
  PUBLIC_GA_MEASUREMENT_ID: "G-TEST123456"
};
const productionHeaders = {
  origin: "https://quantummechanicsbook.app",
  host: "quantummechanicsbook.app",
  "x-vercel-id": "test-request"
};

test("the event contract is explicit and covers the C16 learning funnel", function () {
  assert.deepEqual(Object.keys(ANALYTICS_EVENT_PROPERTIES), [
    "session_start",
    "home_study_cta_click",
    "chapter_start",
    "section_open",
    "section_complete",
    "simulator_open",
    "assessment_start",
    "assessment_complete",
    "exercise_generate",
    "exercise_solution_open",
    "exercise_validation_submit",
    "favorite_changed",
    "auth_open",
    "login_success",
    "rating_prompt_shown",
    "rating_submitted",
    "book_preview_open",
    "search_submit",
    "search_result_open"
  ]);
});

test("page paths keep only approved navigation parameters", function () {
  assert.equal(
    normalizeAnalyticsPagePath("/index.html?view=chapters&chapter=06&code=oauth-secret&utm_campaign=private#token"),
    "/index.html?view=chapters&chapter=06"
  );
  assert.equal(
    normalizeAnalyticsPagePath("https://quantummechanicsbook.app/search.html?q=wavefunction&email=student@example.com"),
    "/search.html"
  );
  assert.equal(
    normalizeAnalyticsPagePath("https://quantummechanicsbook.app/student%40example.com?view=chapters"),
    "/?view=chapters"
  );
});

test("event normalization keeps only event-specific, non-content properties", function () {
  const row = normalizeAnalyticsEvent({
    eventName: "exercise_generate",
    pagePath: "/slides/chapter-06/general-matrix-representation.html?token=secret",
    properties: {
      chapter_id: "06",
      item_id: "6.2",
      difficulty: "medium",
      email: "student@example.com",
      answer: "full learner answer",
      solution: "generated solution",
      access_token: "secret"
    }
  });

  assert.deepEqual(row, {
    event_name: "exercise_generate",
    page_path: "/slides/chapter-06/general-matrix-representation.html",
    properties: {
      chapter_id: "06",
      item_id: "6.2",
      difficulty: "medium"
    },
    consent_version: ANALYTICS_CONSENT_VERSION
  });
  assert.equal(normalizeAnalyticsEvent({ eventName: "unapproved_event" }), null);

  const categoricalInjection = normalizeAnalyticsEvent({
    eventName: "exercise_generate",
    properties: {
      chapter_id: "6",
      item_id: "6.2",
      difficulty: "student@example.com"
    }
  });
  assert.deepEqual(categoricalInjection.properties, {
    chapter_id: "06",
    item_id: "6.2"
  });
});

test("production ingestion accepts only the final QUANTUM origin", function () {
  assert.equal(requestIsAllowed(productionHeaders, serverEnv), true);
  assert.equal(requestIsAllowed({ origin: "https://preview.vercel.app", host: "preview.vercel.app" }, serverEnv), false);
  assert.equal(requestIsAllowed({ origin: "https://quantummechanicsbook.app", host: "preview.vercel.app" }, serverEnv), false);
});

test("ingestion remains inactive until a Measurement ID is configured", async function () {
  const response = await handleAnalyticsEventRequest({
    method: "POST",
    headers: productionHeaders,
    body: {
      analyticsConsent: true,
      consentVersion: ANALYTICS_CONSENT_VERSION,
      events: [{ eventName: "section_open" }]
    },
    env: { ...serverEnv, PUBLIC_GA_MEASUREMENT_ID: "" }
  });
  assert.equal(response.status, 503);
  assert.equal(response.body.error, "Analytics collection is not active.");
});

test("ingestion rejects missing consent and invalid batches before Supabase", async function () {
  const noConsent = await handleAnalyticsEventRequest({
    method: "POST",
    headers: productionHeaders,
    body: { events: [{ eventName: "section_open" }] },
    env: serverEnv
  });
  assert.equal(noConsent.status, 400);

  const invalid = await handleAnalyticsEventRequest({
    method: "POST",
    headers: productionHeaders,
    body: {
      analyticsConsent: true,
      consentVersion: ANALYTICS_CONSENT_VERSION,
      events: [{ eventName: "not_allowed" }]
    },
    env: serverEnv
  });
  assert.equal(invalid.status, 400);

  const tooMany = await handleAnalyticsEventRequest({
    method: "POST",
    headers: productionHeaders,
    body: {
      analyticsConsent: true,
      consentVersion: ANALYTICS_CONSENT_VERSION,
      events: Array.from({ length: 11 }, function () { return { eventName: "session_start" }; })
    },
    env: serverEnv
  });
  assert.equal(tooMany.status, 400);
});

test("accepted batches are sanitized and written server-side without user identity", async function () {
  const originalFetch = globalThis.fetch;
  let captured = null;
  globalThis.fetch = async function (url, options) {
    captured = { url: String(url), options };
    return {
      ok: true,
      status: 201,
      headers: { get() { return "application/json"; } },
      async json() { return []; }
    };
  };

  try {
    const response = await handleAnalyticsEventRequest({
      method: "POST",
      headers: productionHeaders,
      body: {
        analyticsConsent: true,
        consentVersion: ANALYTICS_CONSENT_VERSION,
        events: [{
          eventName: "search_submit",
          pagePath: "/search.html?q=private+words",
          properties: {
            query_length_bucket: "6-10",
            result_count: 4,
            query: "private words",
            email: "student@example.com"
          }
        }]
      },
      env: serverEnv
    });

    assert.equal(response.status, 202);
    assert.equal(response.body.accepted, 1);
    assert.match(captured.url, /\/rest\/v1\/qm_analytics_events/);
    assert.equal(captured.options.headers.apikey, "server-secret");
    const rows = JSON.parse(captured.options.body);
    assert.deepEqual(rows, [{
      event_name: "search_submit",
      page_path: "/search.html",
      properties: { query_length_bucket: "6-10", result_count: 4 },
      consent_version: ANALYTICS_CONSENT_VERSION
    }]);
    assert.equal("user_id" in rows[0], false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("public config exposes only a validated Measurement ID", async function () {
  const enabled = await handlePublicConfigRequest({
    method: "GET",
    env: { PUBLIC_GA_MEASUREMENT_ID: "g-abc1234567" }
  });
  assert.equal(enabled.body.analytics.enabled, true);
  assert.equal(enabled.body.analytics.measurementId, "G-ABC1234567");
  assert.equal(enabled.body.analytics.productionHost, "quantummechanicsbook.app");

  const disabled = await handlePublicConfigRequest({
    method: "GET",
    env: { PUBLIC_GA_MEASUREMENT_ID: "not-a-measurement-id" }
  });
  assert.equal(disabled.body.analytics.enabled, false);
  assert.equal(disabled.body.analytics.measurementId, "");
});
