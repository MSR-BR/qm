-- C30 follow-up. Apply with the 2026-10-17 application, not independently.
-- Additive catalogue; existing attempts, ledger, XP and badges are untouched.
begin;
-- Repair only the active source contract; saved historical attempt metadata stays intact.
update private.qm_learning_question_contracts
set content_id='slides/chapter-05/hydrogen-atom-and-effective-potential.html'
where question_id in ('qm-05-radial','qm-05-radial-transfer');
insert into private.qm_learning_question_contracts
(question_id,chapter_id,concept_id,source_id,content_id,representation,mode) values
('qm-01-spectral-lines','01','hydrogen-spectral-lines','qm-01-1.3','slides/chapter-01/hydrogen-spectral-lines.html','conceptual_recognition','assessment'),
('qm-01-spectral-lines-transfer','01','hydrogen-spectral-lines','qm-01-1.3','slides/chapter-01/hydrogen-spectral-lines.html','relation_transfer','retry'),
('qm-01-black-body','01','black-body-radiation','qm-01-1.5','slides/chapter-01/black-body-radiation.html','conceptual_recognition','assessment'),
('qm-01-black-body-transfer','01','black-body-radiation','qm-01-1.5','slides/chapter-01/black-body-radiation.html','relation_transfer','retry'),
('qm-01-bohr','01','bohr-hydrogen-model','qm-01-1.9','slides/chapter-01/bohr-model-postulates.html','conceptual_recognition','assessment'),
('qm-01-bohr-transfer','01','bohr-hydrogen-model','qm-01-1.9','slides/chapter-01/bohr-model-postulates.html','relation_transfer','retry'),
('qm-02-stationary','02','stationary-states-tise','qm-02-2.3','slides/chapter-02/stationary-states-and-tise.html','conceptual_recognition','assessment'),
('qm-02-stationary-transfer','02','stationary-states-tise','qm-02-2.3','slides/chapter-02/stationary-states-and-tise.html','relation_transfer','retry'),
('qm-02-superposition','02','superposition-state-space','qm-02-2.7','slides/chapter-02/quantum-states-superpositions.html','conceptual_recognition','assessment'),
('qm-02-superposition-transfer','02','superposition-state-space','qm-02-2.7','slides/chapter-02/quantum-states-superpositions.html','relation_transfer','retry'),
('qm-02-born','02','born-rule-probabilities','qm-02-2.9','slides/chapter-02/measurement-probabilities.html','conceptual_recognition','assessment'),
('qm-02-born-transfer','02','born-rule-probabilities','qm-02-2.9','slides/chapter-02/measurement-probabilities.html','relation_transfer','retry'),
('qm-03-completeness','03','hilbert-space-bases-completeness','qm-03-3.4','slides/chapter-03/hilbert-space-bases-superposition-completeness.html','conceptual_recognition','assessment'),
('qm-03-completeness-transfer','03','hilbert-space-bases-completeness','qm-03-3.4','slides/chapter-03/hilbert-space-bases-superposition-completeness.html','relation_transfer','retry'),
('qm-03-pauli','03','pauli-matrices-spin','qm-03-3.6','slides/chapter-03/pauli-matrices-and-spin-observables.html','conceptual_recognition','assessment'),
('qm-03-pauli-transfer','03','pauli-matrices-spin','qm-03-3.6','slides/chapter-03/pauli-matrices-and-spin-observables.html','relation_transfer','retry'),
('qm-03-measurement-order','03','compatibility-measurement-order','qm-03-3.10','slides/chapter-03/commutators-compatibility-and-measurement-order.html','conceptual_recognition','assessment'),
('qm-03-measurement-order-transfer','03','compatibility-measurement-order','qm-03-3.10','slides/chapter-03/commutators-compatibility-and-measurement-order.html','relation_transfer','retry'),
('qm-04-ladder','04','ladder-operator-methods','qm-04-4.4','slides/chapter-04/qho-ladder-operators-and-oscillator-algebra.html','conceptual_recognition','assessment'),
('qm-04-ladder-transfer','04','ladder-operator-methods','qm-04-4.4','slides/chapter-04/qho-ladder-operators-and-oscillator-algebra.html','relation_transfer','retry'),
('qm-04-current','04','scattering-reflection-transmission','qm-04-4.9','slides/chapter-04/probability-current-reflection-and-transmission.html','conceptual_recognition','assessment'),
('qm-04-current-transfer','04','scattering-reflection-transmission','qm-04-4.9','slides/chapter-04/probability-current-reflection-and-transmission.html','relation_transfer','retry'),
('qm-04-delta','04','delta-function-potential','qm-04-4.11','slides/chapter-04/delta-function-well-and-scattering.html','conceptual_recognition','assessment'),
('qm-04-delta-transfer','04','delta-function-potential','qm-04-4.11','slides/chapter-04/delta-function-well-and-scattering.html','relation_transfer','retry'),
('qm-05-separation','05','central-potentials-spherical-separation','qm-05-5.2','slides/chapter-05/separation-of-variables-in-spherical-coordinates.html','conceptual_recognition','assessment'),
('qm-05-separation-transfer','05','central-potentials-spherical-separation','qm-05-5.2','slides/chapter-05/separation-of-variables-in-spherical-coordinates.html','relation_transfer','retry'),
('qm-05-oscillator-3d','05','three-dimensional-harmonic-oscillator','qm-05-5.7','slides/chapter-05/three-dimensional-harmonic-oscillator.html','conceptual_recognition','assessment'),
('qm-05-oscillator-3d-transfer','05','three-dimensional-harmonic-oscillator','qm-05-5.7','slides/chapter-05/three-dimensional-harmonic-oscillator.html','relation_transfer','retry'),
('qm-05-moments','05','hydrogen-expectation-values','qm-05-5.9','slides/chapter-05/hydrogen-expectation-values.html','conceptual_recognition','assessment'),
('qm-05-moments-transfer','05','hydrogen-expectation-values','qm-05-5.9','slides/chapter-05/hydrogen-expectation-values.html','relation_transfer','retry'),
('qm-06-variance','06','angular-momentum-variance-geometry','qm-06-6.4','slides/chapter-06/expectation-values-and-transverse-variance.html','conceptual_recognition','assessment'),
('qm-06-variance-transfer','06','angular-momentum-variance-geometry','qm-06-6.4','slides/chapter-06/expectation-values-and-transverse-variance.html','relation_transfer','retry'),
('qm-06-position','06','angular-momentum-position-representation','qm-06-6.6','slides/chapter-06/angular-momentum-in-position-space.html','conceptual_recognition','assessment'),
('qm-06-position-transfer','06','angular-momentum-position-representation','qm-06-6.6','slides/chapter-06/angular-momentum-in-position-space.html','relation_transfer','retry'),
('qm-06-uncertainty','06','schrodinger-uncertainty-schwartz','qm-06-6.7','slides/chapter-06/generalized-uncertainty-for-angular-momentum.html','conceptual_recognition','assessment'),
('qm-06-uncertainty-transfer','06','schrodinger-uncertainty-schwartz','qm-06-6.7','slides/chapter-06/generalized-uncertainty-for-angular-momentum.html','relation_transfer','retry'),
('qm-07-interactions','07','angular-momentum-interactions','qm-07-7.2','slides/chapter-07/interactions-between-angular-momenta.html','conceptual_recognition','assessment'),
('qm-07-interactions-transfer','07','angular-momentum-interactions','qm-07-7.2','slides/chapter-07/interactions-between-angular-momenta.html','relation_transfer','retry'),
('qm-07-commuting','07','coupled-commuting-observables','qm-07-7.3','slides/chapter-07/commutation-relations.html','conceptual_recognition','assessment'),
('qm-07-commuting-transfer','07','coupled-commuting-observables','qm-07-7.3','slides/chapter-07/commutation-relations.html','relation_transfer','retry'),
('qm-07-operator-basis','07','operator-basis-change-coupled','qm-07-7.7','slides/chapter-07/basis-change-of-an-operator.html','conceptual_recognition','assessment'),
('qm-07-operator-basis-transfer','07','operator-basis-change-coupled','qm-07-7.7','slides/chapter-07/basis-change-of-an-operator.html','relation_transfer','retry');

