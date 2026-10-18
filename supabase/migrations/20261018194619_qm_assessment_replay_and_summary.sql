-- C15-016/017: replay the same evidence and compare assessment-only scores.
-- No learner rows, points, thresholds or grants are broadened.
begin;

create or replace function public.record_qm_learning_activity(
  p_user_id uuid,p_idempotency_key text,p_activity_type text,p_chapter_id text,p_session_id uuid,
  p_item_set_version text,p_evidence jsonb,p_issue_id uuid default null,p_remediation_cycle_id uuid default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_attempt public.qm_learning_attempts%rowtype;
  v_issue public.qm_learning_activity_issues%rowtype;
  v_cycle public.qm_learning_remediation_cycles%rowtype;
  v_count integer; v_correct integer; v_score integer; v_xp integer := 0; v_mastery_xp integer := 0;
  v_content text; v_question_ids text[]; v_expected text[]; v_bad_concepts text[]; v_retry_ids text[];
  v_cycle_id uuid; v_profile jsonb; v_mastered integer; v_required integer; v_policy constant text := 'qm-learning-policy-2026-09-25.1';
begin
  if p_user_id is null or nullif(p_idempotency_key,'') is null or p_activity_type not in ('assessment','daily_challenge','retry')
    or p_chapter_id not in ('01','02','03','04','05','06','07') or p_session_id is null
    or p_item_set_version is distinct from 'qm-reviewed-question-set-2026-10-17.1' or jsonb_typeof(p_evidence)<>'array'
    or jsonb_array_length(p_evidence) not between 1 and 6 then
    raise exception using errcode='22023',message='Invalid learning attempt.';
  end if;
  insert into public.qm_gamification_profiles(user_id) values(p_user_id) on conflict do nothing;
  perform 1 from public.qm_gamification_profiles where user_id=p_user_id for update;
  select * into v_attempt from public.qm_learning_attempts where user_id=p_user_id and idempotency_key=p_idempotency_key;
  if found then
    -- Compare the immutable scored request, not a newly supplied result. This
    -- also prevents a retry key from being reused for another activity/user.
    if v_attempt.activity_type is distinct from p_activity_type
      or v_attempt.chapter_id is distinct from p_chapter_id
      or v_attempt.session_id is distinct from p_session_id
      or v_attempt.item_set_version is distinct from p_item_set_version
      or v_attempt.issue_id is distinct from p_issue_id
      or v_attempt.remediation_cycle_id is distinct from p_remediation_cycle_id
      or (select jsonb_agg(jsonb_build_object('questionId',i.question_id,'correct',i.correct,'confidence',i.confidence) order by i.question_id)
          from public.qm_learning_attempt_items i where i.attempt_id=v_attempt.id)
         is distinct from
         (select jsonb_agg(jsonb_build_object('questionId',e->>'questionId','correct',(e->>'correct')::boolean,
           'confidence',coalesce(e->>'confidence','unknown')) order by e->>'questionId') from jsonb_array_elements(p_evidence)e) then
      raise exception using errcode='22023',message='Idempotency key belongs to a different learning request.';
    end if;
    select c.id into v_cycle_id from public.qm_learning_remediation_cycles c
      where c.user_id=p_user_id and c.source_attempt_id=v_attempt.id;
    return jsonb_build_object('deduped',true,'attempt_id',v_attempt.id,'score',v_attempt.score,
      'correct_count',v_attempt.correct_count,'question_count',v_attempt.question_count,'xp_delta',0,
      'remediation_cycle_id',coalesce(v_cycle_id,v_attempt.remediation_cycle_id));
  end if;
  if exists(select 1 from public.qm_gamification_events e where e.user_id=p_user_id
    and not exists(select 1 from public.qm_learning_ledger l where l.legacy_reward_id=e.id))
    or (select xp_total from public.qm_gamification_profiles where user_id=p_user_id)
      <> (select coalesce(sum(xp_delta),0) from public.qm_learning_ledger where user_id=p_user_id) then
    raise exception using errcode='55000',message='Historical rewards require reconciliation.';
  end if;
  select array_agg(e->>'questionId' order by e->>'questionId'),count(*),
    count(*) filter(where jsonb_typeof(e->'correct')='boolean'),
    count(*) filter(where (e->>'correct')::boolean)
    into v_question_ids,v_count,v_mastered,v_correct from jsonb_array_elements(p_evidence) e;
  if v_count<>v_mastered or v_count<>(select count(distinct e->>'questionId') from jsonb_array_elements(p_evidence)e)
    or exists(select 1 from jsonb_array_elements(p_evidence)e where coalesce(e->>'confidence','unknown') not in ('unknown','low','medium','high')) then
    raise exception using errcode='22023',message='Invalid bounded evidence.';
  end if;
  if p_activity_type='assessment' then
    select array_agg(question_id order by question_id) into v_expected from private.qm_learning_question_contracts
      where chapter_id=p_chapter_id and mode='assessment';
  elsif p_activity_type='daily_challenge' then
    select * into v_issue from public.qm_learning_activity_issues where id=p_issue_id and user_id=p_user_id for update;
    if not found or v_issue.completed_at is not null or v_issue.expires_at<now() then
      raise exception using errcode='22023',message='Daily Challenge is unavailable.';
    end if;
    select array_agg(x order by x) into v_expected from unnest(v_issue.item_ids)x;
  else
    select * into v_cycle from public.qm_learning_remediation_cycles where id=p_remediation_cycle_id and user_id=p_user_id for update;
    if not found or v_cycle.review_completed_at is null or v_cycle.retry_attempt_id is not null then
      raise exception using errcode='22023',message='Guided review is required before retry.';
    end if;
    select array_agg(x order by x) into v_expected from unnest(v_cycle.retry_question_ids)x;
  end if;
  if v_question_ids is distinct from v_expected or exists(select 1 from unnest(v_question_ids) id
    where not exists(select 1 from private.qm_learning_question_contracts q where q.question_id=id and q.chapter_id=p_chapter_id)) then
    raise exception using errcode='22023',message='Attempt items do not match the issued reviewed set.';
  end if;
  select q.content_id into v_content from private.qm_learning_question_contracts q where q.question_id=v_question_ids[1];
  v_score := round(100.0*v_correct/v_count);
  if p_activity_type='assessment' and not exists(select 1 from public.qm_learning_ledger
    where user_id=p_user_id and event_type='assessment_completed' and chapter_id=p_chapter_id and xp_delta>0) then v_xp:=30;
  elsif p_activity_type='retry' and v_cycle.reward_eligible then v_xp:=10; end if;
  insert into public.qm_learning_attempts(user_id,activity_type,chapter_id,session_id,issue_id,remediation_cycle_id,
    item_set_version,idempotency_key,score,correct_count,question_count,policy_version)
    values(p_user_id,p_activity_type,p_chapter_id,p_session_id,p_issue_id,p_remediation_cycle_id,
      p_item_set_version,p_idempotency_key,v_score,v_correct,v_count,v_policy) returning * into v_attempt;
  insert into public.qm_learning_attempt_items(user_id,attempt_id,question_id,concept_id,source_id,content_id,
    representation,correct,confidence,hint_level,solution_revealed,session_id,occurred_at)
  select p_user_id,v_attempt.id,q.question_id,q.concept_id,q.source_id,q.content_id,q.representation,
    (e->>'correct')::boolean,coalesce(e->>'confidence','unknown'),
    case when p_activity_type='daily_challenge' then coalesce((v_issue.help_state->q.question_id->>'hint_level')::integer,0) else 0 end,
    case when p_activity_type='daily_challenge' then coalesce((v_issue.help_state->q.question_id->>'solution_revealed')::boolean,false) else false end,
    p_session_id,v_attempt.occurred_at from jsonb_array_elements(p_evidence)e
      join private.qm_learning_question_contracts q on q.question_id=e->>'questionId';
  insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,concept_ids,source_ids,
    attempt_id,idempotency_key,policy_version,evidence,xp_delta)
  select p_user_id,case p_activity_type when 'assessment' then 'assessment_completed' when 'retry' then 'assessment_retry_completed'
      else 'daily_challenge_completed' end,v_attempt.occurred_at,v_content,p_chapter_id,
    array_agg(distinct concept_id),array_agg(distinct source_id),v_attempt.id,'attempt:'||v_attempt.id,v_policy,
    jsonb_build_object('kind','server_scored','score',v_score,'question_count',v_count,'mastery','evaluated_separately'),v_xp
    from public.qm_learning_attempt_items where attempt_id=v_attempt.id;
  insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,concept_ids,source_ids,
    attempt_id,idempotency_key,policy_version,evidence,xp_delta)
  select p_user_id,'concept_retrieved',occurred_at,content_id,p_chapter_id,array[concept_id],array[source_id],v_attempt.id,
    'retrieval:'||id,v_policy,jsonb_build_object('correct',correct,'confidence',confidence,'representation',representation,
      'hint_level',hint_level,'solution_revealed',solution_revealed,'session_id',session_id),0
    from public.qm_learning_attempt_items where attempt_id=v_attempt.id;
  if p_activity_type='daily_challenge' then
    update public.qm_learning_activity_issues set completed_at=v_attempt.occurred_at where id=p_issue_id;
  elsif p_activity_type='retry' then
    update public.qm_learning_remediation_cycles set retry_attempt_id=v_attempt.id where id=p_remediation_cycle_id;
    insert into public.qm_learning_badges(user_id,badge_key,chapter_id,evidence,policy_version)
      values(p_user_id,'guided_recovery',p_chapter_id,jsonb_build_object('cycle_id',p_remediation_cycle_id),v_policy) on conflict do nothing;
  elsif v_correct<v_count then
    select array_agg(distinct i.concept_id),array_agg(distinct q.question_id)
      into v_bad_concepts,v_retry_ids from public.qm_learning_attempt_items i
      join private.qm_learning_question_contracts q on q.chapter_id=p_chapter_id and q.concept_id=i.concept_id and q.mode='retry'
      where i.attempt_id=v_attempt.id and not i.correct;
    insert into public.qm_learning_remediation_cycles(user_id,chapter_id,source_attempt_id,concept_ids,retry_question_ids,policy_version)
      values(p_user_id,p_chapter_id,v_attempt.id,v_bad_concepts,v_retry_ids,v_policy) returning id into v_cycle_id;
  end if;
  insert into public.qm_learning_badges(user_id,badge_key,chapter_id,evidence,policy_version)
    values(p_user_id,'first_chapter_checkpoint',p_chapter_id,jsonb_build_object('attempt_id',v_attempt.id),v_policy) on conflict do nothing;
  -- Required reviewed objectives, not merely the sampled checkpoint bank.
  v_required := case p_chapter_id when '01' then 9 when '02' then 12 when '03' then 12 when '04' then 10 when '05' then 9 when '06' then 8 when '07' then 10 else 0 end;
  select count(*) into v_mastered from (
    select q.concept_id from private.qm_learning_question_contracts q where q.chapter_id=p_chapter_id and q.mode='assessment'
      and (select count(*) from public.qm_learning_attempt_items i where i.user_id=p_user_id and i.concept_id=q.concept_id
        and i.correct and i.hint_level=0 and not i.solution_revealed)>=2
      and (select count(distinct i.session_id) from public.qm_learning_attempt_items i where i.user_id=p_user_id and i.concept_id=q.concept_id
        and i.correct and i.hint_level=0 and not i.solution_revealed)>=2
      and (select count(distinct i.representation) from public.qm_learning_attempt_items i where i.user_id=p_user_id and i.concept_id=q.concept_id
        and i.correct and i.hint_level=0 and not i.solution_revealed)>=2
      and (select max(i.occurred_at)-min(i.occurred_at) from public.qm_learning_attempt_items i where i.user_id=p_user_id and i.concept_id=q.concept_id
        and i.correct and i.hint_level=0 and not i.solution_revealed)>=interval '24 hours'
  ) mastered;
  if v_required>0 and v_mastered=v_required and not exists(select 1 from public.qm_learning_ledger where user_id=p_user_id
      and event_type='chapter_mastery_reached' and chapter_id=p_chapter_id) then
    v_mastery_xp:=80;
    insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,attempt_id,
      idempotency_key,policy_version,evidence,xp_delta)
      values(p_user_id,'chapter_mastery_reached',v_attempt.occurred_at,v_content,p_chapter_id,v_attempt.id,
        'mastery:'||p_chapter_id,v_policy,jsonb_build_object('rule','two_unaided_two_sessions_two_forms_24h','concept_count',v_required),80);
    insert into public.qm_learning_badges(user_id,badge_key,chapter_id,evidence,policy_version)
      values(p_user_id,'successive_relearning',p_chapter_id,jsonb_build_object('attempt_id',v_attempt.id),v_policy) on conflict do nothing;
  end if;
  v_profile:=private.qm_sync_learning_projection(p_user_id,true);
  return jsonb_build_object('deduped',false,'attempt_id',v_attempt.id,'score',v_score,'correct_count',v_correct,
    'question_count',v_count,'xp_delta',v_xp+v_mastery_xp,'remediation_cycle_id',v_cycle_id,
    'required_concepts',v_required,'assessed_concepts',(select count(distinct concept_id) from private.qm_learning_question_contracts where chapter_id=p_chapter_id and mode='assessment'),
    'mastery_status',case when v_required>0 and v_mastered=v_required then 'mastered' else 'insufficient_evidence' end,'rewards',v_profile);
