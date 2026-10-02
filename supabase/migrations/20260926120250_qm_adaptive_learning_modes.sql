-- C30. Forward-only adaptive learning and reward contract.
-- No historical backfill and no remote execution are performed by this file.
begin;

create table private.qm_learning_question_contracts (
  question_id text primary key,
  chapter_id text not null check (chapter_id in ('01','02','03','04','05','06','07')),
  concept_id text not null,
  source_id text not null,
  content_id text not null,
  representation text not null check (representation in ('conceptual_recognition','relation_transfer')),
  mode text not null check (mode in ('assessment','retry')),
  unique (chapter_id, concept_id, mode)
);
revoke all on table private.qm_learning_question_contracts from public,anon,authenticated,service_role;
grant select on table private.qm_learning_question_contracts to service_role;

insert into private.qm_learning_question_contracts(question_id,chapter_id,concept_id,source_id,content_id,representation,mode) values
  ('qm-01-wave-benchmark','01','classical-wave-benchmark','qm-01-1.2','slides/chapter-01/wave-optics-classical-benchmark.html','conceptual_recognition','assessment'),
  ('qm-01-wave-benchmark-transfer','01','classical-wave-benchmark','qm-01-1.2','slides/chapter-01/wave-optics-classical-benchmark.html','relation_transfer','retry'),
  ('qm-01-photoelectric','01','photoelectric-effect','qm-01-1.6','slides/chapter-01/photoelectric-effect.html','conceptual_recognition','assessment'),
  ('qm-01-photoelectric-transfer','01','photoelectric-effect','qm-01-1.6','slides/chapter-01/photoelectric-effect.html','relation_transfer','retry'),
  ('qm-01-de-broglie','01','de-broglie-matter-waves','qm-01-1.11','slides/chapter-01/de-broglie-hypothesis.html','conceptual_recognition','assessment'),
  ('qm-01-de-broglie-transfer','01','de-broglie-matter-waves','qm-01-1.11','slides/chapter-01/de-broglie-hypothesis.html','relation_transfer','retry'),
  ('qm-02-schrodinger','02','schrodinger-equation','qm-02-2.2','slides/chapter-02/time-dependent-schrodinger-equation.html','conceptual_recognition','assessment'),
  ('qm-02-schrodinger-transfer','02','schrodinger-equation','qm-02-2.2','slides/chapter-02/time-dependent-schrodinger-equation.html','relation_transfer','retry'),
  ('qm-02-probability','02','probability-density-current','qm-02-2.4','slides/chapter-02/probability-density-and-current.html','conceptual_recognition','assessment'),
  ('qm-02-probability-transfer','02','probability-density-current','qm-02-2.4','slides/chapter-02/probability-density-and-current.html','relation_transfer','retry'),
  ('qm-02-infinite-well','02','infinite-potential-well','qm-02-2.5','slides/chapter-02/infinite-potential-well.html','conceptual_recognition','assessment'),
  ('qm-02-infinite-well-transfer','02','infinite-potential-well','qm-02-2.5','slides/chapter-02/infinite-potential-well.html','relation_transfer','retry'),
  ('qm-03-spin','03','matrix-mechanics-spin-entry','qm-03-3.2','slides/chapter-03/stern-gerlach-experiment-magnetic-force-and-spin.html','conceptual_recognition','assessment'),
  ('qm-03-spin-transfer','03','matrix-mechanics-spin-entry','qm-03-3.2','slides/chapter-03/stern-gerlach-experiment-magnetic-force-and-spin.html','relation_transfer','retry'),
  ('qm-03-dirac','03','dirac-notation','qm-03-3.3','slides/chapter-03/dirac-notation-kets-bras-inner-products.html','conceptual_recognition','assessment'),
  ('qm-03-dirac-transfer','03','dirac-notation','qm-03-3.3','slides/chapter-03/dirac-notation-kets-bras-inner-products.html','relation_transfer','retry'),
  ('qm-03-hermitian','03','hermitian-observables','qm-03-3.9','slides/chapter-03/hermitian-operators-and-real-outcomes.html','conceptual_recognition','assessment'),
  ('qm-03-hermitian-transfer','03','hermitian-observables','qm-03-3.9','slides/chapter-03/hermitian-operators-and-real-outcomes.html','relation_transfer','retry'),
  ('qm-04-hermite','04','hermite-quantization','qm-04-4.3','slides/chapter-04/qho-hermite-equation-and-energy-quantization.html','conceptual_recognition','assessment'),
  ('qm-04-hermite-transfer','04','hermite-quantization','qm-04-4.3','slides/chapter-04/qho-hermite-equation-and-energy-quantization.html','relation_transfer','retry'),
  ('qm-04-finite-well','04','finite-well-bound-states','qm-04-4.6','slides/chapter-04/finite-potential-well-bound-state-setup.html','conceptual_recognition','assessment'),
  ('qm-04-finite-well-transfer','04','finite-well-bound-states','qm-04-4.6','slides/chapter-04/finite-potential-well-bound-state-setup.html','relation_transfer','retry'),
  ('qm-04-tunneling','04','quantum-tunneling-barrier','qm-04-4.12','slides/chapter-04/rectangular-barrier-and-quantum-tunneling.html','conceptual_recognition','assessment'),
  ('qm-04-tunneling-transfer','04','quantum-tunneling-barrier','qm-04-4.12','slides/chapter-04/rectangular-barrier-and-quantum-tunneling.html','relation_transfer','retry'),
  ('qm-05-spherical','05','spherical-harmonics','qm-05-5.4','slides/chapter-05/spherical-harmonics.html','conceptual_recognition','assessment'),
  ('qm-05-spherical-transfer','05','spherical-harmonics','qm-05-5.4','slides/chapter-05/spherical-harmonics.html','relation_transfer','retry'),
  ('qm-05-radial','05','hydrogen-radial-laguerre','qm-05-5.5','slides/chapter-05/hydrogen-atom-radial-solution-and-probability.html','conceptual_recognition','assessment'),
  ('qm-05-radial-transfer','05','hydrogen-radial-laguerre','qm-05-5.5','slides/chapter-05/hydrogen-atom-radial-solution-and-probability.html','relation_transfer','retry'),
  ('qm-05-degeneracy','05','hydrogen-spectrum-degeneracy','qm-05-5.6','slides/chapter-05/hydrogen-spectrum-and-degeneracy.html','conceptual_recognition','assessment'),
  ('qm-05-degeneracy-transfer','05','hydrogen-spectrum-degeneracy','qm-05-5.6','slides/chapter-05/hydrogen-spectrum-and-degeneracy.html','relation_transfer','retry'),
  ('qm-06-compatible','06','angular-momentum-algebra-ladders','qm-06-6.3','slides/chapter-06/compatible-observables-l-squared-and-lz.html','conceptual_recognition','assessment'),
  ('qm-06-compatible-transfer','06','angular-momentum-algebra-ladders','qm-06-6.3','slides/chapter-06/compatible-observables-l-squared-and-lz.html','relation_transfer','retry'),
  ('qm-06-commutator','06','angular-momentum-commutators','qm-06-6.2','slides/chapter-06/commutation-relations-and-physical-meaning.html','conceptual_recognition','assessment'),
  ('qm-06-commutator-transfer','06','angular-momentum-commutators','qm-06-6.2','slides/chapter-06/commutation-relations-and-physical-meaning.html','relation_transfer','retry'),
  ('qm-06-matrices','06','angular-momentum-matrix-representation','qm-06-6.5','slides/chapter-06/general-matrix-representation.html','conceptual_recognition','assessment'),
  ('qm-06-matrices-transfer','06','angular-momentum-matrix-representation','qm-06-6.5','slides/chapter-06/general-matrix-representation.html','relation_transfer','retry'),
  ('qm-07-addition','07','addition-angular-momenta-roadmap','qm-07-7.1','slides/chapter-07/addition-of-angular-momenta-chapter-roadmap.html','conceptual_recognition','assessment'),
  ('qm-07-addition-transfer','07','addition-angular-momenta-roadmap','qm-07-7.1','slides/chapter-07/addition-of-angular-momenta-chapter-roadmap.html','relation_transfer','retry'),
  ('qm-07-clebsch','07','clebsch-gordan-coefficients','qm-07-7.6','slides/chapter-07/local-basis-vs-coupled-basis-clebsch-gordan-coefficients.html','conceptual_recognition','assessment'),
  ('qm-07-clebsch-transfer','07','clebsch-gordan-coefficients','qm-07-7.6','slides/chapter-07/local-basis-vs-coupled-basis-clebsch-gordan-coefficients.html','relation_transfer','retry'),
  ('qm-07-coupled','07','coupled-basis-construction','qm-07-7.4','slides/chapter-07/vectors-in-the-coupled-basis.html','conceptual_recognition','assessment'),
  ('qm-07-coupled-transfer','07','coupled-basis-construction','qm-07-7.4','slides/chapter-07/vectors-in-the-coupled-basis.html','relation_transfer','retry');

