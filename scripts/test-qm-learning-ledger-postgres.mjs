// Explicit local test runner, never connects to Supabase or reads credentials.
// Requires the named --network none disposable PostgreSQL container.
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync, execFile } from "node:child_process";
import { promisify } from "node:util";
import assert from "node:assert/strict";
import { fileURLToPath } from 'node:url';
const container = "qm-c29-disposable-20260926";
const database = "qm_c29_" + Date.now();
const fresh = process.argv.includes('--fresh-baseline');
const root = new URL("../", import.meta.url);
const args = db => ["exec", "-i", container, "psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", db];
const sql = text => execFileSync("docker", args(database), { input: text, encoding: "utf8", stdio: ["pipe","pipe","pipe"] }).trim();
const denied = text => assert.throws(() => sql(text), /permission denied|append-only/);
const isolation = JSON.parse(execFileSync("docker", ["inspect", container], { encoding: "utf8" }))[0];
assert.equal(isolation.HostConfig.NetworkMode, "none", "Test database must have no network");
assert.equal(Object.keys(isolation.HostConfig.PortBindings || {}).length, 0, "No published ports allowed");
execFileSync("docker", args("postgres"), { input: `create database ${database};`, stdio: "pipe" });
sql(`do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
do $$ begin create role service_role bypassrls; exception when duplicate_object then null; end $$;
create schema auth; create schema storage;
create table auth.users(id uuid primary key,email text,raw_app_meta_data jsonb,raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth,public to anon,authenticated,service_role;
grant select on auth.users to authenticated,service_role;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
if(!fresh) sql('create function public.rls_auto_enable() returns event_trigger language plpgsql as $$ begin return; end $$;');
const migrationPath = fresh ? 'supabase/fresh/supabase/migrations/' : 'supabase/migrations/';
if(fresh) execFileSync(process.execPath,[fileURLToPath(new URL('scripts/build-qm-fresh-baseline.mjs',root))],{stdio:'pipe'});
for (const file of readdirSync(new URL(migrationPath, root)).filter(f => f.endsWith(".sql")).sort()) {
  try {
    const migration=readFileSync(new URL(migrationPath + file, root), "utf8");
    sql(fresh ? `begin;\n${migration}\ncommit;` : migration);
  }
  catch (error) { throw new Error(`SQL replay failed: ${file}: ${error.stderr}`); }
}
const access = JSON.parse(readFileSync(new URL("data/qm-supabase-access-contract.json",root)));
for (const table of access.tables) for (const role of ["anon","authenticated","service_role"]) {
  for (const privilege of ["select","insert","update","delete","truncate","references","trigger"]) {
    assert.equal(sql(`select has_table_privilege('${role}','${table.name}','${privilege}');`),
      table.roles[role]?.includes(privilege) ? "t" : "f", `${table.name}/${role}/${privilege}`);
  }
}
for (const fn of access.functions) for (const role of ["anon","authenticated","service_role"]) {
  const [schema,name]=fn.name.split(".");
  assert.equal(sql(`select bool_and(has_function_privilege('${role}',p.oid,'execute')) from pg_proc p
    join pg_namespace n on p.pronamespace=n.oid where n.nspname='${schema}' and p.proname='${name}';`),
    fn.roles[role]?.includes("execute") ? "t" : "f",`${fn.name}/${role}`);
}
const user = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
const legacy = "10000000-0000-4000-8000-000000000003";
const weekly = "10000000-0000-4000-8000-000000000004";
const timezone = "10000000-0000-4000-8000-000000000005";
const section = "slides/chapter-01/why-old-quantum-physics-matters.html";
const second = "slides/chapter-01/wave-optics.html";
const call = (u = user, p = section, item = "1.1") => `select awarded from public.record_qm_section_completion_reward('${u}','section:01:${item}:${p}','01','${item}','${p}');`;
sql(`insert into auth.users(id,email,raw_user_meta_data) values
  ('${user}','fixture1@example.invalid','{}'),
  ('${other}','marioreis@id.uff.br','{"admin":true}'),
  ('${legacy}','fixture3@example.invalid','{}'),
  ('${weekly}','fixture4@example.invalid','{}'),
  ('${timezone}','fixture5@example.invalid','{}');`);
assert.throws(() => sql(`set role service_role; ${call()}`), /Persisted completion/);
sql(`insert into public.qm_study_progress(user_id,chapter_id,item_id,page_path,page_title,status,completed_at) values('${user}','01','1.1','${section}','Fixture','completed',now()),('${legacy}','01','1.1','${section}','Fixture','completed',now());`);
// Real simultaneous sessions: 12 requests, only one award.
const run = promisify(execFile);
const results = await Promise.all(Array.from({length:12}, () => run("docker", [...args(database),"-c",`set role service_role; ${call()}`])));
assert.equal(results.filter(r => r.stdout.trim() === "t").length,1);
assert.equal(sql(`select xp_total || ':' || studied_items_count from public.qm_gamification_profiles where user_id='${user}'`),"20:1");
assert.equal(sql(`select count(*) from public.qm_learning_ledger where user_id='${user}'`),"1");
sql(`update public.qm_study_progress set status='in_progress',completed_at=null where user_id='${user}';`);
assert.throws(() => sql(`set role service_role; ${call()}`), /Persisted completion/);
sql(`update public.qm_study_progress set status='completed',completed_at=now() where user_id='${user}';`);
assert.equal(sql(`set role service_role; ${call()}`),"f");
assert.throws(() => sql(`set role service_role; ${call(user,second,"1.2")}`), /not reviewed|Persisted completion/);
denied(`set role anon; select * from public.qm_learning_ledger;`);
denied(`set role authenticated; ${call()}`);
denied(`set role authenticated; select public.read_qm_learning_snapshot('${other}');`);
assert.equal(sql(`set role authenticated; set request.jwt.claim.sub='${user}'; select count(*) from public.qm_learning_ledger;`),"1");
assert.equal(sql(`set role authenticated; set request.jwt.claim.sub='${other}'; select count(*) from public.qm_learning_ledger;`),"0");
denied(`set role authenticated; update public.qm_gamification_profiles set xp_total=1000;`);
denied(`set role authenticated; insert into public.qm_learning_ledger(user_id) values('${user}');`);
denied(`set role anon; select public.read_qm_learning_snapshot('${user}');`);
denied(`set role authenticated; select * from private.qm_reviewed_learning_sections;`);
denied(`set role service_role; update public.qm_learning_ledger set xp_delta=1000;`);
denied(`update public.qm_learning_ledger set xp_delta=1000;`);
denied(`delete from public.qm_learning_ledger;`);
denied(`set role service_role; truncate public.qm_learning_ledger;`);
denied(`truncate public.qm_learning_ledger;`);
// Historical import is dry-run-first/operator-only and does not change XP.
sql(`insert into public.qm_gamification_profiles(user_id,xp_total,studied_items_count) values('${legacy}',20,1);
insert into public.qm_gamification_events(user_id,event_type,idempotency_key,chapter_id,item_id,page_path,xp_delta)
 values('${legacy}','section_completed','section:01:1.1:${section}','01','1.1','${section}',20);`);
assert.throws(() => sql(`set role service_role; ${call(legacy)}`),/require reconciliation/);
denied(`set role service_role; select public.reconcile_qm_legacy_rewards('${legacy}',1,20);`);
assert.throws(() => sql(`select public.reconcile_qm_legacy_rewards('${legacy}',2,40)`),/mismatch/);
assert.equal(sql(`select public.reconcile_qm_legacy_rewards('${legacy}',1,20)`),"1");
assert.equal(sql(`select public.reconcile_qm_legacy_rewards('${legacy}',1,20)`),"0");
assert.equal(sql(`set role service_role; ${call(legacy)}`),"f");
sql(`set role service_role; insert into public.qm_chapter_quiz_attempts(user_id,quiz_key,chapter_id,answers,feedback,score,correct_count,question_count)
select '${user}','fixture-quiz','01','[]','[]',100,1,1 from generate_series(1,25);`);
const snapshot = JSON.parse(sql(`set role service_role; select public.read_qm_learning_snapshot('${user}');`));
assert.equal(snapshot.assessments.total,25);
assert.equal(snapshot.ledger_xp,20);
assert.equal(snapshot.ledger_sections,1);
assert.equal(snapshot.unreconciled_rewards,0);
assert.ok(!JSON.stringify(snapshot).includes("answers"));
// C30 deliberately retires the legacy trigger. Old direct inserts remain counted
// as legacy history but never become new points or mastery evidence.
assert.equal(sql(`select count(*) from public.qm_learning_ledger where user_id='${user}' and event_type='assessment_completed'`),"0");

const session = "20000000-0000-4000-8000-000000000001";
const assessmentKey = "30000000-0000-4000-8000-000000000001";
const assessmentEvidence = JSON.stringify([
  {questionId:"qm-01-wave-benchmark",correct:true,confidence:"high"},
  {questionId:"qm-01-photoelectric",correct:false,confidence:"high"},
  {questionId:"qm-01-de-broglie",correct:true,confidence:"medium"}
]).replaceAll("'","''");
const assessment = JSON.parse(sql(`set role service_role; select public.record_qm_learning_activity('${user}','${assessmentKey}',
  'assessment','01','${session}','qm-reviewed-question-set-2026-09-26.1','${assessmentEvidence}'::jsonb,null,null);`));
assert.equal(assessment.score,67);
assert.equal(assessment.xp_delta,30);
assert.equal(assessment.mastery_status,"insufficient_evidence");
assert.ok(assessment.remediation_cycle_id);
const duplicate = JSON.parse(sql(`set role service_role; select public.record_qm_learning_activity('${user}','${assessmentKey}',
  'assessment','01','${session}','qm-reviewed-question-set-2026-09-26.1','${assessmentEvidence}'::jsonb,null,null);`));
assert.equal(duplicate.deduped,true);
assert.equal(sql(`select xp_total from public.qm_gamification_profiles where user_id='${user}'`),"50");
const review = JSON.parse(sql(`set role service_role; select public.complete_qm_learning_review('${user}',
  '${assessment.remediation_cycle_id}','review:${assessment.remediation_cycle_id}',4,true);`));
assert.equal(review.xp_delta,10);
const retryEvidence = JSON.stringify([{questionId:"qm-01-photoelectric-transfer",correct:true,confidence:"medium"}]).replaceAll("'","''");
const retry = JSON.parse(sql(`set role service_role; select public.record_qm_learning_activity('${user}',
  '30000000-0000-4000-8000-000000000002','retry','01','20000000-0000-4000-8000-000000000002',
  'qm-reviewed-question-set-2026-09-26.1','${retryEvidence}'::jsonb,null,'${assessment.remediation_cycle_id}');`));
assert.equal(retry.xp_delta,10);
assert.equal(retry.mastery_status,"insufficient_evidence");
assert.equal(sql(`select xp_total from public.qm_gamification_profiles where user_id='${user}'`),"70");

// The second same-day review is valid learning activity but earns no reward;
// its retry inherits that ineligibility. This proves the São Paulo local-day
// cap without treating a missed or extra practice opportunity as a penalty.
const secondAssessment = JSON.parse(sql(`set role service_role; select public.record_qm_learning_activity('${user}',
  '30000000-0000-4000-8000-000000000004','assessment','02','20000000-0000-4000-8000-000000000004',
  'qm-reviewed-question-set-2026-09-26.1','${JSON.stringify([
    {questionId:"qm-02-schrodinger",correct:true,confidence:"medium"},
    {questionId:"qm-02-probability",correct:false,confidence:"high"},
    {questionId:"qm-02-infinite-well",correct:true,confidence:"medium"}
  ]).replaceAll("'","''")}'::jsonb,null,null);`));
