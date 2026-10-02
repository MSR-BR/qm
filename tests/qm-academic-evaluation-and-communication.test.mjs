import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildLearningEmail,
  createUnsubscribeToken,
  evaluateLearningMessageEligibility,
  learningProviderIdempotencyKey,
  planReviewedLearningMessage,
  verifyUnsubscribeToken
} from "../lib/qm-learning-communication.mjs";
import { buildAcademicEvaluationReport, evaluationContract } from "../lib/qm-learning-evaluation.mjs";
import { handleLegalPreferencesRequest } from "../lib/qm-legal-preferences-handler.mjs";
import { handleQmLearningCommunication } from "../lib/qm-learning-communication-handler.mjs";

const reviewedSource = {
  chapterId: "01",
  sectionId: "1.1",
  contentId: "slides/chapter-01/why-old-quantum-physics-matters.html"
};

function preference(overrides = {}) {
  return {
    email_updates_opted_in: true,
    email_updates_opted_in_at: "2026-09-26T10:00:00.000Z",
    learning_email_consent_version: "qm-learning-email-consent-2026-09-26.1",
    learning_email_paused: false,
    timezone: "America/Sao_Paulo",
    ...overrides
  };
}

function profile(status = "due") {
  return { due_reviews: { items: [{ concept_id: "wave-model", label: "Wave model", status, source: reviewedSource }] } };
}

test("review reminders require affirmative consent, reviewed content, known time zone and server caps", () => {
  const now = new Date("2026-09-26T15:00:00.000Z");
  const eligible = evaluateLearningMessageEligibility({ preference: preference(), profile: profile(), now });
  assert.equal(eligible.eligible, true);
  assert.equal(evaluateLearningMessageEligibility({ preference: preference({ learning_email_consent_version: null }), profile: profile(), now }).reason, "not_opted_in");
  assert.equal(eligible.plan.contentId, reviewedSource.contentId);
  assert.equal(evaluateLearningMessageEligibility({ preference: preference({ email_updates_opted_in: false }), profile: profile(), now }).reason, "not_opted_in");
  assert.equal(evaluateLearningMessageEligibility({ preference: preference({ learning_email_paused: true }), profile: profile(), now }).reason, "paused");
  assert.equal(evaluateLearningMessageEligibility({ preference: preference({ timezone: "" }), profile: profile(), now }).reason, "unknown_timezone");
  assert.equal(evaluateLearningMessageEligibility({ preference: preference(), profile: profile(), now: new Date("2026-09-27T01:00:00.000Z") }).reason, "quiet_hours");
  assert.equal(evaluateLearningMessageEligibility({ preference: preference(), profile: profile(), now,
    recentEvents: [{ event_type: "eligible", occurred_at: "2026-09-26T13:00:00.000Z" }] }).reason, "daily_cap");
  assert.equal(evaluateLearningMessageEligibility({ preference: preference(), profile: profile(), now,
    recentEvents: [{ event_type: "eligible", occurred_at: "2026-09-24T13:00:00.000Z" }, { event_type: "eligible", occurred_at: "2026-09-25T13:00:00.000Z" }] }).reason, "rolling_cap");
  assert.equal(planReviewedLearningMessage({ due_reviews: { items: [{ ...profile().due_reviews.items[0], source: { ...reviewedSource, chapterId: "08" } }] } }), null);
});

test("provider deduplication separates recipients and remains stable for retries", () => {
  const input = { userId: "learner-a", reservationKey: "due-review:2026-09-26:wave-model", secret: "fixture-secret-that-is-at-least-32-characters" };
  const first = learningProviderIdempotencyKey(input);
  assert.equal(learningProviderIdempotencyKey(input), first);
  assert.notEqual(learningProviderIdempotencyKey({ ...input, userId: "learner-b" }), first);
  assert.doesNotMatch(first, /learner-a|wave-model/);
});

