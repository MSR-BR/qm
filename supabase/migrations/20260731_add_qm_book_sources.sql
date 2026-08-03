-- Private source PDFs for the QM exercise generator. Files are never exposed to the browser.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'qm-book-sources',
  'qm-book-sources',
  false,
  104857600,
  array['application/pdf']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.qm_book_sources (
  source_key text primary key,
  chapter_id text not null check (chapter_id ~ '^[0-9]{2}$'),
  source_kind text not null check (source_kind in ('theory', 'solutions')),
  storage_bucket text not null default 'qm-book-sources' check (storage_bucket = 'qm-book-sources'),
  storage_path text not null unique,
  original_filename text not null,
  sha256 text not null,
  byte_size bigint not null check (byte_size > 0),
  pdf_page_count integer,
  is_active boolean not null default true,
  uploaded_at timestamptz not null default now()
);

alter table public.qm_book_sources enable row level security;
revoke all on table public.qm_book_sources from anon, authenticated;
grant select, insert, update on table public.qm_book_sources to service_role;

comment on table public.qm_book_sources is
  'Private metadata for book PDFs used by the server-side QM exercise generator.';
