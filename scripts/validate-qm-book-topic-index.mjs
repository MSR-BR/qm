import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const index = JSON.parse(readFileSync(resolve(process.cwd(), "data/book-topic-index.json"), "utf8"));
const errors = [];
for (const section of index.sectionIndex || []) {
  if (!section.sectionId || !section.primaryTopic || !Array.isArray(section.transversalTopics) || !Array.isArray(section.advancedSupportTopics)) errors.push(`Invalid section index ${section.sectionId || "unknown"}`);
}
for (const topic of index.topics || []) if (!topic.id || !Array.isArray(topic.fragments) || !topic.fragments.length) errors.push(`Invalid topic ${topic.id || "unknown"}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`QM book topic index valid: ${index.sectionCount} sections, ${index.topicCount} topics.`);
