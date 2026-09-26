# Requirements

- Preserve existing RLS policies and browser ownership behavior.
- Give every project-created table, function, and sequence an explicit access decision.
- Grant only operations confirmed by browser code, server handlers, maintenance scripts, or bounded audit cleanup.
- Keep assessment attempts server-only and reward writes atomic through the C21 RPC.
- Prevent future objects from entering the migrations without a privilege decision.
- Do not run the remote audit, apply migrations, deploy, or change provider settings without separate authorization.
