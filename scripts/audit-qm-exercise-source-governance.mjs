import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getContentRegistry, isChapterExerciseEligible } from "../lib/qm-content-registry.mjs";

const root = process.cwd();
const readJson = (file) => JSON.parse(readFileSync(resolve(root, file), "utf8"));
const corpus = readJson("data/book-section-corpus.json");
const taxonomy = readJson("data/book-topic-taxonomy.json");
const index = readJson("data/book-topic-index.json");
const manifest = readJson("data/qm-exercise-source-manifest.json");
const configuredUrl = readFileSync(resolve(root, "scripts/audit-qm-supabase.mjs"), "utf8").match(/SUPABASE_URL\s*=\s*"([^"]+)"/)?.[1] || "";
const configuredProjectRef = configuredUrl.match(/^https:\/\/([a-z0-9]+)\.supabase\.co$/i)?.[1] || "";
const eligibleChapters = Object.keys(getContentRegistry().chapters).filter((chapterId) => isChapterExerciseEligible(chapterId));
const eligibleSections = (corpus.sections || []).filter((section) => isChapterExerciseEligible(section.chapterId));
const errors = [];

if (JSON.stringify(taxonomy.scope?.chapters || []) !== JSON.stringify(eligibleChapters)) errors.push("Taxonomy scope differs from the exercise-eligible chapter registry.");
if (manifest.sectionCount !== eligibleSections.length) errors.push("Source manifest section count differs from eligible corpus coverage.");
if ((index.sectionIndex || []).some((section) => !isChapterExerciseEligible(section.chapterId))) errors.push("Topic index contains a non-eligible chapter.");
for (const entry of manifest.entries || []) {
  if (!entry.pagePath || !existsSync(resolve(root, entry.pagePath))) errors.push(`Missing app page for ${entry.sectionId}.`);
  if (!entry.canonicalReference?.pageStart || !entry.canonicalReference?.pdfChapterTitle) errors.push(`Missing PDF page reference for ${entry.sectionId}.`);
  if (!entry.sourceFiles?.length) errors.push(`Missing PDF source filename for ${entry.sectionId}.`);
  if (entry.needsReview) errors.push(`Eligible source ${entry.sectionId} is still marked needsReview.`);
}

const report = {
  ok: errors.length === 0,
  eligibleChapters,
  eligibleCorpusSections: eligibleSections.length,
  indexedSections: index.sectionCount,
  indexedTopics: index.topicCount,
  manifestSections: manifest.sectionCount,
  distinctSourceFiles: manifest.sourceFileCount,
  supabase: {
    localEnvironmentFilePresent: existsSync(resolve(root, ".env.local")),
    configuredProjectRef: configuredProjectRef || "unavailable",
    remoteOwnershipVerification: "verified separately on 2026-09-03; this command makes no remote request"
  },
  errors
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