end;
$$;
revoke all on function public.record_qm_learning_activity(uuid,text,text,text,uuid,text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.record_qm_learning_activity(uuid,text,text,text,uuid,text,jsonb,uuid,uuid) to service_role;


create or replace function public.read_qm_learning_snapshot(p_user_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'generated_at',statement_timestamp(),
    'progress',coalesce((select jsonb_agg(jsonb_build_object('chapter_id',p.chapter_id,'item_id',p.item_id,
      'page_path',p.page_path,'status',p.status,'last_opened_at',p.last_opened_at))
      from public.qm_study_progress p where p.user_id=p_user_id),'[]'::jsonb),
    'rewards',(select to_jsonb(p)-'user_id' from public.qm_gamification_profiles p where p.user_id=p_user_id),
    'ledger_xp',(select coalesce(sum(l.xp_delta),0) from public.qm_learning_ledger l where l.user_id=p_user_id),
    'ledger_sections',(select count(*) from public.qm_learning_ledger l where l.user_id=p_user_id and l.event_type='section_completed'),
    'unreconciled_rewards',(select count(*) from public.qm_gamification_events e where e.user_id=p_user_id
      and not exists(select 1 from public.qm_learning_ledger l where l.legacy_reward_id=e.id)),
    'assessments',(select jsonb_build_object('total',
      (select count(*) from public.qm_chapter_quiz_attempts a where a.user_id=p_user_id)+
      (select count(*) from public.qm_learning_attempts a where a.user_id=p_user_id and a.activity_type='assessment'),
      'best_score',greatest((select max(score) from public.qm_chapter_quiz_attempts where user_id=p_user_id),
        (select max(score) from public.qm_learning_attempts where user_id=p_user_id and activity_type='assessment')),'evidence_status','evaluated_by_concept')),
    'simulators',coalesce((select jsonb_agg(jsonb_build_object('slug',s.simulator_slug,'page_path',s.simulator_path,
      'last_opened_at',s.last_opened_at)) from public.qm_simulator_activity s where s.user_id=p_user_id),'[]'::jsonb),
    'attempt_items',coalesce((select jsonb_agg(to_jsonb(i)-'user_id') from public.qm_learning_attempt_items i where i.user_id=p_user_id),'[]'::jsonb),
    'remediation_cycles',coalesce((select jsonb_agg(to_jsonb(c)-'user_id') from public.qm_learning_remediation_cycles c where c.user_id=p_user_id),'[]'::jsonb),
    'badges',coalesce((select jsonb_agg(to_jsonb(b)-'user_id') from public.qm_learning_badges b where b.user_id=p_user_id),'[]'::jsonb),
    'simulator_learning',coalesce((select jsonb_agg(to_jsonb(s)-'user_id') from public.qm_simulator_learning_events s where s.user_id=p_user_id),'[]'::jsonb),
    'mechanic_events',coalesce((select jsonb_agg(to_jsonb(m)-'user_id') from public.qm_learning_mechanic_events m where m.user_id=p_user_id),'[]'::jsonb)
  );
$$;
revoke all on function public.read_qm_learning_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.read_qm_learning_snapshot(uuid) to service_role;


notify pgrst,'reload schema';
commit;
