import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isChapterExerciseEligible } from "../lib/qm-content-registry.mjs";

const root = process.cwd();
const taxonomy = JSON.parse(readFileSync(resolve(root, "data/book-topic-taxonomy.json"), "utf8"));
const corpus = JSON.parse(readFileSync(resolve(root, "data/book-section-corpus.json"), "utf8"));

const corpusSections = (Array.isArray(corpus.sections) ? corpus.sections : []).filter((section) => isChapterExerciseEligible(section.chapterId));
const taxonomySections = (Array.isArray(taxonomy.sectionTopics) ? taxonomy.sectionTopics : []).filter((entry) => isChapterExerciseEligible(entry.chapterId));
const topics = Array.isArray(taxonomy.transversalTopics) ? taxonomy.transversalTopics : [];
const errors = [];

const corpusSectionIds = new Set(corpusSections.map((section) => section.itemId));
const taxonomySectionIds = new Set(taxonomySections.map((entry) => entry.sectionId));
const topicConfigById = new Map(topics.map((topic) => [topic.id, topic]));
const topicUsageById = new Map(topics.map((topic) => [topic.id, topic.usage || "default"]));
const referencedTopicIds = new Map();

function rememberTopic(topicId, sectionId) {
  if (!topicId) return;
  if (!referencedTopicIds.has(topicId)) referencedTopicIds.set(topicId, []);
  referencedTopicIds.get(topicId).push(sectionId);
}

if (!taxonomy.version) errors.push("Taxonomy is missing version.");
if (!taxonomy.sourceCorpus) errors.push("Taxonomy is missing sourceCorpus.");
if (!taxonomy.scope?.chapters?.length) errors.push("Taxonomy scope must list reviewed chapters.");
if ((taxonomy.scope?.chapters || []).some((chapterId) => !isChapterExerciseEligible(chapterId))) errors.push("Taxonomy scope includes a chapter that is not exercise-eligible.");

for (const sectionId of corpusSectionIds) {
  if (!taxonomySectionIds.has(sectionId)) {
    errors.push(`Missing taxonomy entry for corpus section ${sectionId}.`);
  }
}

for (const entry of taxonomySections) {
  if (!corpusSectionIds.has(entry.sectionId)) {
    errors.push(`Taxonomy entry ${entry.sectionId || "unknown"} does not exist in corpus.`);
  }

  if (!entry.chapterId || !entry.itemId || !entry.title) {
    errors.push(`Taxonomy entry ${entry.sectionId || "unknown"} must include chapterId, itemId and title.`);
  }

  if (!entry.primaryTopic) {
    errors.push(`Taxonomy entry ${entry.sectionId || "unknown"} has no primaryTopic.`);
  }

  const topicTags = Array.isArray(entry.topicTags) ? entry.topicTags : [];
  const advancedTopicTags = Array.isArray(entry.advancedTopicTags) ? entry.advancedTopicTags : [];

  if (!topicTags.length) {
    errors.push(`Taxonomy entry ${entry.sectionId || "unknown"} has no topicTags.`);
  }

  if (entry.primaryTopic && !topicTags.includes(entry.primaryTopic)) {
    errors.push(`Taxonomy entry ${entry.sectionId} must include its primaryTopic in topicTags.`);
  }

  for (const topicId of [...topicTags, ...advancedTopicTags]) {
    if (!topicConfigById.has(topicId)) {
      errors.push(`Taxonomy entry ${entry.sectionId} references unknown topic ${topicId}.`);
    }
    rememberTopic(topicId, entry.sectionId);
  }

  for (const topicId of topicTags) {
    if (topicUsageById.get(topicId) === "advanced-support") {
      errors.push(`Taxonomy entry ${entry.sectionId} uses advanced topic ${topicId} inside topicTags; move it to advancedTopicTags.`);
    }
  }

  for (const topicId of advancedTopicTags) {
    if (topicUsageById.get(topicId) !== "advanced-support") {
      errors.push(`Taxonomy entry ${entry.sectionId} uses non-advanced topic ${topicId} inside advancedTopicTags.`);
    }
  }
}

for (const topic of topics) {
  if (!topic.id || !topic.label) {
    errors.push(`Every transversal topic must include id and label.`);
    continue;
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.id)) {
    errors.push(`Topic ${topic.id} must be a lowercase slug.`);
  }
  if (!referencedTopicIds.has(topic.id)) {
    errors.push(`Topic ${topic.id} is not referenced by any section.`);
  }
}

if (errors.length) {
  console.error("QM book topic taxonomy validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("QM book topic taxonomy valid.");
console.log(`- ${taxonomySections.length} app sections indexed.`);
console.log(`- ${topics.length} curated topics indexed.`);