assert.equal(secondAssessment.xp_delta,30);
const cappedReview = JSON.parse(sql(`set role service_role; select public.complete_qm_learning_review('${user}',
  '${secondAssessment.remediation_cycle_id}','review:${secondAssessment.remediation_cycle_id}',2,false);`));
assert.equal(cappedReview.xp_delta,0);
assert.equal(cappedReview.reward_eligible,false);
const cappedRetryEvidence = JSON.stringify([{questionId:"qm-02-probability-transfer",correct:true,confidence:"medium"}]).replaceAll("'","''");
const cappedRetry = JSON.parse(sql(`set role service_role; select public.record_qm_learning_activity('${user}',
  '30000000-0000-4000-8000-000000000005','retry','02','20000000-0000-4000-8000-000000000005',
  'qm-reviewed-question-set-2026-09-26.1','${cappedRetryEvidence}'::jsonb,null,'${secondAssessment.remediation_cycle_id}');`));
assert.equal(cappedRetry.xp_delta,0);
assert.equal(sql(`select xp_total from public.qm_gamification_profiles where user_id='${user}'`),"100");

// A reward at 23:59 on the previous São Paulo calendar day must not consume
// today's cap even when both timestamps can fall on the same UTC date.
sql(`insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,activity_id,
  idempotency_key,policy_version,evidence,xp_delta) values('${timezone}','assessment_reviewed',
  ((((current_timestamp at time zone 'America/Sao_Paulo')::date-1)::timestamp+interval '23 hours 59 minutes') at time zone 'America/Sao_Paulo'),
  'guided-review:03','03','60000000-0000-4000-8000-000000000001','fixture:timezone:yesterday',
  'qm-learning-policy-2026-09-25.1','{"fixture":"timezone_boundary"}',0);`);
