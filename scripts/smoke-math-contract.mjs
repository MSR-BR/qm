import { validateExerciseMathContract } from "../lib/math-format-validator.mjs";

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
