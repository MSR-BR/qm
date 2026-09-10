# Cutover and rollback

## Cutover

1. Complete — Supabase Auth Site URL is `https://quantummechanicsbook.app`; its Redirect URLs include both the final and temporary production hosts, plus the two local development hosts.
2. Run the project validations and deploy only after an explicit CPD.
3. Confirm `https://quantummechanicsbook.app/` responds over HTTPS.
4. Keep `https://qm-beta.vercel.app/` as a non-promoted fallback only; do not direct canonical URLs, sitemap entries, marketing links, or new users to it.
5. Confirm an authenticated learner session works on the final domain. The Supabase OAuth allow-list remains configured for the final return URL.
6. Move canonical URLs, sitemap, robots, structured data, and Search Console work into Change 014.

## Rollback

If sign-in or host routing fails after deployment, retain the legacy fallback, deploy the prior working commit if needed, and retain both URLs in Supabase Auth while the issue is investigated. The final domain remains attached in Vercel and its DNS stays unchanged.
