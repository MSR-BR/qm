revoke all on table public.qm_saved_exercises from anon;
revoke all on table public.qm_saved_exercises from authenticated;
grant select, insert, update, delete on table public.qm_saved_exercises to authenticated;

revoke all on table public.qm_exercise_validation_reports from anon;
revoke all on table public.qm_exercise_validation_reports from authenticated;
grant select on table public.qm_exercise_validation_reports to anon;
grant select, insert, update on table public.qm_exercise_validation_reports to authenticated;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;
grant usage on schema private to service_role;

create or replace function private.is_qm_exercise_validator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where id = (select auth.uid())
      and lower(email) in ('marioreis@id.uff.br')
  );
$$;

revoke all on function private.is_qm_exercise_validator() from public;
grant execute on function private.is_qm_exercise_validator() to authenticated;
grant execute on function private.is_qm_exercise_validator() to service_role;

drop policy if exists "Anyone can read confirmed QM validation memory" on public.qm_exercise_validation_reports;
create policy "Anyone can read confirmed QM validation memory"
on public.qm_exercise_validation_reports
for select
to anon, authenticated
using (
  avoid_propagation is true
  and ai_review_state = 'confirmed_error'
  and review_status = 'approved'
);

drop policy if exists "Users can read own QM validation reports" on public.qm_exercise_validation_reports;
create policy "Users can read own QM validation reports"
on public.qm_exercise_validation_reports
for select
to authenticated
using (
  (select private.is_qm_exercise_validator())
  or coalesce(reporter_user_id, validator_user_id) = (select auth.uid())
  or (
    avoid_propagation is true
    and ai_review_state = 'confirmed_error'
    and review_status = 'approved'
  )
);

drop policy if exists "Professor can update QM validation reports" on public.qm_exercise_validation_reports;
create policy "Professor can update QM validation reports"
on public.qm_exercise_validation_reports
for update
to authenticated
using ((select private.is_qm_exercise_validator()))
with check ((select private.is_qm_exercise_validator()));

drop function if exists public.is_qm_exercise_validator();
