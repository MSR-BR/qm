import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { handleQmLearningProfile, buildLearningProfile } from "../lib/qm-learning-profile-handler.mjs";
import { planLedgerImport } from "../lib/qm-ledger-reconciliation.mjs";
const userId = "10000000-0000-4000-8000-000000000001";
const path = "slides/chapter-01/why-old-quantum-physics-matters.html";
const env = { PUBLIC_SUPABASE_URL:"https://fixture.invalid",PUBLIC_SUPABASE_PUBLISHABLE_KEY:"public-fixture",SUPABASE_SECRET_KEY:"private-fixture" };
const json = (value,status=200) => new Response(JSON.stringify(value),{status});
const snapshot = () => ({ generated_at:"2026-09-26T12:00:00Z",progress:[{chapter_id:"01",item_id:"1.1",page_path:path,status:"completed",last_opened_at:"2026-09-26T12:00:00Z"}],
  rewards:{xp_total:20,level:1,current_streak:3,best_streak:3,studied_items_count:1,last_active_on:"2026-09-20"},
  ledger_xp:20,ledger_sections:1,unreconciled_rewards:0,assessments:{total:25,best_score:100},simulators:[{slug:"double-slit",page_path:"simulators/classical.html?sim=double-slit"},{slug:"double-slit",page_path:"simulators/classical.html?sim=double-slit"},{slug:"forged",page_path:"forged"}] });

