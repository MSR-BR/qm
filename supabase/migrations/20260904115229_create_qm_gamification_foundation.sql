create extension if not exists pgcrypto;

create table if not exists public.qm_gamification_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp_total integer not null default 0 check (xp_total >= 0),
  level integer not null default 1 check (level >= 1),
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  last_active_on date,
  studied_items_count integer not null default 0 check (studied_items_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.qm_gamification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('section_completed')),
  idempotency_key text not null,
  chapter_id text not null,
  item_id text not null,
  page_path text not null,
  xp_delta integer not null check (xp_delta >= 0),
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, idempotency_key),
  unique (user_id, event_type, page_path)
);

create index if not exists qm_gamification_events_user_created_idx
  on public.qm_gamification_events (user_id, created_at desc);

alter table public.qm_gamification_profiles enable row level security;
alter table public.qm_gamification_events enable row level security;

revoke all on table public.qm_gamification_profiles from anon;
revoke all on table public.qm_gamification_profiles from authenticated;
revoke all on table public.qm_gamification_events from anon;
revoke all on table public.qm_gamification_events from authenticated;
grant select on table public.qm_gamification_profiles to authenticated;
grant select on table public.qm_gamification_events to authenticated;

drop policy if exists "Users can view their own QM gamification profile" on public.qm_gamification_profiles;
create policy "Users can view their own QM gamification profile"
on public.qm_gamification_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own QM gamification events" on public.qm_gamification_events;
create policy "Users can view their own QM gamification events"
on public.qm_gamification_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.set_qm_gamification_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists qm_gamification_profiles_set_updated_at on public.qm_gamification_profiles;
create trigger qm_gamification_profiles_set_updated_at
before update on public.qm_gamification_profiles
for each row
execute function public.set_qm_gamification_updated_at();
