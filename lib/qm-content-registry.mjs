import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registryPath = path.resolve(__dirname, "../data/qm-content-registry.json");
const registry = Object.freeze(JSON.parse(readFileSync(registryPath, "utf8")));

function normalizeChapterId(value = "") {
  return String(value || "").replace(/\D/g, "").padStart(2, "0").slice(-2);
}

export function getContentRegistry() {
  return registry;
}

export function getChapterPublication(value = "") {
  return registry.chapters?.[normalizeChapterId(value)] || null;
}

export function isChapterPublished(value = "") {
  return getChapterPublication(value)?.availability === "published";
}

export function isChapterSeoEligible(value = "") {
  return getChapterPublication(value)?.seoEligible === true;
}

export function isChapterExerciseEligible(value = "") {
  return getChapterPublication(value)?.exerciseEligible === true;
}

export function getLockedChapterIds() {
  return Object.keys(registry.chapters || {}).filter((chapterId) => !isChapterPublished(chapterId));
}

export function getBrowserContentRegistry() {
  return {
    schemaVersion: registry.schemaVersion,
    defaultLanguage: registry.defaultLanguage,
    chapters: registry.chapters
  };
}
