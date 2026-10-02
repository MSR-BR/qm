import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

test('logical restore ACL repair covers each contracted table, sequence and function', () => {
  const contract = JSON.parse(readFileSync(new URL('../data/qm-supabase-access-contract.json', import.meta.url)));
  const sql = execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/build-qm-restore-privileges.mjs', import.meta.url))], { encoding: 'utf8' });
  assert.match(sql, /^-- Generated from /);
  assert.match(sql, /BEGIN;[\s\S]*COMMIT;\s*$/);
  for (const item of contract.tables) {
    const [schema, name] = item.name.split('.');
    assert.ok(sql.includes(`REVOKE ALL ON TABLE "${schema}"."${name}" FROM PUBLIC, anon, authenticated, service_role;`), item.name);
  }
  for (const item of contract.sequences) {
    const [schema, name] = item.name.split('.');
    assert.ok(sql.includes(`REVOKE ALL ON SEQUENCE "${schema}"."${name}" FROM PUBLIC, anon, authenticated, service_role;`), item.name);
  }
  assert.equal((sql.match(/DO \$qm_restore_acl\$/g) || []).length, contract.functions.length);
  assert.match(sql, /GRANT SELECT ON TABLE "public"\."qm_learning_ledger" TO authenticated;/);
  assert.doesNotMatch(sql, /GRANT [^\n]*"public"\."qm_learning_ledger" TO anon;/);
});
