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
