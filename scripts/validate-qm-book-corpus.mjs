import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isChapterExerciseEligible } from "../lib/qm-content-registry.mjs";

const corpus = JSON.parse(readFileSync(resolve(process.cwd(), "data/book-section-corpus.json"), "utf8"));
const activeSections = (corpus.sections || []).filter((section) => isChapterExerciseEligible(section.chapterId));
const deferredSections = (corpus.sections || []).filter((section) => !isChapterExerciseEligible(section.chapterId));
const errors = [];
for (const section of activeSections) {
  if (!section.chapterId || !section.itemId || !section.pagePath || !section.content) errors.push(`Incomplete eligible section ${section.chapterId}.${section.itemId}`);
  if (section.pageStart > section.pageEnd) errors.push(`Inverted pages for ${section.itemId}`);
  if (!existsSync(resolve(process.cwd(), section.pagePath))) errors.push(`Missing app page ${section.pagePath}`);
  const references = Array.isArray(section.references) ? section.references : [];
  if (!references.length) errors.push(`Missing canonical reference for ${section.itemId}`);
  if (!references.some((reference) => Array.isArray(reference.extractionSources) && reference.extractionSources.length)) errors.push(`Missing PDF source file for ${section.itemId}`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`QM exercise corpus valid: ${activeSections.length} eligible sections; ${deferredSections.length} deferred sections retained locally.`);