test("profile binds verified identity, has no targeting/admin bypass and strips private fields", async () => {
  let calls = [];
  const fetchImpl = async (url,options) => { calls.push([url,options]); return url.endsWith("/user") ? json({id:userId,email:"do-not-leak",user_metadata:{admin:true}}) : json(snapshot()); };
  assert.equal((await handleQmLearningProfile({method:"GET",env,fetchImpl})).status,401);
  assert.equal((await handleQmLearningProfile({method:"POST",env,fetchImpl})).status,405);
  assert.equal((await handleQmLearningProfile({method:"GET",query:{user_id:"other"},headers:{authorization:"Bearer fixture"},env,fetchImpl})).status,400);
  assert.equal(calls.length,0);
  const result = await handleQmLearningProfile({method:"GET",headers:{authorization:"Bearer fixture"},env,fetchImpl});
  assert.equal(result.status,200);
  assert.deepEqual(JSON.parse(calls[1][1].body),{p_user_id:userId});
  assert.doesNotMatch(JSON.stringify(result),/private-fixture|do-not-leak|answers|feedback|user_id/);
});
test("one snapshot retains all-time counts and distinguishes behavior from mastery", () => {
  const profile = buildLearningProfile(snapshot());
  assert.equal(profile.assessments.total,25);
  assert.equal(profile.simulators.opened,1);
  assert.equal(profile.rewards.current_streak,0);
  assert.equal(profile.rewards.status,"available");
  assert.equal(profile.concepts.status,"insufficient_evidence");
  assert.equal(profile.due_reviews.status,"insufficient_evidence");
  assert.equal(profile.badges.status,"available");
  assert.equal(profile.missions.status,"available");
  assert.equal(profile.next_action.href,"/"+path);
  const oldSlug = snapshot(); oldSlug.simulators=[{slug:"finite",page_path:"simulators/chapter-04-labs.html?sim=finite"},{slug:"hydrogen-radial",page_path:"simulators/hydrogen-radial.html"}];
  assert.equal(buildLearningProfile(oldSlug).simulators.opened,2);
  const legacy = snapshot(); legacy.unreconciled_rewards=1;
  assert.equal(buildLearningProfile(legacy).rewards.status,"reconciliation_required");
  assert.equal(buildLearningProfile(legacy).rewards.xp_total,20);
  const forged = snapshot(); forged.progress[0].chapter_id="08";
  assert.equal(buildLearningProfile(forged).progress.completed,0);
});
test("canonical simulator paths stay aligned with the actual catalogue, independent of legacy slug", () => {
  const context={window:{__qmAnalyticsLoaderStarted:true},document:{readyState:"loading",addEventListener(){}}};
  vm.runInNewContext(readFileSync(new URL("../assets/qm-simulator-catalog.js",import.meta.url),"utf8"),context);
  const paths=JSON.parse(readFileSync(new URL("../data/qm-learning-simulator-paths.v1.json",import.meta.url)));
  assert.deepEqual(paths.simulators,JSON.parse(JSON.stringify(context.window.QMSimulatorCatalog.filter(s=>!s.standaloneUrl.startsWith("https:")).map(s=>({slug:s.slug,pagePath:s.standaloneUrl})))));
});
test("snapshot errors never become zero records and never leak provider errors", async () => {
  for (const response of [() => json({message:"secret db detail"},500),() => json({}),() => {throw Error("private detail");}]) {
    const result = await handleQmLearningProfile({method:"GET",headers:{authorization:"Bearer fixture"},env,fetchImpl:async url=>url.endsWith("/user")?json({id:userId}):response()});
    assert.equal(result.status,503);
    assert.equal(result.body.freshness.status,"unavailable");
    assert.equal(result.body.profile,undefined);
    assert.doesNotMatch(JSON.stringify(result),/secret|private detail/);
  }
});
test("historical planner is dry-run, preserves XP, blocks mismatches and never invents mastery", () => {
  const input={complete:true,profiles:[{user_id:userId,xp_total:20,level:1,studied_items_count:1}],
    rewardEvents:[{id:"reward1",user_id:userId,event_type:"section_completed",chapter_id:"01",item_id:"1.1",page_path:path,xp_delta:20}],ledger:[]};
  const original=structuredClone(input);
  const plan=planLedgerImport(input);
  assert.equal(plan.counts.eligible_imports,1);
  assert.equal(plan.remote_writes,false);
  assert.doesNotMatch(JSON.stringify(plan),new RegExp(userId));
  assert.deepEqual(input,original);
  input.profiles[0].xp_total=40;
  assert.equal(planLedgerImport(input).counts.blocked,1);
  input.profiles[0].xp_total=20; input.rewardEvents[0].chapter_id="08";
  assert.equal(planLedgerImport(input).counts.blocked,1);
  assert.throws(()=>planLedgerImport({...input,complete:false}));
});
test("browser consumes the authoritative snapshot and fails visibly instead of direct reward reads", async () => {
  const window={TermoAuth:{getSession:async()=>({access_token:"fixture"})},addEventListener(){}};
  const context={window,fetch:async()=>json({profile:buildLearningProfile(snapshot())})};
  vm.runInNewContext(readFileSync(new URL("../assets/qm-gamification.js",import.meta.url),"utf8"),context);
  assert.equal((await window.QMGamification.listProfile()).profile.xp_total,20);
  context.fetch=async()=>json({},503);
  assert.equal((await window.QMGamification.learningProfile()).ok,false);
  context.fetch=async()=>{
    window.TermoAuth.getSession=async()=>({access_token:"different-account"});
    return json({profile:buildLearningProfile(snapshot())});
  };
  assert.equal((await window.QMGamification.learningProfile()).reason,"session_changed");
});
test("SQL reviewed allowlist matches all C28 manifest identities and source IDs", () => {
  const manifest=JSON.parse(readFileSync(new URL("../data/qm-exercise-source-manifest.json",import.meta.url)));
  const sql=readFileSync(new URL("../supabase/migrations/20260926112057_qm_authoritative_learning_ledger.sql",import.meta.url),"utf8");
  for(const entry of manifest.entries) assert.ok(sql.includes(`('${entry.pagePath}','${entry.chapterId}','${entry.sectionId}',array[${entry.canonicalReference.references.map(r=>`'${r.id}'`).join(',')}])`));
  assert.equal((sql.match(/\(\x27slides\//g)||[]).length,85);
});
