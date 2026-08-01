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

if (rendered.includes("\\(\\(") || rendered.includes("\\)\\)")) {
  throw new Error("The renderer nested MathJax delimiters inside a protected expression.");
}

if (!rendered.includes("E_1") || !rendered.includes("E_2")) {
  throw new Error("The renderer did not preserve the quantum equations.");
}

console.log("AI exercise renderer passed.");
