create extension if not exists pgcrypto;
create table if not exists public.qm_chapter_quiz_attempts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 quiz_key text not null, chapter_id text not null check (chapter_id in ('01','02','03','04','05','06','07')),
 answers jsonb not null check (jsonb_typeof(answers)='array'), feedback jsonb not null check (jsonb_typeof(feedback)='array'),
 score integer not null check (score between 0 and 100), correct_count integer not null check (correct_count >= 0), question_count integer not null check (question_count > 0),
 created_at timestamptz not null default timezone('utc',now())
);
create index if not exists qm_chapter_quiz_attempts_user_created_idx on public.qm_chapter_quiz_attempts(user_id,created_at desc);
alter table public.qm_chapter_quiz_attempts enable row level security;
revoke all on public.qm_chapter_quiz_attempts from anon, authenticated;
