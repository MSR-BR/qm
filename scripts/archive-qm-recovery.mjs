// Preserve the rehearsed C33 snapshot and verified private PDFs as an encrypted,
// local-only artifact. Secrets stay in memory/Keychain; no cloud upload occurs.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,statSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const ref='crasnnvdvujzxudmbakv';
const destination='/Users/marioreis/Library/Application Support/QUANTUM/backups';
const archive=destination+'/c33-2026-10-02.qmbak';
const service='QUANTUM recovery archive',account=ref+'-c33-2026-10-02';
const hash=x=>createHash('sha256').update(x).digest('hex');
const keychainRead=(s,a)=>execFileSync('/usr/bin/security',['find-generic-password','-s',s,'-a',a,'-w'],{stdio:['ignore','pipe','ignore']}).toString().trim();
function decrypt(bytes,key){
  assert.equal(bytes.subarray(0,6).toString(),'QMBK01');
  const d=createDecipheriv('aes-256-gcm',key,bytes.subarray(6,18));
  d.setAAD(Buffer.from('QMBK01'));d.setAuthTag(bytes.subarray(18,34));
  return gunzipSync(Buffer.concat([d.update(bytes.subarray(34)),d.final()]));
}
if(['--verify','--extract'].includes(process.argv[2])){
  const bytes=readFileSync(archive),key=Buffer.from(keychainRead(service,account),'base64');
  const p=JSON.parse(decrypt(bytes,key));
  for(const file of [...p.database,...p.sources])assert.equal(hash(Buffer.from(file.base64,'base64')),file.sha256);
  const corrupt=Buffer.from(bytes);corrupt[corrupt.length-1]^=1;
  assert.throws(()=>decrypt(corrupt,key));
  if(process.argv[2]==='--extract'){
    const out=mkdtempSync('/private/tmp/qm-recovery-');
    for(const file of p.database){
      assert.ok(['schema.sql','data.sql','roles.sql','history_schema.sql','history_data.sql'].includes(file.name));
      writeFileSync(out+'/'+file.name,Buffer.from(file.base64,'base64'),{flag:'wx',mode:0o600});
    }
    for(const file of p.sources){
      assert.match(file.name,/^chapters\/0[1-7]\/(theory|solutions)\.pdf$/);
      const target=out+'/storage/qm-book-sources/'+file.name;
      mkdirSync(dirname(target),{recursive:true,mode:0o700});
      writeFileSync(target,Buffer.from(file.base64,'base64'),{flag:'wx',mode:0o600});
    }
    console.log(JSON.stringify({extractedTo:out,containsPrivateData:true,remoteRestorePerformed:false}));
  }
  console.log(JSON.stringify({verified:true,archive,archiveSha256:hash(bytes),databaseFiles:p.database.length,privateSources:p.sources.length,authenticatedEncryption:true,snapshotAt:p.snapshotAt}));
}else{
  assert.equal(process.argv[2],'--create','Choose --create, --verify or --extract');
  const snapshot='/private/tmp/qm-c33-backup.dXLQcr';
  const names=['schema.sql','data.sql','roles.sql','history_schema.sql','history_data.sql'];
  const database=names.map(name=>{const b=readFileSync(snapshot+'/'+name);return {name,sha256:hash(b),base64:b.toString('base64')};});
  let token=process.env.SUPABASE_ACCESS_TOKEN;
  if(!token)for(const a of ['access-token','supabase']){try{token=keychainRead('Supabase CLI',a);break;}catch{}}
  assert.ok(token,'Supabase CLI credential unavailable');
  if(token.startsWith('go-keyring-base64:'))token=Buffer.from(token.slice(18),'base64').toString();
  async function mg(path,body){const r=await fetch('https://api.supabase.com/v1/projects/'+ref+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});assert.ok(r.ok,'Management HTTP '+r.status);return r.json();}
  const project=await mg('');assert.equal(project.name,'quantum_rebuild');assert.equal(project.organization_id,'farevhlbtnmkuewoxhry');
  const rows=await mg('/database/query',{query:'select storage_path,sha256,byte_size from public.qm_book_sources where is_active order by storage_path',read_only:true});assert.equal(rows.length,14);
  const keys=await mg('/api-keys?reveal=true'),secret=keys.find(k=>k.name==='service_role')?.api_key;assert.ok(secret);
  const sources=[];
  for(const row of rows){
    assert.match(row.storage_path,/^chapters\/0[1-7]\/(theory|solutions)\.pdf$/);
    const r=await fetch('https://'+ref+'.supabase.co/storage/v1/object/authenticated/qm-book-sources/'+row.storage_path,{headers:{apikey:secret,Authorization:'Bearer '+secret},signal:AbortSignal.timeout(30000)});assert.equal(r.status,200);
    const b=Buffer.from(await r.arrayBuffer());assert.equal(b.length,Number(row.byte_size));assert.equal(hash(b),row.sha256);
    sources.push({name:row.storage_path,sha256:row.sha256,base64:b.toString('base64')});
  }
  const payload=Buffer.from(JSON.stringify({format:'qm-recovery-v1',projectRef:ref,createdAt:new Date().toISOString(),snapshotAt:statSync(snapshot+'/data.sql').mtime.toISOString(),database,sources}));
  const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from('QMBK01'));
  const ciphertext=Buffer.concat([cipher.update(gzipSync(payload)),cipher.final()]);
  const bytes=Buffer.concat([Buffer.from('QMBK01'),iv,cipher.getAuthTag(),ciphertext]);
  assert.equal(hash(decrypt(bytes,key)),hash(payload));
  // The credential is passed on stdin, never through process arguments/logs.
  const input='add-generic-password -s "'+service+'" -a "'+account+'" -w "'+key.toString('base64')+'"\n';
  try{execFileSync('/usr/bin/security',['-i'],{input,stdio:['pipe','pipe','pipe']});}catch{throw new Error('Unable to save archive key in Keychain');}
  assert.equal(keychainRead(service,account),key.toString('base64'));
  mkdirSync(destination,{recursive:true,mode:0o700});writeFileSync(archive,bytes,{mode:0o600,flag:'wx'});
  console.log(JSON.stringify({created:true,archive,archiveSha256:hash(bytes),databaseFiles:database.length,privateSources:sources.length,keychainService:service,keychainAccount:account,offsiteCopy:false}));
}
