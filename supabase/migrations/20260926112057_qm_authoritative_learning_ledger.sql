-- C29. Forward-only schema; deliberately NO historical learner-data backfill.
-- Apply only after C21/C27 and an authorized, reviewed release gate.
begin;

-- Versioned reviewed allowlist. Seeded from the C28 manifest, not browser input.
create table private.qm_reviewed_learning_sections (
  content_id text primary key,
  chapter_id text not null,
  section_id text not null,
  source_ids text[] not null,
  unique(chapter_id,section_id)
);
revoke all on table private.qm_reviewed_learning_sections from public,anon,authenticated,service_role;
grant select on table private.qm_reviewed_learning_sections to service_role;
insert into private.qm_reviewed_learning_sections(content_id,chapter_id,section_id,source_ids) values
  ('slides/chapter-01/why-old-quantum-physics-matters.html','01','1.1',array['qm-01-1.1']),
  ('slides/chapter-01/wave-optics-classical-benchmark.html','01','1.2',array['qm-01-1.2']),
  ('slides/chapter-01/hydrogen-spectral-lines.html','01','1.3',array['qm-01-1.3']),
  ('slides/chapter-01/cathode-rays-and-electron.html','01','1.4',array['qm-01-1.4']),
  ('slides/chapter-01/black-body-radiation.html','01','1.5',array['qm-01-1.5']),
  ('slides/chapter-01/photoelectric-effect.html','01','1.6',array['qm-01-1.6']),
  ('slides/chapter-01/elementary-charge.html','01','1.7',array['qm-01-1.7']),
  ('slides/chapter-01/electron-diffraction.html','01','1.8',array['qm-01-1.8']),
  ('slides/chapter-01/bohr-model-postulates.html','01','1.9',array['qm-01-1.9']),
  ('slides/chapter-01/bohr-model-hydrogen-spectrum.html','01','1.10',array['qm-01-1.10']),
  ('slides/chapter-01/de-broglie-hypothesis.html','01','1.11',array['qm-01-1.11']),
  ('slides/chapter-01/semi-classical-quantization-rule.html','01','1.12',array['qm-01-1.12']),
  ('slides/chapter-01/scqr-examples.html','01','1.13',array['qm-01-1.13']),
  ('slides/chapter-01/sommerfeld-orbits-ellipse-geometry.html','01','1.14',array['qm-01-1.14']),
  ('slides/chapter-01/timeline-conceptual-synthesis.html','01','1.15',array['qm-01-1.15']),
  ('slides/chapter-02/why-wave-mechanics-is-needed.html','02','2.1',array['qm-02-2.1']),
  ('slides/chapter-02/time-dependent-schrodinger-equation.html','02','2.2',array['qm-02-2.2']),
  ('slides/chapter-02/stationary-states-and-tise.html','02','2.3',array['qm-02-2.3']),
  ('slides/chapter-02/probability-density-and-current.html','02','2.4',array['qm-02-2.4']),
  ('slides/chapter-02/infinite-potential-well.html','02','2.5',array['qm-02-2.5']),
  ('slides/chapter-02/postulates-rules-ahead.html','02','2.6',array['qm-02-2.6']),
  ('slides/chapter-02/quantum-states-superpositions.html','02','2.7',array['qm-02-2.7']),
  ('slides/chapter-02/observables-operators-commutators.html','02','2.8',array['qm-02-2.8']),
  ('slides/chapter-02/measurement-probabilities.html','02','2.9',array['qm-02-2.9']),
  ('slides/chapter-02/expectation-values-and-collapse.html','02','2.10',array['qm-02-2.10']),
  ('slides/chapter-02/ehrenfest-and-virial-theorems.html','02','2.11',array['qm-02-2.11']),
  ('slides/chapter-02/plane-waves-and-localized-packets.html','02','2.12',array['qm-02-2.12']),
  ('slides/chapter-02/gaussian-wave-packet-fourier-width.html','02','2.13',array['qm-02-2.13']),
  ('slides/chapter-02/wave-packet-spreading-uncertainty.html','02','2.14',array['qm-02-2.14']),
  ('slides/chapter-02/chapter-synthesis.html','02','2.15',array['qm-02-2.15']),
  ('slides/chapter-03/why-matrix-mechanics-is-needed.html','03','3.1',array['qm-03-3.1']),
  ('slides/chapter-03/stern-gerlach-experiment-magnetic-force-and-spin.html','03','3.2',array['qm-03-3.2']),
  ('slides/chapter-03/dirac-notation-kets-bras-inner-products.html','03','3.3',array['qm-03-3.3']),
  ('slides/chapter-03/hilbert-space-bases-superposition-completeness.html','03','3.4',array['qm-03-3.4']),
  ('slides/chapter-03/operators-as-matrices.html','03','3.5',array['qm-03-3.5']),
  ('slides/chapter-03/pauli-matrices-and-spin-observables.html','03','3.6',array['qm-03-3.6']),
  ('slides/chapter-03/born-rule-vector-notation.html','03','3.7',array['qm-03-3.7']),
  ('slides/chapter-03/expectation-value-variance-and-preparation.html','03','3.8',array['qm-03-3.8']),
  ('slides/chapter-03/hermitian-operators-and-real-outcomes.html','03','3.9',array['qm-03-3.9']),
  ('slides/chapter-03/commutators-compatibility-and-measurement-order.html','03','3.10',array['qm-03-3.10']),
  ('slides/chapter-03/schrodinger-picture-unitary-time-evolution.html','03','3.11',array['qm-03-3.11']),
  ('slides/chapter-03/heisenberg-picture-operator-evolution.html','03','3.12',array['qm-03-3.12']),
  ('slides/chapter-03/unitary-transformations-and-change-of-basis.html','03','3.13',array['qm-03-3.13']),
  ('slides/chapter-03/operator-functions-and-chapter-synthesis.html','03','3.14',array['qm-03-3.14']),
  ('slides/chapter-04/bound-and-unbound-states-chapter-roadmap.html','04','4.1',array['qm-04-4.1']),
  ('slides/chapter-04/quantum-harmonic-oscillator-qho-model-and-scaling.html','04','4.2',array['qm-04-4.2']),
  ('slides/chapter-04/qho-hermite-equation-and-energy-quantization.html','04','4.3',array['qm-04-4.3']),
  ('slides/chapter-04/qho-ladder-operators-and-oscillator-algebra.html','04','4.4',array['qm-04-4.4']),
  ('slides/chapter-04/qho-expectation-values-and-uncertainty.html','04','4.5',array['qm-04-4.5']),
  ('slides/chapter-04/finite-potential-well-bound-state-setup.html','04','4.6',array['qm-04-4.6']),
  ('slides/chapter-04/finite-well-quantization-and-energy-levels.html','04','4.7',array['qm-04-4.7']),
  ('slides/chapter-04/finite-well-wave-functions-and-penetration.html','04','4.8',array['qm-04-4.8']),
  ('slides/chapter-04/probability-current-reflection-and-transmission.html','04','4.9',array['qm-04-4.9']),
  ('slides/chapter-04/scattering-from-an-attractive-finite-well.html','04','4.10',array['qm-04-4.10']),
  ('slides/chapter-04/delta-function-well-and-scattering.html','04','4.11',array['qm-04-4.11']),
  ('slides/chapter-04/rectangular-barrier-and-quantum-tunneling.html','04','4.12',array['qm-04-4.12']),
  ('slides/chapter-04/chapter-synthesis-one-dimensional-quantum-models.html','04','4.14',array['qm-04-4.14']),
  ('slides/chapter-05/central-potentials-chapter-roadmap.html','05','5.1',array['qm-05-5.1']),
  ('slides/chapter-05/separation-of-variables-in-spherical-coordinates.html','05','5.2',array['qm-05-5.2']),
  ('slides/chapter-05/azimuthal-and-polar-equations.html','05','5.3',array['qm-05-5.3']),
  ('slides/chapter-05/spherical-harmonics.html','05','5.4',array['qm-05-5.4']),
  ('slides/chapter-05/hydrogen-atom-and-effective-potential.html','05','5.5',array['qm-05-5.5']),
  ('slides/chapter-05/hydrogen-spectrum-and-degeneracy.html','05','5.6',array['qm-05-5.6']),
  ('slides/chapter-05/three-dimensional-harmonic-oscillator.html','05','5.7',array['qm-05-5.7']),
  ('slides/chapter-05/hydrogen-atom-and-the-periodic-table.html','05','5.8',array['qm-05-5.8']),
  ('slides/chapter-05/hydrogen-expectation-values.html','05','5.9',array['qm-05-5.9']),
  ('slides/chapter-05/chapter-synthesis-solving-central-potentials.html','05','5.10',array['qm-05-5.10']),
  ('slides/chapter-06/angular-momentum-chapter-roadmap.html','06','6.1',array['qm-06-6.1']),
  ('slides/chapter-06/commutation-relations-and-physical-meaning.html','06','6.2',array['qm-06-6.2']),
  ('slides/chapter-06/compatible-observables-l-squared-and-lz.html','06','6.3',array['qm-06-6.3']),
  ('slides/chapter-06/expectation-values-and-transverse-variance.html','06','6.4',array['qm-06-6.4']),
  ('slides/chapter-06/general-matrix-representation.html','06','6.5',array['qm-06-6.5']),
  ('slides/chapter-06/angular-momentum-in-position-space.html','06','6.6',array['qm-06-6.6']),
  ('slides/chapter-06/generalized-uncertainty-for-angular-momentum.html','06','6.7',array['qm-06-6.7']),
  ('slides/chapter-06/chapter-synthesis-angular-momentum-toolkit.html','06','6.8',array['qm-06-6.8']),
  ('slides/chapter-07/addition-of-angular-momenta-chapter-roadmap.html','07','7.1',array['qm-07-7.1']),
  ('slides/chapter-07/interactions-between-angular-momenta.html','07','7.2',array['qm-07-7.2']),
  ('slides/chapter-07/commutation-relations.html','07','7.3',array['qm-07-7.3']),
  ('slides/chapter-07/vectors-in-the-coupled-basis.html','07','7.4',array['qm-07-7.4']),
  ('slides/chapter-07/hilbert-space-expansion.html','07','7.5',array['qm-07-7.5']),
  ('slides/chapter-07/local-basis-vs-coupled-basis-clebsch-gordan-coefficients.html','07','7.6',array['qm-07-7.6']),
  ('slides/chapter-07/basis-change-of-an-operator.html','07','7.7',array['qm-07-7.7']),
  ('slides/chapter-07/application-magnetic-moment-and-zeeman-effect.html','07','7.8',array['qm-07-7.8']),
  ('slides/chapter-07/application-angular-momentum-of-atoms-and-hunds-rules.html','07','7.9',array['qm-07-7.9']),
  ('slides/chapter-07/addition-of-angular-momenta-chapter-synthesis.html','07','7.10',array['qm-07-7.10']);

