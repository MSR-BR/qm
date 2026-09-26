import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(root, "supabase", "migrations");
const contractPath = path.join(root, "data", "qm-supabase-access-contract.json");

function names(entries = []) {
  return new Set(entries.map((entry) => String(entry.name || "").toLowerCase()));
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

function discoverObjects(sql) {
  const tables = new Set();
  const functions = new Set();
  const droppedFunctions = new Set();
  const sequences = new Set();

  for (const match of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][\w]*)\.([a-z_][\w]*)/gi)) {
    tables.add(`${match[1]}.${match[2]}`.toLowerCase());
  }
  for (const match of sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+([a-z_][\w]*)\.([a-z_][\w]*)\s*\(/gi)) {
    functions.add(`${match[1]}.${match[2]}`.toLowerCase());
  }
  for (const match of sql.matchAll(/drop\s+function\s+(?:if\s+exists\s+)?([a-z_][\w]*)\.([a-z_][\w]*)\s*\(/gi)) {
    droppedFunctions.add(`${match[1]}.${match[2]}`.toLowerCase());
  }
  for (const name of droppedFunctions) functions.delete(name);

  for (const match of sql.matchAll(/create\s+sequence\s+(?:if\s+not\s+exists\s+)?([a-z_][\w]*)\.([a-z_][\w]*)/gi)) {
    sequences.add(`${match[1]}.${match[2]}`.toLowerCase());
  }
  for (const match of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][\w]*)\.([a-z_][\w]*)\s*\(([\s\S]*?)\n\);/gi)) {
    const [, schema, table, body] = match;
    for (const column of body.matchAll(/^\s*([a-z_][\w]*)\s+[^,\n]*generated\s+by\s+default\s+as\s+identity/gim)) {
      sequences.add(`${schema}.${table}_${column[1]}_seq`.toLowerCase());
    }
  }
  return { tables, functions, sequences };
}

function validateEntries(contract, errors) {
  for (const kind of ["tables", "functions", "sequences"]) {
    for (const entry of contract[kind] || []) {
      if (!entry.name || !entry.grantMigration || !entry.consumers?.length || typeof entry.roles !== "object") {
        errors.push(`${kind}: incomplete privilege decision for ${entry.name || "<unnamed>"}`);
      }
      if (kind === "tables" && entry.name.startsWith("public.") && entry.rls !== true) {
        errors.push(`tables: exposed table ${entry.name} must declare RLS`);
      }
    }
  }
}

export async function auditSupabasePrivilegeContract() {
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();
  const sources = await Promise.all(files.map(async (file) => ({
    file,
    sql: await readFile(path.join(migrationsDir, file), "utf8")
  })));
  const sql = sources.map((entry) => entry.sql).join("\n");
  const normalizedSql = sql.toLowerCase().replace(/\s+/g, " ");
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  const actual = discoverObjects(sql);
  const expected = {
    tables: names(contract.tables),
    functions: names(contract.functions),
    sequences: names(contract.sequences)
  };
  const errors = [];

  validateEntries(contract, errors);
  for (const kind of ["tables", "functions", "sequences"]) {
    const missingDecision = difference(actual[kind], expected[kind]);
    const staleDecision = difference(expected[kind], actual[kind]);
    if (missingDecision.length) errors.push(`${kind}: missing privilege decisions: ${missingDecision.join(", ")}`);
    if (staleDecision.length) errors.push(`${kind}: stale privilege decisions: ${staleDecision.join(", ")}`);
  }

  for (const entry of contract.tables || []) {
    if (entry.rls && !normalizedSql.includes(`alter table ${entry.name.toLowerCase()} enable row level security`)) {
      errors.push(`tables: RLS enable statement not found for ${entry.name}`);
    }
  }

  const c27 = sources.find((entry) => entry.file === "20260925215027_explicit_data_api_privileges.sql")?.sql
    .toLowerCase().replace(/\s+/g, " ") || "";
  const required = [
    "grant select, insert, update on table public.qm_gamification_profiles to service_role",
    "grant select, insert on table public.qm_gamification_events to service_role",
    "grant select, insert on table public.qm_chapter_quiz_attempts to service_role",
    "grant usage, select on sequence public.qm_analytics_events_id_seq to service_role"
  ];
  for (const fragment of required) {
    if (!c27.includes(fragment)) errors.push(`C27: required SQL missing: ${fragment}`);
  }
  const forbidden = [
    /grant\s+[^;]*delete[^;]*qm_gamification_profiles/,
    /grant\s+[^;]*delete[^;]*qm_gamification_events/,
    /grant\s+[^;]*update[^;]*qm_gamification_events/,
    /grant\s+[^;]*delete[^;]*qm_chapter_quiz_attempts/,
    /grant\s+[^;]*update[^;]*qm_chapter_quiz_attempts/,
    /grant\s+[^;]*qm_chapter_quiz_attempts[^;]*to\s+(anon|authenticated)/
  ];
  for (const pattern of forbidden) {
    if (pattern.test(c27)) errors.push(`C27: forbidden broad privilege matched ${pattern}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    counts: Object.fromEntries(Object.entries(actual).map(([kind, set]) => [kind, set.size])),
    migrationCount: files.length,
    contractVersion: contract.version
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await auditSupabasePrivilegeContract();
  if (!result.ok) {
    console.error("Supabase privilege contract failed:\n- " + result.errors.join("\n- "));
    process.exitCode = 1;
  } else {
    console.log(`Supabase privilege contract OK (${result.counts.tables} tables, ${result.counts.functions} functions, ${result.counts.sequences} sequences; ${result.migrationCount} migrations; ${result.contractVersion}).`);
  }
}
