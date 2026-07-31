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
  const fragments = [];
  for (const topicId of topicIds || []) {
    const topic = index.topics.find((entry) => entry.id === topicId);
    if (!topic) continue;
    for (const fragment of topic.fragments || []) {
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
