alter table public.qm_book_sources
  drop constraint if exists qm_book_sources_chapter_id_check;

alter table public.qm_book_sources
  add constraint qm_book_sources_chapter_id_check
  check (chapter_id ~ '^[0-9]{2}$');
