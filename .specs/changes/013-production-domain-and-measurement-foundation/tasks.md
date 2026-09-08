# Tasks

- [x] Confirm the user-approved final domain and DNS authority: `quantummechanicsbook.app` at Cloudflare.
- [x] Audit Vercel, Supabase Auth client behavior, and all host-routing references.
- [x] Attach the final domain in Vercel and verify HTTPS/HSTS.
- [x] Prepare the cutover and rollback plan in `cutover.md`.
- [x] Update the client fallbacks for login and local sharing; prepare the generated 308 legacy-host redirect.
- [x] Set Supabase Auth Site URL to `https://quantummechanicsbook.app` and add `https://quantummechanicsbook.app/**` to Redirect URLs, while retaining the legacy and local URLs.
- [ ] Deploy after an explicit CPD, then verify the legacy-host redirect and a full Google sign-in return.
- [ ] Record final verification and mark this change published.
