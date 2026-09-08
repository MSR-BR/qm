# Acceptance criteria

- The final domain serves QM over HTTPS.
- Sign-in on the final host returns the learner to the intended QM page.
- The temporary Vercel host either redirects safely to the final host or remains explicitly documented as a non-promoted fallback.
- The cutover and rollback checks are recorded before CPD.
