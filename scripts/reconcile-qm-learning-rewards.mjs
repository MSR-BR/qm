import { readFile } from "node:fs/promises";
import { buildEligibleSectionSet, planRewardReconciliation } from "../lib/qm-learning-reconciliation.mjs";

const EXPECTED_PROJECT_REF = "plqiofznjlbpfufigpcp";
const PAGE_SIZE = 1000;

async function loadLocalEnv() {
  const contents = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^("|')|("|')$/g, "");
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function projectRefFromUrl(value) {
  try {
    return new URL(value).hostname.split(".")[0];
  } catch {
    return "";
  }
}

async function loadEligibleSections() {
  const registry = JSON.parse(await readFile(new URL("../data/qm-content-registry.json", import.meta.url), "utf8"));
  const chapterIds = Object.entries(registry.chapters || {})
    .filter(([, entry]) => entry?.availability === "published" && entry?.reviewStatus === "reviewed")
    .map(([chapterId]) => chapterId)
    .sort();

  const chapters = await Promise.all(chapterIds.map(async function (chapterId) {
    const payload = JSON.parse(await readFile(new URL("../data/chapter-" + chapterId + ".json", import.meta.url), "utf8"));
    return {
      chapterId,
      topics: Array.isArray(payload.topics) ? payload.topics : []
    };
  }));

  return buildEligibleSectionSet(chapters);
}

async function fetchRows(supabaseUrl, serviceHeaders, endpoint) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const response = await fetch(
      supabaseUrl + "/rest/v1/" + endpoint + separator + "limit=" + PAGE_SIZE + "&offset=" + offset,
      { headers: serviceHeaders }
    );
    const page = await response.json().catch(() => null);
    assert(response.ok && Array.isArray(page), "Could not read reconciliation input (" + response.status + ").");
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

async function applyCandidate(supabaseUrl, serviceHeaders, candidate) {
  const response = await fetch(supabaseUrl + "/rest/v1/rpc/record_qm_section_completion_reward", {
    method: "POST",
    headers: { ...serviceHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      p_user_id: candidate.userId,
      p_idempotency_key: candidate.idempotencyKey,
      p_chapter_id: candidate.chapterId,
      p_item_id: candidate.itemId,
      p_page_path: candidate.pagePath
    })
  });
  const body = await response.json().catch(() => null);
  assert(response.ok, "Reward reconciliation RPC failed (" + response.status + ").");
  const row = Array.isArray(body) ? body[0] : body;
  assert(row && typeof row.awarded === "boolean", "Reward reconciliation RPC returned an invalid contract.");
  return row.awarded;
}

await loadLocalEnv();

const apply = process.argv.includes("--apply");
const confirmation = process.argv.find((entry) => entry.startsWith("--confirm-project="))?.split("=")[1] || "";
const supabaseUrl = String(process.env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const serviceKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const projectRef = projectRefFromUrl(supabaseUrl);

assert(projectRef === EXPECTED_PROJECT_REF, "Refusing to use an unexpected Supabase project.");
assert(Boolean(serviceKey), "A server-side Supabase key is required.");
if (apply) {
  assert(confirmation === EXPECTED_PROJECT_REF, "Use --confirm-project=" + EXPECTED_PROJECT_REF + " with --apply.");
}

const serviceHeaders = {
  apikey: serviceKey,
  Authorization: "Bearer " + serviceKey
};
const eligibleSections = await loadEligibleSections();
const [progressRows, eventRows] = await Promise.all([
  fetchRows(
    supabaseUrl,
    serviceHeaders,
    "qm_study_progress?select=user_id,chapter_id,item_id,page_path,status&status=eq.completed"
  ),
  fetchRows(
    supabaseUrl,
    serviceHeaders,
    "qm_gamification_events?select=user_id,idempotency_key&event_type=eq.section_completed"
  )
]);
const plan = planRewardReconciliation({ progressRows, eventRows, eligibleSections });

let awarded = 0;
let deduped = 0;
if (apply) {
  for (const candidate of plan.candidates) {
    if (await applyCandidate(supabaseUrl, serviceHeaders, candidate)) awarded += 1;
    else deduped += 1;
  }
}

console.log(JSON.stringify({
  ok: true,
  mode: apply ? "apply" : "dry-run",
  projectRef,
  scannedProgress: plan.scannedProgress,
  scannedEvents: plan.scannedEvents,
  eligibleSectionCount: eligibleSections.size,
  candidateCount: plan.candidates.length,
  skipped: plan.skipped,
  awarded,
  deduped
}, null, 2));
