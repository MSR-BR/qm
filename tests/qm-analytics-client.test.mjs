import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../assets/qm-analytics.js", import.meta.url), "utf8");
const authSource = await readFile(new URL("../assets/termo-auth.js", import.meta.url), "utf8");
const seoSource = await readFile(new URL("../assets/termo-seo.js", import.meta.url), "utf8");
const simulatorCatalogSource = await readFile(new URL("../assets/qm-simulator-catalog.js", import.meta.url), "utf8");
const exerciseSource = await readFile(new URL("../assets/ai-exercises.js", import.meta.url), "utf8");
const ratingSource = await readFile(new URL("../assets/qm-rating.js", import.meta.url), "utf8");
const assessmentSource = await readFile(new URL("../assets/qm-assessments.js", import.meta.url), "utf8");
const migrationSource = await readFile(new URL("../supabase/migrations/20260914223802_qm_analytics_retention.sql", import.meta.url), "utf8");

test("analytics is opt-in and Google consent defaults to denied", function () {
  assert.match(source, /consentDecision = readConsentDecision\(\)/);
  assert.match(source, /analytics_storage: "denied"/);
  assert.match(source, /if \(consentDecision === "granted"\)/);
  assert.match(source, /Allow analytics/);
  assert.match(source, /Only necessary/);
  assert.doesNotMatch(source, /pendingConsentEvents/);
  assert.doesNotMatch(source, /const GA_MEASUREMENT_ID\s*=\s*"G-/);
});

test("collection is restricted to the final host and public environment config", function () {
  assert.match(source, /PRODUCTION_HOST = "quantummechanicsbook\.app"/);
  assert.match(source, /config\?\.productionHost/);
  assert.match(source, /publicConfig\?\.analytics/);
  assert.match(source, /page_location: safeLocation/);
  assert.match(source, /\["view", "chapter", "sim"\]/);
});

test("the client never exposes known sensitive learning payload fields", function () {
  assert.match(source, /EVENT_PROPERTIES/);
  assert.doesNotMatch(source, /utm_source/);
  assert.doesNotMatch(source, /learner_answer/);
  assert.doesNotMatch(source, /generated_solution/);
  assert.match(source, /query_length_bucket/);
  assert.doesNotMatch(source, /properties\.query\b/);
});

test("shared loaders cover reading pages, public SEO pages, and simulators", function () {
  for (const loaderSource of [authSource, seoSource, simulatorCatalogSource]) {
    assert.match(loaderSource, /qm-analytics\.js\?v=0912\.1/);
    assert.match(loaderSource, /window\.__qmAnalyticsLoaderStarted/);
  }
});

test("the storage migration removes identity and enforces the approved retention contract", function () {
  assert.match(migrationSource, /drop column if exists user_id/);
  assert.match(migrationSource, /qm_analytics_events_allowed_event_name_check/);
  assert.match(migrationSource, /interval '90 days'/);
  assert.match(migrationSource, /revoke all on function public\.purge_qm_analytics_events/);
});

test("real completion points emit the agreed learning events", function () {
  assert.match(exerciseSource, /trackAnalytics\("exercise_generate"/);
  assert.match(exerciseSource, /trackAnalytics\("exercise_validation_submit"/);
  assert.match(exerciseSource, /trackAnalytics\("favorite_changed"/);
  assert.match(ratingSource, /track\("rating_prompt_shown"/);
  assert.match(ratingSource, /track\("rating_submitted"/);
  assert.match(assessmentSource, /trackAssessmentEvent\("assessment_start"/);
  assert.match(assessmentSource, /trackAssessmentEvent\("assessment_complete"/);
  assert.match(source, /window\.addEventListener\("qm-study-progress-change"/);
  assert.match(source, /data-termo-auth-google-button/);
  assert.match(source, /storageSet\("sessionStorage", LOGIN_PENDING_KEY, "1"\)/);
});
