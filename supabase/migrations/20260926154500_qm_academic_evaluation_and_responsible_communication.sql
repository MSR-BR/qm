-- C32. Academic outcome separation and responsible optional learning communication.
-- Forward-only. Applying this migration does NOT activate a sender, provider secret,
-- scheduled job or production delivery.
begin;

alter table public.qm_user_legal_preferences
  add column if not exists learning_email_consent_version text,
  add column if not exists learning_email_paused boolean not null default false,
  add column if not exists learning_email_paused_at timestamptz,
  add column if not exists timezone text;

update public.qm_user_legal_preferences
set learning_email_consent_version = 'qm-learning-email-consent-2026-09-26.1'
where email_updates_opted_in = true
  and email_updates_opted_in_at is not null
  and learning_email_consent_version is null;

alter table public.qm_user_legal_preferences
  drop constraint if exists qm_user_legal_preferences_email_consent_check,
  add constraint qm_user_legal_preferences_email_consent_check check (
    email_updates_opted_in = false or (
      email_updates_opted_in_at is not null
      and learning_email_consent_version = 'qm-learning-email-consent-2026-09-26.1'
    )
  ),
  drop constraint if exists qm_user_legal_preferences_timezone_length_check,
  add constraint qm_user_legal_preferences_timezone_length_check check (
    timezone is null or char_length(timezone) between 1 and 80
  );

create table public.qm_learning_communication_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'eligible','sent','delivered','acted','delivery_failed','bounced','opted_out'
  )),
  message_kind text not null check (message_kind in ('due_review')),
  context_id text not null check (char_length(context_id) between 1 and 160),
  content_id text not null references private.qm_reviewed_learning_sections(content_id),
  reason_code text not null check (reason_code in ('recent_evidence_needs_review','spaced_retrieval_due','learner_unsubscribed')),
  idempotency_key text not null,
  policy_version text not null,
  provider_message_id text,
  occurred_at timestamptz not null default now(),
  unique(user_id,idempotency_key)
);

create index qm_learning_communication_user_time
  on public.qm_learning_communication_events(user_id,occurred_at desc);
create index qm_learning_communication_type_time
  on public.qm_learning_communication_events(event_type,occurred_at desc);

alter table public.qm_learning_communication_events enable row level security;
revoke all on table public.qm_learning_communication_events from public,anon,authenticated,service_role;
grant select,insert on table public.qm_learning_communication_events to service_role;

create trigger qm_learning_communication_events_immutable
before update or delete on public.qm_learning_communication_events
for each row execute function public.reject_qm_learning_mutation();

