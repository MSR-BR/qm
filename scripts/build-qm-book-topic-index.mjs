import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { isChapterExerciseEligible } from "../lib/qm-content-registry.mjs";

const root = process.cwd();
const corpusPath = resolve(root, "data/book-section-corpus.json");
const taxonomyPath = resolve(root, "data/book-topic-taxonomy.json");
const outputPath = resolve(root, "data/book-topic-index.json");

const corpus = JSON.parse(readFileSync(corpusPath, "utf8"));
const taxonomy = JSON.parse(readFileSync(taxonomyPath, "utf8"));
const sections = (Array.isArray(corpus.sections) ? corpus.sections : []).filter((section) => isChapterExerciseEligible(section.chapterId));
const sectionTopics = (Array.isArray(taxonomy.sectionTopics) ? taxonomy.sectionTopics : []).filter((entry) => isChapterExerciseEligible(entry.chapterId));
const topicConfigs = Array.isArray(taxonomy.transversalTopics) ? taxonomy.transversalTopics : [];

const sectionById = new Map(sections.map((section) => [section.itemId, section]));
const topicConfigById = new Map(topicConfigs.map((topic) => [topic.id, topic]));
const sectionOrder = new Map(sections.map((section, index) => [section.itemId, index]));

function truncateText(value = "", maxChars = 900) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text || text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastBreak = Math.max(sliced.lastIndexOf(". "), sliced.lastIndexOf("; "));
  return `${sliced.slice(0, lastBreak >= Math.floor(maxChars * 0.55) ? lastBreak + 1 : maxChars).trimEnd()}...`;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function referenceSummary(section = {}) {
  return (section.references || []).map((reference) => ({
    id: reference.id,
    label: reference.label,
    pdfChapterNumber: reference.pdfChapterNumber,
    pdfChapterTitle: reference.pdfChapterTitle,
    pageStart: reference.pageStart,
    pageEnd: reference.pageEnd,
    mappingReason: reference.mappingReason,
    extractionSources: reference.extractionSources || [],
    needsReview: Boolean(reference.needsReview)
  }));
}

function topicIdsForEntry(entry = {}) {
  return unique([
    entry.primaryTopic,
    ...(entry.topicTags || []),
    ...(entry.advancedTopicTags || [])
  ]);
}

function buildFragment({ topicId, entry, section }) {
  const isPrimaryTopic = entry.primaryTopic === topicId;
  return {
    sectionId: entry.sectionId,
    chapterId: entry.chapterId,
    itemId: entry.itemId,
    title: entry.title,
    pagePath: section?.pagePath || "",
    relation: isPrimaryTopic ? "primary-topic" : "tagged-topic",
    primaryTopic: entry.primaryTopic,
    topicTags: entry.topicTags || [],
    advancedTopicTags: entry.advancedTopicTags || [],
    pdfChapterNumber: section?.pdfChapterNumber || "",
    pdfChapterTitle: section?.pdfChapterTitle || "",
    pageStart: section?.pageStart || 0,
    pageEnd: section?.pageEnd || 0,
    references: referenceSummary(section),
    excerpt: truncateText(section?.excerpt || section?.content || "", 900),
    mappingReason: section?.mappingReason || "",
    reviewStatus: entry.reviewStatus || taxonomy.scope?.reviewStatus || "curated"
  };
}

function buildTopics() {
  return topicConfigs.map((topic) => {
    const fragments = sectionTopics
      .filter((entry) => topicIdsForEntry(entry).includes(topic.id))
      .sort((left, right) => (sectionOrder.get(left.sectionId) ?? 9999) - (sectionOrder.get(right.sectionId) ?? 9999))
      .map((entry) => buildFragment({
        topicId: topic.id,
        entry,
        section: sectionById.get(entry.sectionId)
      }));

    if (!fragments.length) return null;

    return {
      id: topic.id,
      label: topic.label,
      usage: topic.usage || "default",
      sectionCount: fragments.length,
      chapters: unique(fragments.map((fragment) => fragment.chapterId)).sort(),
      fragments,
      usageHint: topic.usage === "advanced-support"
        ? "Use this topic only as advanced support; it must not replace the current page as the exercise anchor."
        : "Use these fragments as related context. The current section remains the primary exercise anchor."
    };
  }).filter(Boolean);
}

function buildSectionIndex() {
  return sectionTopics
    .slice()
    .sort((left, right) => (sectionOrder.get(left.sectionId) ?? 9999) - (sectionOrder.get(right.sectionId) ?? 9999))
    .map((entry) => {
      const section = sectionById.get(entry.sectionId);
      const topicTags = unique([entry.primaryTopic, ...(entry.topicTags || [])]);
      const transversalTopics = topicTags.filter((topicId) => (topicConfigById.get(topicId)?.usage || "default") !== "advanced-support");
      const advancedSupportTopics = unique([
        ...(entry.advancedTopicTags || []),
        ...topicTags.filter((topicId) => (topicConfigById.get(topicId)?.usage || "default") === "advanced-support")
      ]);

      return {
        sectionId: entry.sectionId,
        chapterId: entry.chapterId,
        itemId: entry.itemId,
        title: entry.title,
        pagePath: section?.pagePath || "",
        primaryTopic: entry.primaryTopic,
        topicTags,
        advancedTopicTags: entry.advancedTopicTags || [],
        transversalTopics,
        advancedSupportTopics,
        reviewStatus: entry.reviewStatus || taxonomy.scope?.reviewStatus || "curated",
        canonicalReference: {
          pdfChapterNumber: section?.pdfChapterNumber || "",
          pdfChapterTitle: section?.pdfChapterTitle || "",
          pageStart: section?.pageStart || 0,
          pageEnd: section?.pageEnd || 0,
          references: referenceSummary(section)
        }
      };
    });
}

const topics = buildTopics();
const sectionIndex = buildSectionIndex();

writeFileSync(outputPath, `${JSON.stringify({
  version: "qm-book-topic-index-v2",
  generatedAt: new Date().toISOString(),
  sourceTaxonomy: "data/book-topic-taxonomy.json",
  sourceCorpus: "data/book-section-corpus.json",
  description: "Curated topic index for QM AI exercises. It connects each reviewed app section to canonical book references and controlled related topics.",
  sectionCount: sectionIndex.length,
  topicCount: topics.length,
  topics,
  sectionIndex
}, null, 2)}\n`);

console.log(`Wrote curated QM topic index for ${sectionIndex.length} sections and ${topics.length} topics.`);