create table private.qm_learning_simulator_contracts (
  simulator_slug text primary key,
  chapter_id text not null check (chapter_id in ('01','02','03','04','05','06','07')),
  content_id text not null,
  concept_ids text[] not null,
  source_ids text[] not null
);
revoke all on table private.qm_learning_simulator_contracts from public,anon,authenticated,service_role;
grant select on table private.qm_learning_simulator_contracts to service_role;
insert into private.qm_learning_simulator_contracts(simulator_slug,chapter_id,content_id,concept_ids,source_ids) values
  ('double-slit','01','simulators/classical.html?sim=double-slit',array['classical-wave-benchmark'],array['qm-01-1.2']),
  ('hydrogen-bohr','01','simulators/classical.html?sim=hydrogen-bohr',array['bohr-hydrogen-model'],array['qm-01-1.9','qm-01-1.10']),
  ('thomson-circle','01','simulators/classical.html?sim=thomson-circle',array['electron-experimental-evidence'],array['qm-01-1.4']),
  ('thomson-deflection','01','simulators/classical.html?sim=thomson-deflection',array['electron-experimental-evidence'],array['qm-01-1.4']),
  ('blackbody-radiation','01','simulators/classical.html?sim=blackbody-radiation',array['black-body-radiation'],array['qm-01-1.5']),
  ('millikan-oil-drop','01','simulators/classical.html?sim=millikan-oil-drop',array['electron-experimental-evidence'],array['qm-01-1.7']),
  ('probability-current','02','simulators/probability-current.html',array['probability-density-current'],array['qm-02-2.4']),
  ('infinite-well','02','simulators/infinite-well.html',array['infinite-potential-well'],array['qm-02-2.5']),
  ('superposition-measurement','02','simulators/superposition-measurement.html',array['superposition-state-space','born-rule-probabilities'],array['qm-02-2.7','qm-02-2.9']),
  ('gaussian-wave-packet','02','simulators/gaussian-wave-packet.html',array['wave-packets-fourier-uncertainty'],array['qm-02-2.13']),
  ('finite-well-bound-states','04','simulators/chapter-04-labs.html?sim=finite',array['finite-well-bound-states'],array['qm-04-4.6']),
  ('hydrogen-radial-states','05','simulators/hydrogen-radial.html',array['hydrogen-radial-laguerre'],array['qm-05-5.5']),
  ('angular-momentum-matrix-calculator','06','simulators/angular-momentum-matrices.html',array['angular-momentum-matrix-representation'],array['qm-06-6.5']),
  ('angular-momentum-coupled-states','07','simulators/angular-momentum-coupled-states.html',array['clebsch-gordan-coefficients'],array['qm-07-7.6']);