const timezoneEvidence = JSON.stringify([
  {questionId:"qm-03-spin",correct:true,confidence:"medium"},
  {questionId:"qm-03-dirac",correct:false,confidence:"high"},
  {questionId:"qm-03-hermitian",correct:true,confidence:"medium"}
]).replaceAll("'","''");
const timezoneAssessment = JSON.parse(sql(`set role service_role; select public.record_qm_learning_activity('${timezone}',
  '30000000-0000-4000-8000-000000000006','assessment','03','20000000-0000-4000-8000-000000000006',
  'qm-reviewed-question-set-2026-09-26.1','${timezoneEvidence}'::jsonb,null,null);`));
const timezoneReview = JSON.parse(sql(`set role service_role; select public.complete_qm_learning_review('${timezone}',
  '${timezoneAssessment.remediation_cycle_id}','review:${timezoneAssessment.remediation_cycle_id}',2,false);`));
assert.equal(timezoneReview.xp_delta,10);

// Two rewarded reviews in the preceding seven days consume the per-chapter
// rolling cap even though neither consumes today's local-day cap.
sql(`insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,activity_id,
  idempotency_key,policy_version,evidence,xp_delta) values
  ('${weekly}','assessment_reviewed',now()-interval '2 days','guided-review:04','04',
    '60000000-0000-4000-8000-000000000002','fixture:weekly:one','qm-learning-policy-2026-09-25.1','{"fixture":"weekly_cap"}',0),
  ('${weekly}','assessment_reviewed',now()-interval '4 days','guided-review:04','04',
    '60000000-0000-4000-8000-000000000003','fixture:weekly:two','qm-learning-policy-2026-09-25.1','{"fixture":"weekly_cap"}',0);`);
