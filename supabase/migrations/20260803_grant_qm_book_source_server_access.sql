-- The source metadata is private to the browser, but the server-side upload
-- and exercise generator require a narrowly scoped service-role grant.
grant select, insert, update on table public.qm_book_sources to service_role;
