create table if not exists public.qm_simulator_activity (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, simulator_path text not null, simulator_slug text, first_opened_at timestamptz not null default timezone('utc',now()), last_opened_at timestamptz not null default timezone('utc',now()), open_count integer not null default 1 check(open_count>=1), unique(user_id,simulator_path));
alter table public.qm_simulator_activity enable row level security;
revoke all on public.qm_simulator_activity from anon, authenticated;
grant select,insert,update on public.qm_simulator_activity to authenticated;
create policy "Users manage their own QM simulator activity" on public.qm_simulator_activity for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
