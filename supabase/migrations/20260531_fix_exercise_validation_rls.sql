create or replace function public.is_qm_exercise_validator()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from auth.users
    where id = (select auth.uid())
      and lower(email) in ('marioreis@id.uff.br')
  );
$$;

drop policy if exists "Professor can insert QM validation reports" on public.qm_exercise_validation_reports;
create policy "Professor can insert QM validation reports"
on public.qm_exercise_validation_reports
for insert
to authenticated
with check (
  public.is_qm_exercise_validator()
);
