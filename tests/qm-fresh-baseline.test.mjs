import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=new URL('../',import.meta.url);
test('fresh baseline exactly reproduces preserved sources and guarded compatibility change',()=>{
  const result=JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL('scripts/build-qm-fresh-baseline.mjs',root))],{encoding:'utf8'}));
  assert.equal(result.ok,true);assert.equal(result.sources,21);
  const sql=readFileSync(new URL(result.migration,root),'utf8');
  assert.match(sql,/to_regprocedure\('public\.rls_auto_enable\(\)'\) is not null/);
  assert.match(sql,/Fresh QUANTUM baseline refuses an existing application schema/);
  assert.doesNotMatch(sql,/^(begin|commit);$/mi);
});
test('fresh release fingerprint includes destination-specific SQL and config',()=>{
  const result=JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL('scripts/inspect-qm-release-candidate.mjs',root)),'--fresh-target'],{encoding:'utf8'}));
  assert.equal(result.projectRef,'crasnnvdvujzxudmbakv');
  assert.equal(result.activeMigrationWorkdir,'supabase/fresh');
  assert.equal(result.canonicalHistoryReady,true);assert.equal(result.freshMigrations.length,1);
  assert.ok(result.files.some(f=>f.path==='supabase/fresh/supabase/config.toml'));
  assert.ok(result.files.some(f=>f.path==='supabase/fresh/baseline-manifest.json'));
  assert.equal(result.duplicateMigrationVersions.length,3,'Historical evidence remains recorded');
});