test("delivery evidence never becomes observed learner exposure", () => {
  const report = buildAcademicEvaluationReport({ communication_eligible: 3, communication_sent: 2, communication_delivered: 1 });
  assert.equal(report.outcomes.equitySafety.communicationSent, 2);
  assert.equal(report.outcomes.equitySafety.communicationDelivered, 1);
  assert.equal(report.outcomes.equitySafety.communicationExposed, null);
  assert.equal(report.outcomes.equitySafety.exposureRate, null);
});

test("fixed template explains the reason, avoids coercion and includes one-click unsubscribe", () => {
  const plan = planReviewedLearningMessage(profile("needs_review"));
  const email = buildLearningEmail({ plan, destination: "learner@example.com", unsubscribeUrl: "https://quantummechanicsbook.app/unsubscribe.html#token=signed", oneClickUrl: "https://quantummechanicsbook.app/api/qm-learning-communication?token=signed" });
  assert.match(email.text, /explicitly enabled optional learning updates/);
  assert.match(email.text, /no missed-day penalty, point loss, rank loss or deadline/i);
  assert.match(email.text, /unsubscribe\.html#token=signed/);
  assert.equal(email.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  assert.match(email.headers["List-Unsubscribe"], /qm-learning-communication\?token=signed/);
  assert.match(email.text, /why-old-quantum-physics-matters\.html/);
  assert.doesNotMatch(email.text, /act now|last chance|you will lose|mastery will expire/i);
});

test("unsubscribe tokens are signed and scoped to the active opt-in timestamp", () => {
  const secret = "fixture-secret-that-is-at-least-32-characters";
  const token = createUnsubscribeToken({ userId: "10000000-0000-4000-8000-000000000001", optedInAt: "2026-09-26T10:00:00.000Z", secret });
  const decoded = verifyUnsubscribeToken(token, secret);
  assert.equal(decoded.u, "10000000-0000-4000-8000-000000000001");
  assert.equal(decoded.c, "2026-09-26T10:00:00.000Z");
  assert.equal(verifyUnsubscribeToken(token + "tampered", "fixture-secret"), null);
  assert.equal(verifyUnsubscribeToken(token, "wrong-secret-that-is-at-least-32-chars"), null);
  assert.equal(verifyUnsubscribeToken("x".repeat(2049), secret), null);
});

test("signed one-click unsubscribe changes only communication preference and is idempotent", async () => {
  const originalFetch = globalThis.fetch;
  const secret = "fixture-secret-that-is-at-least-32-characters";
  const optedInAt = "2026-09-26T10:00:00.000Z";
  const token = createUnsubscribeToken({ userId: "10000000-0000-4000-8000-000000000001", optedInAt, secret });
  let patch = null;
  const json = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
  globalThis.fetch = async function (url, options = {}) {
    const target = String(url);
    if (target.includes("qm_user_legal_preferences") && options.method === "PATCH") { patch = JSON.parse(options.body); return json([]); }
    if (target.includes("qm_user_legal_preferences")) return json([{ user_id: "10000000-0000-4000-8000-000000000001", email_updates_opted_in_at: optedInAt }]);
    if (target.includes("qm_learning_communication_events")) return json([]);
    throw new Error(`Unexpected request: ${target}`);
  };
  try {
    const response = await handleQmLearningCommunication({ method: "POST", query: { token }, env: {
      PUBLIC_SUPABASE_URL: "https://example.supabase.co", PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public",
      SUPABASE_SECRET_KEY: "service", QM_UNSUBSCRIBE_SECRET: secret
    } });
    assert.equal(response.status, 200);
    assert.equal(response.body.unsubscribed, true);
    assert.equal(patch.email_updates_opted_in, false);
    assert.equal(patch.learning_email_paused, true);
    assert.equal("learning" in patch, false);
  } finally { globalThis.fetch = originalFetch; }
});

test("production dispatch remains disabled even for the owner until separately authorized", async () => {
  const originalFetch = globalThis.fetch;
  const json = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
  globalThis.fetch = async function (url) {
    const target = String(url);
    if (target.includes("/auth/v1/user")) return json({ id: "owner", email: "marioreis@id.uff.br" });
    if (target.includes("qm_user_legal_preferences")) return json([]);
    if (target.includes("/auth/v1/admin/users")) return json({ users: [] });
    throw new Error(`Unexpected request: ${target}`);
  };
  try {
    const response = await handleQmLearningCommunication({ method: "POST", headers: { authorization: "Bearer owner" },
      body: { action: "dispatch", confirmationText: "SEND REVIEWED LEARNING UPDATES" }, env: {
        PUBLIC_SUPABASE_URL: "https://example.supabase.co", PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public", SUPABASE_SECRET_KEY: "service"
      } });
    assert.equal(response.status, 409);
    assert.match(response.body.error, /disabled/);
  } finally { globalThis.fetch = originalFetch; }
});

test("academic reporting never relabels analytics or ratings as learning", () => {
  const report = buildAcademicEvaluationReport({ learning_sample: 10, delayed_retrieval_learners: 3, delayed_eligible_learners: 6,
    changed_representation_learners: 2, changed_representation_eligible: 5, analytics_events: 900,
    rating_count: 4, average_rating: 4.5, mechanic_exposed: 8, mechanic_acted: 5 });
  assert.equal(report.outcomes.learning.delayedUnaidedRetrieval.denominator, 6);
  assert.equal(report.outcomes.behavior.analyticsEvents, 900);
  assert.match(report.outcomes.behavior.claimBoundary, /cannot be relabeled as learning/i);
  assert.match(report.outcomes.experience.claimBoundary, /cannot be relabeled as learning/i);
  assert.equal(report.effectSize, null);
  assert.equal(evaluationContract.analyticsSeparation.analyticsMayAwardPoints, false);
  assert.equal(evaluationContract.analyticsSeparation.analyticsMayEstablishMastery, false);
  assert.equal(evaluationContract.analyticsSeparation.analyticsMayDetermineMessageEligibility, false);
});

test("enabling optional email requires current documents and a valid time zone", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function (url, options = {}) {
    const json = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
    if (String(url).includes("/auth/v1/user")) return json({ id: "10000000-0000-4000-8000-000000000001" });
    if (options.method === "POST") return json([JSON.parse(options.body)], 201);
    return json([]);
  };
  const env = { PUBLIC_SUPABASE_URL: "https://example.supabase.co", PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public", SUPABASE_SECRET_KEY: "secret" };
  try {
    const rejected = await handleLegalPreferencesRequest({ method: "PUT", headers: { authorization: "Bearer token" }, body: { acceptDocuments: true, emailUpdatesOptedIn: true, timezone: "" }, env });
    assert.equal(rejected.status, 400);
    const accepted = await handleLegalPreferencesRequest({ method: "PUT", headers: { authorization: "Bearer token" }, body: { acceptDocuments: true, emailUpdatesOptedIn: true, learningEmailPaused: false, timezone: "America/Sao_Paulo" }, env });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.body.emailUpdatesOptedIn, true);
    assert.equal(accepted.body.timezone, "America/Sao_Paulo");
  } finally { globalThis.fetch = originalFetch; }
});

test("C32 migration and public help encode server enforcement and release separation", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20260926154500_qm_academic_evaluation_and_responsible_communication.sql", import.meta.url), "utf8");
  const handler = readFileSync(new URL("../lib/qm-learning-communication-handler.mjs", import.meta.url), "utf8");
  const help = readFileSync(new URL("../help.html", import.meta.url), "utf8");
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /v_daily >= 1/);
  assert.match(sql, /v_rolling >= 2/);
  assert.match(sql, /time '21:00'.*time '07:00'/s);
  assert.match(sql, /grant execute on function public\.reserve_qm_learning_message.*to service_role/s);
  assert.match(handler, /QM_LEARNING_EMAIL_DELIVERY_ENABLED !== "true"/);
  assert.match(help, /Engagement is not the same as learning/);
  assert.match(help, /one-click unsubscribe/);
});