create table public.qm_learning_ledger (
  event_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('section_completed', 'assessment_completed')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  content_id text not null,
  chapter_id text not null check (chapter_id in ('01','02','03','04','05','06','07')),
  section_id text,
  concept_ids text[] not null default '{}',
  source_ids text[] not null default '{}',
  attempt_id uuid,
  activity_id uuid,
  idempotency_key text not null,
  policy_version text not null,
  evidence jsonb not null check (jsonb_typeof(evidence) = 'object'),
  xp_delta integer not null check (xp_delta >= 0),
  legacy_reward_id uuid unique,
  unique (user_id, idempotency_key),
  check ((event_type = 'section_completed' and section_id is not null and legacy_reward_id is not null)
    or (event_type = 'assessment_completed' and attempt_id is not null and xp_delta = 0))
);
create index qm_learning_ledger_user_time on public.qm_learning_ledger(user_id, occurred_at desc);
create unique index qm_learning_ledger_section_once on public.qm_learning_ledger(user_id, content_id)
  where event_type = 'section_completed';
create unique index qm_learning_ledger_attempt_once on public.qm_learning_ledger(user_id, attempt_id)
  where event_type = 'assessment_completed';
alter table public.qm_learning_ledger enable row level security;
create policy qm_learning_ledger_own_read on public.qm_learning_ledger for select to authenticated
  using ((select auth.uid()) = user_id);
