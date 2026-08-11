import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const index = JSON.parse(readFileSync(resolve(root, "data/book-topic-index.json"), "utf8"));
const taxonomy = JSON.parse(readFileSync(resolve(root, "data/book-topic-taxonomy.json"), "utf8"));

const errors = [];
const taxonomySectionIds = new Set((taxonomy.sectionTopics || []).map((entry) => entry.sectionId));
const taxonomyTopicIds = new Set((taxonomy.transversalTopics || []).map((topic) => topic.id));
const indexSectionIds = new Set((index.sectionIndex || []).map((entry) => entry.sectionId));
const indexTopicIds = new Set((index.topics || []).map((topic) => topic.id));

if (index.sourceTaxonomy !== "data/book-topic-taxonomy.json") {
  errors.push("Index must declare data/book-topic-taxonomy.json as sourceTaxonomy.");
}

if (index.sectionCount !== taxonomySectionIds.size) {
  errors.push(`sectionCount ${index.sectionCount} does not match taxonomy ${taxonomySectionIds.size}.`);
}

if (index.topicCount !== taxonomyTopicIds.size) {
  errors.push(`topicCount ${index.topicCount} does not match taxonomy ${taxonomyTopicIds.size}.`);
}

for (const sectionId of taxonomySectionIds) {
  if (!indexSectionIds.has(sectionId)) errors.push(`Missing index section ${sectionId}.`);
}

for (const topicId of taxonomyTopicIds) {
  if (!indexTopicIds.has(topicId)) errors.push(`Missing index topic ${topicId}.`);
}

for (const topic of index.topics || []) {
  if (!topic.id || !topic.label || !Array.isArray(topic.fragments) || !topic.fragments.length) {
    errors.push(`Invalid topic ${topic.id || "unknown"}.`);
    continue;
  }

  for (const fragment of topic.fragments || []) {
    if (!taxonomySectionIds.has(fragment.sectionId)) {
      errors.push(`Topic ${topic.id} references unknown section ${fragment.sectionId}.`);
    }
    if (!fragment.excerpt) {
      errors.push(`Topic ${topic.id} fragment ${fragment.sectionId} has no excerpt.`);
    }
  }
}

for (const section of index.sectionIndex || []) {
  if (!section.sectionId || !section.primaryTopic) errors.push(`Invalid section index ${section.sectionId || "unknown"}.`);
  if (!Array.isArray(section.transversalTopics)) errors.push(`Section ${section.sectionId} has invalid transversalTopics.`);
  if (!Array.isArray(section.advancedSupportTopics)) errors.push(`Section ${section.sectionId} has invalid advancedSupportTopics.`);
  if (!section.transversalTopics.length && !section.advancedSupportTopics.length) {
    errors.push(`Section ${section.sectionId} has no topic links.`);
  }
  if (section.primaryTopic && !section.transversalTopics.includes(section.primaryTopic)) {
    errors.push(`Section ${section.sectionId} does not include primaryTopic in transversalTopics.`);
  }
}

if (errors.length) {
  console.error("QM book topic index validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`QM book topic index valid: ${index.sectionCount} sections, ${index.topicCount} curated topics.`);