create function public.reserve_qm_learning_message(
  p_user_id uuid,
  p_message_kind text,
  p_context_id text,
  p_content_id text,
  p_reason_code text,
  p_idempotency_key text,
  p_now timestamptz default statement_timestamp()
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_pref public.qm_user_legal_preferences%rowtype;
  v_local timestamp;
  v_existing uuid;
  v_id uuid;
  v_daily integer;
  v_rolling integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  select id into v_existing from public.qm_learning_communication_events
    where user_id=p_user_id and idempotency_key=p_idempotency_key;
  if v_existing is not null then
    return jsonb_build_object('allowed',true,'deduped',true,'event_id',v_existing);
  end if;
  if p_message_kind <> 'due_review'
    or p_reason_code not in ('recent_evidence_needs_review','spaced_retrieval_due')
    or nullif(p_context_id,'') is null
    or not exists(select 1 from private.qm_reviewed_learning_sections where content_id=p_content_id) then
    return jsonb_build_object('allowed',false,'reason','unreviewed_or_invalid_content');
  end if;

  select * into v_pref from public.qm_user_legal_preferences where user_id=p_user_id;
  if not found or v_pref.email_updates_opted_in is not true or v_pref.email_updates_opted_in_at is null
    or v_pref.learning_email_consent_version <> 'qm-learning-email-consent-2026-09-26.1' then
    return jsonb_build_object('allowed',false,'reason','not_opted_in');
  end if;
  if v_pref.terms_version <> '2026-08-13' or v_pref.terms_accepted_at is null
    or v_pref.privacy_version <> '2026-08-13' or v_pref.privacy_acknowledged_at is null then
    return jsonb_build_object('allowed',false,'reason','legal_documents_not_current');
  end if;
  if v_pref.learning_email_paused then
    return jsonb_build_object('allowed',false,'reason','paused');
  end if;
  if v_pref.timezone is null or not exists(select 1 from pg_catalog.pg_timezone_names where name=v_pref.timezone) then
    return jsonb_build_object('allowed',false,'reason','unknown_timezone');
  end if;
  v_local := timezone(v_pref.timezone,p_now);
  if v_local::time >= time '21:00' or v_local::time < time '07:00' then
    return jsonb_build_object('allowed',false,'reason','quiet_hours');
  end if;
  select count(*) into v_daily from public.qm_learning_communication_events e
    where e.user_id=p_user_id and e.event_type='eligible'
      and timezone(v_pref.timezone,e.occurred_at)::date=v_local::date;
  if v_daily >= 1 then return jsonb_build_object('allowed',false,'reason','daily_cap'); end if;
  select count(*) into v_rolling from public.qm_learning_communication_events e
    where e.user_id=p_user_id and e.event_type='eligible' and e.occurred_at >= p_now-interval '7 days';
  if v_rolling >= 2 then return jsonb_build_object('allowed',false,'reason','rolling_cap'); end if;

  insert into public.qm_learning_communication_events(
    user_id,event_type,message_kind,context_id,content_id,reason_code,idempotency_key,policy_version,occurred_at
  ) values(
    p_user_id,'eligible',p_message_kind,p_context_id,p_content_id,p_reason_code,p_idempotency_key,
    'qm-learning-policy-2026-09-25.1',p_now
  ) returning id into v_id;
  return jsonb_build_object('allowed',true,'deduped',false,'event_id',v_id);
end;
$$;
revoke all on function public.reserve_qm_learning_message(uuid,text,text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.reserve_qm_learning_message(uuid,text,text,text,text,text,timestamptz) to service_role;

create function public.read_qm_learning_evaluation_summary()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with per_concept as (
    select user_id,concept_id,
      count(*) as attempts,
      count(*) filter(where correct and hint_level=0 and not solution_revealed) as unaided_correct,
      count(distinct session_id) filter(where correct and hint_level=0 and not solution_revealed) as sessions,
      count(distinct representation) as attempted_representations,
      count(distinct representation) filter(where correct and hint_level=0 and not solution_revealed) as representations,
      min(occurred_at) filter(where correct and hint_level=0 and not solution_revealed) as first_success,
      max(occurred_at) filter(where correct and hint_level=0 and not solution_revealed) as last_success
    from public.qm_learning_attempt_items group by user_id,concept_id
  ), learner_learning as (
    select user_id,
      bool_or(unaided_correct>=2 and sessions>=2 and last_success-first_success>=interval '24 hours') as delayed,
      bool_or(representations>=2) as changed,
      bool_or(attempts>=2) as delayed_eligible,
      bool_or(attempted_representations>=2) as changed_eligible
    from per_concept group by user_id
  ), mechanic as (
    select
      count(*) filter(where event_type='eligible') as eligible,
      count(*) filter(where event_type='exposed') as exposed,
      count(*) filter(where event_type='acted') as acted
    from public.qm_learning_mechanic_events
  ), communication as (
    select
      count(*) filter(where event_type='eligible') as eligible,
      count(*) filter(where event_type='sent') as sent,
      count(*) filter(where event_type='delivered') as delivered,
      count(*) filter(where event_type in ('delivery_failed','bounced')) as failed,
      count(*) filter(where event_type='opted_out') as opted_out
    from public.qm_learning_communication_events
  )
  select jsonb_build_object(
    'generated_at',statement_timestamp(),
    'learning_sample',(select count(*) from learner_learning),
    'delayed_retrieval_learners',(select count(*) from learner_learning where delayed),
    'delayed_eligible_learners',(select count(*) from learner_learning where delayed_eligible),
    'changed_representation_learners',(select count(*) from learner_learning where changed),
    'changed_representation_eligible',(select count(*) from learner_learning where changed_eligible),
    'analytics_events',(select count(*) from public.qm_analytics_events),
    'rating_count',(select count(*) from public.qm_app_ratings),
    'average_rating',(select round(avg(rating)::numeric,2) from public.qm_app_ratings),
    'mechanic_eligible',(select eligible from mechanic),
    'mechanic_exposed',(select exposed from mechanic),
    'mechanic_acted',(select acted from mechanic),
    'communication_eligible',(select eligible from communication),
    'communication_sent',(select sent from communication),
    'communication_delivered',(select delivered from communication),
    'communication_failed',(select failed from communication),
    'communication_opted_out',(select opted_out from communication)
  );
$$;
revoke all on function public.read_qm_learning_evaluation_summary() from public,anon,authenticated;
grant execute on function public.read_qm_learning_evaluation_summary() to service_role;

notify pgrst,'reload schema';
commit;
