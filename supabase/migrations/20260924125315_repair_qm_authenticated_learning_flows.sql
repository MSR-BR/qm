-- C21: repair the atomic section-completion reward workflow.
-- Data API privileges are intentionally centralized in the later C27 migration
-- so functional repair and access control remain independently reviewable.

create or replace function public.record_qm_section_completion_reward(
  p_user_id uuid,
  p_idempotency_key text,
  p_chapter_id text,
  p_item_id text,
  p_page_path text
)
returns table (
  awarded boolean,
  xp_delta integer,
  xp_total integer,
  level integer,
  current_streak integer,
  best_streak integer,
  studied_items_count integer
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_awarded boolean := false;
  v_today date := (current_timestamp at time zone 'America/Sao_Paulo')::date;
  v_previous_xp integer;
  v_previous_streak integer;
  v_previous_best integer;
  v_previous_active date;
  v_previous_count integer;
  v_next_streak integer;
begin
  if p_user_id is null then
    raise exception using errcode = '22023', message = 'A verified learner is required.';
  end if;

  if p_chapter_id is null or p_chapter_id not in ('01', '02', '03', '04', '05', '06', '07') then
    raise exception using errcode = '22023', message = 'The chapter is not eligible for rewards.';
  end if;

  if nullif(btrim(p_item_id), '') is null
    or nullif(btrim(p_page_path), '') is null
    or nullif(btrim(p_idempotency_key), '') is null
    or length(p_idempotency_key) > 500 then
    raise exception using errcode = '22023', message = 'The reward event is incomplete.';
  end if;

  insert into public.qm_gamification_profiles (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select
    profile.xp_total,
    profile.current_streak,
    profile.best_streak,
    profile.last_active_on,
    profile.studied_items_count
  into
    v_previous_xp,
    v_previous_streak,
    v_previous_best,
    v_previous_active,
    v_previous_count
  from public.qm_gamification_profiles as profile
  where profile.user_id = p_user_id
  for update;

  insert into public.qm_gamification_events (
    user_id,
    event_type,
    idempotency_key,
    chapter_id,
    item_id,
    page_path,
    xp_delta
  ) values (
    p_user_id,
    'section_completed',
    p_idempotency_key,
    p_chapter_id,
    p_item_id,
    p_page_path,
    20
  )
  on conflict do nothing
  returning true into v_awarded;

  v_awarded := coalesce(v_awarded, false);

  if v_awarded then
    v_next_streak := case
      when v_previous_active = v_today then v_previous_streak
      when v_previous_active = v_today - 1 then v_previous_streak + 1
      else 1
    end;

    update public.qm_gamification_profiles as profile
    set
      xp_total = v_previous_xp + 20,
      level = floor((v_previous_xp + 20) / 100.0)::integer + 1,
      current_streak = v_next_streak,
      best_streak = greatest(v_previous_best, v_next_streak),
      last_active_on = v_today,
      studied_items_count = v_previous_count + 1
    where profile.user_id = p_user_id;
  end if;

  return query
  select
    v_awarded,
    case when v_awarded then 20 else 0 end,
    profile.xp_total,
    profile.level,
    profile.current_streak,
    profile.best_streak,
    profile.studied_items_count
  from public.qm_gamification_profiles as profile
  where profile.user_id = p_user_id;
end;
$$;

revoke all on function public.record_qm_section_completion_reward(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_qm_section_completion_reward(uuid, text, text, text, text)
  to service_role;

comment on function public.record_qm_section_completion_reward(uuid, text, text, text, text)
  is 'Atomically records one reviewed QM section completion and updates its learner reward projection.';

notify pgrst, 'reload schema';
