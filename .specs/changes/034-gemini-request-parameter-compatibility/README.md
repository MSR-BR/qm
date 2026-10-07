# C34 — Gemini request-parameter compatibility

## Objective and scope

Audit QUANTUM's actual Gemini requests after the owner's 2026-10-07 notice about deprecated sampling and thinking controls. Make the smallest model-aware correction. The owner subsequently requested `cpd limpo`, authorizing commit, push to `main`, and production deployment of this change. No paid API request, model/key/environment change, or migration from `generateContent` to Interactions is authorized.

## Evidence and requirements

- The sole Gemini request builder is `callGeminiJson` in `lib/exercicio-handler.mjs`, used for exercise generation, math refinement, and validation review through `api/exercicio.js` and the validation handler. It calls `v1beta/models/{model}:generateContent` with `generationConfig.responseMimeType` and, before C34, `temperature` (0.7 for generation; 0.2 for refinement/review). No `topP`/`top_p`, `topK`/`top_k`, `thinkingBudget`/`thinking_budget`, or `thinkingLevel`/`thinking_level` is sent by this repository.
- Code default and fallback: `gemini-2.5-flash`. The local, untracked `.env.local` declares `GEMINI_MODEL=gemini-flash-latest`; no key value was read or recorded. The alias is movable, so its effective model can change. The Vercel environment-variable listing was denied (403); the production `GEMINI_MODEL` value is **not confirmed**.
- Vercel deployment `dpl_HoRQyfHBS6B4pEr4PrugiR5e3zY5`, serving the production domain when inspected on 2026-10-07, reports commit `d6f0e013ba0ad5f7a3d98bba17e19f026d706c4d`, matching the clean local checkout before C34. This does not prove which Google Cloud project owns `GEMINI_API_KEY`. The account/project relationship in the Google warning is **not confirmed**.
- Google documentation says sampling parameters are deprecated for Gemini 3.6 Flash, 3.5 Flash-Lite and future releases, with future HTTP 400 rejection. Gemini 3.8 Flash does not support `minimal` thinking. Gemini 2.5 does not support `thinkingLevel`; its existing temperature behavior should be retained. No thinking control is currently sent, so model defaults remain in force.

## Implementation and tasks

1. Keep `temperature` only for explicit `gemini-2.5-*` model IDs. Omit it for Gemini 3.x, movable aliases, and unknown model IDs. Continue sending `responseMimeType: application/json`.
2. Do not introduce `thinkingLevel`: there is no `thinkingBudget` to replace, and omitting both avoids unsupported values or a behavior change.
3. Test outgoing request bodies for Gemini 3.8, `gemini-flash-latest`, explicit/default 2.5; simulate HTTP 400 with fallback success and total failure without network access.

## Acceptance, risks, and validation

- Six mock-fetch tests pass in `tests/qm-gemini-parameter-compatibility.test.mjs`; no live Gemini call was made.
- `node --check lib/exercicio-handler.mjs`, `npm run check`, `npm run smoke:ai-context`, `npm run smoke:math-contract`, and `git diff --check` pass locally.
- Risk: omitting temperature for a non-2.5 model or the moving alias can change exercise wording and reproducibility. The 2.5 values are unchanged. The 2.5 fallback may be unavailable to a new Google project under current access rules; no model switch is authorized here.
- Release decision: the owner requested `cpd limpo` after local review. The production domain was rechecked against the expected Vercel project, Git repository, branch, and pre-C34 commit. Environment metadata access remains denied (403), so the production `GEMINI_MODEL` and the key-owning Google project remain **not confirmed**. This is not a blocker for this request-body-only change: explicit Gemini 2.5 retains its previous temperature, while all other IDs omit the deprecated parameter; no key, model, or environment setting changes. Representative paid exercise/validation quality was not tested and remains a post-release observation item, not a claim of validation. No paid API call was made.

## Source and model-routing record

- [Google Gemini 3.6/3.5 Flash-Lite parameter changes](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.6)
- [Google Gemini thinking levels and 2.5 behavior](https://ai.google.dev/gemini-api/docs/generate-content/thinking)
- [Google Gemini model aliases](https://ai.google.dev/gemini-api/docs/models)
- The assistant did not request a model override or delegate work. The exact assistant model/runtime route is not exposed to this repository; no unsupported claim of a specific execution model is made.
