import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

const SUPABASE_URL = "https://plqiofznjlbpfufigpcp.supabase.co";

async function loadLocalEnv() {
  const contents = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^("|')|("|')$/g, "");
  }
}

function assert(result, label) {
  if (!result) throw new Error(`Audit failed: ${label}`);
}

async function request(path, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, options);
}

await loadLocalEnv();

const serviceKey = String(process.env.SUPABASE_SECRET_KEY || "").trim();
const publicKey = String(process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "").trim();
assert(/^sb_secret_[A-Za-z0-9_-]{20,}$/.test(serviceKey), "SUPABASE_SECRET_KEY is missing or malformed in .env.local");
assert(Boolean(publicKey), "PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing in .env.local");

const serviceHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
const runId = randomUUID();
const password = `QmAudit!${randomUUID()}Aa9`;
const emails = [`qm-audit-a-${runId}@example.invalid`, `qm-audit-b-${runId}@example.invalid`];
const users = [];
let savedId = "";
let reportId = "";
const results = {};

async function createUser(email) {
  const response = await request("/auth/v1/admin/users", {
    method: "POST",
    headers: { ...serviceHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true })
  });
  const body = await response.json().catch(() => ({}));
  assert(response.ok && body.id, `create QA user (${response.status})`);
  users.push(body.id);
  return body.id;
}

async function login(email) {
  const response = await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { apikey: publicKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const body = await response.json().catch(() => ({}));
  assert(response.ok && body.access_token, `QA password login (${response.status})`);
  return body.access_token;
}

function userHeaders(token, extra = {}) {
  return { apikey: publicKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...extra };
}

try {
  const bucket = await request("/storage/v1/bucket/qm-book-sources", { headers: serviceHeaders });
  results.privateBucket = bucket.status === 200;
  assert(results.privateBucket, "private bucket is accessible to server only");

  const [userAId, userBId] = await Promise.all(emails.map(createUser));
  const [tokenA, tokenB] = await Promise.all(emails.map(login));
  results.passwordLogin = true;

  const saved = await request("/rest/v1/qm_saved_exercises", {
    method: "POST",
    headers: userHeaders(tokenA, { Prefer: "return=representation" }),
    body: JSON.stringify({
      user_id: userAId, chapter_id: "01", item_id: "audit", page_path: "/audit",
      page_url: "https://qm-beta.vercel.app/audit", page_title: "Temporary audit",
      difficulty: "medio", exercise_title: "Temporary audit exercise",
      statement: "Temporary statement.", solution: "Temporary solution."
    })
  });
  const savedBody = await saved.json().catch(() => []);
  savedId = savedBody?.[0]?.id || "";
  results.savedCreate = saved.status === 201 && Boolean(savedId);
  assert(results.savedCreate, `saved exercise creation (${saved.status})`);

  const ownRead = await request(`/rest/v1/qm_saved_exercises?id=eq.${encodeURIComponent(savedId)}&select=id`, { headers: userHeaders(tokenA) });
  const otherRead = await request(`/rest/v1/qm_saved_exercises?id=eq.${encodeURIComponent(savedId)}&select=id`, { headers: userHeaders(tokenB) });
  const otherRows = await otherRead.json().catch(() => null);
  results.savedOwnership = ownRead.status === 200 && otherRead.status === 200 && Array.isArray(otherRows) && otherRows.length === 0;
  assert(results.savedOwnership, "saved-exercise ownership RLS");

  const forbidden = await request("/rest/v1/qm_saved_exercises", {
    method: "POST",
    headers: userHeaders(tokenB),
    body: JSON.stringify({
      user_id: userAId, page_path: "/audit", page_url: "https://qm-beta.vercel.app/audit",
      page_title: "Forbidden", difficulty: "medio", exercise_title: "Forbidden",
      statement: "Forbidden.", solution: "Forbidden."
    })
  });
  results.foreignInsertBlocked = [401, 403].includes(forbidden.status);
  assert(results.foreignInsertBlocked, `foreign saved-exercise insert blocked (${forbidden.status})`);

  const report = await request("/rest/v1/qm_exercise_validation_reports", {
    method: "POST",
    headers: userHeaders(tokenA, { Prefer: "return=representation" }),
    body: JSON.stringify({
      validator_user_id: userAId, validator_email: emails[0], reporter_user_id: userAId, reporter_email: emails[0],
      saved_exercise_id: savedId, exercise_id: `audit-${runId}`, chapter_id: "01", item_id: "audit",
      page_path: "/audit", page_url: "https://qm-beta.vercel.app/audit", page_title: "Temporary audit",
      exercise_title: "Temporary audit exercise", exercise_fingerprint: runId,
      statement_excerpt: "Temporary statement.", solution_excerpt: "Temporary solution.",
      statement_status: "nao", solution_status: "nao", ai_review_state: "inconclusive",
      ai_review_summary: "Temporary audit.", ai_correction_advice: "", avoid_propagation: false, review_status: "pending"
    })
  });
  const reportBody = await report.json().catch(() => []);
  reportId = reportBody?.[0]?.id || "";
  results.reportCreate = report.status === 201 && Boolean(reportId);
  assert(results.reportCreate, `validation report creation (${report.status})`);

  const foreignReport = await request(`/rest/v1/qm_exercise_validation_reports?id=eq.${encodeURIComponent(reportId)}&select=id`, { headers: userHeaders(tokenB) });
  const foreignReportRows = await foreignReport.json().catch(() => null);
  results.reportOwnership = foreignReport.status === 200 && Array.isArray(foreignReportRows) && foreignReportRows.length === 0;
  assert(results.reportOwnership, "validation-report ownership RLS");

  const privateMetadata = await request("/rest/v1/qm_book_sources?select=source_key&limit=1", { headers: userHeaders(tokenA) });
  results.bookMetadataBlocked = [401, 403].includes(privateMetadata.status);
  assert(results.bookMetadataBlocked, `book metadata privacy (${privateMetadata.status})`);

  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  if (reportId) await request(`/rest/v1/qm_exercise_validation_reports?id=eq.${encodeURIComponent(reportId)}`, { method: "DELETE", headers: serviceHeaders }).catch(() => null);
  if (savedId) await request(`/rest/v1/qm_saved_exercises?id=eq.${encodeURIComponent(savedId)}`, { method: "DELETE", headers: serviceHeaders }).catch(() => null);
  await Promise.all(users.map((id) => request(`/auth/v1/admin/users/${encodeURIComponent(id)}`, { method: "DELETE", headers: serviceHeaders }).catch(() => null)));
}
