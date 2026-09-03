# Acceptance criteria

- A single registry identifies each chapter's availability, SEO eligibility, and exercise eligibility.
- The Chapters view displays Chapters 8–13 as unavailable without a working content link.
- Requests to `/slides/chapter-08/...` through `/slides/chapter-13/...` redirect to their unavailable Chapters view.
- Locked chapters are absent from `sitemap.xml` and produce noindex metadata.
- The exercise endpoint returns a clear 403 response for a locked chapter.
- Chapters 1–7 retain their existing published paths.
