import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const indexSource = await readFile(new URL("../index.html", import.meta.url), "utf8");
const assessmentPage = await readFile(new URL("../assessments.html", import.meta.url), "utf8");
const assessmentClient = await readFile(new URL("../assets/qm-assessments.js", import.meta.url), "utf8");
const assessmentStyles = await readFile(new URL("../assets/qm-assessments.css", import.meta.url), "utf8");
const shareClient = await readFile(new URL("../assets/termo-share.js", import.meta.url), "utf8");
const preferenceClient = await readFile(new URL("../assets/qm-first-login-preferences.js", import.meta.url), "utf8");
const preferenceHandler = await readFile(new URL("../lib/qm-legal-preferences-handler.mjs", import.meta.url), "utf8");
const preferenceMigration = await readFile(new URL("../supabase/migrations/20260925230000_qm_optional_email_consent_default_off.sql", import.meta.url), "utf8");

test("header actions are consistent controls and sharing is English-only", function () {
  assert.match(indexSource, /class="header-action termo-points-trigger"/);
  assert.match(indexSource, /class="header-action" target="_blank"/);
  assert.match(indexSource, /<button type="button" class="header-action termo-auth-trigger"/);
  assert.match(indexSource, /<button type="button" class="header-action termo-share-button/);
  assert.match(shareClient, /Explore this interactive Quantum Mechanics book\./);
  assert.doesNotMatch(shareClient, /Veja|este material/);
  assert.doesNotMatch(indexSource, /Veja este interactive/);
});

test("favorite exercises use the shared lookup and accessible detail dialog", function () {
  assert.match(indexSource, /\[\.\.\.state\.savedExercises, \.\.\.state\.favoriteExercises\]/);
  assert.match(indexSource, /role="dialog" aria-modal="true" aria-labelledby="exerciseModalTitle"/);
  assert.match(indexSource, /event\.key === "Escape"/);
  assert.match(indexSource, /typesetExerciseModal\(modal\)/);
  assert.match(indexSource, /summarizeExerciseText/);
});

test("chapter assessments expose responsive, traceable, duplicate-safe practice", function () {
  assert.match(assessmentPage, /This is a chapter assessment, not the Daily Challenge/);
  assert.match(assessmentPage, /id="pageStatus" role="status" aria-live="polite"/);
  assert.match(assessmentClient, /if \(submitting \|\| !quiz\) return/);
  assert.match(assessmentClient, /if \(reporting \|\| !quiz \|\| !result\) return/);
  assert.match(assessmentClient, /Review source:/);
  assert.match(assessmentClient, /Report a possible assessment error/);
  assert.match(assessmentStyles, /@media \(max-width: 520px\)/);
  assert.match(assessmentStyles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("first authenticated use separates required acknowledgement from optional email", function () {
  assert.match(preferenceClient, /name="accept" required/);
  assert.match(preferenceClient, /name="email"/);
  assert.doesNotMatch(preferenceClient, /name="email"[^>]*checked/);
  assert.match(preferenceClient, /emailUpdatesOptedIn: Boolean\(form\.elements\.email\.checked\)/);
  assert.match(preferenceHandler, /emailUpdatesOptedIn: row\.email_updates_opted_in === true/);
  assert.match(preferenceMigration, /alter column email_updates_opted_in set default false/);
  assert.match(preferenceMigration, /email_updates_opted_in_at is null/);
});