create table public.qm_learning_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('assessment','daily_challenge','retry')),
  chapter_id text not null check (chapter_id in ('01','02','03','04','05','06','07')),
  session_id uuid not null,
  issue_id uuid,
  remediation_cycle_id uuid,
  item_set_version text not null,
  idempotency_key text not null,
  score integer not null check (score between 0 and 100),
  correct_count integer not null check (correct_count >= 0),
  question_count integer not null check (question_count between 1 and 5),
  occurred_at timestamptz not null default now(),
  received_at timestamptz not null default now(),
  policy_version text not null,
  unique(user_id,idempotency_key)
);

create table public.qm_learning_attempt_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null references public.qm_learning_attempts(id) on delete cascade,
  question_id text not null,
  concept_id text not null,
  source_id text not null,
  content_id text not null,
  representation text not null,
  correct boolean not null,
  confidence text not null check (confidence in ('unknown','low','medium','high')),
  hint_level integer not null check (hint_level between 0 and 4),
  solution_revealed boolean not null,
  session_id uuid not null,
  occurred_at timestamptz not null,
  unique(attempt_id,question_id)
);

create table public.qm_learning_activity_issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type = 'daily_challenge'),
  chapter_id text not null check (chapter_id in ('01','02','03','04','05','06','07')),
  item_ids text[] not null check (cardinality(item_ids) between 3 and 5),
  help_state jsonb not null default '{}'::jsonb check (jsonb_typeof(help_state)='object'),
  idempotency_key text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '36 hours',
  completed_at timestamptz,
  policy_version text not null,
  unique(user_id,idempotency_key)
);