revoke all on table public.qm_learning_ledger from public, anon, authenticated, service_role;
grant select on table public.qm_learning_ledger to authenticated;
grant select, insert on table public.qm_learning_ledger to service_role;
grant select on table public.qm_simulator_activity to service_role;

create function public.reject_qm_learning_mutation() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  -- Account erasure via auth.users cascade is the sole retention exception.
  if tg_op = 'DELETE' and pg_trigger_depth() > 1
    and not exists (select 1 from auth.users where id = old.user_id) then
    return old;
  end if;
  raise exception using errcode = '55000', message = 'Learning records are append-only.';
end;
$$;
revoke all on function public.reject_qm_learning_mutation() from public, anon, authenticated, service_role;
create trigger qm_learning_ledger_immutable before update or delete on public.qm_learning_ledger
  for each row execute function public.reject_qm_learning_mutation();
create trigger qm_learning_ledger_no_truncate before truncate on public.qm_learning_ledger
  for each statement execute function public.reject_qm_learning_mutation();
create trigger qm_reward_events_immutable before update or delete on public.qm_gamification_events
  for each row execute function public.reject_qm_learning_mutation();
create trigger qm_reward_events_no_truncate before truncate on public.qm_gamification_events
  for each statement execute function public.reject_qm_learning_mutation();