const weeklyEvidence = JSON.stringify([
  {questionId:"qm-04-hermite",correct:true,confidence:"medium"},
  {questionId:"qm-04-finite-well",correct:false,confidence:"high"},
  {questionId:"qm-04-tunneling",correct:true,confidence:"medium"}
]).replaceAll("'","''");
const weeklyAssessment = JSON.parse(sql(`set role service_role; select public.record_qm_learning_activity('${weekly}',
  '30000000-0000-4000-8000-000000000007','assessment','04','20000000-0000-4000-8000-000000000007',
  'qm-reviewed-question-set-2026-09-26.1','${weeklyEvidence}'::jsonb,null,null);`));
const weeklyReview = JSON.parse(sql(`set role service_role; select public.complete_qm_learning_review('${weekly}',
  '${weeklyAssessment.remediation_cycle_id}','review:${weeklyAssessment.remediation_cycle_id}',2,false);`));
assert.equal(weeklyReview.xp_delta,0);
assert.equal(weeklyReview.reward_eligible,false);

sql(`insert into public.qm_study_progress(user_id,chapter_id,item_id,page_path,page_title,status,completed_at) values
  ('${user}','01','1.2','slides/chapter-01/wave-optics-classical-benchmark.html','Fixture','completed',now()),
  ('${user}','01','1.6','slides/chapter-01/photoelectric-effect.html','Fixture','completed',now()),
  ('${user}','01','1.11','slides/chapter-01/de-broglie-hypothesis.html','Fixture','completed',now());`);
const issue = JSON.parse(sql(`set role service_role; select public.issue_qm_daily_challenge('${user}','daily:2026-09-26','01',
  array['qm-01-wave-benchmark','qm-01-photoelectric','qm-01-de-broglie']);`));
assert.equal(issue.item_ids.length,3);
const dailyEvidence = JSON.stringify([
  {questionId:"qm-01-wave-benchmark",correct:true,confidence:"high"},
  {questionId:"qm-01-photoelectric",correct:true,confidence:"medium"},
  {questionId:"qm-01-de-broglie",correct:true,confidence:"low"}
]).replaceAll("'","''");
const daily = JSON.parse(sql(`set role service_role; select public.record_qm_learning_activity('${user}',
  '30000000-0000-4000-8000-000000000003','daily_challenge','01','20000000-0000-4000-8000-000000000003',
  'qm-reviewed-question-set-2026-09-26.1','${dailyEvidence}'::jsonb,'${issue.id}',null);`));
