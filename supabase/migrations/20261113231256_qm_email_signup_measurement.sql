-- Attribute signup only to the session created by the first email confirmation.
create or replace function public.claim_email_signup_measurement()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  v_claimed uuid;
begin
  if v_user_id is null or v_session_id is null then return false; end if;

  insert into signup_measurement_private.claims (user_id)
    select u.id
    from auth.users u
    join auth.sessions s on s.user_id = u.id and s.id = v_session_id
    cross join signup_measurement_private.config c
    cross join lateral (
      select a.payload ->> 'action' as action,
             a.payload -> 'traits' ->> 'provider' as provider
      from auth.audit_log_entries a
      where a.payload ->> 'actor_id' = u.id::text
        and a.payload ->> 'action' in ('user_signedup', 'login')
        and a.created_at between u.email_confirmed_at - interval '1 minute' and s.created_at
      order by a.created_at desc
      limit 1
    ) event
    where u.id = v_user_id
      and u.is_anonymous is not true
      and u.created_at >= c.activated_at
      and u.email_confirmed_at <= s.created_at
      and s.created_at <= pg_catalog.now()
      and s.created_at >= pg_catalog.now() - interval '30 minutes'
      and s.created_at <= u.email_confirmed_at + interval '1 minute'
      and event.action = 'user_signedup' and event.provider = 'email'
    on conflict (user_id) do nothing
    returning user_id into v_claimed;
  return v_claimed is not null;
end;
$$;
revoke all on function public.claim_email_signup_measurement() from public, anon, authenticated;
grant execute on function public.claim_email_signup_measurement() to authenticated;

-- Keep the stored event allowlist aligned with the client and ingest handler.
alter table public.qm_analytics_events
  drop constraint qm_analytics_events_allowed_event_name_check,
  add constraint qm_analytics_events_allowed_event_name_check
    check (event_name in (
      'session_start', 'home_study_cta_click', 'chapter_start', 'section_open',
      'section_complete', 'simulator_open', 'assessment_start', 'assessment_complete',
      'exercise_generate', 'exercise_solution_open', 'exercise_validation_submit',
      'favorite_changed', 'auth_open', 'login_success', 'sign_up', 'rating_prompt_shown',
      'rating_submitted', 'book_preview_open', 'search_submit', 'search_result_open'
    ));