create or replace function public.record_qm_section_completion_reward(
  p_user_id uuid, p_idempotency_key text, p_chapter_id text, p_item_id text, p_page_path text
) returns table (awarded boolean, xp_delta integer, xp_total integer, level integer,
  current_streak integer, best_streak integer, studied_items_count integer)
language plpgsql security invoker set search_path = '' as $$
declare
  v_profile public.qm_gamification_profiles%rowtype;
  v_progress public.qm_study_progress%rowtype;
  v_event public.qm_gamification_events%rowtype;
  v_today date := (current_timestamp at time zone 'America/Sao_Paulo')::date;
  v_streak integer;
  v_awarded boolean := false;
  v_sources text[];
begin
  if p_user_id is null or p_chapter_id is null or p_chapter_id not in ('01','02','03','04','05','06','07')
    or nullif(p_item_id,'') is null or nullif(p_page_path,'') is null
    or p_idempotency_key is distinct from ('section:' || p_chapter_id || ':' || p_item_id || ':' || p_page_path) then
    raise exception using errcode = '22023', message = 'Invalid learning event.';
  end if;
  select s.source_ids into v_sources from private.qm_reviewed_learning_sections s
    where s.content_id = p_page_path and s.chapter_id = p_chapter_id and s.section_id = p_item_id;
  if not found then raise exception using errcode = '22023', message = 'Section is not reviewed.'; end if;
  select * into v_progress from public.qm_study_progress p
    where p.user_id = p_user_id and p.page_path = p_page_path
      and p.chapter_id = p_chapter_id and p.item_id = p_item_id and p.status = 'completed';
  if not found then
    raise exception using errcode = '22023', message = 'Persisted completion is required.';
  end if;
  insert into public.qm_gamification_profiles(user_id) values(p_user_id) on conflict do nothing;
  select * into v_profile from public.qm_gamification_profiles p where p.user_id = p_user_id for update;
  if exists (select 1 from public.qm_gamification_events e where e.user_id = p_user_id
    and not exists (select 1 from public.qm_learning_ledger l where l.legacy_reward_id = e.id))
    or v_profile.xp_total <> (select coalesce(sum(l.xp_delta),0) from public.qm_learning_ledger l where l.user_id = p_user_id)
    or v_profile.studied_items_count <> (select count(*) from public.qm_learning_ledger l where l.user_id = p_user_id and l.event_type = 'section_completed') then
    raise exception using errcode = '55000', message = 'Historical rewards require reconciliation.';
  end if;
  insert into public.qm_gamification_events(user_id,event_type,idempotency_key,chapter_id,item_id,page_path,xp_delta)
    values(p_user_id,'section_completed',p_idempotency_key,p_chapter_id,p_item_id,p_page_path,20)
    on conflict do nothing returning * into v_event;
  v_awarded := found;
  if v_awarded then
    insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,section_id,
      source_ids,activity_id,idempotency_key,policy_version,evidence,xp_delta,legacy_reward_id)
    values(p_user_id,'section_completed',v_event.occurred_at,p_page_path,p_chapter_id,p_item_id,
      v_sources,v_progress.id,p_idempotency_key,'qm-learning-policy-2026-09-25.1',
      '{"kind":"persisted_self_report","mastery":"insufficient_evidence","concepts":"unknown","source":"reviewed_manifest_server_gate"}',20,v_event.id);
    v_streak := case when v_profile.last_active_on = v_today then v_profile.current_streak
      when v_profile.last_active_on = v_today - 1 then v_profile.current_streak + 1 else 1 end;
    update public.qm_gamification_profiles p set xp_total = v_profile.xp_total + 20,
      level = floor((v_profile.xp_total + 20)/100.0)::integer + 1,
      current_streak = v_streak, best_streak = greatest(v_profile.best_streak,v_streak),
      last_active_on = v_today, studied_items_count = v_profile.studied_items_count + 1
      where p.user_id = p_user_id;
  end if;
  return query select v_awarded, case when v_awarded then 20 else 0 end,
    p.xp_total,p.level,p.current_streak,p.best_streak,p.studied_items_count
    from public.qm_gamification_profiles p where p.user_id = p_user_id;
