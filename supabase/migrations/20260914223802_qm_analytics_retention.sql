-- C16: keep consented, non-identifying learning telemetry for no longer than 90 days.

-- Identity is deliberately not part of this dataset.
alter table public.qm_analytics_events
  drop column if exists user_id;

alter table public.qm_analytics_events
  drop constraint if exists qm_analytics_events_allowed_event_name_check;

alter table public.qm_analytics_events
  add constraint qm_analytics_events_allowed_event_name_check
  check (event_name in (
    'session_start',
    'home_study_cta_click',
    'chapter_start',
    'section_open',
    'section_complete',
    'simulator_open',
    'assessment_start',
    'assessment_complete',
    'exercise_generate',
    'exercise_solution_open',
    'exercise_validation_submit',
    'favorite_changed',
    'auth_open',
    'login_success',
    'rating_prompt_shown',
    'rating_submitted',
    'book_preview_open',
    'search_submit',
    'search_result_open'
  ));

comment on table public.qm_analytics_events is
  'Consent-based, non-PII product events. Rows are automatically removed after 90 days.';

create or replace function public.purge_qm_analytics_events()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  delete from public.qm_analytics_events
  where created_at < timezone('utc', now()) - interval '90 days';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_qm_analytics_events() from public, anon, authenticated;
grant execute on function public.purge_qm_analytics_events() to service_role;

create or replace function public.enforce_qm_analytics_retention()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.purge_qm_analytics_events();
  return null;
end;
$$;

revoke all on function public.enforce_qm_analytics_retention() from public, anon, authenticated;
grant execute on function public.enforce_qm_analytics_retention() to service_role;

drop trigger if exists qm_analytics_events_enforce_retention on public.qm_analytics_events;
create trigger qm_analytics_events_enforce_retention
before insert on public.qm_analytics_events
for each statement execute function public.enforce_qm_analytics_retention();
