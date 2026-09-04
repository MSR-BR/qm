create extension if not exists pgcrypto;

create table if not exists public.qm_study_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text not null,
  item_id text not null,
  page_path text not null,
  page_title text not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  first_opened_at timestamptz not null default timezone('utc', now()),
  last_opened_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, page_path),
  check ((status = 'completed' and completed_at is not null) or (status = 'in_progress' and completed_at is null))
);

create index if not exists qm_study_progress_user_last_opened_idx
  on public.qm_study_progress (user_id, last_opened_at desc);

create index if not exists qm_study_progress_user_chapter_idx
  on public.qm_study_progress (user_id, chapter_id, item_id);

alter table public.qm_study_progress enable row level security;

revoke all on table public.qm_study_progress from anon;
revoke all on table public.qm_study_progress from authenticated;
grant select, insert, update, delete on table public.qm_study_progress to authenticated;

create or replace function public.set_qm_study_progress_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists qm_study_progress_set_updated_at on public.qm_study_progress;

create trigger qm_study_progress_set_updated_at
before update on public.qm_study_progress
for each row
execute function public.set_qm_study_progress_updated_at();

drop policy if exists "Users can view their own QM study progress" on public.qm_study_progress;
create policy "Users can view their own QM study progress"
on public.qm_study_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own QM study progress" on public.qm_study_progress;
create policy "Users can insert their own QM study progress"
on public.qm_study_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own QM study progress" on public.qm_study_progress;
create policy "Users can update their own QM study progress"
on public.qm_study_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own QM study progress" on public.qm_study_progress;
create policy "Users can delete their own QM study progress"
on public.qm_study_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);
