import test from "node:test";
import assert from "node:assert/strict";
import { handleQmGamificationEvent } from "../lib/qm-gamification-handler.mjs";

test("gamification endpoint accepts only POST", async () => {
  const response = await handleQmGamificationEvent({ method: "GET" });
  assert.equal(response.status, 405);
});

test("gamification endpoint requires an authenticated bearer token", async () => {
  const response = await handleQmGamificationEvent({ method: "POST", env: { PUBLIC_SUPABASE_URL: "https://example.supabase.co", PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public", SUPABASE_SERVICE_ROLE_KEY: "server" } });
  assert.equal(response.status, 401);
});

test("gamification endpoint reports an unavailable service without server configuration", async () => {
  const response = await handleQmGamificationEvent({ method: "POST", headers: { authorization: "Bearer test" }, env: {} });
  assert.equal(response.status, 503);
});


test("gamification rejects a section in an unpublished chapter", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ id: "test-user" }), { status: 200, headers: { "Content-Type": "application/json" } });
  try {
    const response = await handleQmGamificationEvent({
      method: "POST",
      headers: { authorization: "Bearer test" },
      env: { PUBLIC_SUPABASE_URL: "https://example.supabase.co", PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public", SUPABASE_SERVICE_ROLE_KEY: "server" },
      body: { eventType: "section_completed", idempotencyKey: "section:08:1:sample", chapterId: "08", itemId: "1", pagePath: "slides/chapter-08/page_1.html" }
    });
    assert.equal(response.status, 422);
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("gamification accepts the configured Supabase secret-key name", async () => {
  const response = await handleQmGamificationEvent({
    method: "POST",
    env: { PUBLIC_SUPABASE_URL: "https://example.supabase.co", PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public", SUPABASE_SECRET_KEY: "secret" }
  });
  assert.equal(response.status, 401);
});
