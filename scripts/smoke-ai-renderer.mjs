import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/ai-exercises.js", import.meta.url), "utf8");
const window = {};
const document = {
  readyState: "loading",
  addEventListener() {},
  querySelectorAll() { return []; }
};

vm.runInNewContext(source, { window, document, console });

const input = "where \\(E_1 = \\frac{\\pi^2\\hbar^2}{2mL^2}\\), \\(E_2 = \\frac{4\\pi^2\\hbar^2}{2mL^2}\\).";
const rendered = window.QmAIExercise.formatGeneratedText(input);
const nestedDisplay = window.QmAIExercise.formatGeneratedText("\\[\\frac{i}{\\hbar} \\(\\hat H, \\hat A_H(t)\\) = \\frac{\\hat p}{m}\\]");
const fragmentedInline = window.QmAIExercise.formatGeneratedText("Consider a particle of mass\n\n\\(m\\)\n\nmoving in one dimension.");

if (rendered.includes("\\(\\(") || rendered.includes("\\)\\)")) {
  throw new Error("The renderer nested MathJax delimiters inside a protected expression.");
}

if (!rendered.includes("E_1") || !rendered.includes("E_2")) {
  throw new Error("The renderer did not preserve the quantum equations.");
}
if (nestedDisplay.includes("\\(\\hat H") || nestedDisplay.includes("\\)\\]")) {
  throw new Error("The renderer did not flatten inline math nested in display math.");
}
if ((fragmentedInline.match(/<p>/g) || []).length !== 1 || !fragmentedInline.includes("mass \\(m\\) moving")) {
  throw new Error("The renderer did not reattach an isolated inline expression to its sentence.");
}

console.log("AI exercise renderer passed.");
