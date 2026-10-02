import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const vercel = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));
const expected = new Map([
  ["/api/qm-adaptive-learning", "adaptive"],
  ["/api/qm-learning-communication", "communication"],
  ["/api/qm-learning-evaluation", "evaluation"],
  ["/api/qm-learning-profile", "profile"],
  ["/api/qm-gamification-event", "reward"]
]);

test("learning API rewrites preserve public endpoints and dispatch targets", () => {
  for (const [source, route] of expected) {
    const rewrite = vercel.rewrites.find(item => item.source === source);
    assert.equal(rewrite?.destination, `/api/qm-learning?route=${route}`);
  }
});

test("Vercel Hobby function count stays within its 12-function limit", () => {
  const functions = readdirSync(new URL("api/", root)).filter(name => /\.(?:js|mjs|ts)$/.test(name));
  assert.ok(functions.includes("qm-learning.js"));
  assert.ok(functions.length <= 12, `Found ${functions.length} serverless function files.`);
});

test("server modules are denied before filesystem resolution, not with a fallback rewrite", () => {
  const deny = vercel.routes.find(item => item.status === 404);
  assert.ok(deny);
  const pattern = new RegExp(`^${deny.src}$`);
  for (const path of ["/lib", "/lib/qm-chapter-quiz-catalog.mjs", "/lib/nested/file.js"]) {
    assert.ok(pattern.test(path));
  }
  assert.ok(!pattern.test("/library.html"));
  assert.ok(!pattern.test("/assets/qm-auth.js"));
  assert.ok(!deny.continue);
  assert.ok(!vercel.rewrites.some(item => item.source.startsWith("/lib")));
});
