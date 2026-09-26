-- C27: explicit Data API privileges for the Supabase default change scheduled
-- for 2026-10-30. RLS remains enabled and authoritative for row ownership.
-- This migration makes object reachability explicit and removes implicit grants
-- inherited by older projects before granting only the operations in the
-- versioned access contract.

-- Learner-owned browser data.
revoke all privileges on table public.qm_saved_exercises from anon, authenticated, service_role;
grant select, insert, update, delete on table public.qm_saved_exercises to authenticated;

revoke all privileges on table public.qm_exercise_validation_reports from anon, authenticated, service_role;
grant select on table public.qm_exercise_validation_reports to anon;
grant select, insert, update on table public.qm_exercise_validation_reports to authenticated;
-- Used only by the authorized disposable-audit cleanup path.
grant delete on table public.qm_exercise_validation_reports to service_role;

revoke all privileges on table public.qm_study_progress from anon, authenticated, service_role;
grant select, insert, update, delete on table public.qm_study_progress to authenticated;
grant select on table public.qm_study_progress to service_role;

revoke all privileges on table public.qm_simulator_activity from anon, authenticated, service_role;
grant select, insert, update on table public.qm_simulator_activity to authenticated;

-- Server-only source, assessment, reward, preference, communication, feedback,
-- and analytics data.
revoke all privileges on table public.qm_book_sources from anon, authenticated, service_role;
grant select, insert, update on table public.qm_book_sources to service_role;

revoke all privileges on table public.qm_gamification_profiles from anon, authenticated, service_role;
grant select on table public.qm_gamification_profiles to authenticated;
grant select, insert, update on table public.qm_gamification_profiles to service_role;

revoke all privileges on table public.qm_gamification_events from anon, authenticated, service_role;
grant select on table public.qm_gamification_events to authenticated;
grant select, insert on table public.qm_gamification_events to service_role;

revoke all privileges on table public.qm_chapter_quiz_attempts from anon, authenticated, service_role;
grant select, insert on table public.qm_chapter_quiz_attempts to service_role;

revoke all privileges on table public.qm_user_legal_preferences from anon, authenticated, service_role;
grant select, insert, update on table public.qm_user_legal_preferences to service_role;

revoke all privileges on table public.qm_email_campaigns from anon, authenticated, service_role;
grant select, insert, update on table public.qm_email_campaigns to service_role;

revoke all privileges on table public.qm_email_recipient_deliveries from anon, authenticated, service_role;
grant select, insert, update on table public.qm_email_recipient_deliveries to service_role;

revoke all privileges on table public.qm_app_ratings from anon, authenticated, service_role;
grant select, insert, update, delete on table public.qm_app_ratings to service_role;

revoke all privileges on table public.qm_analytics_events from anon, authenticated, service_role;
grant select, insert on table public.qm_analytics_events to service_role;

-- Identity sequences are separate privilege-bearing objects.
revoke all privileges on sequence public.qm_app_ratings_id_seq from anon, authenticated, service_role;
grant usage, select on sequence public.qm_app_ratings_id_seq to service_role;

revoke all privileges on sequence public.qm_analytics_events_id_seq from anon, authenticated, service_role;
grant usage, select on sequence public.qm_analytics_events_id_seq to service_role;

-- Trigger helpers are not public RPCs. PostgreSQL checks trigger-function
-- execution when a trigger is created, so revoking API-role EXECUTE does not
-- prevent the existing triggers from firing.
revoke all on function public.set_qm_saved_exercises_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_qm_exercise_validation_reports_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_qm_study_progress_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_qm_gamification_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_qm_user_legal_preferences_updated_at() from public, anon, authenticated, service_role;

-- Private validator helper: authenticated policies and server-side checks only.
revoke all on function private.is_qm_exercise_validator() from public, anon, authenticated, service_role;
grant execute on function private.is_qm_exercise_validator() to authenticated, service_role;

-- Server-only public RPC surface.
revoke all on function public.purge_qm_analytics_events() from public, anon, authenticated, service_role;
grant execute on function public.purge_qm_analytics_events() to service_role;

revoke all on function public.enforce_qm_analytics_retention() from public, anon, authenticated, service_role;
grant execute on function public.enforce_qm_analytics_retention() to service_role;

revoke all on function public.record_qm_section_completion_reward(uuid, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.record_qm_section_completion_reward(uuid, text, text, text, text)
  to service_role;

notify pgrst, 'reload schema';
