import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ITEM_SET_VERSION, getQuiz, grade, publicQuiz, publicQuestion, questionById, catalogContractRows, chapterCoverage } from '../lib/qm-chapter-quiz-catalog.mjs';
import { deriveChapterMastery, deriveConceptStates, selectDailyChapter } from '../lib/qm-adaptive-engine.mjs';
import { handleQmChapterQuiz } from '../lib/qm-chapter-quiz-handler.mjs';
import { handleQmAdaptiveLearning } from '../lib/qm-adaptive-learning-handler.mjs';
const ids = ['01','02','03','04','05','06','07'];
const manifest = JSON.parse(readFileSync(new URL('../data/qm-exercise-source-manifest.json', import.meta.url)));
const env = { PUBLIC_SUPABASE_URL:'https://fixture.invalid', PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture-public', SUPABASE_SECRET_KEY:'fixture-private' };
const headers = { authorization:'Bearer fixture-session' };
const uuid = '11111111-1111-4111-8111-111111111111';
const json = (value, status=200) => new Response(JSON.stringify(value), {status});
const answers = quiz => quiz.questions.map(q => ({questionId:q.questionId, choice:q.correct, confidence:'high'}));
const progress = ids.flatMap(id => getQuiz(id).questions.map(q => ({chapter_id:id, item_id:q.reviewItem, status:'completed'})));
const at = '2026-10-17T15:00:00Z';

test('all 84 questions have stable balanced keys, faithful metadata and an exactly graded displayed map', () => {
  const rows = catalogContractRows();
  assert.equal(new Set(rows.map(row => row.questionId)).size, 84);
  for (const id of ids) {
    const original = getQuiz(id);
    const retry = getQuiz(id, {retryConceptIds:original.questions.map(q=>q.conceptId)});
    for (const quiz of [original, retry]) {
      const counts = 'abcd'.split('').map(key=>quiz.questions.filter(q=>q.correct===key).length);
      assert.deepEqual([...counts].sort(), [1,1,2,2]);
      assert.equal(new Set(quiz.questions.map(q=>q.conceptId)).size, 6);
      assert.equal(grade(quiz, answers(quiz)).score, 100);
      assert.ok(grade(quiz, quiz.questions.map(q=>({questionId:q.questionId,choice:'a'}))).score < 100);
      assert.doesNotMatch(JSON.stringify(publicQuiz(quiz)), /"correct"|"explanation"|"hintLadder"|"retry"\s*:\s*\{|optionSlots/);
      for (const q of quiz.questions) {
        assert.deepEqual(questionById(q.questionId), q);
        assert.equal(Object.keys(q.options).join(''), 'abcd');
        assert.equal(new Set(Object.values(q.options)).size, 4);
        const source = manifest.entries.find(entry=>entry.sectionId===q.reviewItem);
        assert.equal(source.needsReview, false);
        assert.equal(source.pagePath, q.reviewPath);
        assert.ok(source.canonicalReference.references.some(ref=>ref.id===q.sourceId));
        for (const key of 'abcd') assert.equal(grade({questions:[q]}, [{questionId:q.questionId,choice:key}]).correctCount, Number(key===q.correct));
      }
    }
    original.questions.forEach((q,i)=>assert.notEqual(q.prompt, retry.questions[i].prompt));
  }
  assert.equal(getQuiz('08'), null);
});

test('perfect delayed performance on every sampled concept still cannot certify a partially covered chapter', () => {
  const history = ids.flatMap(id => getQuiz(id).questions.flatMap(q => [
    {concept_id:q.conceptId, correct:true, session_id:'one', representation:'conceptual_recognition', occurred_at:'2026-10-10T10:00:00Z'},
    {concept_id:q.conceptId, correct:true, session_id:'two', representation:'relation_transfer', occurred_at:'2026-10-12T10:00:00Z'}
  ]));
  const states = deriveConceptStates(history, at);
  for (const chapter of deriveChapterMastery(states)) {
    assert.equal(chapter.status, 'insufficient_evidence');
    assert.equal(chapter.coverage_status, 'partial');
    assert.equal(chapter.assessed_concepts, 6);
    assert.ok(chapter.required_concepts > 6);
    assert.ok(chapterCoverage(chapter.chapter_id).unassessedConceptIds.length > 0);
  }
});

test('later weak chapter outranks first eligible chapter and only completed reviewed sections are selected', () => {
  const concept = getQuiz('07').questions[0].conceptId;
  const plan = selectDailyChapter({progress, generatedAt:at, conceptStates:[{concept_id:concept,status:'needs_review',evidence_count:1}]});
  assert.equal(plan.chapterId, '07');
  assert.equal(plan.questions.length, 3);
  assert.equal(new Set(plan.questions.map(q=>q.conceptId)).size, 3);
  assert.ok(plan.questions.every(q=>q.chapterId==='07'));
  assert.equal(selectDailyChapter({progress:[{chapter_id:'08',item_id:'8.1',status:'completed'}]}), null);
  assert.equal(selectDailyChapter({progress:progress.map(row=>({...row,status:'in_progress'}))}), null);
});

test('daily ties rotate, and seven separate practice sessions override a persistently weak chapter', () => {
  const visited = new Set();
  for (let day=10;day<17;day++) visited.add(selectDailyChapter({progress,generatedAt:`2026-10-${day}T15:00:00Z`}).chapterId);
  assert.equal(visited.size, 7);
  const question = getQuiz('01').questions[0];
  const attemptItems = Array.from({length:7}, (_,i)=>({question_id:question.questionId, session_id:'s'+i, occurred_at:`2026-10-${10+i}T15:00:00Z`}));
  const plan = selectDailyChapter({progress,generatedAt:at,attemptItems,conceptStates:[{concept_id:question.conceptId,status:'needs_review'}]});
  assert.notEqual(plan.chapterId, '01');
  assert.match(plan.questions[0].selection_reason,/seven sessions/);
  // Multiple items from a session are not counted as additional sessions.
  assert.equal(selectDailyChapter({progress,generatedAt:at,attemptItems:attemptItems.map(x=>({...x,session_id:'one'})),conceptStates:[{concept_id:question.conceptId,status:'needs_review'}]}).chapterId,'01');
});

test('mastered concepts still receive maintenance when due and review priority after a new error', () => {
  const q=getQuiz('06').questions[0];
  const state={concept_id:q.conceptId,status:'mastered',evidence_count:2,delayed_retrieval:true,due_at:'2026-10-16T10:00:00Z'};
  const plan=selectDailyChapter({progress,generatedAt:at,conceptStates:[state]});
  assert.equal(plan.chapterId,'06');
  assert.match(plan.questions.find(x=>x.conceptId===q.conceptId).selection_reason,/maintenance/);
  const error=selectDailyChapter({progress,generatedAt:at,conceptStates:[{...state,last_outcome:'needs_review',due_at:'2026-11-01T10:00:00Z'}]});
  assert.equal(error.chapterId,'06');
  assert.match(error.questions.find(x=>x.conceptId===q.conceptId).selection_reason,/recent error/);
});

test('stale assessment and daily option versions fail before storage', async () => {
  for (const version of [undefined,'qm-reviewed-question-set-2026-09-26.1']) {
    const fetchImpl = async url => {assert.match(url,/auth\/v1\/user$/);return json({id:uuid});};
    const body = {chapterId:'01', itemSetVersion:version, sessionId:uuid,idempotencyKey:uuid,answers:answers(getQuiz('01'))};
    assert.equal((await handleQmChapterQuiz({method:'POST',headers,body,env,fetchImpl})).status,409);
    assert.equal((await handleQmAdaptiveLearning({method:'POST',headers,body:{...body,action:'submit_daily',issueId:uuid},env,fetchImpl})).status,409);
  }
});

test('daily handler ranks globally, keeps an existing issued set and returns no answer key', async () => {
  const q = getQuiz('07').questions[0];
  let requestedChapter;
  const issue = {id:uuid,chapter_id:'02',item_ids:getQuiz('02').questions.slice(0,3).map(q=>q.questionId),issued_at:at,policy_version:'fixture'};
  const result = await handleQmAdaptiveLearning({method:'GET',headers,env,fetchImpl:async (url,options)=>{
    if(url.endsWith('/user')) return json({id:uuid});
    if(url.endsWith('/read_qm_learning_snapshot')) return json({progress,generated_at:at,attempt_items:[{concept_id:q.conceptId,correct:false,occurred_at:at}]});
    assert.ok(url.endsWith('/issue_qm_daily_challenge'));
    requestedChapter=JSON.parse(options.body).p_chapter_id;
    return json(issue);
  }});
  assert.equal(requestedChapter,'07');
  assert.equal(result.status,200);
  assert.equal(result.body.challenge.chapterId,'02');
  assert.equal(result.body.challenge.itemSetVersion,ITEM_SET_VERSION);
  assert.deepEqual(result.body.challenge.questions.map(q=>q.questionId),issue.item_ids);
  assert.doesNotMatch(JSON.stringify(result.body),/"correct"|"hintLadder"|"explanation"/);
});

test('daily grading maps the displayed options, binds the owner and fails safely on storage errors', async () => {
  const questions=getQuiz('05').questions.slice(0,3);
  const entries=answers({questions}); entries[1].choice='abcd'.split('').find(x=>x!==questions[1].correct);
  for(const fail of [false,true]) {
    const result=await handleQmAdaptiveLearning({method:'POST',headers,env,body:{action:'submit_daily',issueId:uuid,sessionId:uuid,idempotencyKey:uuid,itemSetVersion:ITEM_SET_VERSION,answers:entries,user_id:'forged'},fetchImpl:async(url,options)=>{
      if(url.endsWith('/user')) return json({id:uuid});
      if(url.includes('qm_learning_activity_issues?')) {assert.ok(url.includes('user_id=eq.'+uuid));return json([{id:uuid,chapter_id:'05',item_ids:questions.map(q=>q.questionId),issued_at:at}]);}
      const body=JSON.parse(options.body);
      assert.equal(body.p_user_id,uuid);assert.deepEqual(body.p_evidence.map(e=>e.correct),[true,false,true]);
      assert.equal(body.p_item_set_version,ITEM_SET_VERSION);
      return fail?json({message:'private database error'},500):json({attempt_id:uuid,xp_delta:0});
    }});
    assert.equal(result.status,fail?503:200);
    assert.doesNotMatch(JSON.stringify(result.body),/private database error/);
  }
});

test('SQL upgrade matches catalogue identities and reviewed chapter coverage, without editing history', () => {
  const graph=JSON.parse(readFileSync(new URL('../data/qm-learning-concept-graph.v1.json',import.meta.url)));
  for (const id of ids) assert.deepEqual(graph.assessmentCoverage[id],chapterCoverage(id).assessedConceptIds);
  const sql=readFileSync(new URL('../supabase/migrations/20261018005852_qm_checkpoint_coverage_and_mastery_guard.sql',import.meta.url),'utf8');
  const baseline=readFileSync(new URL('../supabase/migrations/20260926120250_qm_adaptive_learning_modes.sql',import.meta.url),'utf8');
  for(const row of catalogContractRows()) {
    const historicalPath = row.questionId.startsWith('qm-05-radial') ? 'slides/chapter-05/hydrogen-atom-radial-solution-and-probability.html' : row.contentId;
    assert.ok((baseline+sql).includes([row.questionId,row.chapterId,row.conceptId,row.sourceId,historicalPath,row.representation,row.mode].map(x=>"'"+x+"'").join(',')));
  }
  assert.match(sql,/set content_id='slides\/chapter-05\/hydrogen-atom-and-effective-potential.html'/);
  for(const id of ids) assert.ok(sql.includes(`when '${id}' then ${chapterCoverage(id).requiredConceptIds.length}`));
  assert.ok(sql.includes(ITEM_SET_VERSION));
  assert.doesNotMatch(sql,/v_mastered=3|security definer|update public.qm_learning_ledger|delete from public.qm_learning/);
  assert.match(sql,/from public,anon,authenticated/);
  assert.match(sql,/to service_role/);
});
