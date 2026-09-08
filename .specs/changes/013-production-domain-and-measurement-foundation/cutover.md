# Cutover and rollback

## Cutover

1. Complete — Supabase Auth Site URL is `https://quantummechanicsbook.app`; its Redirect URLs include both the final and temporary production hosts, plus the two local development hosts.
2. Run the project validations and deploy only after an explicit CPD.
3. Confirm `https://quantummechanicsbook.app/` responds over HTTPS.
4. Confirm `https://qm-beta.vercel.app/` returns a 308 redirect to the matching path on `https://quantummechanicsbook.app/`.
5. Complete one Google sign-in from the final domain and confirm the learner returns to the original route.
6. Move canonical URLs, sitemap, robots, structured data, and Search Console work into Change 014.

## Rollback

If sign-in or host routing fails after deployment, remove the generated legacy-host redirect from `scripts/build-qm-content-registry.mjs`, rebuild the registry, deploy the prior working commit, and retain both URLs in Supabase Auth while the issue is investigated. The final domain remains attached in Vercel and its DNS stays unchanged.
