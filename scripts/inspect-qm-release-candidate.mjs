// Read-only, offline release fingerprint. No credentials, writes or network.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const fresh = process.argv.includes('--fresh-target');
const cliArgs = process.argv.slice(2).filter(arg=>arg!=='--fresh-target');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
// Documentation is outside the deployable payload and can record its digest
// without creating a self-referential fingerprint. Tests/tools ARE included.
const inScope = path => /^(api|assets|data|lib|scripts|simulators|slides|supabase\/(migrations|fresh)|tests)\//.test(path)
  || path === '.vercelignore'
  || (!path.includes('/') && /\.(html|js|mjs|css|json|xml|txt)$/.test(path));
const paths = [...new Set(git('ls-files','--cached','--others','--exclude-standard','-z').split('\0').filter(Boolean))]
  .filter(inScope).sort();
const files = paths.map(path => {
  try {
    const info = lstatSync(new URL('../'+path, import.meta.url));
    if (!info.isFile()) throw new Error('Release inputs must be regular files: '+path);
    return { path, sha256: sha(readFileSync(new URL('../'+path,import.meta.url))), executable: Boolean(info.mode & 0o111) };
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}).filter(Boolean);
const migrations = files.filter(file=>file.path.startsWith('supabase/migrations/') && !file.deleted)
  .map(file=>({...file,version:file.path.split('/').at(-1).split('_')[0]}));
const versions = new Map();
for(const file of migrations) versions.set(file.version,[...(versions.get(file.version)||[]),file.path]);
const duplicates = [...versions].filter(([,paths])=>paths.length>1).map(([version,paths])=>({version,paths}));
const freshMigrations=files.filter(file=>file.path.startsWith('supabase/fresh/supabase/migrations/')&&!file.deleted)
  .map(file=>({...file,version:file.path.split('/').at(-1).split('_')[0]}));
const report = {
  format:'qm-release-candidate-v1', baseHead:git('rev-parse','HEAD'),
  projectRef:fresh?'crasnnvdvujzxudmbakv':'plqiofznjlbpfufigpcp', destination:'https://quantummechanicsbook.app',
  payloadSha256:sha(JSON.stringify(files)), fileCount:files.length,
  scope:'Runtime, data, migrations, tests and tools listed in files; docs/specs and ignored local configuration excluded. Not a commit or deployment identity.',
  migrationCount:migrations.length, duplicateMigrationVersions:duplicates,
  canonicalHistoryReady:fresh?freshMigrations.length>0&&new Set(freshMigrations.map(m=>m.version)).size===freshMigrations.length:duplicates.length===0,
  productionGate:fresh?'See C33 current preflight; a fingerprint never constitutes release approval':'BLOCKED: remote history, role/API proof, historical balances, recovery and scoped authorization required',
  activeMigrationWorkdir:fresh?'supabase/fresh':'.',
  freshMigrations,migrations, files
};
if(cliArgs[0]==='--verify' && cliArgs.length===2) {
  const recorded=JSON.parse(readFileSync(cliArgs[1],'utf8'));
  // Committing the prepared tree must not invalidate an otherwise identical
  // payload. Bind the final commit/deployment separately in the release receipt.
  let baseIsAncestor=false;
  if(/^[a-f0-9]{40}$/.test(recorded.baseHead||'')) {
    try { git('merge-base','--is-ancestor',recorded.baseHead,report.baseHead);baseIsAncestor=true; } catch {}
  }
  const inventoryMatches=Array.isArray(recorded.files)&&sha(JSON.stringify(recorded.files))===report.payloadSha256;
  const matches=recorded.projectRef===report.projectRef && baseIsAncestor && inventoryMatches
    && recorded.fileCount===report.fileCount && recorded.payloadSha256===report.payloadSha256;
  console.log(JSON.stringify({matches,baseHead:report.baseHead,recordedBaseHead:recorded.baseHead,baseIsAncestor,inventoryMatches,payloadSha256:report.payloadSha256,fileCount:report.fileCount}));
  if(!matches)process.exitCode=1;
} else if(cliArgs.length===0) console.log(JSON.stringify(report,null,2));
else { console.error('Usage: node scripts/inspect-qm-release-candidate.mjs [--fresh-target] [--verify recorded-manifest.json]');process.exitCode=1; }
