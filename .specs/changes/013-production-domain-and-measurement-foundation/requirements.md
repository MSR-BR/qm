# Requirements

- Use a user-approved final domain only; do not infer or purchase a domain.
- Attach the final domain in Vercel and document the exact DNS records required.
- Keep HTTPS active and redirect the temporary `qm-beta.vercel.app` host to the final canonical host only after the final host is serving correctly.
- Add the final production URL and approved redirect URLs to Supabase Auth before changing public sign-in links.
- Provide a cutover and rollback note before CPD.
- Do not change DNS, Vercel domain settings, or Supabase Auth settings without scoped user authorization and required access.
