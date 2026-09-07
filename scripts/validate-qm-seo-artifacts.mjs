import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { isChapterPublished } from "../lib/qm-content-registry.mjs";
const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), "..");
const siteUrl = "https://qm-beta.vercel.app";
const errors = [];
const read = (filePath) => readFile(path.join(rootDir, filePath), "utf8");
const searchIndex = JSON.parse(await read("data/qm-published-search-index.json"));
const sitemapPages = await read("sitemap-pages.xml");
const sitemapApp = await read("sitemap-app.xml");
for (const section of searchIndex.sections || []) {
  if (!isChapterPublished(section.chapterId)) errors.push(`Search index exposes unpublished Chapter ${section.chapterId}: ${section.url}`);
  const html = await read(section.url);
  const canonical = `${siteUrl}/${section.url}`;
  if (!html.includes(`<link rel="canonical" href="${canonical}"/>`)) errors.push(`Missing canonical for ${section.url}`);
  if (!html.includes('"@type":"LearningResource"')) errors.push(`Missing LearningResource JSON-LD for ${section.url}`);
  if (!html.includes('name="robots" content="index,follow')) errors.push(`Missing indexable robots directive for ${section.url}`);
  if (!sitemapPages.includes(`<loc>${canonical}</loc>`)) errors.push(`Published page missing from sitemap: ${section.url}`);
}
for (const chapterId of ["08", "09", "10", "11", "12", "13"]) {
  if (sitemapPages.includes(`/slides/chapter-${chapterId}/`) || sitemapApp.includes(`chapter=${chapterId}`)) errors.push(`Sitemap exposes Chapter ${chapterId}`);
}
if (!sitemapApp.includes(`<loc>${siteUrl}/search.html</loc>`)) errors.push("Search page missing from the app sitemap.");
const searchHtml = await read("search.html");
if (!searchHtml.includes('data/qm-published-search-index.json')) errors.push("Search page does not consume the generated published index.");
if (errors.length) { console.error(errors.map((error) => `- ${error}`).join("\n")); process.exit(1); }
console.log(`SEO validation passed for ${searchIndex.sections.length} published sections.`);
