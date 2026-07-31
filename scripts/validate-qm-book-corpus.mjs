import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const corpus = JSON.parse(readFileSync(resolve(process.cwd(), "data/book-section-corpus.json"), "utf8"));
const errors = [];
for (const section of corpus.sections || []) {
  if (!section.chapterId || !section.itemId || !section.pagePath || !section.content) errors.push(`Incomplete section ${section.chapterId}.${section.itemId}`);
  if (section.pageStart > section.pageEnd) errors.push(`Inverted pages for ${section.itemId}`);
  if (!existsSync(resolve(process.cwd(), section.pagePath))) errors.push(`Missing app page ${section.pagePath}`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`QM book corpus valid: ${(corpus.sections || []).length} sections.`);
