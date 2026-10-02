// Audits a disposable local Supabase restoration. Never connects remotely.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const container = process.argv[2];
if (!/^supabase_db_[a-z0-9-]+$/.test(container || '')) {
  throw new Error('Pass the exact disposable local Supabase DB container name');
}
const contract = JSON.parse(readFileSync(new URL('../data/qm-supabase-access-contract.json', import.meta.url)));
const roles = ['anon', 'authenticated', 'service_role'];
const literal = (value) => "'" + String(value).replaceAll("'", "''") + "'";
const assertions = [];
for (const item of contract.tables) {
  assertions.push(`SELECT ${literal(item.name + '/rls')} AS label, relrowsecurity=${item.rls} AS ok FROM pg_class WHERE oid=${literal(item.name)}::regclass`);
  for (const role of roles) for (const privilege of ['select', 'insert', 'update', 'delete', 'truncate', 'references', 'trigger']) {
    assertions.push(`SELECT ${literal(item.name + '/' + role + '/' + privilege)}, has_table_privilege(${literal(role)}, ${literal(item.name)}, ${literal(privilege)})=${Boolean(item.roles[role]?.includes(privilege))}`);
  }
}
for (const item of contract.functions) for (const role of roles) {
  const [schema, name] = item.name.split('.');
  assertions.push(`SELECT ${literal(item.name + '/' + role)}, coalesce(bool_and(has_function_privilege(${literal(role)}, p.oid, 'execute')=${Boolean(item.roles[role]?.includes('execute'))}), false) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname=${literal(schema)} AND p.proname=${literal(name)}`);
}
for (const item of contract.sequences) for (const role of roles) for (const privilege of ['usage', 'select', 'update']) {
  assertions.push(`SELECT ${literal(item.name + '/' + role + '/' + privilege)}, has_sequence_privilege(${literal(role)}, ${literal(item.name)}, ${literal(privilege)})=${Boolean(item.roles[role]?.includes(privilege))}`);
}
const sql = assertions.join('\nUNION ALL\n');
const stdout = execFileSync('docker', ['exec', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-F', '|', '-c', sql], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
const rows = stdout.trim().split('\n').map((line) => line.split('|'));
const failures = rows.filter((row) => row[1] !== 't').map((row) => row[0]);
const result = { localContainer: container, checks: rows.length, failures };
console.log(JSON.stringify(result));
if (rows.length !== assertions.length || failures.length) process.exitCode = 1;
