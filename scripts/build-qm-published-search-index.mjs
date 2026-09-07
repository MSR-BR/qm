import path from "node:path";
import { fileURLToPath } from "node:url";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { isChapterPublished } from "../lib/qm-content-registry.mjs";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), "..");
const dataDir = path.join(rootDir, "data");
const destination = path.join(dataDir, "qm-published-search-index.json");
const files = (await readdir(dataDir)).filter((name) => /^chapter-\d{2}\.json$/.test(name)).sort();
const sections = [];
for (const fileName of files) {
  const chapterId = fileName.match(/^chapter-(\d{2})\.json$/)?.[1] || "";
  if (!isChapterPublished(chapterId)) continue;
  const chapter = JSON.parse(await readFile(path.join(dataDir, fileName), "utf8"));
  for (const topic of Array.isArray(chapter.topics) ? chapter.topics : []) {
    if (!topic?.url || !topic?.title) continue;
    sections.push({ chapterId, chapterTitle: String(chapter.title || `Chapter ${Number(chapterId)}`), sectionId: String(topic.id || ""), title: String(topic.title), summary: String(topic.note || ""), url: String(topic.url).replace(/^\/+/, "") });
  }
}
await writeFile(destination, `${JSON.stringify({ generatedAt: new Date().toISOString(), sections }, null, 2)}\n`, "utf8");
console.log(`Published search index built: ${sections.length} sections.`);
