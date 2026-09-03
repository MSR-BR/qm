# Notes

`scripts/audit-qm-supabase.mjs` is an active RLS audit: it creates temporary users and rows before deleting them. It must not be run as part of this change's initial verification. A read-only inspection will be used first.

The local configuration currently names a Supabase host, but host presence is not treated as owner confirmation of the remote project.

Remote project reference `plqiofznjlbpfufigpcp` was confirmed on 2026-09-03 through a single authenticated GET against `qm_book_sources`; no rows were created, modified, or deleted.