assert.equal(daily.xp_delta,0);
assert.equal(sql(`select xp_total from public.qm_gamification_profiles where user_id='${user}'`),"100");

const simulatorActivity = "40000000-0000-4000-8000-000000000001";
for (const [index,stage,responseCode,count] of [
  [1,"prediction_recorded","higher",0],[2,"meaningful_interaction",null,2],
  [3,"reflection_recorded","qualitative_match",2],[4,"goal_completed",null,2]
]) {
  sql(`set role service_role; select public.record_qm_simulator_learning_stage('${user}','${simulatorActivity}',
    'infinite-well','${stage}',${responseCode ? `'${responseCode}'` : "null"},${count},'50000000-0000-4000-8000-00000000000${index}');`);
}
assert.equal(sql(`select count(*) from public.qm_simulator_learning_events where user_id='${user}' and activity_id='${simulatorActivity}'`),"4");
assert.equal(sql(`select count(*) from public.qm_learning_ledger where user_id='${user}' and event_type like 'simulator_%' and xp_delta=0`),"4");
assert.equal(sql(`set role authenticated; set request.jwt.claim.sub='${user}'; select count(*) from public.qm_learning_attempts;`),"5");
assert.equal(sql(`set role authenticated; set request.jwt.claim.sub='${other}'; select count(*) from public.qm_learning_attempts;`),"0");
assert.equal(sql(`set role authenticated; set request.jwt.claim.sub='${user}'; select count(*) from public.qm_simulator_learning_events;`),"4");
assert.equal(sql(`set role authenticated; set request.jwt.claim.sub='${other}'; select count(*) from public.qm_simulator_learning_events;`),"0");
denied(`set role authenticated; insert into public.qm_learning_attempts(user_id) values('${user}');`);
denied(`set role service_role; update public.qm_learning_attempts set score=100;`);
// A fault after the legacy insert must roll back that event AND the projection.
sql(`insert into public.qm_study_progress(user_id,chapter_id,item_id,page_path,page_title,status,completed_at)
values('${other}','01','1.1','${section}','Rollback fixture','completed',now());
create function public.c29_fault_fixture() returns trigger language plpgsql as $$ begin raise exception 'synthetic ledger fault'; end $$;
create trigger c29_fault_fixture before insert on public.qm_learning_ledger for each row execute function public.c29_fault_fixture();`);
assert.throws(()=>sql(`set role service_role; ${call(other)}`),/synthetic ledger fault/);
assert.equal(sql(`select count(*) from public.qm_gamification_events where user_id='${other}'`),"0");
assert.equal(sql(`select count(*) from public.qm_gamification_profiles where user_id='${other}'`),"0");
sql(`drop trigger c29_fault_fixture on public.qm_learning_ledger; drop function public.c29_fault_fixture();`);
// Privacy deletion is an explicit exception; normal deletion is prohibited.
// C33: execute C32 SQL, not just text assertions. All identities are synthetic.
const commUser = "70000000-0000-4000-8000-000000000001";
sql(`insert into auth.users(id,email) values('${commUser}','communication@example.invalid');
insert into public.qm_user_legal_preferences(user_id,email_updates_opted_in,email_updates_opted_in_at,
  learning_email_consent_version,timezone,terms_version,terms_accepted_at,privacy_version,privacy_acknowledged_at)
values('${commUser}',true,'2026-09-20T10:00:00Z','qm-learning-email-consent-2026-09-26.1',
  'America/Sao_Paulo','2026-08-13',now(),'2026-08-13',now());`);
const reserve = (key, now = "2026-09-26T15:00:00Z", content = section) =>
  `select public.reserve_qm_learning_message('${commUser}','due_review','wave-model','${content}',
  'spaced_retrieval_due','${key}','${now}');`;
