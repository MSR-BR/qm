// Isolated Chrome only: real browser/client/handlers, synthetic identity and RPCs.
// PostgreSQL contracts are exercised separately by test-qm-learning-ledger-postgres.
import assert from 'node:assert/strict';
import { getQuiz, ITEM_SET_VERSION } from '../lib/qm-chapter-quiz-catalog.mjs';
import { handleQmChapterQuiz } from '../lib/qm-chapter-quiz-handler.mjs';
import { handleQmAdaptiveLearning } from '../lib/qm-adaptive-learning-handler.mjs';

export async function checkLearningBrowser(client, baseUrl) {
  assert.ok(['127.0.0.1','localhost'].includes(baseUrl.hostname), 'Synthetic learning tests are local only');
  const id='11111111-1111-4111-8111-111111111111';
  const env={PUBLIC_SUPABASE_URL:'https://fixture.invalid',PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture',SUPABASE_SECRET_KEY:'fixture'};
  const calls=[]; let issue=null; let failStorage=false; let stale=false;
  const json=(x,status=200)=>new Response(JSON.stringify(x),{status});
  const q1=getQuiz('01'); const retryQuiz=getQuiz('01',{retryConceptIds:[q1.questions[0].conceptId]});
  const fixture=async(url,options={})=>{
    if(url.endsWith('/user'))return json({id});
    const body=options.body?JSON.parse(options.body):{};
    if(url.endsWith('/read_qm_learning_snapshot'))return json({generated_at:'2026-10-17T15:00:00Z',attempt_items:[],progress:q1.questions.map(q=>({chapter_id:'01',item_id:q.reviewItem,status:'completed'}))});
    if(url.endsWith('/issue_qm_daily_challenge')) {issue={id,chapter_id:body.p_chapter_id,item_ids:body.p_question_ids,issued_at:'2026-10-17T15:00:00Z'};return json(issue);}
    if(url.includes('qm_learning_activity_issues?'))return json([issue]);
    if(url.includes('qm_learning_remediation_cycles?'))return json([{id,chapter_id:'01',concept_ids:[q1.questions[0].conceptId],review_completed_at:'2026-10-17T15:00:00Z'}]);
    if(url.endsWith('/complete_qm_learning_review'))return json({xp_delta:10});
    if(url.endsWith('/record_qm_daily_help'))return json({ok:true});
    if(url.endsWith('/record_qm_learning_activity')) {calls.push(body);return failStorage?json({message:'private fixture failure'},500):json({attempt_id:id,remediation_cycle_id:body.p_activity_type==='assessment'?id:null,xp_delta:body.p_activity_type==='daily_challenge'?0:10});}
    throw new Error('Unexpected synthetic endpoint '+new URL(url).pathname);
  };
  const failures=[];
  await client.send('Fetch.enable',{patterns:[{urlPattern:baseUrl.origin+'/api/qm-chapter-quiz*'},{urlPattern:baseUrl.origin+'/api/qm-adaptive-learning*'}]});
  client.on('Fetch.requestPaused',async event=>{
    try {
      const url=new URL(event.request.url);
      const body=JSON.parse(event.request.postData||'{}');
      if(stale && body.answers)body.itemSetVersion='obsolete';
      const handler=url.pathname.endsWith('qm-chapter-quiz')?handleQmChapterQuiz:handleQmAdaptiveLearning;
      const result=await handler({method:event.request.method,headers:event.request.headers,body,query:Object.fromEntries(url.searchParams),env,fetchImpl:fixture});
      await client.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:result.status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(result.body)).toString('base64')});
    } catch(error) {failures.push(error.message);await client.send('Fetch.failRequest',{requestId:event.requestId,errorReason:'Failed'});}
  });
  const evaluate=async expression=>{
    const r=await client.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);
    return r.result?.value;
  };
  const wait=async expression=>{
    for(let n=0;n<80;n++){if(await evaluate(expression))return;await new Promise(resolve=>setTimeout(resolve,100));}
    throw new Error('Browser condition failed: '+expression);
  };
  const open=async path=>{
    await client.send('Page.navigate',{url:new URL(path,baseUrl).href});
    await wait("document.readyState==='complete'");
    await evaluate(`window.TermoAuth={whenReady:async()=>true,getSession:async()=>({access_token:'synthetic-only'}),openModal(){}};document.querySelector('[data-qm-analytics-consent="denied"]')?.click()`);
  };
  const fill=async(quiz,wrong=false)=>evaluate(`(()=>{const questions=${JSON.stringify(quiz.questions.map(q=>({id:q.questionId,key:q.correct})))};questions.forEach((q,i)=>{const key=${wrong}&&i===0?'abcd'.split('').find(k=>k!==q.key):q.key;document.querySelector('input[name="'+q.id+'"][value="'+key+'"]').checked=true;document.querySelector('select[name="confidence:'+q.id+'"]').value='high'});document.querySelector('form').requestSubmit()})()`);
  const results=[];
  await client.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await open('/assessments.html');
  await evaluate("document.querySelector('#load').click()");
  await wait("document.querySelectorAll('.assessment-question').length===6");
  assert.match(await evaluate("document.querySelector('.assessment-coverage').textContent"),/6 of 9/);
  assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  await fill(q1,true);await wait("document.querySelector('#resultTitle')?.textContent==='83%'");
  assert.equal(calls.at(-1).p_item_set_version,ITEM_SET_VERSION);
  assert.equal(calls.at(-1).p_evidence.filter(e=>e.correct).length,5);
  results.push({name:'six-item-assessment-mobile',result:'83%, five of six correctly graded; partial coverage visible'});
  await evaluate("document.querySelector('#completeReview').click()");
  await wait("document.querySelector('#quizTitle')?.textContent.includes('focused retry')");
  await fill(retryQuiz);await wait("document.querySelector('#resultTitle')?.textContent==='100%'");
  results.push({name:'guided-review-changed-retry',result:'one changed-form item; 100%'});
  await open('/assessments.html');await evaluate("document.querySelector('#load').click()");
  await wait("document.querySelectorAll('.assessment-question').length===6");
  stale=true;await fill(q1);await wait("document.querySelector('#assessmentStatus')?.textContent.includes('Reload')");stale=false;
  failStorage=true;await fill(q1);await wait("document.querySelector('#assessmentStatus')?.textContent.includes('could not') || document.querySelector('#assessmentStatus')?.textContent.includes('Could not')");failStorage=false;
  assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"),false);
  results.push({name:'assessment-stale-and-storage-errors',result:'visible reload/retry messages; submit re-enabled'});
  await open('/daily-challenge.html');await evaluate("document.querySelector('#loadChallenge').click()");
  await wait("document.querySelectorAll('.assessment-question').length===3");
  await evaluate("document.querySelector('[data-hint]').click()");
  await wait("document.querySelector('[data-hint-copy]')?.textContent.includes('Orienting')");
  const daily=getQuiz('01');daily.questions=issue.item_ids.map(id=>q1.questions.find(q=>q.questionId===id)||getQuiz('01',{retryConceptIds:q1.questions.map(q=>q.conceptId)}).questions.find(q=>q.questionId===id));
  await fill(daily);await wait("document.querySelector('.assessment-result')?.textContent.includes('Daily Challenge awards no extra points')");
  assert.equal(calls.at(-1).p_activity_type,'daily_challenge');assert.equal(calls.at(-1).p_item_set_version,ITEM_SET_VERSION);
  results.push({name:'daily-three-items-hint-submit',result:'three items, hint, correct version, result and zero extra points'});
  assert.deepEqual(failures,[]);
  await client.send('Fetch.disable');
  return results;
}