create table public.qm_learning_remediation_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text not null check (chapter_id in ('01','02','03','04','05','06','07')),
  source_attempt_id uuid not null references public.qm_learning_attempts(id) on delete cascade,
  concept_ids text[] not null check (cardinality(concept_ids) between 1 and 5),
  retry_question_ids text[] not null check (cardinality(retry_question_ids) between 1 and 5),
  created_at timestamptz not null default now(),
  review_completed_at timestamptz,
  retry_attempt_id uuid references public.qm_learning_attempts(id),
  highest_hint_level integer not null default 0 check (highest_hint_level between 0 and 4),
  solution_revealed boolean not null default false,
  reward_eligible boolean,
  policy_version text not null,
  unique(source_attempt_id)
);

create table public.qm_learning_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null check (badge_key in ('first_chapter_checkpoint','guided_recovery','successive_relearning')),
  chapter_id text check (chapter_id in ('01','02','03','04','05','06','07')),
  evidence jsonb not null check (jsonb_typeof(evidence)='object'),
  policy_version text not null,
  awarded_at timestamptz not null default now(),
  unique(user_id,badge_key,chapter_id)
);

create table public.qm_learning_mechanic_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mechanism_id text not null,
  event_type text not null check (event_type in ('eligible','exposed','acted','opted_out')),
  context_id text not null,
  idempotency_key text not null,
  policy_version text not null,
  occurred_at timestamptz not null default now(),
  unique(user_id,idempotency_key)
);

create table public.qm_simulator_learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null,
  simulator_slug text not null,
  stage text not null check (stage in ('prediction_recorded','meaningful_interaction','reflection_recorded','goal_completed')),
  response_code text,
  interaction_count integer not null default 0 check (interaction_count between 0 and 1000),
  idempotency_key text not null,
  policy_version text not null,
  occurred_at timestamptz not null default now(),
  unique(user_id,idempotency_key),
  unique(user_id,activity_id,stage)
);

create index qm_learning_attempt_items_user_concept_time on public.qm_learning_attempt_items(user_id,concept_id,occurred_at);
create index qm_learning_cycles_user_time on public.qm_learning_remediation_cycles(user_id,created_at desc);
create index qm_simulator_learning_user_time on public.qm_simulator_learning_events(user_id,occurred_at desc);

alter table public.qm_learning_attempts enable row level security;
alter table public.qm_learning_attempt_items enable row level security;
alter table public.qm_learning_activity_issues enable row level security;
alter table public.qm_learning_remediation_cycles enable row level security;
alter table public.qm_learning_badges enable row level security;
alter table public.qm_learning_mechanic_events enable row level security;
alter table public.qm_simulator_learning_events enable row level security;

create policy qm_learning_attempts_own_read on public.qm_learning_attempts for select to authenticated using ((select auth.uid())=user_id);
create policy qm_learning_attempt_items_own_read on public.qm_learning_attempt_items for select to authenticated using ((select auth.uid())=user_id);
create policy qm_learning_activity_issues_own_read on public.qm_learning_activity_issues for select to authenticated using ((select auth.uid())=user_id);
create policy qm_learning_remediation_cycles_own_read on public.qm_learning_remediation_cycles for select to authenticated using ((select auth.uid())=user_id);
create policy qm_learning_badges_own_read on public.qm_learning_badges for select to authenticated using ((select auth.uid())=user_id);
create policy qm_learning_mechanic_events_own_read on public.qm_learning_mechanic_events for select to authenticated using ((select auth.uid())=user_id);
create policy qm_simulator_learning_events_own_read on public.qm_simulator_learning_events for select to authenticated using ((select auth.uid())=user_id);

revoke all on table public.qm_learning_attempts,public.qm_learning_attempt_items,public.qm_learning_activity_issues,
  public.qm_learning_remediation_cycles,public.qm_learning_badges,public.qm_learning_mechanic_events,
  public.qm_simulator_learning_events from public,anon,authenticated,service_role;
grant select on table public.qm_learning_attempts,public.qm_learning_attempt_items,public.qm_learning_activity_issues,
  public.qm_learning_remediation_cycles,public.qm_learning_badges,public.qm_learning_mechanic_events,
  public.qm_simulator_learning_events to authenticated;