denied(`set role anon; ${reserve("anon")}`);
denied(`set role authenticated; set request.jwt.claim.sub='${commUser}'; ${reserve("own")}`);
for (const role of ["anon", "authenticated"]) {
  denied(`set role ${role}; select public.read_qm_learning_evaluation_summary();`);
  denied(`set role ${role}; select * from public.qm_learning_communication_events;`);
}
assert.equal(JSON.parse(sql(`set role service_role; ${reserve("quiet","2026-09-26T02:00:00Z")}`)).reason,"quiet_hours");
assert.equal(JSON.parse(sql(`set role service_role; ${reserve("locked","2026-09-26T15:00:00Z","slides/chapter-08/locked.html")}`)).reason,"unreviewed_or_invalid_content");
sql(`update public.qm_user_legal_preferences set learning_email_paused=true where user_id='${commUser}';`);
assert.equal(JSON.parse(sql(`set role service_role; ${reserve("paused")}`)).reason,"paused");
sql(`update public.qm_user_legal_preferences set learning_email_paused=false,timezone='Invalid/Zone' where user_id='${commUser}';`);
assert.equal(JSON.parse(sql(`set role service_role; ${reserve("zone")}`)).reason,"unknown_timezone");
sql(`update public.qm_user_legal_preferences set timezone='America/Sao_Paulo' where user_id='${commUser}';`);
const competing = await Promise.all(Array.from({length:12},(_,i)=>run("docker",[...args(database),"-c",`set role service_role; ${reserve("race:"+i)}`])));
const reservations = competing.map(r=>JSON.parse(r.stdout.trim()));
assert.equal(reservations.filter(r=>r.allowed && !r.deduped).length,1);
assert.equal(reservations.filter(r=>r.reason==="daily_cap").length,11);
const winningKey = `race:${reservations.findIndex(r=>r.allowed)}`;
assert.equal(JSON.parse(sql(`set role service_role; ${reserve(winningKey)}`)).deduped,true);
assert.equal(JSON.parse(sql(`set role service_role; ${reserve("next-day","2026-09-27T15:00:00Z")}`)).allowed,true);
assert.equal(JSON.parse(sql(`set role service_role; ${reserve("third-day","2026-09-28T15:00:00Z")}`)).reason,"rolling_cap");
sql(`update public.qm_user_legal_preferences set email_updates_opted_in=false where user_id='${commUser}';`);
assert.equal(JSON.parse(sql(`set role service_role; ${reserve("after-optout","2026-10-05T15:00:00Z")}`)).reason,"not_opted_in");
denied(`set role service_role; update public.qm_learning_communication_events set event_type='sent';`);
denied(`set role service_role; delete from public.qm_learning_communication_events;`);
sql(`set role service_role;
insert into public.qm_learning_communication_events(user_id,event_type,message_kind,context_id,content_id,reason_code,idempotency_key,policy_version)
values('${commUser}','sent','due_review','wave-model','${section}','spaced_retrieval_due','fixture:sent','qm-learning-policy-2026-09-25.1'),
('${commUser}','delivered','due_review','wave-model','${section}','spaced_retrieval_due','fixture:delivered','qm-learning-policy-2026-09-25.1');
select public.record_qm_mechanic_fidelity('${commUser}','recommendation','exposed','wave-model','fixture:exposed');`);
const summary = JSON.parse(sql(`set role service_role; select public.read_qm_learning_evaluation_summary();`));
assert.equal(summary.communication_eligible,2);
assert.equal(summary.communication_sent,1);
assert.equal(summary.communication_delivered,1);
assert.equal(summary.mechanic_exposed,1);
assert.equal('communication_exposed' in summary,false);
sql(`delete from auth.users where id='${commUser}';`);
assert.equal(sql(`select count(*) from public.qm_learning_communication_events where user_id='${commUser}'`),"0");
sql(`delete from auth.users where id='${user}';`);
assert.equal(sql(`select count(*) from public.qm_learning_ledger where user_id='${user}'`),"0");
console.log(JSON.stringify({ok:true,database,freshBaseline:fresh,optionalHelperStub:!fresh,tablePrivilegeChecks:access.tables.length*21,functionPrivilegeChecks:access.functions.length*3,
  parallelRequests:12,awards:1,legacyAttempts:25,adaptiveAssessment:true,guidedReview:true,focusedRetry:true,dailyChallenge:true,
  sameDayRewardCap:true,timeZoneBoundary:true,rollingSevenDayCap:true,crossUserIsolation:true,
  simulatorCycle:true,masteryGuard:true,rollbackProven:true,
  c32SqlReplay:true,communicationCapsAndConcurrency:true,communicationOptOut:true,
  communicationPrivacyErasure:true,academicReportExecuted:true,
  scope:"isolated PostgreSQL; synthetic auth/storage; not Supabase CLI reset or production"}));
