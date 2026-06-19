create extension if not exists pgcrypto;

create table if not exists public.qm_saved_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text,
  item_id text,
  page_path text not null,
  page_url text not null,
  page_title text not null,
  difficulty text not null check (difficulty in ('facil', 'medio', 'dificil')),
  exercise_title text not null,
  statement text not null,
  solution text not null,
  source_model text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists qm_saved_exercises_user_created_at_idx
  on public.qm_saved_exercises (user_id, created_at desc);

alter table public.qm_saved_exercises enable row level security;

create or replace function public.set_qm_saved_exercises_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists qm_saved_exercises_set_updated_at on public.qm_saved_exercises;

create trigger qm_saved_exercises_set_updated_at
before update on public.qm_saved_exercises
for each row
execute function public.set_qm_saved_exercises_updated_at();

drop policy if exists "Users can view their own QM saved exercises" on public.qm_saved_exercises;
create policy "Users can view their own QM saved exercises"
on public.qm_saved_exercises
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can insert their own QM saved exercises" on public.qm_saved_exercises;
create policy "Users can insert their own QM saved exercises"
on public.qm_saved_exercises
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can update their own QM saved exercises" on public.qm_saved_exercises;
create policy "Users can update their own QM saved exercises"
on public.qm_saved_exercises
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can delete their own QM saved exercises" on public.qm_saved_exercises;
create policy "Users can delete their own QM saved exercises"
on public.qm_saved_exercises
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
