# Tasks

- [x] Confirm the user-approved final domain and DNS authority: `quantummechanicsbook.app` at Cloudflare.
- [x] Audit Vercel, Supabase Auth client behavior, and all host-routing references.
- [x] Attach the final domain in Vercel and verify HTTPS/HSTS.
- [x] Prepare the cutover and rollback plan in `cutover.md`.
- [x] Update the client fallbacks for login and local sharing; evaluate legacy-host routing without risking deep-link or query loss.
- [x] Set Supabase Auth Site URL to `https://quantummechanicsbook.app` and add `https://quantummechanicsbook.app/**` to Redirect URLs, while retaining the legacy and local URLs.
- [x] Keep `qm-beta.vercel.app` as an explicitly documented, non-promoted fallback after discarding the unsafe static redirect draft.
- [x] Verify an authenticated Supabase session on the final domain and retain final-domain OAuth redirect configuration.
- [ ] Publish this documentation and configuration cleanup after an explicit CPD, then mark this change published.
