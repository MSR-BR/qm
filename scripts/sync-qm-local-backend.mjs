// Explicit local-only alignment. No provider settings, users or remote data are changed.
// Credentials pass through memory and an ignored 0600 file, never stdout or arguments.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, renameSync, chmodSync, lstatSync } from "node:fs";
import { fileURLToPath } from "node:url";
const ref = "crasnnvdvujzxudmbakv";
assert.equal(process.argv[2], "--sync", "Use --sync for the authorized local environment update");
let token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) for (const account of ["access-token", "supabase"]) {
  try { token = execFileSync("/usr/bin/security", ["find-generic-password", "-s", "Supabase CLI", "-a", account, "-w"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); break; } catch {}
}
assert.ok(token, "Supabase CLI credential unavailable");
if (token.startsWith("go-keyring-base64:")) token = Buffer.from(token.slice(18), "base64").toString();
async function get(path) {
  const response = await fetch("https://api.supabase.com/v1/projects/" + ref + path, {
    headers: { Authorization: "Bearer " + token }, signal: AbortSignal.timeout(30000)
  });
  assert.ok(response.ok, "Management request HTTP " + response.status);
  return response.json();
}
const project = await get("");
assert.equal(project.name, "quantum_rebuild");
assert.equal(project.organization_id, "farevhlbtnmkuewoxhry");
assert.equal(project.status, "ACTIVE_HEALTHY");
const publicResponse = await fetch("https://quantummechanicsbook.app/api/public-config");
assert.ok(publicResponse.ok);
const config = await publicResponse.json();
assert.equal(new URL(config.supabaseUrl).hostname, ref + ".supabase.co");
assert.equal(config.googleClientId, "1091169926547-94qapsmdmtg38hbognu8dapl1j8lpimd.apps.googleusercontent.com");
const keys = await get("/api-keys?reveal=true");
const secret = keys.find(key => key.type === "secret")?.api_key || keys.find(key => key.name === "service_role")?.api_key;
assert.ok(secret && config.supabasePublishableKey, "Target keys unavailable");
const envFile = fileURLToPath(new URL("../.env.local", import.meta.url));
assert.ok(!lstatSync(envFile).isSymbolicLink(), "Refuse symlink environment file");
let content = readFileSync(envFile, "utf8");
const updates = {
  PUBLIC_SUPABASE_URL: config.supabaseUrl,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: config.supabasePublishableKey,
  PUBLIC_GOOGLE_CLIENT_ID: config.googleClientId,
  SUPABASE_SECRET_KEY: secret
};
for (const [name, value] of Object.entries(updates)) {
  assert.ok(!/[\r\n]/.test(value));
  const line = name + "=" + JSON.stringify(value);
  const matcher = new RegExp("^" + name + "=.*$", "m");
  content = matcher.test(content) ? content.replace(matcher, () => line) : content.trimEnd() + "\n" + line + "\n";
}
const temporary = envFile + ".next";
writeFileSync(temporary, content, { mode: 0o600, flag: "wx" });
renameSync(temporary, envFile);
chmodSync(envFile, 0o600);
console.log(JSON.stringify({ aligned: true, projectRef: ref, updatedNames: Object.keys(updates), remoteChanges: false, otherVariablesPreserved: true }));
