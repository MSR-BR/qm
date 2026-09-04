# Requirements

1. Persist private section-level reading progress in the QM Supabase project for authenticated users only.
2. Treat Chapters 1–7 as the only eligible learning content; locked Chapters 8–13 must never enter the learner record or its summaries.
3. Provide an English personal "Study journey" view in the reading app with a continuation action, completed-section count, and chapter completion state.
4. Record a learner's last opened reviewed section automatically after authentication, and let the learner explicitly mark or reopen a section as completed.
5. Calculate chapter completion only from all published sections in the canonical content registry.
6. Keep existing favorites and saved exercises intact; do not add points, streaks, rankings, or public learner data in this change.
7. Apply Supabase RLS, explicit authenticated access grants, user-owned row policies, and indexes appropriate for the learner's private queries.
