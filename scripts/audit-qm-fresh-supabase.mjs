// Explicit managed-service verification for the authorized empty replacement.
// Never loads .env.local (it may still point at the paused historical project).
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const ref='crasnnvdvujzxudmbakv', org='farevhlbtnmkuewoxhry';
const mode=process.argv[2];
assert.ok(['--catalog','--sources','--disposable-flows'].includes(mode),'Choose explicit audit mode');
let token=process.env.SUPABASE_ACCESS_TOKEN;
if(!token) for(const account of ['access-token','supabase']) {
  try { token=execFileSync('/usr/bin/security',['find-generic-password','-s','Supabase CLI','-a',account,'-w'],{stdio:['ignore','pipe','ignore']}).toString().trim();break; } catch {}
}
assert.ok(token,'CLI credential unavailable');
if(token.startsWith('go-keyring-base64:')) token=Buffer.from(token.slice(18),'base64').toString();
async function management(path,body) {
  const r=await fetch('https://api.supabase.com/v1/projects/'+ref+path,{
    method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});
  assert.ok(r.ok,`Management ${path.split('?')[0]} HTTP ${r.status}`);
  return r.json();
}
const project=await management('');
assert.equal(project.id,ref);assert.equal(project.organization_id,org);
assert.equal(project.name,'quantum_rebuild');assert.equal(project.status,'ACTIVE_HEALTHY');
const query=sql=>management('/database/query',{query:sql,read_only:true});
const literal=s=>"'"+String(s).replaceAll("'","''")+"'";
const history=await query('select version,name from supabase_migrations.schema_migrations order by version');
assert.ok(history.some(x=>x.version==='20260926204825'&&x.name==='qm_clean_baseline'),'Fresh baseline history missing');
const contract=JSON.parse(readFileSync(new URL('../data/qm-supabase-access-contract.json',import.meta.url)));
if(mode==='--catalog') {
  const roles=['anon','authenticated','service_role'];
  const assertions=[];
  for(const t of contract.tables) {
    assertions.push(`select ${literal(t.name+'/rls')} as label, relrowsecurity=${t.rls} as ok from pg_class where oid=${literal(t.name)}::regclass`);
    for(const role of roles) for(const privilege of ['select','insert','update','delete','truncate','references','trigger'])
      assertions.push(`select ${literal(t.name+'/'+role+'/'+privilege)} as label,has_table_privilege(${literal(role)},${literal(t.name)},${literal(privilege)})=${Boolean(t.roles[role]?.includes(privilege))} as ok`);
  }
  for(const f of contract.functions) for(const role of roles) {
    const [schema,name]=f.name.split('.');
    assertions.push(`select ${literal(f.name+'/'+role)} as label,coalesce(bool_and(has_function_privilege(${literal(role)},p.oid,'execute')=${Boolean(f.roles[role]?.includes('execute'))}),false) as ok from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname=${literal(schema)} and p.proname=${literal(name)}`);
  }
  for(const s of contract.sequences) for(const role of roles) for(const priv of ['usage','select','update'])
    assertions.push(`select ${literal(s.name+'/'+role+'/'+priv)} as label,has_sequence_privilege(${literal(role)},${literal(s.name)},${literal(priv)})=${Boolean(s.roles[role]?.includes(priv))} as ok`);
  const rows=await query(assertions.join('\nunion all\n'));
  const failures=rows.filter(r=>r.ok!==true);
  console.log(JSON.stringify({projectRef:ref,history,catalogChecks:rows.length,failures}));
  assert.equal(failures.length,0,'Managed privilege/RLS mismatch');
  const advisors=await management('/advisors/security');
  console.log(JSON.stringify({securityAdvisors:(advisors.lints||[]).map(x=>({name:x.name,level:x.level,object:x.metadata?.name}))}));
  const counts=await query("select (select count(*) from auth.users) as users,(select count(*) from public.qm_learning_ledger) as ledger_rows,(select count(*) from public.qm_book_sources) as book_sources,(select count(*) from storage.objects) as storage_objects");
  console.log(JSON.stringify({ok:true,counts}));
} else if(mode==='--sources') {
  const rows=await query("select source_key,chapter_id,storage_path,sha256,byte_size,pdf_page_count from public.qm_book_sources where is_active order by source_key");
  assert.equal(rows.length,14);
  assert.deepEqual([...new Set(rows.map(r=>r.chapter_id))].sort(),['01','02','03','04','05','06','07']);
  const bucket=await query("select public from storage.buckets where id='qm-book-sources'");
  assert.equal(bucket[0].public,false);
  const keys=await management('/api-keys?reveal=true');
  const secret=keys.find(k=>k.name==='service_role')?.api_key;
  const pub=keys.find(k=>k.name==='anon')?.api_key;
  assert.ok(secret&&pub);
  let bytes=0;
  for(const row of rows) {
    assert.match(row.storage_path,/^chapters\/0[1-7]\/(theory|solutions)\.pdf$/);
    const r=await fetch('https://'+ref+'.supabase.co/storage/v1/object/authenticated/qm-book-sources/'+row.storage_path,{
      headers:{apikey:secret,Authorization:'Bearer '+secret},signal:AbortSignal.timeout(30000)});
    assert.equal(r.status,200,'Server source read');
    const data=Buffer.from(await r.arrayBuffer());bytes+=data.length;
    assert.equal(data.length,Number(row.byte_size));assert.equal(createHash('sha256').update(data).digest('hex'),row.sha256);
    assert.equal(data.subarray(0,5).toString(),'%PDF-');
    const denied=await fetch('https://'+ref+'.supabase.co/storage/v1/object/public/qm-book-sources/'+row.storage_path,{signal:AbortSignal.timeout(30000)});
    assert.ok([400,403,404].includes(denied.status),'Private source reachable publicly');await denied.body?.cancel();
  }
  const anon=await fetch('https://'+ref+'.supabase.co/rest/v1/qm_book_sources?select=source_key',{headers:{apikey:pub,Authorization:'Bearer '+pub},signal:AbortSignal.timeout(30000)});
  assert.ok([401,403].includes(anon.status));await anon.body?.cancel();
  console.log(JSON.stringify({ok:true,projectRef:ref,privateSources:rows.length,byteAndSha256Verified:true,bytes,publicDownloadsDenied:true,anonymousMetadataDenied:true,pageCountsPresent:rows.every(r=>Number(r.pdf_page_count)>0)}));
} else {
  const authConfig=await management('/config/auth');
  assert.equal(authConfig.external_email_enabled,true,
    'Password-session fixtures are unavailable on the Google-only release target. Use an isolated test backend; never re-enable email/password on the release target just for this audit.');
  // Mutating mode allows only the expected single Google owner account and
  // snapshots affected table counts. Only IDs created by this run are deleted;
  // no broad cleanup or provider-email call.
  const before=await query("select (select count(*) from auth.users) as users,(select count(*) from auth.identities where provider='google') as google_identities,(select count(*) from auth.identities) as identities");
  assert.equal(Number(before[0].users),1,'Disposable audit expects exactly the existing owner account');
  assert.equal(Number(before[0].google_identities),1,'Disposable audit expects the existing Google owner identity');
  assert.equal(Number(before[0].identities),1,'Disposable audit refuses any unexpected identity');
  const baseline=await query("select (select count(*) from auth.users) as users,(select count(*) from auth.identities) as identities,(select count(*) from public.qm_study_progress) as study_progress,(select count(*) from public.qm_simulator_activity) as simulator_activity,(select count(*) from public.qm_gamification_profiles) as profiles,(select count(*) from public.qm_gamification_events) as gamification_events,(select count(*) from public.qm_learning_ledger) as ledger,(select count(*) from public.qm_learning_attempts) as attempts,(select count(*) from public.qm_learning_attempt_items) as attempt_items,(select count(*) from public.qm_learning_activity_issues) as issues,(select count(*) from public.qm_learning_remediation_cycles) as reviews,(select count(*) from public.qm_learning_badges) as badges,(select count(*) from public.qm_learning_mechanic_events) as mechanic_events,(select count(*) from public.qm_simulator_learning_events) as simulator_events,(select count(*) from public.qm_learning_communication_events) as communication_events");
  const keys=await management('/api-keys?reveal=true');
  const pub=keys.find(k=>k.name==='anon')?.api_key;
  const secret=keys.find(k=>k.name==='service_role')?.api_key;
  assert.ok(pub&&secret,'Legacy gateway keys required for this audit; no keys printed');
  const base='https://'+ref+'.supabase.co',created=[],sessions=[];
  const h=(jwt=secret)=>({apikey:jwt===secret?secret:pub,Authorization:'Bearer '+jwt,'Content-Type':'application/json'});
  async function req(path,{jwt=secret,method='GET',body,allowed=[200,201,204]}={}) {
    const r=await fetch(base+path,{method,headers:h(jwt),body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
    const data=await r.json().catch(()=>null);
    // Never echo arbitrary provider error bodies, account data or tokens.
    assert.ok(allowed.includes(r.status),`${method} ${path.split('?')[0]} HTTP ${r.status}; code ${/^[A-Z0-9_]+$/.test(data?.code||'')?data.code:'unavailable'}`);
    return data;
  }
  const rpc=(name,body,jwt=secret,allowed)=>req('/rest/v1/rpc/'+name,{method:'POST',body,jwt,allowed});
  let complete=false;
  try {
    for(let i=0;i<2;i++) {
      const email='qm-c33-'+randomUUID()+'@example.invalid',password='Qm!'+randomUUID()+'Aa9';
      const user=await req('/auth/v1/admin/users',{method:'POST',body:{email,password,email_confirm:true,user_metadata:{admin:true}}});
      assert.ok(user.id);created.push(user.id);
      const session=await req('/auth/v1/token?grant_type=password',{jwt:pub,method:'POST',body:{email,password}});
      assert.ok(session.access_token);sessions.push(session.access_token);
    }
    const [user,other]=created,[a,b]=sessions;
    const previewDeployment=String(process.env.QM_C33_PREVIEW_DEPLOYMENT||'').trim();
    if(previewDeployment) {
      const preview=spawnSync('npx',['--offline','vercel','curl','/api/qm-learning-profile','--deployment',previewDeployment,'--','--header','@-'],{
        input:'Authorization: Bearer '+a+'\n',encoding:'utf8',maxBuffer:2*1024*1024
      });
      assert.ok(!preview.error&&preview.status===0,'Authenticated Vercel Preview request failed');
      assert.ok((preview.stdout||'').includes('"profile_version":"learning-profile-v1"'),'Preview did not return an authenticated learning profile');
    }
    await req('/rest/v1/qm_book_sources?select=source_key',{jwt:a,allowed:[403]});
    await req('/storage/v1/object/authenticated/qm-book-sources/chapters/01/theory.pdf',{jwt:a,allowed:[400,403,404]});
    const section='slides/chapter-01/why-old-quantum-physics-matters.html';
    await req('/rest/v1/qm_study_progress',{jwt:a,method:'POST',body:{user_id:user,chapter_id:'01',item_id:'1.1',page_path:section,page_title:'Disposable C33 fixture',status:'completed',completed_at:new Date().toISOString()}});
    await req('/rest/v1/qm_study_progress',{jwt:b,method:'POST',body:{user_id:user,chapter_id:'01',item_id:'1.2',page_path:section,status:'completed'},allowed:[403]});
    assert.deepEqual(await req('/rest/v1/qm_study_progress?user_id=eq.'+user,{jwt:b}),[]);
    await req('/rest/v1/qm_simulator_activity',{jwt:a,method:'POST',body:{user_id:user,simulator_path:'simulators/infinite-well.html',simulator_slug:'infinite-well'}});
    assert.deepEqual(await req('/rest/v1/qm_simulator_activity?user_id=eq.'+user,{jwt:b}),[]);
    const reward={p_user_id:user,p_idempotency_key:'section:01:1.1:'+section,p_chapter_id:'01',p_item_id:'1.1',p_page_path:section};
    for(const jwt of [pub,a,b]) await rpc('record_qm_section_completion_reward',reward,jwt,[401,403]);
    const awards=await Promise.all(Array.from({length:12},()=>rpc('record_qm_section_completion_reward',reward)));
    assert.equal(awards.filter(r=>r?.[0]?.awarded===true).length,1);
    const evidence=[{questionId:'qm-01-wave-benchmark',correct:true,confidence:'high'},{questionId:'qm-01-photoelectric',correct:false,confidence:'high'},{questionId:'qm-01-de-broglie',correct:true,confidence:'medium'}];
    const assessment={p_user_id:user,p_idempotency_key:randomUUID(),p_activity_type:'assessment',p_chapter_id:'01',p_session_id:randomUUID(),p_item_set_version:'qm-reviewed-question-set-2026-09-26.1',p_evidence:evidence,p_issue_id:null,p_remediation_cycle_id:null};
    const result=await rpc('record_qm_learning_activity',assessment);
    assert.equal(result.score,67);assert.equal(result.xp_delta,30);assert.equal(result.mastery_status,'insufficient_evidence');
    assert.equal((await rpc('record_qm_learning_activity',assessment)).deduped,true);
    const review=await rpc('complete_qm_learning_review',{p_user_id:user,p_cycle_id:result.remediation_cycle_id,
      p_idempotency_key:'review:'+result.remediation_cycle_id,p_highest_hint_level:4,p_solution_revealed:true});
    assert.equal(review.xp_delta,10);
    const retry=await rpc('record_qm_learning_activity',{...assessment,p_idempotency_key:randomUUID(),p_session_id:randomUUID(),
      p_activity_type:'retry',p_remediation_cycle_id:result.remediation_cycle_id,
      p_evidence:[{questionId:'qm-01-photoelectric-transfer',correct:true,confidence:'medium'}]});
    assert.equal(retry.xp_delta,10);assert.equal(retry.mastery_status,'insufficient_evidence');
    const dailyRequest={p_user_id:user,p_idempotency_key:'daily:'+new Date().toISOString().slice(0,10),p_chapter_id:'01',p_question_ids:evidence.map(e=>e.questionId)};
    // Merely opening/unstudied sections must not unlock a Daily Challenge.
    await rpc('issue_qm_daily_challenge',dailyRequest,secret,[400]);
    for(const [item,slug] of [['1.2','wave-optics-classical-benchmark'],['1.6','photoelectric-effect'],['1.11','de-broglie-hypothesis']])
      await req('/rest/v1/qm_study_progress',{jwt:a,method:'POST',body:{user_id:user,chapter_id:'01',item_id:item,
        page_path:'slides/chapter-01/'+slug+'.html',page_title:'Disposable daily fixture',status:'completed',completed_at:new Date().toISOString()}});
    const dailyIssue=await rpc('issue_qm_daily_challenge',dailyRequest);
    assert.equal(dailyIssue.item_ids.length,3);
    const daily=await rpc('record_qm_learning_activity',{...assessment,p_idempotency_key:randomUUID(),p_session_id:randomUUID(),
      p_activity_type:'daily_challenge',p_issue_id:dailyIssue.id,p_evidence:evidence.map(e=>({...e,correct:true}))});
    assert.equal(daily.xp_delta,0);
    const simulatorId=randomUUID();
    for(const [stage,response,count] of [['prediction_recorded','higher',0],['meaningful_interaction',null,2],
      ['reflection_recorded','qualitative_match',2],['goal_completed',null,2]])
      await rpc('record_qm_simulator_learning_stage',{p_user_id:user,p_activity_id:simulatorId,p_simulator_slug:'infinite-well',
        p_stage:stage,p_response_code:response,p_interaction_count:count,p_idempotency_key:randomUUID()});
    const communication=await rpc('reserve_qm_learning_message',{p_user_id:user,p_message_kind:'due_review',
      p_context_id:'wave-model',p_content_id:section,p_reason_code:'spaced_retrieval_due',p_idempotency_key:randomUUID()});
    assert.equal(communication.allowed,false);assert.equal(communication.reason,'not_opted_in');
    for(const jwt of [pub,a]) await rpc('read_qm_learning_snapshot',{p_user_id:user},jwt,[401,403]);
    const snapshot=await rpc('read_qm_learning_snapshot',{p_user_id:user});
    assert.equal(snapshot.ledger_xp,70);assert.equal(snapshot.rewards.xp_total,70);assert.equal(snapshot.simulators.length,1);
    assert.equal(snapshot.simulator_learning.length,4);
    assert.deepEqual(await req('/rest/v1/qm_learning_attempts?user_id=eq.'+user,{jwt:b}),[]);
    assert.deepEqual(await req('/rest/v1/qm_gamification_profiles?user_id=eq.'+user,{jwt:b}),[]);
    await req('/rest/v1/qm_gamification_profiles?user_id=eq.'+user,{jwt:a,method:'PATCH',body:{xp_total:1000},allowed:[403]});
    await req('/rest/v1/qm_learning_ledger?user_id=eq.'+user,{method:'PATCH',body:{xp_delta:1000},allowed:[403]});
    await rpc('read_qm_learning_evaluation_summary',{},a,[403]);
    const evaluation=await rpc('read_qm_learning_evaluation_summary',{});
    assert.ok(evaluation&&typeof evaluation==='object');
    complete=true;
  } finally {
    const cleanup=[];
    for(const jwt of sessions) {try{await req('/auth/v1/logout?scope=global',{jwt,method:'POST',allowed:[204]});}catch{cleanup.push('session revocation failed');}}
    for(const id of created) {try{await req('/auth/v1/admin/users/'+encodeURIComponent(id),{method:'DELETE',allowed:[200]});}catch{cleanup.push('fixture account deletion failed');}}
    const after=await query("select (select count(*) from auth.users) as users,(select count(*) from auth.identities) as identities,(select count(*) from public.qm_study_progress) as study_progress,(select count(*) from public.qm_simulator_activity) as simulator_activity,(select count(*) from public.qm_gamification_profiles) as profiles,(select count(*) from public.qm_gamification_events) as gamification_events,(select count(*) from public.qm_learning_ledger) as ledger,(select count(*) from public.qm_learning_attempts) as attempts,(select count(*) from public.qm_learning_attempt_items) as attempt_items,(select count(*) from public.qm_learning_activity_issues) as issues,(select count(*) from public.qm_learning_remediation_cycles) as reviews,(select count(*) from public.qm_learning_badges) as badges,(select count(*) from public.qm_learning_mechanic_events) as mechanic_events,(select count(*) from public.qm_simulator_learning_events) as simulator_events,(select count(*) from public.qm_learning_communication_events) as communication_events");
    assert.equal(cleanup.length,0,cleanup.join('; '));
    assert.deepEqual(after[0],baseline[0],'Fixture cleanup changed pre-existing Auth or learning rows');
    console.log(JSON.stringify({projectRef:ref,complete,cleanupVerified:true,disposableUsers:created.length,
      previewAuthenticatedProfile:!!process.env.QM_C33_PREVIEW_DEPLOYMENT,
      scope:'Managed Auth password sessions, PostgREST RLS, concurrent rewards, assessment/review/retry, studied-only Daily, simulator cycle, email no-consent denial, optional authenticated Vercel Preview profile; Google OAuth was verified separately'}));
  }
}
