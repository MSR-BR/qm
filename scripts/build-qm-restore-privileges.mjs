// Emits reviewed object-level ACL repair for a logical restore into a fresh
// Supabase project. A pg_dump omits REVOKEs implied by the source project's
// default ACLs; the destination may otherwise grant broad access on CREATE.
// This script never connects to, or changes, a database.
import { readFileSync } from 'node:fs';

const contract = JSON.parse(readFileSync(new URL('../data/qm-supabase-access-contract.json', import.meta.url)));
const roles = ['anon', 'authenticated', 'service_role'];
const tablePrivileges = ['select', 'insert', 'update', 'delete', 'truncate', 'references', 'trigger'];
const sequencePrivileges = ['usage', 'select', 'update'];
const quote = (value) => '"' + value.replaceAll('"', '""') + '"';
const qualified = (name) => {
  const parts = name.split('.');
  if (parts.length !== 2 || parts.some((part) => !/^[a-z][a-z0-9_]*$/.test(part))) {
    throw new Error(`Invalid contract object name: ${name}`);
  }
  return parts.map(quote).join('.');
};
const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
const lines = [
  '-- Generated from data/qm-supabase-access-contract.json; review before applying.',
  '-- Apply only to a freshly restored QUANTUM project, then run the 634-check audit.',
  'BEGIN;',
];

for (const item of contract.tables) {
  const name = qualified(item.name);
  lines.push(`REVOKE ALL ON TABLE ${name} FROM PUBLIC, ${roles.join(', ')};`);
  for (const role of roles) {
    const requested = item.roles[role] || [];
    if (requested.some((privilege) => !tablePrivileges.includes(privilege))) {
      throw new Error(`Unknown table privilege on ${item.name}`);
    }
    if (requested.length) lines.push(`GRANT ${requested.map((p) => p.toUpperCase()).join(', ')} ON TABLE ${name} TO ${role};`);
  }
}

for (const item of contract.sequences) {
  const name = qualified(item.name);
  lines.push(`REVOKE ALL ON SEQUENCE ${name} FROM PUBLIC, ${roles.join(', ')};`);
  for (const role of roles) {
    const requested = item.roles[role] || [];
    if (requested.some((privilege) => !sequencePrivileges.includes(privilege))) {
      throw new Error(`Unknown sequence privilege on ${item.name}`);
    }
    if (requested.length) lines.push(`GRANT ${requested.map((p) => p.toUpperCase()).join(', ')} ON SEQUENCE ${name} TO ${role};`);
  }
}

for (const item of contract.functions) {
  qualified(item.name);
  const [schema, name] = item.name.split('.');
  // Function signatures may be overloaded; grant decisions are per contract
  // name and apply to every overload, exactly as the catalog audit checks.
  lines.push('DO $qm_restore_acl$');
  lines.push('DECLARE fn regprocedure;');
  lines.push('BEGIN');
  lines.push(`  FOR fn IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname=${literal(schema)} AND p.proname=${literal(name)} LOOP`);
  lines.push(`    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, ${roles.join(', ')}', fn);`);
  for (const role of roles) {
    const requested = item.roles[role] || [];
    if (requested.some((privilege) => privilege !== 'execute')) throw new Error(`Unknown function privilege on ${item.name}`);
    if (requested.length) lines.push(`    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO ${role}', fn);`);
  }
  lines.push('  END LOOP;');
  lines.push('END $qm_restore_acl$;');
}

lines.push('COMMIT;');
process.stdout.write(lines.join('\n') + '\n');
