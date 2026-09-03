import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { getContentRegistry, isChapterExerciseEligible } from "../lib/qm-content-registry.mjs";

const root = process.cwd();
const corpus = JSON.parse(readFileSync(resolve(root, "data/book-section-corpus.json"), "utf8"));
const outputPath = resolve(root, "data/qm-exercise-source-manifest.json");
const entries = (corpus.sections || [])
  .filter((section) => isChapterExerciseEligible(section.chapterId))
  .map((section) => {
    const references = Array.isArray(section.references) ? section.references : [];
    const sourceFiles = [...new Set(references.flatMap((reference) => reference.extractionSources || []))].sort();
    return {
      sectionId: String(section.itemId || ""),
      chapterId: String(section.chapterId || "").padStart(2, "0"),
      itemId: String(section.itemId || ""),
      title: String(section.topicTitle || section.sectionTitle || ""),
      pagePath: String(section.pagePath || ""),
      canonicalReference: {
        pdfChapterNumber: String(section.pdfChapterNumber || ""),
        pdfChapterTitle: String(section.pdfChapterTitle || ""),
        pageStart: Number(section.pageStart || 0) || 0,
        pageEnd: Number(section.pageEnd || 0) || 0,
        references: references.map((reference) => ({
          id: String(reference.id || ""),
          label: String(reference.label || ""),
          pageStart: Number(reference.pageStart || 0) || 0,
          pageEnd: Number(reference.pageEnd || 0) || 0,
          extractionSources: Array.isArray(reference.extractionSources) ? reference.extractionSources.map(String) : [],
          needsReview: Boolean(reference.needsReview)
        }))
      },
      sourceFiles,
      needsReview: Boolean(section.needsReview || references.some((reference) => reference.needsReview))
    };
  })
  .sort((left, right) => left.sectionId.localeCompare(right.sectionId, undefined, { numeric: true }));

const manifest = {
  version: "qm-exercise-source-manifest-v1",
  generatedAt: new Date().toISOString(),
  sourceCorpus: "data/book-section-corpus.json",
  publicationRegistry: "data/qm-content-registry.json",
  eligibleChapters: Object.keys(getContentRegistry().chapters).filter((chapterId) => isChapterExerciseEligible(chapterId)),
  sectionCount: entries.length,
  sourceFileCount: new Set(entries.flatMap((entry) => entry.sourceFiles)).size,
  entries
};
manifest.integrity = createHash("sha256").update(JSON.stringify({ ...manifest, generatedAt: "" })).digest("hex");
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote exercise-source manifest for ${entries.length} sections.`);