end;
$$;
revoke all on function public.record_qm_section_completion_reward(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_qm_section_completion_reward(uuid,text,text,text,text) to service_role;

-- Existing server-scored assessments provide limited evidence, NOT mastery or a
-- C30 assessment reward. Capture atomically without exposing answers in the ledger.
create function public.capture_qm_assessment_evidence() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,
    attempt_id,idempotency_key,policy_version,evidence,xp_delta)
  values(new.user_id,'assessment_completed',new.created_at,new.quiz_key,new.chapter_id,new.id,
    'assessment:' || new.id::text,'qm-learning-policy-2026-09-25.1',
    jsonb_build_object('kind','server_scored_legacy_assessment','score',new.score,
      'question_count',new.question_count,'help','unknown','session','unknown','mastery','insufficient_evidence'),0);
  return new;
end;
$$;
revoke all on function public.capture_qm_assessment_evidence() from public,anon,authenticated,service_role;
create trigger qm_assessment_ledger after insert on public.qm_chapter_quiz_attempts
  for each row execute function public.capture_qm_assessment_evidence();

-- Operator-only historical import. No invocation occurs in this migration.
-- Dry-run count/XP/eligibility must be reviewed before explicit approval to invoke.
create function public.reconcile_qm_legacy_rewards(p_user_id uuid, p_expected_count integer, p_expected_xp integer)
returns integer language plpgsql security invoker set search_path = '' as $$
declare v_profile public.qm_gamification_profiles%rowtype; v_count integer; v_xp integer; v_inserted integer;
begin
  select * into v_profile from public.qm_gamification_profiles where user_id = p_user_id for update;
  if not found then raise exception 'Missing reward projection'; end if;
  select count(*),coalesce(sum(xp_delta),0) into v_count,v_xp
    from public.qm_gamification_events where user_id = p_user_id;
  if v_count is distinct from p_expected_count or v_xp is distinct from p_expected_xp
    or v_profile.xp_total <> v_xp or v_profile.studied_items_count <> v_count then
    raise exception 'Historical reward mismatch; no changes applied';
  end if;
  if exists (select 1 from public.qm_gamification_events e where e.user_id = p_user_id and
    (e.xp_delta <> 20 or not exists (select 1 from private.qm_reviewed_learning_sections s
      where s.content_id = e.page_path and s.chapter_id = e.chapter_id and s.section_id = e.item_id))) then
    raise exception 'Ineligible legacy rewards require individual review';
  end if;
  insert into public.qm_learning_ledger(user_id,event_type,occurred_at,content_id,chapter_id,section_id,
    idempotency_key,policy_version,evidence,xp_delta,legacy_reward_id)
  select e.user_id,e.event_type,e.occurred_at,e.page_path,e.chapter_id,e.item_id,
    e.idempotency_key,'legacy-unversioned',
    '{"kind":"legacy_reward_preserved","mastery":"insufficient_evidence","concepts":"unknown","help":"unknown","session":"unknown"}',
    e.xp_delta,e.id from public.qm_gamification_events e where e.user_id = p_user_id
    and not exists (select 1 from public.qm_learning_ledger l where l.legacy_reward_id = e.id);
  get diagnostics v_inserted = row_count;
  if (select coalesce(sum(xp_delta),0) from public.qm_learning_ledger where user_id = p_user_id) <> v_xp then
    raise exception 'Ledger mismatch; no changes applied';
  end if;
  return v_inserted;
