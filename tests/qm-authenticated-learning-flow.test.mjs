import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import { handleQmChapterQuiz } from "../lib/qm-chapter-quiz-handler.mjs";
import {
  handleQmGamificationEvent,
  sectionCompletionIdempotencyKey
} from "../lib/qm-gamification-handler.mjs";
import {
  buildEligibleSectionSet,
  planRewardReconciliation
} from "../lib/qm-learning-reconciliation.mjs";

const SERVER_ENV = {
  PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
  SUPABASE_SECRET_KEY: "server-secret"
};
const PUBLISHED_SECTION = {
  chapterId: "01",
  itemId: "1.1",
  pagePath: "slides/chapter-01/why-old-quantum-physics-matters.html"
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("chapter assessment save uses the verified learner and returns the attempt identifier", async function () {
  const originalFetch = globalThis.fetch;
  let stored = null;
  globalThis.fetch = async function (url, options = {}) {
    if (String(url).includes("/auth/v1/user")) return json({ id: "learner-1" });
    stored = JSON.parse(options.body);
    return json([{ id: "attempt-1", ...stored }], 201);
  };

  try {
    const response = await handleQmChapterQuiz({
      method: "POST",
      headers: { authorization: "Bearer learner-token" },
      body: {
        chapterId: "01",
        answers: [{ questionId: "qm-01-q1", choice: "a" }],
        user_id: "attacker-controlled"
      },
      env: SERVER_ENV
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.attempt.id, "attempt-1");
    assert.equal(stored.user_id, "learner-1");
    assert.equal(stored.chapter_id, "01");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("chapter assessment history is scoped to the verified learner and omits answer payloads", async function () {
  const originalFetch = globalThis.fetch;
  let historyUrl = "";
  globalThis.fetch = async function (url) {
    if (String(url).includes("/auth/v1/user")) return json({ id: "learner-1" });
    historyUrl = String(url);
    return json([{ id: "attempt-1", chapter_id: "01", score: 100 }]);
  };

  try {
    const response = await handleQmChapterQuiz({
      method: "GET",
      headers: { authorization: "Bearer learner-token" },
      query: { history: "1" },
      env: SERVER_ENV
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.attempts.length, 1);
    assert.match(historyUrl, /user_id=eq\.learner-1/);
    assert.doesNotMatch(historyUrl, /answers|feedback/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("chapter assessment rejects incomplete or malformed answer sets before storage", async function () {
  const originalFetch = globalThis.fetch;
  let storageCalls = 0;
  globalThis.fetch = async function (url) {
    if (String(url).includes("/auth/v1/user")) return json({ id: "learner-1" });
    storageCalls += 1;
    return json([]);
  };

  try {
    const response = await handleQmChapterQuiz({
      method: "POST",
      headers: { authorization: "Bearer learner-token" },
      body: {
        chapterId: "01",
        answers: [{ questionId: "qm-01-q1", choice: "not-a-choice" }]
      },
      env: SERVER_ENV
    });

    assert.equal(response.status, 422);
    assert.equal(storageCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("chapter assessment reports a retryable storage failure without leaking database details", async function () {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function (url) {
    if (String(url).includes("/auth/v1/user")) return json({ id: "learner-1" });
    return json({ code: "42501", message: "permission denied for table" }, 403);
  };

  try {
    const response = await handleQmChapterQuiz({
      method: "POST",
      headers: { authorization: "Bearer learner-token" },
      body: {
        chapterId: "01",
        answers: [{ questionId: "qm-01-q1", choice: "a" }]
      },
      env: SERVER_ENV
    });

    assert.equal(response.status, 503);
    assert.doesNotMatch(response.body.error, /permission|table|42501/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("section rewards use one canonical idempotency key and the atomic RPC", async function () {
  const originalFetch = globalThis.fetch;
  let rpcRequest = null;
  globalThis.fetch = async function (url, options = {}) {
    if (String(url).includes("/auth/v1/user")) return json({ id: "learner-1" });
    rpcRequest = { url: String(url), body: JSON.parse(options.body) };
    return json([{
      awarded: true,
      xp_delta: 20,
      xp_total: 40,
      level: 1,
      current_streak: 2,
      best_streak: 2,
      studied_items_count: 2
    }]);
  };

  try {
    const idempotencyKey = sectionCompletionIdempotencyKey(PUBLISHED_SECTION);
    const response = await handleQmGamificationEvent({
      method: "POST",
      headers: { authorization: "Bearer learner-token" },
      body: {
        eventType: "section_completed",
        idempotencyKey,
        ...PUBLISHED_SECTION
      },
      env: SERVER_ENV
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.awarded, true);
    assert.equal(response.body.profile.xpTotal, 40);
    assert.match(rpcRequest.url, /\/rest\/v1\/rpc\/record_qm_section_completion_reward$/);
    assert.deepEqual(rpcRequest.body, {
      p_user_id: "learner-1",
      p_idempotency_key: idempotencyKey,
      p_chapter_id: "01",
      p_item_id: "1.1",
      p_page_path: PUBLISHED_SECTION.pagePath
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("section rewards reject a client-supplied key that does not match the reviewed section", async function () {
  const originalFetch = globalThis.fetch;
  let rpcCalls = 0;
  globalThis.fetch = async function (url) {
    if (String(url).includes("/auth/v1/user")) return json({ id: "learner-1" });
    rpcCalls += 1;
    return json([]);
  };

  try {
    const response = await handleQmGamificationEvent({
      method: "POST",
      headers: { authorization: "Bearer learner-token" },
      body: {
        eventType: "section_completed",
        idempotencyKey: "section:01:other:forged",
        ...PUBLISHED_SECTION
      },
      env: SERVER_ENV
    });

    assert.equal(response.status, 422);
    assert.equal(rpcCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("historical reconciliation includes only reviewed completed sections without existing rewards", function () {
  const eligibleSections = buildEligibleSectionSet([{
    chapterId: "01",
    topics: [{ id: "1.1", url: PUBLISHED_SECTION.pagePath }]
  }]);
  const existingKey = sectionCompletionIdempotencyKey(PUBLISHED_SECTION);
  const plan = planRewardReconciliation({
    eligibleSections,
    progressRows: [
      { user_id: "user-a", chapter_id: "01", item_id: "1.1", page_path: PUBLISHED_SECTION.pagePath, status: "completed" },
      { user_id: "user-b", chapter_id: "01", item_id: "1.1", page_path: PUBLISHED_SECTION.pagePath, status: "completed" },
      { user_id: "user-c", chapter_id: "08", item_id: "8.1", page_path: "slides/chapter-08/example.html", status: "completed" },
      { user_id: "user-d", chapter_id: "01", item_id: "1.1", page_path: PUBLISHED_SECTION.pagePath, status: "in_progress" }
    ],
    eventRows: [{ user_id: "user-a", idempotency_key: existingKey }]
  });

  assert.equal(plan.candidates.length, 1);
  assert.equal(plan.candidates[0].userId, "user-b");
  assert.equal(plan.skipped.existing, 1);
  assert.equal(plan.skipped.ineligible, 1);
  assert.equal(plan.skipped.notCompleted, 1);
});

test("simulator progress records one exploration per browser session", async function () {
  const source = await readFile(new URL("../assets/qm-simulator-progress.js", import.meta.url), "utf8");
  const sessionStore = new Map();
  let insertCalls = 0;

  const client = {
    from() {
      const builder = {
        select() { return builder; },
        eq() { return builder; },
        async maybeSingle() { return { data: null, error: null }; },
        async insert() {
          insertCalls += 1;
          return { error: null };
        },
        async update() { return { error: null }; }
      };
      return builder;
    }
  };

  const window = {
    location: {
      origin: "https://quantummechanicsbook.app",
      pathname: "/simulators/infinite-well.html",
      search: ""
    },
    sessionStorage: {
      getItem(key) { return sessionStore.get(key) || null; },
      setItem(key, value) { sessionStore.set(key, value); }
    },
    TermoAuth: {
      async whenReady() { return null; },
      async ensureSupabase() { return client; },
      async getSession() { return { user: { id: "learner-1" } }; }
    },
    addEventListener() {},
    dispatchEvent() {},
    setTimeout
  };
  const document = {
    readyState: "loading",
    currentScript: { src: "https://quantummechanicsbook.app/assets/qm-simulator-progress.js" },
    scripts: [],
    head: { appendChild() {} },
    createElement() { return {}; },
    querySelector() {
      return { getAttribute() { return "infinite-well"; } };
    }
  };

  vm.runInNewContext(source, {
    window,
    document,
    URL,
    URLSearchParams,
    CustomEvent: class CustomEvent {
      constructor(type, options) {
        this.type = type;
        this.detail = options?.detail;
      }
    },
    Array,
    String,
    Number,
    Promise,
    setTimeout
  });

  const first = await window.QMSimulatorProgress.record();
  const second = await window.QMSimulatorProgress.record();
  assert.equal(first.ok, true);
  assert.equal(first.deduped, false);
  assert.equal(second.ok, true);
  assert.equal(second.deduped, true);
  assert.equal(insertCalls, 1);
});

test("C21 migration preserves browser RLS and grants only the server reward RPC", async function () {
  const sql = await readFile(
    new URL("../supabase/migrations/20260924125315_repair_qm_authenticated_learning_flows.sql", import.meta.url),
    "utf8"
  );

  assert.match(sql, /security invoker/i);
  assert.match(sql, /as \$\$[\s\S]*\$\$;/i);
  assert.doesNotMatch(sql, /^as \d+$/im);
  assert.match(sql, /grant execute on function public\.record_qm_section_completion_reward[\s\S]*to service_role/i);
  assert.match(sql, /revoke all on function public\.record_qm_section_completion_reward[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /p_chapter_id not in \('01', '02', '03', '04', '05', '06', '07'\)/);
  assert.doesNotMatch(sql, /grant execute on function public\.record_qm_section_completion_reward[\s\S]{0,180}to authenticated/i);
});
