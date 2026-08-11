import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_PATH = resolve(ROOT_DIR, "data/book-topic-index.json");
let cache = null;

export function loadBookTopicIndex() {
  if (!cache) {
    cache = existsSync(INDEX_PATH)
      ? JSON.parse(readFileSync(INDEX_PATH, "utf8"))
      : { version: "qm-book-topic-index-v1", topics: [], sectionIndex: [] };
  }
  return cache;
}

export function getSectionTopicIndex(sectionId = "") {
  return loadBookTopicIndex().sectionIndex.find((entry) => entry.sectionId === String(sectionId)) || null;
}

function fragmentsFor(sectionId, topicIds, maxFragments) {
  const index = loadBookTopicIndex();
  const sectionIndex = index.sectionIndex || [];
  const currentSection = sectionIndex.find((entry) => entry.sectionId === String(sectionId)) || null;
  const orderBySection = new Map(sectionIndex.map((entry, order) => [entry.sectionId, order]));
  const currentOrder = orderBySection.get(String(sectionId)) ?? 0;
  const fragments = [];
  for (const topicId of topicIds || []) {
    const topic = index.topics.find((entry) => entry.id === topicId);
    if (!topic) continue;
    const rankedFragments = (topic.fragments || [])
      .filter((fragment) => fragment.sectionId !== sectionId)
      .slice()
      .sort((left, right) => {
        const leftSameChapter = currentSection && left.chapterId === currentSection.chapterId ? 0 : 1;
        const rightSameChapter = currentSection && right.chapterId === currentSection.chapterId ? 0 : 1;
        if (leftSameChapter !== rightSameChapter) return leftSameChapter - rightSameChapter;
        const leftOrder = orderBySection.get(left.sectionId) ?? 9999;
        const rightOrder = orderBySection.get(right.sectionId) ?? 9999;
        return Math.abs(leftOrder - currentOrder) - Math.abs(rightOrder - currentOrder) || leftOrder - rightOrder;
      });
    for (const fragment of rankedFragments) {
      if (fragment.sectionId !== sectionId) fragments.push({ topicId, topicLabel: topic.label, ...fragment });
      if (fragments.length >= maxFragments) return fragments;
    }
  }
  return fragments;
}

export function getRelatedTopicFragmentsForSection(sectionId, { maxFragments = 2 } = {}) {
  const section = getSectionTopicIndex(sectionId);
  return section ? fragmentsFor(section.sectionId, section.transversalTopics, maxFragments) : [];
}

export function getAdvancedSupportFragmentsForSection(sectionId, { maxFragments = 2 } = {}) {
  const section = getSectionTopicIndex(sectionId);
  return section ? fragmentsFor(section.sectionId, section.advancedSupportTopics, maxFragments) : [];
}