end;
$$;
revoke all on function public.reconcile_qm_legacy_rewards(uuid,integer,integer) from public,anon,authenticated,service_role;

-- One stable read statement: no mixed snapshots and no last-20 lifetime count.
create function public.read_qm_learning_snapshot(p_user_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'generated_at',statement_timestamp(),
    'progress',coalesce((select jsonb_agg(jsonb_build_object('chapter_id',p.chapter_id,'item_id',p.item_id,
      'page_path',p.page_path,'status',p.status,'last_opened_at',p.last_opened_at))
      from public.qm_study_progress p where p.user_id = p_user_id),'[]'::jsonb),
    'rewards',(select to_jsonb(p) - 'user_id' from public.qm_gamification_profiles p where p.user_id = p_user_id),
    'ledger_xp',(select coalesce(sum(l.xp_delta),0) from public.qm_learning_ledger l where l.user_id = p_user_id),
    'ledger_sections',(select count(*) from public.qm_learning_ledger l where l.user_id = p_user_id and l.event_type = 'section_completed'),
    'unreconciled_rewards',(select count(*) from public.qm_gamification_events e where e.user_id = p_user_id
      and not exists(select 1 from public.qm_learning_ledger l where l.legacy_reward_id = e.id)),
    'assessments',(select jsonb_build_object('total',count(*),'best_score',max(a.score),
      'evidence_status','insufficient_evidence') from public.qm_chapter_quiz_attempts a where a.user_id = p_user_id),
    'simulators',coalesce((select jsonb_agg(jsonb_build_object('slug',s.simulator_slug,'page_path',s.simulator_path,
      'last_opened_at',s.last_opened_at)) from public.qm_simulator_activity s where s.user_id = p_user_id),'[]'::jsonb)
  );
$$;
revoke all on function public.read_qm_learning_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.read_qm_learning_snapshot(uuid) to service_role;
notify pgrst, 'reload schema';
commit;