alter table public.qm_learning_attempts drop constraint qm_learning_attempts_question_count_check;
alter table public.qm_learning_attempts add constraint qm_learning_attempts_question_count_check check (question_count between 1 and 6);
alter table public.qm_learning_remediation_cycles drop constraint qm_learning_remediation_cycles_concept_ids_check;
alter table public.qm_learning_remediation_cycles add constraint qm_learning_remediation_cycles_concept_ids_check check (cardinality(concept_ids) between 1 and 6);
alter table public.qm_learning_remediation_cycles drop constraint qm_learning_remediation_cycles_retry_question_ids_check;
alter table public.qm_learning_remediation_cycles add constraint qm_learning_remediation_cycles_retry_question_ids_check check (cardinality(retry_question_ids) between 1 and 6);

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
  select * into v_attempt from public.qm_learning_attempts where user_id=p_user_id and idempotency_key=p_idempotency_key;
  if found then
    return jsonb_build_object('deduped',true,'attempt_id',v_attempt.id,'score',v_attempt.score,
      'correct_count',v_attempt.correct_count,'question_count',v_attempt.question_count,'xp_delta',0);
  end if;
  insert into public.qm_gamification_profiles(user_id) values(p_user_id) on conflict do nothing;
  perform 1 from public.qm_gamification_profiles where user_id=p_user_id for update;
  select * into v_attempt from public.qm_learning_attempts where user_id=p_user_id and idempotency_key=p_idempotency_key;
  if found then
    return jsonb_build_object('deduped',true,'attempt_id',v_attempt.id,'score',v_attempt.score,
      'correct_count',v_attempt.correct_count,'question_count',v_attempt.question_count,'xp_delta',0);
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


commit;
