import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("public learning guide is versioned, English, and accessible without login", async () => {
  const [html, policy, source] = await Promise.all([
    read("help.html"),
    read("data/qm-learning-policy.v1.json").then(JSON.parse),
    read("docs/learning-methodology.md")
  ]);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /<a class="skip-link" href="#helpContent">/);
  assert.match(html, /<main[^>]+id="helpContent"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /aria-label="On this page"/);
  assert.match(html, new RegExp(policy.policyVersion));
  assert.match(source, new RegExp(policy.policyVersion));
  assert.match(html, /Updated 26 September 2026/);
  assert.match(html, /engagement is not the same as learning/i);
  assert.match(html, /no extra daily completion points/i);
  assert.match(html, /Opening a simulator alone does not award points/i);
});

test("guide explains the core pedagogy and has no private rubric values", async () => {
  const [html, policy] = await Promise.all([
    read("help.html"),
    read("data/qm-learning-policy.v1.json").then(JSON.parse)
  ]);
  for (const id of ["activities", "recommendations", "evidence", "rewards", "simulators", "ai-privacy", "research", "support"]) {
    assert.match(html, new RegExp(`id="${id}"`), `missing guide section ${id}`);
  }
  assert.match(html, /spac(?:ed|ing)/i);
  assert.match(html, /retrieval/i);
  assert.match(html, /prerequisite/i);
  assert.match(html, /without help/i);
  assert.match(html, /choose another available reviewed activity/i);
  assert.doesNotMatch(html, /minimumUnaidedSuccesses|remediationDailyCycleCap|completionPromptRatio/i);
  assert.doesNotMatch(html, /(?:\b20|\b30|\b80) points\b/i);
  assert.equal(policy.rewardRules.additionalDailyChallengePoints, 0);
  assert.equal(policy.rewardRules.simulatorOpeningPoints, 0);
});

test("help and contextual links resolve to pages and fragment targets", async () => {
  const [html, index, assessments, daily, simulator] = await Promise.all([
    read("help.html"), read("index.html"), read("assessments.html"),
    read("daily-challenge.html"), read("assets/qm-simulator-progress.js")
  ]);
  const ids = new Set(Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]));
  for (const [, rawHref] of html.matchAll(/\bhref="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|#)/i.test(rawHref)) {
      if (rawHref.startsWith("#")) assert.ok(ids.has(rawHref.slice(1)), `broken guide fragment ${rawHref}`);
      continue;
    }
    const resolved = new URL(rawHref, "https://quantummechanicsbook.app/help.html");
    const pathname = resolved.pathname.replace(/^\//, "");
    if (pathname) await access(path.join(root, pathname));
    if (resolved.hash && pathname === "help.html") assert.ok(ids.has(decodeURIComponent(resolved.hash.slice(1))), `broken guide fragment ${rawHref}`);
  }
  assert.match(index, /href="help\.html"/);
  assert.match(index, /href="help\.html#rewards"/);
  assert.match(index, /href="help\.html#recommendations"/);
  assert.match(assessments, /help\.html#activities/);
  assert.match(daily, /help\.html#recommendations/);
  assert.match(simulator, /\/help\.html#simulators/);
});

test("SEO generator and validator include the help route", async () => {
  const [generator, validator] = await Promise.all([
    read("scripts/build-seo-artifacts.mjs"),
    read("scripts/validate-qm-seo-artifacts.mjs")
  ]);
  assert.match(generator, /normalizedRelativePath === "help\.html"/);
  assert.match(generator, /SITE_URL \+ "\/help\.html"/);
  assert.match(validator, /help\.html/);
});
