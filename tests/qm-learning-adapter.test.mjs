import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import { policy, eventMap, mechanismCards, classifyQmEvent, eligibleQmSection, validateQmAdapter } from "../lib/qm-learning-adapter.mjs";
import { eligibleSection, validateLearningAdapter } from "../lib/learning-policy-contract.mjs";
import { ANALYTICS_EVENT_PROPERTIES } from "../lib/qm-analytics-handler.mjs";

const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const json = path => JSON.parse(read(path));
const registry = json("data/qm-content-registry.json");
const manifest = json("data/qm-exercise-source-manifest.json");
const first = manifest.entries[0];
const candidate = { chapterId: first.chapterId, sectionId: first.sectionId, pagePath: first.pagePath };
const clone = value => structuredClone(value);

test("shared contract validates the versioned adapter and rejects weakened pedagogical rules", () => {
  assert.deepEqual(validateQmAdapter(), []);
  for (const mutate of [
    p => { p.authority.analyticsCanAward = true; },
    p => { p.authority.clientCanAward = true; },
    p => { p.mastery.singleCorrectAnswerSufficient = true; },
    p => { p.mastery.minimumSeparateSessions = 1; },
    p => { p.rewardRules.simulatorOpeningPoints = 10; },
    p => { p.communication.optInDefault = true; },
    p => { p.structural.publicIndividualLeaderboard = true; },
    p => { p.recommendations.aiMayOverrideEligibility = true; },
    p => { p.rewards.section_completed.cap = 999; }
  ]) {
    const changed = clone(policy); mutate(changed);
    assert.ok(validateLearningAdapter(changed, eventMap, mechanismCards).length > 0);
  }
  assert.ok(Object.isFrozen(policy.rewards.section_completed));
});

test("every current analytics event is classified with no pedagogical authority", () => {
  const names = Object.keys(ANALYTICS_EVENT_PROPERTIES).sort();
  assert.deepEqual(eventMap.events.filter(e => e.channel === "analytics").map(e => e.name).sort(), names);
  for (const name of names) {
    const classification = classifyQmEvent("analytics", name);
    assert.equal(classification.category, "analytics");
    assert.equal(classification.canonicalEvent, null);
    assert.equal(classification.awardAuthority, false);
    assert.equal(classification.masteryAuthority, false);
  }
  // Names resembling authoritative events cannot bypass channel classification.
  assert.throws(() => classifyQmEvent("analytics", "section_completed"), /Unclassified/);
  assert.throws(() => classifyQmEvent("legacy", "unknown_success"), /Unclassified/);
  const changed = clone(eventMap);
  changed.events[0].canonicalEvent = "section_completed";
  assert.ok(validateLearningAdapter(policy, changed, mechanismCards).length);
});

