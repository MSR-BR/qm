-- C22: optional communication must require an affirmative learner choice.
-- Preserve explicit historical opt-ins (which have an opt-in timestamp) and
-- withdraw only legacy rows that inherited the former default=true value.

alter table public.qm_user_legal_preferences
  alter column email_updates_opted_in set default false;

update public.qm_user_legal_preferences
set
  email_updates_opted_in = false,
  email_updates_opted_out_at = coalesce(email_updates_opted_out_at, timezone('utc', now()))
where email_updates_opted_in = true
  and email_updates_opted_in_at is null;
