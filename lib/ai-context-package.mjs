import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { getBookSectionContext } from "./book-section-corpus.mjs";
import { getAdvancedSupportFragmentsForSection, getRelatedTopicFragmentsForSection, getSectionTopicIndex } from "./book-topic-index.mjs";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_BOOK_CHARS = 2800;
const MAX_TEACHING_CHARS = 1800;
const MAX_FALLBACK_CHARS = 900;
const MAX_FRAGMENT_CHARS = 520;
const SOLUTION_GUIDANCE_PATH = resolve(ROOT_DIR, "data/book-solution-guidance.json");

function normalizeWhitespace(value = "") {
  return String(value || "").replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function truncate(value = "", max = 1000) {
  const text = normalizeWhitespace(value); if (text.length <= max) return text;
  const slice = text.slice(0, max); const cut = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "));
  return `${slice.slice(0, cut >= max * 0.55 ? cut + 1 : max).trimEnd()}...`;
}
function normalizeChapterId(value = "") { const digits = String(value).replace(/\D/g, ""); return digits ? digits.padStart(2, "0").slice(-2) : ""; }
function normalizeSectionId(chapterId, itemId) { const ch = normalizeChapterId(chapterId); const item = String(itemId || "").trim().split(".").pop(); return ch && item ? `${Number(ch)}.${item}` : ""; }

export function normalizeRelativePagePath(pagePath = "") {
  const raw = String(pagePath || "").trim().split(/[?#]/)[0];
  const withoutOrigin = raw.replace(/^https?:\/\/[^/]+/i, "");
  const relative = withoutOrigin.replace(/^\/+/, "");
  if (!relative || relative.includes("..") || relative.startsWith("/") || relative.startsWith("api/") || /^[a-z]:/i.test(relative)) return "";
  return relative;
}
export function resolveSafeWorkspacePath(pagePath = "") {
  const relative = normalizeRelativePagePath(pagePath); if (!relative) return "";
  const absolute = resolve(ROOT_DIR, relative); const root = ROOT_DIR.endsWith(sep) ? ROOT_DIR : `${ROOT_DIR}${sep}`;
  return absolute.startsWith(root) ? absolute : "";
}
export function htmlToTeachingText(html = "") {
  return normalizeWhitespace(String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ").replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<(?:form|button)[\s\S]*?<\/(?:form|button)>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
}
export function readTeachingContentFromPage(pagePath = "") {
  const absolute = resolveSafeWorkspacePath(pagePath);
  if (!absolute || !existsSync(absolute)) return "";
  try { return htmlToTeachingText(readFileSync(absolute, "utf8")); } catch { return ""; }
}
function readSolutionGuidance(chapterId = "") {
  if (!chapterId || !existsSync(SOLUTION_GUIDANCE_PATH)) return null;
  try {
    const source = JSON.parse(readFileSync(SOLUTION_GUIDANCE_PATH, "utf8"));
    const chapter = Array.isArray(source?.chapters)
      ? source.chapters.find((entry) => normalizeChapterId(entry.chapterId) === chapterId)
      : null;
    if (!chapter?.content) return null;
    return {
      type: "solutions_pdf",
      source: String(chapter.source || "QM solutions").trim(),
      usage: "Use only as a convention and solution-style reference; never copy an exercise or its answer.",
      content: truncate(chapter.content, 1100)
    };
  } catch {
    return null;
  }
}
function fragment(value = {}) { return { ...value, excerpt: truncate(value.excerpt || "", MAX_FRAGMENT_CHARS) }; }
function sourceReferences(context) {
  const output = [];
  if (context.primarySource) output.push({ type: "book_pdf", role: "primary", chapterId: context.primarySource.chapterId, itemId: context.primarySource.itemId, pageStart: context.primarySource.pageStart, pageEnd: context.primarySource.pageEnd });
  if (context.teachingSource?.path) output.push({ type: "app_html", role: "teaching", path: context.teachingSource.path });
  for (const item of context.relatedFragments || []) output.push({ type: "book_topic_fragment", role: "related", topicId: item.topicId, sectionId: item.sectionId, pageStart: item.pageStart, pageEnd: item.pageEnd });
  for (const item of context.advancedSupportFragments || []) output.push({ type: "book_topic_fragment", role: "advanced_support", topicId: item.topicId, sectionId: item.sectionId, pageStart: item.pageStart, pageEnd: item.pageEnd });
  return output;
}

export function buildAiExerciseContextPackage({ chapterId = "", itemId = "", pagePath = "", pageTitle = "", pageSubtitle = "", pageContent = "", difficulty = "medio" } = {}) {
  const normalizedChapterId = normalizeChapterId(chapterId);
  const normalizedItemId = String(itemId || "").trim();
  const sectionId = normalizeSectionId(normalizedChapterId, normalizedItemId);
  const path = normalizeRelativePagePath(pagePath);
  const book = getBookSectionContext({ chapterId: normalizedChapterId, itemId: normalizedItemId, pagePath: path, pageTitle });
  const topicIndex = getSectionTopicIndex(sectionId);
  const localContent = readTeachingContentFromPage(path);
  const fallback = normalizeWhitespace(pageContent);
  const relatedFragments = difficulty === "facil" ? [] : getRelatedTopicFragmentsForSection(sectionId).map(fragment).slice(0, difficulty === "medio" ? 1 : 2);
  const advancedSupportFragments = difficulty === "dificil" ? getAdvancedSupportFragmentsForSection(sectionId).map(fragment).slice(0, 2) : [];
  const solutionGuidance = readSolutionGuidance(normalizedChapterId);
  const context = {
    version: "qm-ai-context-v1", sectionId, difficulty,
    primarySource: book ? { type: "book_pdf", chapterId: book.chapterId, itemId: book.itemId, topicTitle: book.topicTitle, pdfChapterNumber: book.pdfChapterNumber, pdfChapterTitle: book.pdfChapterTitle, pageStart: book.pageStart, pageEnd: book.pageEnd, content: truncate(book.content || book.excerpt, MAX_BOOK_CHARS) } : null,
    teachingSource: (localContent || fallback) ? { type: localContent ? "app_html" : "client_page_context", path, title: pageTitle, subtitle: pageSubtitle, content: truncate(localContent || fallback, MAX_TEACHING_CHARS) } : null,
    fallbackSource: !localContent && fallback ? { type: "client_page_context", available: true, content: truncate(fallback, MAX_FALLBACK_CHARS) } : null,
    topicIndex: topicIndex ? { primaryTopic: topicIndex.primaryTopic, transversalTopics: topicIndex.transversalTopics, advancedSupportTopics: topicIndex.advancedSupportTopics } : null,
    relatedFragments, advancedSupportFragments, solutionGuidance
  };
  return { ...context, sourceReferences: sourceReferences(context), contextPackageMeta: { hasPrimaryBookSource: Boolean(context.primarySource), hasTeachingSource: Boolean(context.teachingSource), hasSolutionGuidance: Boolean(solutionGuidance), relatedFragmentCount: relatedFragments.length, advancedSupportFragmentCount: advancedSupportFragments.length, topicIndexFound: Boolean(topicIndex) } };
}

export function buildAiExerciseContextPrompt(context = {}) {
  if (!context.primarySource && !context.teachingSource) return "";
  const lines = ["QM SOURCE HIERARCHY:", "1. Book corpus is canonical for definitions, equations, notation and conventions.", "2. The app HTML sets the topic just studied and pedagogical scope.", "3. Related fragments are supporting context only; they never replace the current topic."];
  if (context.primarySource) lines.push(`CANONICAL BOOK REFERENCE — section ${context.sectionId}, PDF pages ${context.primarySource.pageStart}-${context.primarySource.pageEnd}:\n${context.primarySource.content}`);
  if (context.teachingSource) lines.push(`CURRENT APP PAGE — ${context.teachingSource.path || "client fallback"}:\n${context.teachingSource.content}`);
  if (context.topicIndex) lines.push(`TOPIC POLICY — primary: ${context.topicIndex.primaryTopic}; central links: ${context.topicIndex.transversalTopics.join(", ") || "none"}; advanced support: ${context.topicIndex.advancedSupportTopics.join(", ") || "none"}.`);
  if (context.relatedFragments.length) lines.push(`RELATED FRAGMENTS (use at most one brief connection):\n${context.relatedFragments.map((item) => `- ${item.title}: ${item.excerpt}`).join("\n")}`);
  if (context.advancedSupportFragments.length) lines.push(`ADVANCED SUPPORT (difficulty difficult only):\n${context.advancedSupportFragments.map((item) => `- ${item.title}: ${item.excerpt}`).join("\n")}`);
  if (context.solutionGuidance) lines.push(`SOLUTION CONVENTIONS — ${context.solutionGuidance.source}:\n${context.solutionGuidance.content}\ndo not copy questions or answers from this source.`);
  lines.push(`DIFFICULTY RULE: ${context.difficulty === "facil" ? "stay exclusively on the primary topic." : context.difficulty === "medio" ? "use the primary topic and at most one short central connection." : "you may use advanced support only when it helps while the primary topic remains central."}`);
  return lines.join("\n\n");
}