grant select,insert on table public.qm_learning_attempts,public.qm_learning_attempt_items,public.qm_learning_badges,
  public.qm_learning_mechanic_events,public.qm_simulator_learning_events to service_role;
grant select,insert,update on table public.qm_learning_activity_issues,public.qm_learning_remediation_cycles to service_role;

create trigger qm_learning_attempts_immutable before update or delete on public.qm_learning_attempts
  for each row execute function public.reject_qm_learning_mutation();
create trigger qm_learning_attempt_items_immutable before update or delete on public.qm_learning_attempt_items
  for each row execute function public.reject_qm_learning_mutation();
create trigger qm_learning_badges_immutable before update or delete on public.qm_learning_badges
  for each row execute function public.reject_qm_learning_mutation();
create trigger qm_learning_mechanic_events_immutable before update or delete on public.qm_learning_mechanic_events
  for each row execute function public.reject_qm_learning_mutation();
create trigger qm_simulator_learning_events_immutable before update or delete on public.qm_simulator_learning_events
  for each row execute function public.reject_qm_learning_mutation();

alter table public.qm_learning_ledger drop constraint if exists qm_learning_ledger_event_type_check;
alter table public.qm_learning_ledger drop constraint if exists qm_learning_ledger_check;
alter table public.qm_learning_ledger add constraint qm_learning_ledger_event_type_check check (event_type in (
  'section_completed','assessment_completed','assessment_reviewed','assessment_retry_completed','daily_challenge_completed',
  'concept_retrieved','chapter_mastery_reached','simulator_prediction_recorded','simulator_meaningful_interaction',
  'simulator_reflection_recorded','simulator_goal_completed'
));
alter table public.qm_learning_ledger add constraint qm_learning_ledger_semantic_shape_check check (
  (event_type='section_completed' and section_id is not null and legacy_reward_id is not null)
  or (event_type in ('assessment_completed','assessment_retry_completed','daily_challenge_completed','concept_retrieved','chapter_mastery_reached') and attempt_id is not null)
  or (event_type='assessment_reviewed' and activity_id is not null)
  or (event_type like 'simulator_%' and activity_id is not null and xp_delta=0)
);

-- C29's legacy trigger cannot distinguish the new server-owned v2 attempt path.
drop trigger if exists qm_assessment_ledger on public.qm_chapter_quiz_attempts;

create function private.qm_sync_learning_projection(p_user_id uuid, p_meaningful boolean default true)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_profile public.qm_gamification_profiles%rowtype;
  v_xp integer;
  v_sections integer;
  v_today date := (current_timestamp at time zone 'America/Sao_Paulo')::date;
  v_streak integer;
begin
  insert into public.qm_gamification_profiles(user_id) values(p_user_id) on conflict do nothing;
  select * into v_profile from public.qm_gamification_profiles where user_id=p_user_id for update;
  select coalesce(sum(xp_delta),0),count(*) filter(where event_type='section_completed')
    into v_xp,v_sections from public.qm_learning_ledger where user_id=p_user_id;
  v_streak := v_profile.current_streak;
  if p_meaningful then
    v_streak := case when v_profile.last_active_on=v_today then v_profile.current_streak
      when v_profile.last_active_on=v_today-1 then v_profile.current_streak+1 else 1 end;
  end if;
  update public.qm_gamification_profiles set xp_total=v_xp,level=floor(v_xp/100.0)::integer+1,
    studied_items_count=v_sections,current_streak=v_streak,best_streak=greatest(best_streak,v_streak),
    last_active_on=case when p_meaningful then v_today else last_active_on end
    where user_id=p_user_id returning * into v_profile;
  return to_jsonb(v_profile)-'user_id';
