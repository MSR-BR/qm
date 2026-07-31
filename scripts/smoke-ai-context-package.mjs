import {
  buildAiExerciseContextPackage,
  buildAiExerciseContextPrompt,
  normalizeRelativePagePath,
  resolveSafeWorkspacePath
} from "../lib/ai-context-package.mjs";

const context = buildAiExerciseContextPackage({
  chapterId: "03",
  itemId: "3.11",
  pagePath: "slides/chapter-03/schrodinger-picture-unitary-time-evolution.html",
  pageTitle: "Schrodinger picture: unitary time evolution"
});

if (!context.primarySource || context.primarySource.pageStart !== 17) {
  throw new Error("Canonical book section was not resolved for Chapter 3, item 3.11.");
}
if (!context.solutionGuidance?.content) {
  throw new Error("Chapter-level solution guidance was not resolved.");
}
const prompt = buildAiExerciseContextPrompt(context);
if (!prompt.includes("CANONICAL BOOK REFERENCE") || !prompt.includes("do not copy")) {
  throw new Error("AI context prompt does not enforce source hierarchy and anti-copying guidance.");
}
if (normalizeRelativePagePath("../../.env.local") || normalizeRelativePagePath("/api/exercicio")) {
  throw new Error("Unsafe page paths were accepted by the context package.");
}
if (resolveSafeWorkspacePath("../../package.json")) {
  throw new Error("A path outside the QM workspace was resolved.");
}
const easyContext = buildAiExerciseContextPackage({
  chapterId: "03",
  itemId: "3.11",
  pagePath: "slides/chapter-03/schrodinger-picture-unitary-time-evolution.html",
  difficulty: "facil"
});
if (easyContext.relatedFragments.length || easyContext.advancedSupportFragments.length) {
  throw new Error("Easy exercises must not receive related or advanced fragments.");
}
console.log("AI exercise context package passed.");
