import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const corpus = JSON.parse(readFileSync(resolve(root, "data/book-section-corpus.json"), "utf8"));
const sections = Array.isArray(corpus.sections) ? corpus.sections : [];

const advancedByChapter = {
  "01": ["wave-particle-duality", "quantization"],
  "02": ["operator-formalism", "fourier-analysis"],
  "03": ["spectral-theorem", "unitary-evolution"]
};

function slug(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function excerpt(value = "") { return String(value).replace(/\s+/g, " ").trim().slice(0, 520); }

const topicMap = new Map();
const sectionIndex = sections.map((section, index) => {
  const primaryTopic = slug(section.topicTitle) || `qm-${section.chapterId}-${section.itemId}`;
  const chapterSections = sections.filter((entry) => entry.chapterId === section.chapterId);
  const localIndex = chapterSections.findIndex((entry) => entry.itemId === section.itemId);
  const neighbor = chapterSections[localIndex + 1] || chapterSections[localIndex - 1];
  const transversalTopics = neighbor ? [slug(neighbor.topicTitle)] : [];
  const advancedSupportTopics = advancedByChapter[section.chapterId] || [];
  const fragment = {
    sectionId: `${Number(section.chapterId)}.${String(section.itemId).split(".").pop()}`,
    chapterId: section.chapterId,
    itemId: section.itemId,
    title: section.topicTitle,
    pagePath: section.pagePath,
    pageStart: section.pageStart,
    pageEnd: section.pageEnd,
    excerpt: excerpt(section.excerpt || section.content)
  };
  for (const topicId of new Set([primaryTopic, ...advancedSupportTopics])) {
    if (!topicMap.has(topicId)) topicMap.set(topicId, { id: topicId, label: topicId.replace(/-/g, " "), fragments: [] });
    topicMap.get(topicId).fragments.push(fragment);
  }
  return { sectionId: fragment.sectionId, chapterId: section.chapterId, itemId: section.itemId, primaryTopic, transversalTopics, advancedSupportTopics };
});

writeFileSync(resolve(root, "data/book-topic-index.json"), `${JSON.stringify({ version: "qm-book-topic-index-v1", generatedAt: new Date().toISOString(), sectionCount: sectionIndex.length, topicCount: topicMap.size, topics: [...topicMap.values()], sectionIndex }, null, 2)}\n`);
console.log(`Wrote topic index for ${sectionIndex.length} QM sections.`);
