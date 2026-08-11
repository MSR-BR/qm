import { validateExerciseMathContract } from "../lib/math-format-validator.mjs";
import { normalizeExerciseMathForTest } from "../lib/exercicio-handler.mjs";

const cases = [
  {
    name: "valid inline and display math",
    expectedOk: true,
    exercise: {
      title: "Normalized state",
      statement: "The wave function \\( \\psi_n(x) \\) must satisfy normalization.",
      solution: "Therefore:\n\\[\\int_0^L |\\psi_n(x)|^2\\,dx = 1.\\]"
    }
  },
  {
    name: "dollar delimiters are rejected",
    expectedOk: false,
    exercise: {
      title: "Hamiltonian",
      statement: "Use $H = E$ for the energy eigenstate.",
      solution: "Short answer."
    }
  },
  {
    name: "raw latex command is rejected",
    expectedOk: false,
    exercise: {
      title: "Expectation value",
      statement: "Calculate \\langle \\psi|\\hat H|\\psi\\rangle.",
      solution: "Short answer."
    }
  },
  {
    name: "bare assignment is rejected",
    expectedOk: false,
    exercise: {
      title: "Energy",
      statement: "The stationary state obeys E = hbar omega.",
      solution: "Short answer."
    }
  },
  {
    name: "unbalanced delimiter is rejected",
    expectedOk: false,
    exercise: {
      title: "Potential",
      statement: "The expression is \\(V(x) = 0.",
      solution: "Short answer."
    }
  },
  {
    name: "nested delimiters are rejected",
    expectedOk: false,
    exercise: {
      title: "State",
      statement: "Use \\( \\psi(x) = \\(A\\) \\).",
      solution: "Short answer."
    }
  },
  {
    name: "prose inside math delimiters is rejected",
    expectedOk: false,
    exercise: {
      title: "Commutator",
      statement: "Derive \\(\\hat L_i, \\hat x_j between angular-momentum and position components.\\)",
      solution: "Short answer."
    }
  }
];

let failures = 0;

for (const entry of cases) {
  const result = validateExerciseMathContract(entry.exercise);
  const ok = result.ok === entry.expectedOk;
  console.log(`\n${ok ? "OK" : "FAIL"} - ${entry.name}`);
  console.log(JSON.stringify({
    expectedOk: entry.expectedOk,
    actualOk: result.ok,
    errorCodes: result.errors.map((error) => `${error.field}:${error.code}`),
    warningCodes: result.warnings.map((warning) => `${warning.field}:${warning.code}`)
  }, null, 2));

  if (!ok) failures += 1;
}

if (failures > 0) {
  process.exitCode = 1;
}

const flattened = normalizeExerciseMathForTest({
  statement: "\\[\\frac{i}{\\hbar} \\(\\hat H, \\hat A_H(t)\\) = \\frac{\\hat p}{m}\\]",
  solution: ""
});
if (!/^\\\[/.test(flattened.statement) || /\\\[([\s\S]*?)\\\(/.test(flattened.statement) || /\\\)\s*\\\]/.test(flattened.statement)) {
  throw new Error("Nested inline delimiters inside display math were not flattened.");
}

const orphanNested = normalizeExerciseMathForTest({
  statement: "\\[\\hat{L}_i, \\hat{x}_m = \\epsilon_{ijk}\\hat{x}_j \\(\\hat{p}_k, \\hat{x}_m\\]",
  solution: ""
});
if (!validateExerciseMathContract(orphanNested).ok || /\\\[([\s\S]*?)\\\(/.test(orphanNested.statement) || /\\\)\s*$/.test(orphanNested.statement)) {
  throw new Error("Orphan inline delimiters inside display math were not repaired.");
}

const splitInline = normalizeExerciseMathForTest({
  statement: "Derive \\(\\hat L_i, \\hat x_j between angular-momentum and position components.\\)",
  solution: ""
});
if (!splitInline.statement.includes("\\(\\hat L_i, \\hat x_j\\) between angular-momentum and position components.")) {
  throw new Error("Inline math containing prose was not split before rendering.");
}

const splitSetInline = normalizeExerciseMathForTest({
  statement: "For the specific case \\(\\hat{L}_x, \\hat{y}, we set i = x and m = y:\\)",
  solution: ""
});
if (!splitSetInline.statement.includes("\\(\\hat{L}_x, \\hat{y}\\), we set \\(i = x\\) and \\(m = y\\):")) {
  throw new Error("Inline math containing a 'we set' clause was not split before rendering.");
}

const commutatorDisplay = normalizeExerciseMathForTest({
  statement: String.raw`\[[\hat L_y, \hat L_z] = i\hbar\hat L_x\]`,
  solution: ""
});
if (!commutatorDisplay.statement.includes(String.raw`\left[\hat L_{y}, \hat L_{z}\right] = i\hbar\hat L_x`)) {
  throw new Error("Square brackets in a commutator display equation were not preserved.");
}

const commutatorInline = normalizeExerciseMathForTest({
  statement: String.raw`Evaluate [\hat L_y, \hat L_z].`,
  solution: ""
});
if (!commutatorInline.statement.includes(String.raw`\(\left[\hat L_{y}, \hat L_{z}\right]\)`)) {
  throw new Error("Square brackets in an inline commutator were not preserved.");
}