end;
$$;
revoke all on function private.qm_sync_learning_projection(uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function private.qm_sync_learning_projection(uuid,boolean) to service_role;

create function public.issue_qm_daily_challenge(
  p_user_id uuid,p_idempotency_key text,p_chapter_id text,p_question_ids text[]
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_issue public.qm_learning_activity_issues%rowtype; v_valid integer;
begin
  if p_user_id is null or p_idempotency_key !~ '^daily:[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    or p_chapter_id not in ('01','02','03','04','05','06','07')
    or cardinality(p_question_ids) not between 3 and 5
    or cardinality(p_question_ids) <> (select count(distinct x) from unnest(p_question_ids) x) then
    raise exception using errcode='22023',message='Invalid Daily Challenge request.';
  end if;
  select count(*) into v_valid from private.qm_learning_question_contracts q
    where q.question_id=any(p_question_ids) and q.chapter_id=p_chapter_id
      and exists(select 1 from public.qm_study_progress s where s.user_id=p_user_id
        and s.chapter_id=q.chapter_id and s.item_id=split_part(q.source_id,'-',3) and s.status='completed');
  if v_valid <> cardinality(p_question_ids) then
    raise exception using errcode='22023',message='Daily Challenge items must come from completed reviewed content.';
  end if;
  insert into public.qm_learning_activity_issues(user_id,activity_type,chapter_id,item_ids,idempotency_key,policy_version)
    values(p_user_id,'daily_challenge',p_chapter_id,p_question_ids,p_idempotency_key,'qm-learning-policy-2026-09-25.1')
    on conflict(user_id,idempotency_key) do nothing;
  select * into v_issue from public.qm_learning_activity_issues where user_id=p_user_id and idempotency_key=p_idempotency_key;
  return jsonb_build_object('id',v_issue.id,'chapter_id',v_issue.chapter_id,'item_ids',v_issue.item_ids,
    'help_state',v_issue.help_state,'issued_at',v_issue.issued_at,'expires_at',v_issue.expires_at,
    'completed_at',v_issue.completed_at,'policy_version',v_issue.policy_version);
end;
$$;
revoke all on function public.issue_qm_daily_challenge(uuid,text,text,text[]) from public,anon,authenticated;
grant execute on function public.issue_qm_daily_challenge(uuid,text,text,text[]) to service_role;

create function public.record_qm_daily_help(
  p_user_id uuid,p_issue_id uuid,p_question_id text,p_hint_level integer,p_solution_revealed boolean
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_issue public.qm_learning_activity_issues%rowtype; v_current integer;
begin
  select * into v_issue from public.qm_learning_activity_issues where id=p_issue_id and user_id=p_user_id for update;
  if not found or v_issue.completed_at is not null or v_issue.expires_at<now() or not(p_question_id=any(v_issue.item_ids))
    or p_hint_level not between 1 and 4 or p_solution_revealed is distinct from (p_hint_level=4) then
    raise exception using errcode='22023',message='Invalid Daily Challenge help request.';
  end if;
  v_current := coalesce((v_issue.help_state->p_question_id->>'hint_level')::integer,0);
  if p_hint_level < v_current or p_hint_level > v_current+1 then
    raise exception using errcode='22023',message='Hints must be revealed in order.';
  end if;
  update public.qm_learning_activity_issues set help_state=jsonb_set(help_state,array[p_question_id],
    jsonb_build_object('hint_level',p_hint_level,'solution_revealed',p_solution_revealed),true) where id=p_issue_id;
  return jsonb_build_object('hint_level',p_hint_level,'solution_revealed',p_solution_revealed);
end;
$$;
revoke all on function public.record_qm_daily_help(uuid,uuid,text,integer,boolean) from public,anon,authenticated;
grant execute on function public.record_qm_daily_help(uuid,uuid,text,integer,boolean) to service_role;

create function public.record_qm_learning_activity(
  p_user_id uuid,p_idempotency_key text,p_activity_type text,p_chapter_id text,p_session_id uuid,
  p_item_set_version text,p_evidence jsonb,p_issue_id uuid default null,p_remediation_cycle_id uuid default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_attempt public.qm_learning_attempts%rowtype;
  v_issue public.qm_learning_activity_issues%rowtype;
  v_cycle public.qm_learning_remediation_cycles%rowtype;
  v_count integer; v_correct integer; v_score integer; v_xp integer := 0; v_mastery_xp integer := 0;
  v_content text; v_question_ids text[]; v_expected text[]; v_bad_concepts text[]; v_retry_ids text[];
  v_cycle_id uuid; v_profile jsonb; v_mastered integer; v_policy constant text := 'qm-learning-policy-2026-09-25.1';
begin
  if p_user_id is null or nullif(p_idempotency_key,'') is null or p_activity_type not in ('assessment','daily_challenge','retry')
    or p_chapter_id not in ('01','02','03','04','05','06','07') or p_session_id is null
    or nullif(p_item_set_version,'') is null or jsonb_typeof(p_evidence)<>'array'
    or jsonb_array_length(p_evidence) not between 1 and 5 then
    raise exception using errcode='22023',message='Invalid learning attempt.';
  end if;
  select * into v_attempt from public.qm_learning_attempts where user_id=p_user_id and idempotency_key=p_idempotency_key;
  if found then
    return jsonb_build_object('deduped',true,'attempt_id',v_attempt.id,'score',v_attempt.score,
      'correct_count',v_attempt.correct_count,'question_count',v_attempt.question_count,'xp_delta',0);
  end if;
  insert into public.qm_gamification_profiles(user_id) values(p_user_id) on conflict do nothing;
  perform 1 from public.qm_gamification_profiles where user_id=p_user_id for update;
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
  if v_mastered=3 and not exists(select 1 from public.qm_learning_ledger where user_id=p_user_id
      and event_type='chapter_mastery_reached' and chapter_id=p_chapter_id) then
    v_mastery_xp:=80;
    insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,attempt_id,
      idempotency_key,policy_version,evidence,xp_delta)
      values(p_user_id,'chapter_mastery_reached',v_attempt.occurred_at,v_content,p_chapter_id,v_attempt.id,
        'mastery:'||p_chapter_id,v_policy,jsonb_build_object('rule','two_unaided_two_sessions_two_forms_24h','concept_count',3),80);
    insert into public.qm_learning_badges(user_id,badge_key,chapter_id,evidence,policy_version)
      values(p_user_id,'successive_relearning',p_chapter_id,jsonb_build_object('attempt_id',v_attempt.id),v_policy) on conflict do nothing;
  end if;
  v_profile:=private.qm_sync_learning_projection(p_user_id,true);
  return jsonb_build_object('deduped',false,'attempt_id',v_attempt.id,'score',v_score,'correct_count',v_correct,
    'question_count',v_count,'xp_delta',v_xp+v_mastery_xp,'remediation_cycle_id',v_cycle_id,
    'mastery_status',case when v_mastered=3 then 'mastered' else 'insufficient_evidence' end,'rewards',v_profile);
end;
$$;
revoke all on function public.record_qm_learning_activity(uuid,text,text,text,uuid,text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.record_qm_learning_activity(uuid,text,text,text,uuid,text,jsonb,uuid,uuid) to service_role;

create function public.complete_qm_learning_review(
  p_user_id uuid,p_cycle_id uuid,p_idempotency_key text,p_highest_hint_level integer,p_solution_revealed boolean
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_cycle public.qm_learning_remediation_cycles%rowtype; v_eligible boolean; v_profile jsonb; v_xp integer:=0;
begin
  select * into v_cycle from public.qm_learning_remediation_cycles where id=p_cycle_id and user_id=p_user_id for update;
  if not found or p_idempotency_key is distinct from 'review:'||p_cycle_id::text
    or p_highest_hint_level not between 1 and 4 or p_solution_revealed is distinct from (p_highest_hint_level=4) then
    raise exception using errcode='22023',message='Invalid guided review.';
  end if;
  if v_cycle.review_completed_at is null then
    v_eligible := (select count(*)=0 from public.qm_learning_ledger where user_id=p_user_id
        and event_type='assessment_reviewed'
        and (occurred_at at time zone 'America/Sao_Paulo')::date
          = (current_timestamp at time zone 'America/Sao_Paulo')::date)
      and (select count(*)<2 from public.qm_learning_ledger where user_id=p_user_id and event_type='assessment_reviewed'
        and chapter_id=v_cycle.chapter_id and occurred_at>now()-interval '7 days');
    update public.qm_learning_remediation_cycles set review_completed_at=now(),highest_hint_level=p_highest_hint_level,
      solution_revealed=p_solution_revealed,reward_eligible=v_eligible where id=p_cycle_id returning * into v_cycle;
    if v_eligible then v_xp:=10; end if;
    insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,concept_ids,activity_id,
      idempotency_key,policy_version,evidence,xp_delta)
      values(p_user_id,'assessment_reviewed',v_cycle.review_completed_at,'guided-review:'||v_cycle.chapter_id,
        v_cycle.chapter_id,v_cycle.concept_ids,v_cycle.id,p_idempotency_key,v_cycle.policy_version,
        jsonb_build_object('highest_hint_level',p_highest_hint_level,'solution_revealed',p_solution_revealed,
          'reward_eligible',v_eligible,'mastery','not_evidence'),v_xp);
  end if;
  v_profile:=private.qm_sync_learning_projection(p_user_id,true);
  return jsonb_build_object('cycle_id',v_cycle.id,'review_completed_at',v_cycle.review_completed_at,
    'reward_eligible',v_cycle.reward_eligible,'xp_delta',v_xp,'rewards',v_profile);
end;
$$;
revoke all on function public.complete_qm_learning_review(uuid,uuid,text,integer,boolean) from public,anon,authenticated;
grant execute on function public.complete_qm_learning_review(uuid,uuid,text,integer,boolean) to service_role;

create function public.record_qm_simulator_learning_stage(
  p_user_id uuid,p_activity_id uuid,p_simulator_slug text,p_stage text,p_response_code text,
  p_interaction_count integer,p_idempotency_key text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_contract private.qm_learning_simulator_contracts%rowtype; v_event public.qm_simulator_learning_events%rowtype; v_previous integer;
begin
  select * into v_contract from private.qm_learning_simulator_contracts where simulator_slug=p_simulator_slug;
  if not found or p_user_id is null or p_activity_id is null
    or p_stage not in ('prediction_recorded','meaningful_interaction','reflection_recorded','goal_completed')
    or p_interaction_count not between 0 and 1000 or nullif(p_idempotency_key,'') is null
    or (p_stage in ('prediction_recorded','reflection_recorded') and p_response_code not in ('lower','same','higher','qualitative_match','qualitative_mismatch','uncertain'))
    or (p_stage='meaningful_interaction' and p_interaction_count<2) then
    raise exception using errcode='22023',message='Invalid simulator evidence.';
  end if;
  v_previous:=case p_stage when 'prediction_recorded' then 0 when 'meaningful_interaction' then 1 when 'reflection_recorded' then 2 else 3 end;
  if (select count(*) from public.qm_simulator_learning_events where user_id=p_user_id and activity_id=p_activity_id)<>v_previous then
    raise exception using errcode='22023',message='Simulator learning stages must be recorded in order.';
  end if;
  insert into public.qm_simulator_learning_events(user_id,activity_id,simulator_slug,stage,response_code,interaction_count,
    idempotency_key,policy_version) values(p_user_id,p_activity_id,p_simulator_slug,p_stage,p_response_code,p_interaction_count,
      p_idempotency_key,'qm-learning-policy-2026-09-25.1') returning * into v_event;
  insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,concept_ids,source_ids,
    activity_id,idempotency_key,policy_version,evidence,xp_delta)
    values(p_user_id,'simulator_'||p_stage,v_event.occurred_at,v_contract.content_id,v_contract.chapter_id,v_contract.concept_ids,
      v_contract.source_ids,p_activity_id,'ledger:'||p_idempotency_key,v_event.policy_version,
      jsonb_build_object('stage',p_stage,'interaction_count',p_interaction_count,'mastery','insufficient_evidence'),0);
  if p_stage='goal_completed' then perform private.qm_sync_learning_projection(p_user_id,true); end if;
  return jsonb_build_object('activity_id',p_activity_id,'stage',p_stage,'recorded',true,'xp_delta',0);
end;
$$;
revoke all on function public.record_qm_simulator_learning_stage(uuid,uuid,text,text,text,integer,text) from public,anon,authenticated;
grant execute on function public.record_qm_simulator_learning_stage(uuid,uuid,text,text,text,integer,text) to service_role;

create function public.record_qm_mechanic_fidelity(
  p_user_id uuid,p_mechanism_id text,p_event_type text,p_context_id text,p_idempotency_key text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if p_mechanism_id not in ('section_points','assessment_points','review_points','retry_points','mastery_milestone',
      'level','streak','badges','missions','daily_challenge','simulator_cycle','recommendation')
    or p_event_type not in ('eligible','exposed','acted','opted_out') or nullif(p_context_id,'') is null then
    raise exception using errcode='22023',message='Invalid mechanic event.';
  end if;
  insert into public.qm_learning_mechanic_events(user_id,mechanism_id,event_type,context_id,idempotency_key,policy_version)
    values(p_user_id,p_mechanism_id,p_event_type,p_context_id,p_idempotency_key,'qm-learning-policy-2026-09-25.1')
    on conflict(user_id,idempotency_key) do nothing returning id into v_id;
  return jsonb_build_object('recorded',v_id is not null,'deduped',v_id is null);
end;
$$;
revoke all on function public.record_qm_mechanic_fidelity(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_qm_mechanic_fidelity(uuid,text,text,text,text) to service_role;

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
        (select max(score) from public.qm_learning_attempts where user_id=p_user_id)),'evidence_status','evaluated_by_concept')),
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
