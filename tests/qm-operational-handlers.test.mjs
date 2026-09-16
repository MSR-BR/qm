import assert from "node:assert/strict";
import test from "node:test";
import { handleAppRatingRequest } from "../lib/qm-app-rating-handler.mjs";
import { handleLegalPreferencesRequest } from "../lib/qm-legal-preferences-handler.mjs";
import { handleEmailCampaignRequest } from "../lib/qm-email-campaign-handler.mjs";
import { handleEmailTestRequest } from "../lib/qm-email-test-handler.mjs";
import { handleQmChapterQuiz } from "../lib/qm-chapter-quiz-handler.mjs";

const SERVER_ENV = {
  PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
  SUPABASE_SECRET_KEY: "server-secret"
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("anonymous ratings validate and sanitize the persisted payload", async function () {
  const originalFetch = globalThis.fetch;
  let captured = null;
  globalThis.fetch = async function (url, options = {}) {
    captured = { url: String(url), options };
    return json([], 201);
  };
  try {
    const response = await handleAppRatingRequest({
      method: "POST",
      body: {
        rating: 5,
        visitorToken: "rating-token-1234567890",
        feedback: "  Clear\u0000  and useful.  ",
        pagePath: "/index.html?view=chapters",
        visitCount: 7,
        contentViewCount: 4
      },
      env: SERVER_ENV
    });
    assert.equal(response.status, 200);
    assert.match(captured.url, /\/rest\/v1\/qm_app_ratings/);
    assert.equal(captured.options.headers.apikey, "server-secret");
    const row = JSON.parse(captured.options.body);
    assert.equal(row.feedback, "Clear and useful.");
    assert.equal(row.feedback_prompt, "highlight");
    assert.equal(row.page_path, "/index.html?view=chapters");
    assert.equal(row.visitor_hash.length, 64);
    assert.notEqual(row.visitor_hash, "rating-token-1234567890");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ratings administration remains restricted to the responsible account", async function () {
  const denied = await handleAppRatingRequest({ method: "GET", env: SERVER_ENV });
  assert.equal(denied.status, 403);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function (url) {
    if (String(url).includes("/auth/v1/user")) {
      return json({ id: "admin-1", email: "marioreis@id.uff.br" });
    }
    return json([
      { id: 1, rating: 4, feedback: "Useful", updated_at: "2026-09-16T00:00:00.000Z" },
      { id: 2, rating: 2, feedback: null, updated_at: "2026-09-15T00:00:00.000Z" }
    ]);
  };
  try {
    const allowed = await handleAppRatingRequest({
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
      env: SERVER_ENV
    });
    assert.equal(allowed.status, 200);
    assert.deepEqual(allowed.body.summary, {
      total: 2,
      average: 3,
      withFeedback: 1,
      distribution: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 0 }
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("legal preferences require a verified learner and preserve explicit consent", async function () {
  const denied = await handleLegalPreferencesRequest({ method: "GET", env: SERVER_ENV });
  assert.equal(denied.status, 401);
  const originalFetch = globalThis.fetch;
  let persisted = null;
  globalThis.fetch = async function (url, options = {}) {
    if (String(url).includes("/auth/v1/user")) {
      return json({ id: "learner-1", email: "learner@example.com" });
    }
    if (options.method === "POST") {
      persisted = JSON.parse(options.body);
      return json([{ ...persisted }], 201);
    }
    return json([]);
  };
  try {
    const response = await handleLegalPreferencesRequest({
      method: "PUT",
      headers: { authorization: "Bearer learner-token" },
      body: { acceptDocuments: true, emailUpdatesOptedIn: false },
      env: SERVER_ENV
    });
    assert.equal(response.status, 200);
    assert.equal(persisted.user_id, "learner-1");
    assert.equal(persisted.terms_version, "2026-08-13");
    assert.equal(persisted.privacy_version, "2026-08-13");
    assert.equal(persisted.email_updates_opted_in, false);
    assert.ok(persisted.email_updates_opted_out_at);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("email test delivery is admin-only and remains disabled without Resend", async function () {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function () {
    return json({ id: "admin-1", email: "marioreis@id.uff.br" });
  };
  try {
    const response = await handleEmailTestRequest({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      env: SERVER_ENV
    });
    assert.equal(response.status, 500);
    assert.equal(response.body.error, "Email delivery is not configured yet.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("campaign delivery uses the English SEND confirmation contract", async function () {
  const originalFetch = globalThis.fetch;
  const resendPayloads = [];
  globalThis.fetch = async function (url, options = {}) {
    const target = String(url);
    if (target.includes("/auth/v1/user")) return json({ id: "admin-1", email: "marioreis@id.uff.br" });
    if (target.includes("/rest/v1/qm_user_legal_preferences")) return json([{ user_id: "learner-1" }]);
    if (target.includes("/auth/v1/admin/users")) return json({ users: [{ id: "learner-1", email: "learner@example.com" }] });
    if (target === "https://api.resend.com/emails") {
      resendPayloads.push(JSON.parse(options.body));
      return json({ id: "resend-message-1" });
    }
    if (target.includes("/rest/v1/qm_email_campaigns") || target.includes("/rest/v1/qm_email_recipient_deliveries")) {
      return json([], options.method === "POST" ? 201 : 200);
    }
    throw new Error("Unexpected request: " + target);
  };
  try {
    const response = await handleEmailCampaignRequest({
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: {
        action: "send",
        subject: "Reviewed content",
        message: "A reviewed section is available.",
        confirmationText: "SEND",
        confirmRecipientCount: 1,
        audienceType: "all_opted_in"
      },
      env: { ...SERVER_ENV, RESEND_API_KEY: "resend-test-key" }
    });
    assert.equal(response.status, 200);
    assert.equal(response.body.deliveredCount, 1);
    assert.equal(response.body.failedCount, 0);
    assert.equal(resendPayloads.length, 1);
    assert.deepEqual(resendPayloads[0].to, ["learner@example.com"]);
    assert.equal(resendPayloads[0].from, "QUANTUM <hello@quantummechanicsbook.app>");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("chapter assessments expose reviewed questions without answer keys", async function () {
  const publicResponse = await handleQmChapterQuiz({
    method: "GET",
    query: { chapterId: "01" },
    env: {}
  });
  assert.equal(publicResponse.status, 200);
  assert.equal(publicResponse.body.quiz.chapterId, "01");
  assert.equal("correct" in publicResponse.body.quiz.questions[0], false);
  const locked = await handleQmChapterQuiz({
    method: "GET",
    query: { chapterId: "08" },
    env: {}
  });
  assert.equal(locked.status, 404);
});