test("new browser CustomEvents and public tables require explicit inventory", () => {
  const assetFiles = readdirSync(new URL("assets/", root)).filter(name => name.endsWith(".js"));
  const emitted = new Set();
  for (const file of ["index.html", ...assetFiles.map(name => `assets/${name}`)]) {
    for (const match of read(file).matchAll(/new CustomEvent\(["']([^"']+)["']/g)) emitted.add(match[1]);
  }
  assert.deepEqual(eventMap.events.filter(e => e.channel === "ui").map(e => e.name).sort(), [...emitted].sort());
  const tables = new Set();
  for (const file of readdirSync(new URL("supabase/migrations/", root)).filter(name => name.endsWith(".sql"))) {
    for (const match of read(`supabase/migrations/${file}`).matchAll(/create table(?: if not exists)? public\.(\w+)/gi)) tables.add(match[1]);
  }
  assert.deepEqual(eventMap.stores.map(s => s.table).sort(), [...tables].sort());
  for (const event of eventMap.events) assert.doesNotThrow(() => read(event.source));
});

test("reviewed manifest entries pass; locked, forged and incomplete content fails closed", () => {
  for (const entry of manifest.entries) {
    const result = eligibleQmSection({ chapterId: entry.chapterId, sectionId: entry.sectionId, pagePath: entry.pagePath });
    assert.ok(result, entry.sectionId);
    assert.deepEqual(result.sourceIds, entry.canonicalReference.references.map(ref => ref.id));
  }
  for (const chapterId of ["08", "09", "10", "11", "12", "13", "99", "x01", "1", 1, null]) {
    assert.equal(eligibleQmSection({ ...candidate, chapterId }), null);
  }
  for (const bad of [null, {}, { ...candidate, sectionId: "1.999" }, { ...candidate, pagePath: "https://other.test/" + candidate.pagePath }, { ...candidate, pagePath: candidate.pagePath + "?x=1" }]) {
    assert.equal(eligibleQmSection(bad), null);
  }
  for (const mutate of [
    m => { m.entries[0].needsReview = true; },
    m => { delete m.entries[0].needsReview; },
    m => { m.entries[0].canonicalReference.references = []; },
    m => { m.entries[0].canonicalReference.references[0].needsReview = true; },
    m => { m.entries[0].sourceFiles = []; },
    m => { m.entries.push(clone(m.entries[0])); },
    m => { m.eligibleChapters = []; }
  ]) {
    const changed = clone(manifest); mutate(changed);
    assert.equal(eligibleSection(policy, registry, changed, candidate), null);
  }
  const changedRegistry = clone(registry);
  changedRegistry.chapters[candidate.chapterId].reviewStatus = "unreviewed";
  assert.equal(eligibleSection(policy, changedRegistry, manifest, candidate), null);
});

test("all catalogue simulators declare C30 local capabilities without claiming mastery", () => {
  const context = { window: { __qmAnalyticsLoaderStarted: true }, document: { readyState: "loading", addEventListener() {} } };
  vm.runInNewContext(read("assets/qm-simulator-catalog.js"), context);
  const catalogue = Array.from(context.window.QMSimulatorCatalog);
  const declarations = json("data/qm-simulator-evidence.v1.json");
  assert.equal(declarations.policyVersion, policy.policyVersion);
  assert.deepEqual(declarations.simulators.map(s => s.slug).sort(), catalogue.map(s => s.slug).sort());
  for (const simulator of declarations.simulators) {
    assert.equal(simulator.mastery, false);
    const source = catalogue.find(s => s.slug === simulator.slug);
    assert.equal(simulator.opened, !source.standaloneUrl.startsWith("https:"));
    for (const stage of ["prediction", "meaningfulInteraction", "reflection", "completedGoal"]) {
      assert.equal(simulator[stage], !source.standaloneUrl.startsWith("https:"));
    }
    for (const sectionId of source.sections) {
      const entry = manifest.entries.find(e => e.sectionId === sectionId && e.chapterId === String(source.chapter).padStart(2, "0"));
      assert.ok(entry, `Unmapped simulator section: ${simulator.slug}/${sectionId}`);
    }
  }
});

test("every structural mechanic and reward has a complete versioned mechanism card", () => {
  for (const id of ["section_points", "assessment_points", "review_points", "retry_points", "mastery_milestone", "level", "streak", "badges", "missions", "daily_challenge", "simulator_cycle", "recommendation", "timer", "leaderboard", "learning_email"]) {
    assert.ok(mechanismCards.mechanisms.find(c => c.id === id), id);
  }
  const cards = clone(mechanismCards);
  cards.mechanisms[0].evidence = "";
  assert.ok(validateLearningAdapter(policy, eventMap, cards).length);
  assert.equal(policy.rewardRules.policyUpgradeResetsCaps, false);
  assert.equal(policy.rewardRules.recompletionResetsCaps, false);
  assert.equal(policy.modes.assessment.manualAccess, true);
});

test("C30 server-only adoption stays bounded and another project adapter can validate", () => {
  const paths = ["index.html", "assessments.html"];
  for (const directory of ["assets", "api", "lib"]) {
    for (const name of readdirSync(new URL(`${directory}/`, root))) {
      if (/\.(?:js|mjs)$/.test(name) && !["learning-policy-contract.mjs", "qm-learning-adapter.mjs", "qm-gamification-handler.mjs", "qm-learning-profile-handler.mjs", "qm-ledger-reconciliation.mjs", "qm-learning-communication.mjs"].includes(name)) paths.push(`${directory}/${name}`);
    }
  }
  for (const path of paths) assert.doesNotMatch(read(path), /qm-learning-adapter|learning-policy-contract|qm-learning-policy\.v1/, path);
  // Synthetic fixture only, not evidence of TERMO adoption or production parity.
  const fixture = clone(policy); fixture.project = "OTHER_PROJECT_FIXTURE";
  assert.deepEqual(validateLearningAdapter(fixture, eventMap, mechanismCards), []);
  const sql = read("supabase/migrations/20260904115229_create_qm_gamification_foundation.sql");
  const values = sql.match(/event_type in \(([^)]+)\)/)[1].matchAll(/'([^']+)'/g);
  for (const [, name] of values) assert.equal(classifyQmEvent("legacy", name).category, "reward");
});
