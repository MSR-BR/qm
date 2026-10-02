import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { auditSupabasePrivilegeContract } from "../scripts/check-supabase-privileges.mjs";

test("every project-created Supabase object has an explicit privilege decision", async function () {
  const result = await auditSupabasePrivilegeContract();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.counts, { tables: 25, functions: 22, sequences: 2 });
});

test("chapter assessment service writes learning evidence only through server-owned RPCs", async function () {
  const source = await readFile(new URL("../lib/qm-chapter-quiz-handler.mjs", import.meta.url), "utf8");
  assert.match(source, /rpc\/record_qm_learning_activity/);
  assert.match(source, /rpc\/complete_qm_learning_review/);
  assert.doesNotMatch(source, /"qm_learning_attempts",\s*\{\s*method:\s*"POST"/s);
});

test("section reward service writes only through the server-only atomic RPC", async function () {
  const handler = await readFile(new URL("../lib/qm-gamification-handler.mjs", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20260924125315_repair_qm_authenticated_learning_flows.sql", import.meta.url), "utf8");
  assert.match(handler, /rpc\/record_qm_section_completion_reward/);
  assert.doesNotMatch(handler, /rest\(config,\s*"qm_gamification_(?:profiles|events)"/);
  assert.match(migration, /insert into public\.qm_gamification_profiles/i);
  assert.match(migration, /insert into public\.qm_gamification_events/i);
  assert.match(migration, /update public\.qm_gamification_profiles/i);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.qm_gamification_/i);
});

test("reconciliation is read-only except for the atomic reward RPC", async function () {
  const source = await readFile(new URL("../scripts/reconcile-qm-learning-rewards.mjs", import.meta.url), "utf8");
  assert.match(source, /qm_study_progress\?select=/);
  assert.match(source, /qm_gamification_events\?select=/);
  assert.match(source, /rpc\/record_qm_section_completion_reward/);
  assert.doesNotMatch(source, /method:\s*"(?:PATCH|PUT|DELETE)"/);
});
