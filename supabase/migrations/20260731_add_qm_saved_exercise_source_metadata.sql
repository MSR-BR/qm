-- Provenance for AI-generated QM exercises. These columns remain user-owned under
-- the existing qm_saved_exercises RLS policies.
alter table public.qm_saved_exercises
  add column if not exists source_references jsonb not null default '[]'::jsonb,
  add column if not exists context_package_meta jsonb not null default '{}'::jsonb;

comment on column public.qm_saved_exercises.source_references is
  'Canonical-book and app-page provenance returned by the QM exercise generator.';

comment on column public.qm_saved_exercises.context_package_meta is
  'Non-sensitive context-package audit metadata for the generated exercise.';
