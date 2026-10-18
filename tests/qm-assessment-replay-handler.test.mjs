import assert from 'node:assert/strict';
import test from 'node:test';
import { handleQmChapterQuiz } from '../lib/qm-chapter-quiz-handler.mjs';
import { getQuiz, ITEM_SET_VERSION } from '../lib/qm-chapter-quiz-catalog.mjs';

const cycleId = '11111111-1111-4111-8111-111111111111';
const env = { PUBLIC_SUPABASE_URL:'https://example.invalid', PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture', SUPABASE_SECRET_KEY:'fixture' };
const quiz = getQuiz('01',{retryConceptIds:['photoelectric-effect']});
function fixture({rpcOk=true, found=true}={}) {
  const calls=[];
  return { calls, fetchImpl: async (url,options={}) => {
    calls.push({url:String(url),body:options.body && JSON.parse(options.body)});
    const data=String(url).includes('/auth/v1/user') ? {id:'verified-learner'}
      : String(url).includes('qm_learning_remediation_cycles?') ? (found ? [{id:cycleId,chapter_id:'01',concept_ids:['photoelectric-effect'],review_completed_at:'2026-10-18',retry_attempt_id:'completed'}] : [])
      : {deduped:true,attempt_id:'completed',xp_delta:0,remediation_cycle_id:cycleId};
    return new Response(JSON.stringify(data),{status:!rpcOk && String(url).includes('/rpc/') ? 400 : 200});
  }};
}
const body={action:'retry',chapterId:'01',cycleId,itemSetVersion:ITEM_SET_VERSION,
  sessionId:'22222222-2222-4222-8222-222222222222', idempotencyKey:'33333333-3333-4333-8333-333333333333',
  answers:quiz.questions.map(q=>({questionId:q.questionId,choice:q.correct,confidence:'high'}))};
test('completed retry can recover an identical request through the atomic RPC',async()=>{
  const f=fixture();
  const r=await handleQmChapterQuiz({method:'POST',headers:{authorization:'Bearer fixture'},body,env,fetchImpl:f.fetchImpl});
  assert.equal(r.status,200); assert.equal(r.body.attempt.deduped,true); assert.equal(r.body.attempt.xp_delta,0);
  assert.match(f.calls[1].url,/user_id=eq.verified-learner/);
  assert.equal(f.calls[2].body.p_user_id,'verified-learner');
  assert.equal(f.calls[2].body.p_idempotency_key,body.idempotencyKey);
});
test('completed retry with a different request rejected by RPC is a conflict',async()=>{
  const f=fixture({rpcOk:false});
  const r=await handleQmChapterQuiz({method:'POST',headers:{authorization:'Bearer fixture'},body,env,fetchImpl:f.fetchImpl});
  assert.equal(r.status,409); assert.match(r.body.error,/already completed/);
});
test('another owner cannot recover the cycle and completed retry cannot be loaded anew',async()=>{
  const f=fixture({found:false});
  assert.equal((await handleQmChapterQuiz({method:'POST',headers:{authorization:'Bearer fixture'},body,env,fetchImpl:f.fetchImpl})).status,409);
  assert.equal(f.calls.length,2);
  const g=fixture();
  assert.equal((await handleQmChapterQuiz({method:'GET',headers:{authorization:'Bearer fixture'},query:{action:'retry',cycleId},env,fetchImpl:g.fetchImpl})).status,409);
  assert.equal(g.calls.length,2);
});
