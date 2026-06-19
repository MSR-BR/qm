import { createHash } from "node:crypto";

const difficultyGuide = {
  facil: "Conceptual and direct exercise with no long calculations. It should test basic understanding.",
  medio: "Exercise with physical interpretation and, when appropriate, a simple calculation.",
  dificil: "Exercise requiring multi-step reasoning, connections between concepts, or a more elaborate calculation."
};

const MAX_PAGE_CONTENT_CHARS = 4500;
const VALIDATION_TABLE = "qm_exercise_validation_reports";
const VALIDATION_STATUSES = new Set(["sim", "nao", "nao_sei"]);
const VALIDATION_REVIEW_STATUSES = new Set(["pending", "approved", "rejected"]);
const DEFAULT_VALIDATOR_EMAILS = ["marioreis@id.uff.br"];
const EXERCISE_GENERATION_ENABLED = false;
const EXERCISE_VALIDATION_ENABLED = false;

const plainMathPattern =
  /(?:\bk_[A-Za-z0-9]+|\b[A-Za-z]_[A-Za-z0-9]+|\bsum\s*\(|\bln\s*\(|\bexp\s*\(|\bpartial\b|[∂ΔΩβλμ→≤≥±≠∞]|\b[A-Z][A-Za-z0-9']*\s*=|\^[0-9²³]+|_[{(]?[A-Za-z0-9,]+[})]?)/;

function cleanupEquation(value = "") {
  return String(value || "")
    .replace(/^\s*\\\[/, "")
    .replace(/\\\]\s*$/, "")
    .replace(/^\s*\\\(/, "")
    .replace(/\\\)\s*$/, "")
    .replace(/^\s*\[\s*/, "")
    .replace(/\s*\]\s*$/, "")
    .replace(/^\s*\$+/, "")
    .replace(/\$+\s*$/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\\\\/g, "\\")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function countWords(value = "") {
  return (
    String(value || "")
      .replace(/\\[A-Za-z]+/g, " ")
      .match(/[A-Za-zÀ-ÿ]{2,}/g) || []
  ).length;
}

function mathDensity(value = "") {
  const text = String(value || "");
  const mathChars = (text.match(/[\\=+\-*/^_{}[\]()0-9Σ∑∂ΔΩβλμ∞≤≥±≠]/g) || []).length;
  return mathChars / Math.max(text.length, 1);
}

function looksMathy(value = "") {
  return plainMathPattern.test(String(value || "")) || /[=+\-*/^_]/.test(String(value || ""));
}

function isSimpleInlineMath(value = "") {
  const text = cleanupEquation(value).replace(/[{}]/g, "").trim();
  if (!text || text.length > 36) return false;
  if (/[=+\-*/]|[→≤≥≠∑∂]|\\(?:frac|sum|lim|int|partial|sqrt|to|rightarrow|le|ge|neq|cdot|ln|exp)\b/.test(text)) return false;
  if (looksMathy(text)) return true;
  return /^(?:[A-Za-z]|\\[A-Za-z]+)(?:[_^][A-Za-z0-9]+)?'?$/u.test(text);
}

function hasProseCue(value = "") {
  return /\b(?:where|for|consider|suppose|show|calculate|determine|system|state|particle|wave|energy|operator|hamiltonian|spin|momentum|potential|eigenvalue|eigenvector|function|equation|probability|commutator|basis|limit|therefore|hence)\b/i.test(String(value || ""));
}

function latexifySnippet(snippet = "") {
  return String(snippet || "")
    .replace(/([A-Za-z])_([A-Za-z0-9]+)/g, "$1_{$2}")
    .replace(/([A-Za-z0-9}])\^([A-Za-z0-9]+)/g, "$1^{$2}")
    .replace(/³/g, "^{3}")
    .replace(/²/g, "^{2}")
    .replace(/->/g, "\\to ")
    .replace(/∂/g, "\\partial ")
    .replace(/Δ/g, "\\Delta ")
    .replace(/λ/g, "\\lambda ")
    .replace(/β/g, "\\beta ")
    .replace(/Ω/g, "\\Omega ")
    .replace(/μ/g, "\\mu ")
    .replace(/ε/g, "\\varepsilon ")
    .replace(/→/g, "\\to ")
    .replace(/≤/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/≠/g, "\\neq ")
    .replace(/∞/g, "\\infty ")
    .replace(/\bd\s*\/\s*d\s*([A-Za-z])/g, "\\frac{d}{d $1}")
    .replace(/\bpartial\b/g, "\\partial ")
    .replace(/(\\[A-Za-z]+)\s*_([A-Za-z0-9]+)/g, "$1_{$2}")
    .replace(/\bsum_([A-Za-z0-9{}]+)/g, "\\sum_{$1}")
    .replace(/\blim_([A-Za-z0-9{}]+)/g, "\\lim_{$1}")
    .replace(/\bsum\s*\(/g, "\\sum(")
    .replace(/\bln\s*\(/g, "\\ln(")
    .replace(/\bexp\s*\(/g, "\\exp(")
    .replace(/\*/g, " \\cdot ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStandaloneMathLine(line = "") {
  const trimmed = String(line || "").trim();
  if (!trimmed || /\\\(|\\\[/.test(trimmed)) return trimmed;

  const bracketInlineMatch = trimmed.match(/^\[\s*\\\(([\s\S]+?)\\\)\s*\]$/);
  if (bracketInlineMatch) {
    const cleaned = cleanupEquation(bracketInlineMatch[1]);
    return isSimpleInlineMath(cleaned) ? `\\(${latexifySnippet(cleaned)}\\)` : `\\[${cleaned}\\]`;
  }

  const bracketMathMatch = trimmed.match(/^\[\s*([\s\S]+?)\s*\]$/);
  if (bracketMathMatch && looksMathy(bracketMathMatch[1])) {
    const cleaned = cleanupEquation(bracketMathMatch[1]);
    return isSimpleInlineMath(cleaned) ? `\\(${latexifySnippet(cleaned)}\\)` : `\\[${latexifySnippet(cleaned)}\\]`;
  }

  const enumeratedMatch = trimmed.match(/^((?:\d+|[a-z])[\).:]\s+)(.+)$/i);
  const prefix = enumeratedMatch ? enumeratedMatch[1] : "";
  const content = enumeratedMatch ? enumeratedMatch[2].trim() : trimmed;

  if (!hasProseCue(content) && isSimpleInlineMath(content)) {
    return `${prefix}\\(${latexifySnippet(cleanupEquation(content))}\\)`;
  }

  if (!hasProseCue(content) && looksMathy(content) && (countWords(content) <= 4 || mathDensity(content) > 0.18)) {
    return `${prefix}\\[${latexifySnippet(cleanupEquation(content))}\\]`;
  }

  return trimmed;
}

function normalizeMathText(value = "") {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\\\\/g, "\\")
    .replace(/\$\$([\s\S]+?)\$\$/g, (_match, equation) => `\n\\[${cleanupEquation(equation)}\\]\n`)
    .replace(/(^|[^\\])\$([^$\n]+?)\$/g, (_match, lead, equation) => `${lead}\\(${cleanupEquation(equation)}\\)`)
    .replace(/\\\(\s*\$([^$]+)\$\s*\\\)/g, (_match, equation) => `\\(${cleanupEquation(equation)}\\)`)
    .replace(/\[\s*\\\(([\s\S]+?)\\\)\s*\]/g, (_match, equation) => `\n\\[${cleanupEquation(equation)}\\]\n`)
    .replace(/\[\s*([^[\]\n]{3,180})\s*\]/g, function (match, snippet) {
      if (!looksMathy(snippet)) return match;
      return `\\(${latexifySnippet(snippet)}\\)`;
    })
    .replace(/([A-Za-z][A-Za-z0-9']*(?:_[A-Za-z0-9]+)?\s*=\s*[^.,;\n]+)(?=[.,;\n]|$)/g, function (_match, snippet) {
      return `\\(${latexifySnippet(snippet)}\\)`;
    })
    .split("\n")
    .map((line) => normalizeStandaloneMathLine(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeExerciseMathLocally(exercise = {}) {
  return {
    title: normalizeMathText(exercise.title || "Exercise"),
    statement: normalizeMathText(exercise.statement || ""),
    solution: normalizeMathText(exercise.solution || "")
  };
}

function truncateText(value = "", maxLength = 240) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeValidationChoice(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return VALIDATION_STATUSES.has(normalized) ? normalized : "";
}

function normalizeReviewStatus(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return VALIDATION_REVIEW_STATUSES.has(normalized) ? normalized : "pending";
}

function parseValidatorEmails(env = process.env) {
  return DEFAULT_VALIDATOR_EMAILS.slice();
}

function isValidatorEmail(email = "", env = process.env) {
  const normalized = String(email || "").trim().toLowerCase();
  return Boolean(normalized && parseValidatorEmails(env).includes(normalized));
}

function sanitizeExerciseBody(body = {}) {
  const pageContent = String(body.pageContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    ...body,
    chapterId: String(body.chapterId || "").trim().slice(0, 32),
    itemId: String(body.itemId || "").trim().slice(0, 32),
    pagePath: String(body.pagePath || "").trim().slice(0, 320),
    pageTitle: String(body.pageTitle || "").trim().slice(0, 240),
    pageSubtitle: String(body.pageSubtitle || "").trim().slice(0, 320),
    pageContent: pageContent.slice(0, MAX_PAGE_CONTENT_CHARS)
  };
}

function sanitizeValidationBody(body = {}) {
  return {
    exerciseId: String(body.exerciseId || "").trim().slice(0, 64),
    chapterId: String(body.chapterId || "").trim().slice(0, 32),
    itemId: String(body.itemId || "").trim().slice(0, 32),
    pagePath: String(body.pagePath || "").trim().slice(0, 320),
    pageUrl: String(body.pageUrl || "").trim().slice(0, 500),
    pageTitle: truncateText(body.pageTitle || "", 240),
    pageSubtitle: truncateText(body.pageSubtitle || "", 320),
    pageContent: String(body.pageContent || "").replace(/[ \t]+/g, " ").trim().slice(0, MAX_PAGE_CONTENT_CHARS),
    difficulty: String(body.difficulty || "").trim().slice(0, 24),
    savedExerciseId: String(body.savedExerciseId || "").trim().slice(0, 64),
    exerciseTitle: truncateText(body.exerciseTitle || "Exercise", 240),
    statement: String(body.statement || "").trim(),
    solution: String(body.solution || "").trim(),
    statementStatus: normalizeValidationChoice(body.statementStatus),
    solutionStatus: normalizeValidationChoice(body.solutionStatus),
    statementNote: truncateText(body.statementNote || "", 220),
    solutionNote: truncateText(body.solutionNote || "", 220),
    language: String(body.language || "en").trim().slice(0, 24)
  };
}

function sanitizeAdminValidationBody(body = {}) {
  const decision = String(body.decision || "").trim().toLowerCase();

  return {
    reportId: String(body.reportId || body.id || "").trim().slice(0, 80),
    decision: decision === "approved" || decision === "rejected" ? decision : "",
    adminNote: truncateText(body.adminNote || "", 280)
  };
}

function buildValidationMemoryPrompt(entries = []) {
  const relevantEntries = Array.isArray(entries) ? entries.filter(Boolean).slice(0, 6) : [];
  if (!relevantEntries.length) return "";

  const lines = relevantEntries.map(function (entry, index) {
    const summary = truncateText(entry.ai_review_summary || entry.ai_correction_advice || "", 220);
    const note = truncateText([entry.statement_note, entry.solution_note].filter(Boolean).join(" / "), 180);
    return `${index + 1}. ${summary}${note ? ` (professor note: ${note})` : ""}`;
  });

  return `
Errors already confirmed by the professor for this topic:
${lines.join("\n")}

Extra rule:
- Do not repeat the errors listed above.
- If a similar case appears, follow the corrected formulation indicated in these notes.
`;
}

function buildPrompt({
  pageTitle = "",
  pageSubtitle = "",
  pageContent = "",
  difficulty = "medio",
  level = "undergraduate physics",
  language = "en",
  validationMemory = []
}) {
  const memoryPrompt = buildValidationMemoryPrompt(validationMemory);

  return `
You are a teaching assistant for Quantum Mechanics material created by Prof. Mario Reis.

Create ONE new exercise in ${language}, appropriate for the level: ${level}.

Page topic:
${pageTitle}
${pageSubtitle}

Page content:
${pageContent}

Selected difficulty: ${difficulty}.
Difficulty criterion: ${difficultyGuide[difficulty] || difficultyGuide.medio}
${memoryPrompt ? `\n${memoryPrompt}\n` : ""}
Required rules:
- The exercise must be directly related to the page content.
- Do not use subjects outside the page topic.
- Do not invent unnecessary data.
- If you use numbers, use simple values.
- The solution must be clear, short, and step by step.
- If you use equations, write them in LaTeX with delimiters \( ... \) for inline math and \[ ... \] for display math.
- Put each highlighted equation or important algebraic step on its own line using \[ ... \].
- If a line is mostly mathematical, return the entire line as a \[ ... \] block.
- If it is only a short variable or symbol, such as \(E\), \(T\), \(Z_N\), or \(k_B\), keep it inline with \( ... \), without creating a separate block.
- Never use $...$, $$...$$, loose [ ... ], or mixed delimiters such as [ \( ... \) ].
- Never leave formulas as raw ASCII text, such as psi(x), H, L_z, sum(...), partial, bra-ket, or expressions with ^ and _ outside LaTeX delimiters.
- Respond ONLY with valid JSON.
- Do not use Markdown.
- Do not include comments outside the JSON.

Required format:
{
  "title": "short title",
  "statement": "exercise statement",
  "solution": "commented solution"
}
`;
}

function needsMathFormatting(exercise = {}) {
  const combined = [exercise.title, exercise.statement, exercise.solution]
    .filter(Boolean)
    .join("\n");

  if (!combined) return false;
  if (/\\\(|\\\[/.test(combined) && !plainMathPattern.test(combined)) return false;
  return plainMathPattern.test(combined);
}

function requiresRemoteMathRefinement(exercise = {}) {
  const combined = [exercise.title, exercise.statement, exercise.solution]
    .filter(Boolean)
    .join("\n");

  if (!combined) return false;

  const unresolvedPatterns = [
    /\bsum\s*\(/,
    /\bk_[A-Za-z0-9]+/,
    /\b[A-Za-z]_[A-Za-z0-9]+/,
    /\bpartial\b/,
    /\bd\/d[A-Za-z]/,
    /\[\s*[^\]]*[=+\-*/^_∂ΔΩβλμ→≤≥±≠∞][^\]]*\]/,
    /\$\$?/,
    /\[ *\\\(/,
    /\\\(\s*[^)]+\s*\\\)\s*\\\(/,
    /\\\[[^\]]*\\\[[^\]]*\\\]/
  ];

  return unresolvedPatterns.some((pattern) => pattern.test(combined));
}

function buildMathFormattingPrompt(exercise, language = "en") {
  return `
You are a mathematical notation reviewer for Quantum Mechanics teaching material.

Rewrite the JSON below while preserving the content, level, and physical meaning, but convert ALL mathematical expressions to valid LaTeX.

Required rules:
- Keep the language in ${language}.
- Preserve the teaching text; change only how the mathematics is written when necessary.
- Use \( ... \) for inline math.
- Use \[ ... \] for derivation blocks, larger equations, or algebraic steps.
- Put each important equation on its own line with \[ ... \] delimiters.
- If a line is essentially mathematical, return the entire line as a \[ ... \] block.
- If it is only a short variable or symbol, such as \(E\), \(T\), \(Z_N\), or \(k_B\), keep it inline with \( ... \), without creating a separate block.
- Never use $...$, $$...$$, loose [ ... ], or mixed sequences such as [ \( ... \) ].
- Do not leave formulas as raw text, such as psi(x), H, L_z, sum(...), partial, expressions with ^, _, lambda, Delta, beta, or symbols such as ∂.
- Return ONLY valid JSON.
- Do not use Markdown outside the JSON itself.

Required format:
{
  "title": "short title",
  "statement": "formatted statement",
  "solution": "formatted solution"
}

Input JSON:
${JSON.stringify(exercise)}
`;
}

function buildValidationReviewPrompt({
  pageTitle = "",
  pageSubtitle = "",
  pageContent = "",
  exerciseTitle = "",
  statement = "",
  solution = "",
  statementStatus = "nao_sei",
  solutionStatus = "nao_sei",
  statementNote = "",
  solutionNote = "",
  language = "en"
}) {
  return `
You are a pedagogical and conceptual reviewer of Quantum Mechanics exercises.

Analyze the exercise below and the professor's feedback. Your task is to say whether the reported error seems REAL and relevant.

Page context:
- title: ${pageTitle}
- subtitle: ${pageSubtitle}
- base content: ${pageContent}

Exercise:
- title: ${exerciseTitle}
- statement: ${statement}
- solution: ${solution}

Professor feedback:
- statement contains errors? ${statementStatus}
- note about the statement: ${statementNote || "none"}
- solution contains errors? ${solutionStatus}
- note about the solution: ${solutionNote || "none"}

Respond in ${language}, ONLY with valid JSON, without Markdown, in this format:
{
  "aiReviewState": "confirmed_error" | "not_confirmed" | "inconclusive",
  "summary": "a short sentence explaining the conclusion",
  "correctionAdvice": "a short, actionable sentence to avoid repeating this error in future exercises",
  "avoidPropagation": true | false
}

Rules:
- Use "confirmed_error" only if there is strong evidence of a conceptual, mathematical, or pedagogical error.
- Use "not_confirmed" when the report is not well supported.
- Use "inconclusive" when a safe decision is not possible.
- "avoidPropagation" should be true only if a real error is confirmed.
- "correctionAdvice" must be useful for future generations and must not repeat the full statement.
`;
}

function extractJsonObject(raw = "") {
  const text = String(raw || "").trim();
  const start = text.indexOf("{");

  if (start === -1) {
    return text;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return text.slice(start);
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function shouldRetryGemini(result) {
  return Boolean(result && !result.ok && [429, 503].includes(result.status));
}

async function callGeminiJson({ apiKey, model, prompt, temperature = 0.7 }) {
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature,
          responseMimeType: "application/json"
        }
      })
    }
  );

  const data = await geminiResponse.json();

  if (!geminiResponse.ok) {
    return {
      ok: false,
      status: geminiResponse.status,
      data
    };
  }

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const extracted = extractJsonObject(raw);

  try {
    return {
      ok: true,
      status: 200,
      parsed: JSON.parse(extracted)
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: {
        error: "A resposta da IA nao veio como JSON valido.",
        raw
      }
    };
  }
}

async function formatExerciseMath({ apiKey, model, exercise, language }) {
  if (!needsMathFormatting(exercise)) {
    return exercise;
  }

  const result = await callGeminiJson({
    apiKey,
    model,
    prompt: buildMathFormattingPrompt(exercise, language),
    temperature: 0.2
  });

  if (!result.ok) {
    return exercise;
  }

  const parsed = result.parsed || {};

  return {
    title: parsed.title || exercise.title || "Exercise",
    statement: parsed.statement || exercise.statement || "",
    solution: parsed.solution || exercise.solution || ""
  };
}

function createExerciseFingerprint(input = {}) {
  return createHash("sha256")
    .update(JSON.stringify({
      chapterId: input.chapterId || "",
      itemId: input.itemId || "",
      pagePath: input.pagePath || "",
      exerciseTitle: input.exerciseTitle || "",
      statement: input.statement || "",
      solution: input.solution || ""
    }))
    .digest("hex");
}

function createExerciseId(input = {}) {
  const fingerprint = createExerciseFingerprint(input).slice(0, 10).toUpperCase();
  const chapterId = String(input.chapterId || "00").replace(/\D/g, "").padStart(2, "0").slice(-2);
  const itemId = String(input.itemId || "0").replace(/[^0-9]/g, "") || "0";
  return `EX-${chapterId}-${itemId}-${fingerprint}`;
}

async function fetchValidationMemory({ env = process.env, chapterId = "", itemId = "", pagePath = "" }) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL || "";
  const supabasePublishableKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  if (!supabaseUrl || !supabasePublishableKey) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("select", "chapter_id,item_id,page_path,ai_review_summary,ai_correction_advice,statement_note,solution_note,created_at");
  params.set("avoid_propagation", "eq.true");
  params.set("ai_review_state", "eq.confirmed_error");
  params.set("review_status", "eq.approved");
  params.set("order", "created_at.desc");
  params.set("limit", "6");

  if (chapterId && itemId) {
    params.set("chapter_id", `eq.${chapterId}`);
    params.set("item_id", `eq.${itemId}`);
  } else if (pagePath) {
    params.set("page_path", `eq.${pagePath}`);
  } else {
    return [];
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${VALIDATION_TABLE}?${params.toString()}`, {
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${supabasePublishableKey}`
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchAuthenticatedUser({ env = process.env, accessToken = "" }) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL || "";
  const supabasePublishableKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl || !supabasePublishableKey || !accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

async function insertValidationReport({ env = process.env, accessToken = "", payload = {} }) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL || "";
  const supabasePublishableKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl || !supabasePublishableKey || !accessToken) {
    return { ok: false, reason: "supabase_not_configured" };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${VALIDATION_TABLE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: "insert_failed",
      status: response.status,
      data
    };
  }

  return {
    ok: true,
    record: Array.isArray(data) ? data[0] : data
  };
}

async function selectValidationReports({ env = process.env, accessToken = "", status = "pending", id = "" }) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL || "";
  const supabasePublishableKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl || !supabasePublishableKey || !accessToken) {
    return { ok: false, reason: "supabase_not_configured", reports: [] };
  }

  const params = new URLSearchParams();
  params.set("select", [
    "id",
    "exercise_id",
    "chapter_id",
    "item_id",
    "page_path",
    "page_url",
    "page_title",
    "exercise_title",
    "statement_excerpt",
    "solution_excerpt",
    "statement_status",
    "solution_status",
    "statement_note",
    "solution_note",
    "reporter_email",
    "validator_email",
    "review_status",
    "admin_note",
    "created_at"
  ].join(","));
  params.set("order", "created_at.desc");
  params.set("limit", "80");

  if (id) {
    params.set("id", `eq.${id}`);
  } else {
    params.set("review_status", `eq.${normalizeReviewStatus(status)}`);
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${VALIDATION_TABLE}?${params.toString()}`, {
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`
    }
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: "select_failed",
      status: response.status,
      data,
      reports: []
    };
  }

  return {
    ok: true,
    reports: Array.isArray(data) ? data : []
  };
}

async function updateValidationReport({ env = process.env, accessToken = "", reportId = "", payload = {} }) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL || "";
  const supabasePublishableKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl || !supabasePublishableKey || !accessToken || !reportId) {
    return { ok: false, reason: "supabase_not_configured" };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${VALIDATION_TABLE}?id=eq.${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: "update_failed",
      status: response.status,
      data
    };
  }

  return {
    ok: true,
    record: Array.isArray(data) ? data[0] : data
  };
}

function buildValidationRecord({
  body = {},
  reporterUser = null
}) {
  const reporterEmail = String(reporterUser?.email || "").trim().toLowerCase();
  const exerciseId = body.exerciseId || createExerciseId(body);

  return {
    exercise_id: exerciseId,
    reporter_user_id: reporterUser?.id || null,
    reporter_email: reporterEmail,
    validator_user_id: reporterUser?.id || null,
    validator_email: reporterEmail,
    saved_exercise_id: body.savedExerciseId || null,
    chapter_id: body.chapterId || null,
    item_id: body.itemId || null,
    page_path: body.pagePath || "",
    page_url: body.pageUrl || "",
    page_title: body.pageTitle || "Pagina do curso",
    exercise_title: body.exerciseTitle || "Exercise",
    exercise_fingerprint: createExerciseFingerprint(body),
    statement_excerpt: truncateText(body.statement || "", 900),
    solution_excerpt: truncateText(body.solution || "", 900),
    statement_status: body.statementStatus || "nao_sei",
    solution_status: body.solutionStatus || "nao_sei",
    statement_note: body.statementNote || null,
    solution_note: body.solutionNote || null,
    review_status: "pending",
    ai_review_state: "inconclusive",
    ai_review_summary: "Report sent for professor review.",
    ai_correction_advice: "",
    avoid_propagation: false
  };
}

async function reviewValidationWithGemini({ apiKey, model, body }) {
  const result = await callGeminiJson({
    apiKey,
    model,
    prompt: buildValidationReviewPrompt(body),
    temperature: 0.2
  });

  if (!result.ok) {
    return {
      aiReviewState: "inconclusive",
      summary: "The AI could not confirm the report right now.",
      correctionAdvice: "",
      avoidPropagation: false
    };
  }

  const parsed = result.parsed || {};
  const aiReviewState = ["confirmed_error", "not_confirmed", "inconclusive"].includes(parsed.aiReviewState)
    ? parsed.aiReviewState
    : "inconclusive";

  return {
    aiReviewState,
    summary: truncateText(parsed.summary || "The AI reviewed the report.", 220),
    correctionAdvice: truncateText(parsed.correctionAdvice || "", 220),
    avoidPropagation: aiReviewState === "confirmed_error" && Boolean(parsed.avoidPropagation)
  };
}

export async function handleExerciseRequest({
  method,
  body,
  env = process.env
}) {
  if (!EXERCISE_GENERATION_ENABLED) {
    return {
      status: 503,
      body: { error: "Exercise generation is inactive for this project." }
    };
  }

  if (method !== "POST") {
    return { status: 405, body: { error: "Use POST." } };
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      status: 500,
      body: { error: "GEMINI_API_KEY is not configured in the environment." }
    };
  }

  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const fallbackModel = "gemini-2.5-flash";
  const sanitizedBody = sanitizeExerciseBody(body || {});
  const validationMemory = await fetchValidationMemory({
    env,
    chapterId: sanitizedBody.chapterId,
    itemId: sanitizedBody.itemId,
    pagePath: sanitizedBody.pagePath
  });
  const prompt = buildPrompt({
    ...sanitizedBody,
    validationMemory
  });

  try {
    let result = await callGeminiJson({
      apiKey,
      model,
      prompt
    });

    if (shouldRetryGemini(result)) {
      await sleep(1200);
      result = await callGeminiJson({
        apiKey,
        model,
        prompt
      });
    }

    if (!result.ok && model !== fallbackModel) {
      result = await callGeminiJson({
        apiKey,
        model: fallbackModel,
        prompt
      });
    }

    if (!result.ok) {
      return {
        status: result.status,
        body: {
          error: "Error returned by the Gemini API.",
          details: result.data
        }
      };
    }

    const parsed = result.parsed || {};
    const rawExercise = {
      title: parsed.title || "Exercise",
      statement: parsed.statement || "",
      solution: parsed.solution || ""
    };

    let normalized = normalizeExerciseMathLocally(rawExercise);

    if (requiresRemoteMathRefinement(normalized) && needsMathFormatting(rawExercise)) {
      const formatted = await formatExerciseMath({
        apiKey,
        model,
        language: body?.language || "pt-BR",
        exercise: rawExercise
      });
      normalized = normalizeExerciseMathLocally(formatted);
    }

    return {
      status: 200,
      body: {
        title: normalized.title || "Exercise",
        statement: normalized.statement || "",
        solution: normalized.solution || "",
        exerciseId: createExerciseId({
          ...sanitizedBody,
          exerciseTitle: normalized.title || "Exercise",
          statement: normalized.statement || "",
          solution: normalized.solution || ""
        }),
        model,
        validationMemoryCount: validationMemory.length,
        validationMemoryApplied: validationMemory.length > 0
      }
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: "Internal error while generating the exercise.",
        details: String(error)
      }
    };
  }
}

export async function handleExerciseValidationRequest({
  method,
  body,
  headers = {},
  env = process.env
}) {
  if (!EXERCISE_VALIDATION_ENABLED) {
    return {
      status: 503,
      body: { error: "Exercise validation is inactive for this project." }
    };
  }

  if (method !== "POST") {
    return { status: 405, body: { error: "Use POST." } };
  }

  const sanitizedBody = sanitizeValidationBody(body || {});
  const accessToken = String(
    headers.authorization ||
    headers.Authorization ||
    ""
  ).replace(/^Bearer\s+/i, "").trim();

  if (!sanitizedBody.statement || !sanitizedBody.solution) {
    return {
      status: 400,
      body: { error: "The exercise must include a statement and solution before validation." }
    };
  }

  if (!sanitizedBody.statementStatus || !sanitizedBody.solutionStatus) {
    return {
      status: 400,
      body: { error: "Fill in the statement and solution assessment." }
    };
  }

  if (sanitizedBody.statementStatus === "sim" && !sanitizedBody.statementNote) {
    return {
      status: 400,
      body: { error: "Describe the problem found in the statement in one sentence." }
    };
  }

  if (sanitizedBody.solutionStatus === "sim" && !sanitizedBody.solutionNote) {
    return {
      status: 400,
      body: { error: "Describe the problem found in the solution in one sentence." }
    };
  }

  if (!accessToken) {
    return {
      status: 401,
      body: { error: "Sign in with Google to send the exercise validation." }
    };
  }

  const reporterUser = await fetchAuthenticatedUser({ env, accessToken });
  const reporterEmail = String(reporterUser?.email || "").trim().toLowerCase();

  if (!reporterUser || !reporterEmail) {
    return {
      status: 401,
      body: { error: "Could not validate your Supabase session." }
    };
  }

  const insertResult = await insertValidationReport({
    env,
    accessToken,
    payload: buildValidationRecord({
      body: sanitizedBody,
      reporterUser
    })
  });

  if (!insertResult.ok) {
    const rawDetails = insertResult.data?.message || insertResult.data?.error || insertResult.reason || "";
    const isRlsError = /row-level security/i.test(String(rawDetails));

    return {
      status: insertResult.status || 500,
      body: {
        error: isRlsError
          ? "The professor validation policy in Supabase must be updated."
          : "Could not save the validation.",
        details: insertResult.data || insertResult.reason
      }
    };
  }

  return {
    status: 200,
    body: {
      message: "Validation sent for review.",
      aiReviewState: "pending_review",
      summary: "Your report was sent for professor review.",
      correctionAdvice: "",
      avoidPropagation: false,
      recordId: insertResult.record?.id || null
    }
  };
}

function buildAdminReviewUpdate({ report = {}, reviewerUser = null, decision = "", adminNote = "" }) {
  const reviewerEmail = String(reviewerUser?.email || "").trim().toLowerCase();
  const hasReportedIssue = report.statement_status === "sim" || report.solution_status === "sim";
  const notes = [report.statement_note, report.solution_note, adminNote].filter(Boolean).join(" / ");

  if (decision === "rejected") {
    return {
      review_status: "rejected",
      reviewer_user_id: reviewerUser?.id || null,
      reviewer_email: reviewerEmail,
      reviewed_at: new Date().toISOString(),
      admin_note: adminNote || null,
      ai_review_state: "not_confirmed",
      ai_review_summary: "Report reviewed and rejected by the professor.",
      ai_correction_advice: "",
      avoid_propagation: false
    };
  }

  return {
    review_status: "approved",
    reviewer_user_id: reviewerUser?.id || null,
    reviewer_email: reviewerEmail,
    reviewed_at: new Date().toISOString(),
    admin_note: adminNote || null,
    ai_review_state: hasReportedIssue ? "confirmed_error" : "not_confirmed",
    ai_review_summary: hasReportedIssue
      ? `Error confirmed by the professor: ${truncateText(notes || "correct the point indicated in the report.", 220)}`
      : "Report reviewed by the professor with no confirmed error.",
    ai_correction_advice: hasReportedIssue
      ? truncateText(notes || "Avoid repeating the conceptual, mathematical, or pedagogical issue indicated by the professor.", 220)
      : "",
    avoid_propagation: Boolean(hasReportedIssue)
  };
}

export async function handleExerciseValidationAdminRequest({
  method,
  body,
  headers = {},
  query = {},
  env = process.env
}) {
  const accessToken = String(
    headers.authorization ||
    headers.Authorization ||
    ""
  ).replace(/^Bearer\s+/i, "").trim();

  if (!accessToken) {
    return {
      status: 401,
      body: { error: "Sign in with Google to review validations." }
    };
  }

  const reviewerUser = await fetchAuthenticatedUser({ env, accessToken });
  const reviewerEmail = String(reviewerUser?.email || "").trim().toLowerCase();

  if (!reviewerUser || !reviewerEmail) {
    return {
      status: 401,
      body: { error: "Could not validate your Supabase session." }
    };
  }

  if (!isValidatorEmail(reviewerEmail, env)) {
    return {
      status: 403,
      body: { error: "Validation review is reserved for the responsible professor." }
    };
  }

  if (method === "GET") {
    const result = await selectValidationReports({
      env,
      accessToken,
      status: normalizeReviewStatus(query.status || "pending")
    });

    if (!result.ok) {
      return {
        status: result.status || 500,
        body: {
          error: "Could not load pending validations.",
          details: result.data || result.reason
        }
      };
    }

    return {
      status: 200,
      body: { reports: result.reports }
    };
  }

  if (method !== "POST") {
    return { status: 405, body: { error: "Use GET or POST." } };
  }

  const reviewBody = sanitizeAdminValidationBody(body || {});
  if (!reviewBody.reportId || !reviewBody.decision) {
    return {
      status: 400,
      body: { error: "Provide the validation and the review decision." }
    };
  }

  const currentResult = await selectValidationReports({
    env,
    accessToken,
    id: reviewBody.reportId
  });
  const report = currentResult.reports?.[0];

  if (!currentResult.ok || !report) {
    return {
      status: currentResult.status || 404,
      body: {
        error: "Validation not found for review.",
        details: currentResult.data || currentResult.reason || null
      }
    };
  }

  const updateResult = await updateValidationReport({
    env,
    accessToken,
    reportId: reviewBody.reportId,
    payload: buildAdminReviewUpdate({
      report,
      reviewerUser,
      decision: reviewBody.decision,
      adminNote: reviewBody.adminNote
    })
  });

  if (!updateResult.ok) {
    return {
      status: updateResult.status || 500,
      body: {
        error: "Could not save the validation review.",
        details: updateResult.data || updateResult.reason
      }
    };
  }

  return {
    status: 200,
    body: {
      message: reviewBody.decision === "approved"
        ? "Validation approved and added to the AI memory."
        : "Validation rejected.",
      report: updateResult.record
    }
  };
}
