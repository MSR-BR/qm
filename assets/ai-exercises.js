(function () {
  if (window.TermoAIExercise) return;

  const inlineMathPattern = /\\\(([\s\S]+?)\\\)/g;
  const mathSegmentPattern = /\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/g;
  const mathLikePattern =
    /(?:\\[A-Za-z]+|\b(?:psi|Psi|hbar)\b|[A-Za-z]_[A-Za-z0-9]+|[A-Za-z]\^[A-Za-z0-9]+|\b(?:sum|ln|exp|lim|frac|partial|nabla|int|bra|ket|braket|sin|cos|tan|sinh|cosh)\b|[=+\-*/^_]|[Σ∑∂∇ΔΩβλμψΨℏ→≤≥±≠∞])/;
  const DEFAULT_VALIDATOR_EMAILS = ["marioreis@id.uff.br"];
  const EXERCISE_GENERATION_ENABLED = true;

  function sanitizeGeneratedExerciseText(value) {
    return String(value || "")
      .replace(/\b(?:as|according to|following)\s+(?:prof\.?|professor)\s+mario\s+reis,?\s*/gi, "")
      .replace(/\b(?:prof\.?|professor)\s+mario\s+reis\b/gi, "this material")
      .replace(/\bmario\s+reis\b/gi, "this material")
      .replace(/(^|[.!?] +)([a-zà-ÿ])/g, (_match, lead, letter) => lead + letter.toUpperCase());
  }

  function getCurrentPageReference() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
  }

  function disableExerciseHost(host) {
    if (!host) return;
    host.hidden = true;
    host.setAttribute("data-exercise-generation", "inactive");
    host.innerHTML = "";
  }

  function getHostState(host) {
    if (!host.__termoExerciseState) {
      host.__termoExerciseState = {
        exercise: null,
        saveResult: null,
        canValidate: false
      };
    }
    return host.__termoExerciseState;
  }

  function escapeHtml(value){
    return String(value || "").replace(/[&<>"']/g, function (s) {
      return ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#039;"
      })[s];
    });
  }

  function countWords(value) {
    return (
      String(value || "")
        .replace(/\\[A-Za-z]+/g, " ")
        .match(/[A-Za-zÀ-ÿ]{2,}/g) || []
    ).length;
  }

  function mathDensity(value) {
    const text = String(value || "");
    const mathChars = (text.match(/[\\=+\-*/^_{}[\]()0-9Σ∑∂ΔΩβλμ∞≤≥±≠]/g) || []).length;
    return mathChars / Math.max(text.length, 1);
  }

  function isMathy(value) {
    return mathLikePattern.test(String(value || ""));
  }

  function cleanupEquation(value) {
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

  function shouldDisplayEquation(value) {
    const text = cleanupEquation(value);
    if (!text || !isMathy(text)) return false;

    const words = countWords(text);
    const density = mathDensity(text);

    if (words <= 4) return true;
    return density > 0.18 && words <= 8;
  }

  function isSimpleInlineMath(value) {
    const text = cleanupEquation(value).replace(/[{}]/g, "").trim();
    if (!text || text.length > 36) return false;
    if (/[=+\-*/]|[→≤≥≠∑∂]|\\(?:frac|sum|lim|int|partial|sqrt|to|rightarrow|le|ge|neq|cdot|ln|exp)\b/.test(text)) return false;
    if (isMathy(text)) return true;
    return /^(?:[A-Za-z]|\\[A-Za-z]+)(?:[_^][A-Za-z0-9]+)?'?$/u.test(text);
  }

  function hasProseCue(value) {
    return /\b(?:where|for|consider|suppose|show|calculate|determine|evaluate|using|given|since|system|state|particle|wave|energy|operator|hamiltonian|spin|momentum|potential|eigenvalue|eigenvector|function|equation|probability|commutator|basis|limit|therefore|hence)\b/i.test(String(value || ""));
  }

  function convertStandaloneMathLine(line) {
    const trimmed = String(line || "").trim();
    if (!trimmed || /\\\(|\\\[/.test(trimmed)) return trimmed;

    const enumeratedMatch = trimmed.match(/^((?:\d+|[a-z])[\).:]\s+)(.+)$/i);
    const prefix = enumeratedMatch ? enumeratedMatch[1] : "";
    const content = enumeratedMatch ? enumeratedMatch[2].trim() : trimmed;

    if (!hasProseCue(content) && isSimpleInlineMath(content)) {
      return `${prefix}\\(${latexifySnippet(cleanupEquation(content))}\\)`;
    }

    if (!hasProseCue(content) && (shouldDisplayEquation(content) || (isMathy(content) && countWords(content) <= 4 && mathDensity(content) > 0.18))) {
      return `${prefix}\\[${latexifySnippet(content)}\\]`;
    }

    return trimmed;
  }

  function normalizeMathLine(rawLine) {
    const line = String(rawLine || "").trim();
    if (!line) return "";

    const bracketInlineMatch = line.match(/^\[\s*\\\(([\s\S]+?)\\\)\s*\]$/);
    if (bracketInlineMatch) {
      const cleaned = cleanupEquation(bracketInlineMatch[1]);
      return isSimpleInlineMath(cleaned) ? `\\(${latexifySnippet(cleaned)}\\)` : `\\[${cleaned}\\]`;
    }

    const bracketMathMatch = line.match(/^\[\s*([\s\S]+?)\s*\]$/);
    if (bracketMathMatch && shouldDisplayEquation(bracketMathMatch[1])) {
      const cleaned = cleanupEquation(bracketMathMatch[1]);
      return isSimpleInlineMath(cleaned) ? `\\(${latexifySnippet(cleaned)}\\)` : `\\[${cleaned}\\]`;
    }

    const displayMatch = line.match(/^\\\[\s*([\s\S]+?)\s*\\\]$/);
    if (displayMatch) {
      return `\\[${cleanupEquation(displayMatch[1])}\\]`;
    }

    const inlineMatch = line.match(/^\\\(\s*([\s\S]+?)\s*\\\)$/);
    if (inlineMatch) {
      const cleaned = cleanupEquation(inlineMatch[1]);
      return shouldDisplayEquation(cleaned) && !isSimpleInlineMath(cleaned)
        ? `\\[${cleaned}\\]`
        : `\\(${cleaned}\\)`;
    }

    if (/\\\(|\\\[/.test(line)) {
      return line;
    }

    if (/:/.test(line) && countWords(line) > 0 && !/[=+*/→≤≥≠-]/.test(line)) {
      return line;
    }

    if (countWords(line) <= 2 && shouldDisplayEquation(line)) {
      const cleaned = cleanupEquation(line);
      return isSimpleInlineMath(cleaned) ? `\\(${latexifySnippet(cleaned)}\\)` : `\\[${cleaned}\\]`;
    }

    return line;
  }

  function repairGeneratedMathDelimiters(value) {
    let text = String(value || "")
      .replace(/\r\n?/g, "\n");

    const sourceLines = text.split("\n");
    const joinedLines = [];
    let pendingInline = "";
    sourceLines.forEach(function (rawLine, index) {
      const raw = String(rawLine || "");
      if (pendingInline && !raw.trim()) {
        joinedLines.push(pendingInline + "\\)");
        joinedLines.push(raw);
        pendingInline = "";
        return;
      }

      const line = pendingInline ? pendingInline + " " + raw.trim() : raw;
      const inlineOpen = (line.match(/\\\(/g) || []).length;
      const inlineClose = (line.match(/\\\)/g) || []).length;
      if (inlineOpen > inlineClose) {
        const nextLine = String(sourceLines[index + 1] || "");
        const continuesMath = /^\s*(?:[.,;:+\-*/=})\]]|\d|\\[A-Za-z])/.test(nextLine);
        if (!nextLine.trim() || !continuesMath) {
          joinedLines.push(line + "\\)");
          pendingInline = "";
        } else {
          pendingInline = line;
        }
        return;
      }

      joinedLines.push(line);
      pendingInline = "";
    });
    if (pendingInline) joinedLines.push(pendingInline + "\\)");

    text = joinedLines
      .join("\n")
      .replace(/(\d)\s+\.(\d)/g, "$1.$2")
      .replace(/\\\(\s*\\\)/g, "")
      .replace(/\\\[\s*\\\]/g, "");

    let output = "";
    let cursor = 0;
    let inlineBalance = 0;
    let displayBalance = 0;
    const tokenPattern = /\\[()[\]]/g;
    let match;
    while ((match = tokenPattern.exec(text))) {
      output += text.slice(cursor, match.index);
      const token = match[0];
      if (token === "\\(") {
        inlineBalance += 1;
        output += token;
      } else if (token === "\\)") {
        if (inlineBalance > 0) {
          inlineBalance -= 1;
          output += token;
        }
      } else if (token === "\\[") {
        displayBalance += 1;
        output += token;
      } else if (token === "\\]") {
        if (displayBalance > 0) {
          displayBalance -= 1;
          output += token;
        }
      }
      cursor = match.index + token.length;
    }
    output += text.slice(cursor);

    if (displayBalance > 0) output += "\\]".repeat(displayBalance);
    if (inlineBalance > 0) output += "\\)".repeat(inlineBalance);
    return output;
  }

  function splitProseInsideInlineMath(value) {
    const proseCuePattern = /\s+\b(?:between|where|with|using|given|show|calculate|determine|evaluate|explain|prove|find|from|in terms of|with respect to|for a|for the)\b/i;
    return String(value || "").replace(/\\\(([^\n]*?)\\\)/g, function (match, content) {
      const split = String(content || "").match(proseCuePattern);
      if (!split || split.index < 4) return match;

      const mathPart = content.slice(0, split.index).trim();
      const prosePart = content.slice(split.index).trimStart();
      if (!mathPart || !prosePart || !isMathy(mathPart) || countWords(mathPart) > 3) {
        return match;
      }

      return `\\(${cleanupEquation(mathPart)}\\) ${prosePart}`;
    });
  }

  function replaceOutsideMathSegments(value, transform) {
    const tokens = [];
    const masked = String(value || "").replace(mathSegmentPattern, function (match) {
      const token = `@@TERMO_MATH_${tokens.length}@@`;
      tokens.push(match);
      return token;
    });

    return transform(masked).replace(/@@TERMO_MATH_(\d+)@@/g, function (_match, index) {
      return tokens[Number(index)] || "";
    });
  }

  function wrapBareLatexExpressions(value) {
    const latexCommand = /\\(?:left|right|frac|partial|nabla|sum|int|sqrt|cdot|text|mathrm|to|rightarrow|le|ge|neq|infty|hat|vec|epsilon|varepsilon|delta|hbar|ell|langle|rangle|bra|ket|braket|pm|mp|dagger|alpha|beta|gamma|theta|Theta|Phi|phi|lambda|mu|sigma|rho|Omega|Delta|ln|exp|sin|cos|tan)(?![A-Za-z])/;
    const latexRun = /(^|[^A-Za-zÀ-ÿ\\])((?:(?:\\(?:text|mathrm)\s*\{[^}]*\})|(?:\{[^}]*\})|(?:\\[A-Za-z]+)|(?:[A-Za-z](?![A-Za-zÀ-ÿ]))|(?:\d+(?:\.\d+)?)|[\s_{}()[\]=+\-*/^<>.,|]){4,})(?=$|[^A-Za-zÀ-ÿ])/g;

    return replaceOutsideMathSegments(value, function (segment) {
      return segment.replace(latexRun, function (match, lead, candidate) {
        if (!latexCommand.test(candidate)) return match;
        const cleaned = String(candidate || "")
          .replace(/\s*\n\s*/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (!cleaned || !latexCommand.test(cleaned)) return match;
        const punctuation = cleaned.match(/[.,;:]$/)?.[0] || "";
        const core = punctuation ? cleaned.slice(0, -1).trim() : cleaned;
        if (!core || !latexCommand.test(core)) return match;
        return `${lead}\\(${latexifySnippet(core)}\\)${punctuation}`;
      });
    });
  }

  function separateAdjacentMathAndText(value) {
    return String(value || "")
      .replace(/(\\\)|\\\])(?=[A-Za-zÀ-ÿ])/g, "$1 ")
      .replace(/([,.;:])(?=\\\(|\\\[)/g, "$1 ")
      .replace(/([A-Za-zÀ-ÿ])(?=\\\(|\\\[)/g, "$1 ");
  }

  function wrapBareMathTokens(value) {
    return replaceOutsideMathSegments(wrapBareLatexExpressions(value), function (segment) {
      return segment
        .replace(/(^|[^A-Za-zÀ-ÿ\\])([A-Za-z])_([A-Za-z0-9]+)\b/g, function (_match, lead, symbol, subscript) {
          return `${lead}\\(${symbol}_{${subscript}}\\)`;
        })
        .replace(/(^|[^A-Za-zÀ-ÿ\\])([A-Za-z])\^([A-Za-z0-9]+)\b/g, function (_match, lead, symbol, superscript) {
          return `${lead}\\(${symbol}^{${superscript}}\\)`;
        });
    });
  }

  function unwrapProseDisplayMath(value) {
    return String(value || "").replace(/\\\[([\s\S]*?)\\\]/g, function (match, content) {
      return hasProseCue(content) ? content.trim() : match;
    });
  }

  function normalizeGeneratedMath(value) {
    const normalized = wrapBareMathTokens(
      splitProseInsideInlineMath(repairGeneratedMathDelimiters(sanitizeGeneratedExerciseText(value)))
        .replace(/\r\n?/g, "\n")
      .replace(/\\\\/g, "\\")
      .replace(/^\s*```(?:latex|tex)?\s*$/gim, "")
      .replace(/^\s*```\s*$/gm, "")
      .replace(/\$\$([\s\S]+?)\$\$/g, function (_match, equation) {
        return `\n\\[${cleanupEquation(equation)}\\]\n`;
      })
      .replace(/(^|[^\\])\$([^$\n]+?)\$/g, function (_match, lead, equation) {
        return `${lead}\\(${cleanupEquation(equation)}\\)`;
      })
      .replace(/\\\(\s*\$([^$]+)\$\s*\\\)/g, function (_match, equation) {
        return `\\(${cleanupEquation(equation)}\\)`;
      })
      .replace(/\[\s*\\\(([\s\S]+?)\\\)\s*\]/g, function (_match, equation) {
        return `\n\\[${cleanupEquation(equation)}\\]\n`;
      })
      .split("\n")
      .map(function (line) {
        return normalizeMathLine(convertStandaloneMathLine(line.trimEnd()));
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
    );
    const flattened = separateAdjacentMathAndText(splitProseInsideInlineMath(flattenNestedMathDelimiters(normalized)));
    return separateAdjacentMathAndText(wrapBareMathTokens(splitProseInsideInlineMath(unwrapProseDisplayMath(flattened))));
  }

  function flattenNestedMathDelimiters(value) {
    let text = String(value || "");
    let previous = "";
    while (text !== previous) {
      previous = text;
      text = text
        .replace(/\\\[([\s\S]*?)\\\]/g, function (_match, content) {
          return `\\[${String(content).replace(/\\\(([\s\S]*?)\\\)/g, "$1")}\\]`;
        })
        .replace(/\\\(([^\n]*?)\\\)/g, function (_match, content) {
          return `\\(${String(content).replace(/\\\[([\s\S]*?)\\\]/g, "$1")}\\)`;
        });
    }
    return text;
  }

  function latexifySnippet(snippet) {
    return snippet
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
      .replace(/\\partial\s*\/\s*\\partial\s*([A-Za-z])/g, "\\frac{\\partial}{\\partial $1}")
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

  function autoFormatPlainMath(paragraph) {
    if (/\\\(|\\\[/.test(paragraph)) {
      return paragraph;
    }

    let formatted = paragraph;

    formatted = formatted.replace(
      /(^|[^\\])\[\s*([^[\]\n]{3,180})\s*\]/g,
      function (match, lead, snippet) {
        if (!isMathy(snippet)) return match;
        return `${lead}\\(\\left[${latexifySnippet(snippet)}\\right]\\)`;
      }
    );

    formatted = formatted.replace(
      /([A-Za-z][A-Za-z0-9']*(?:_[A-Za-z0-9]+)?\s*=\s*[^.,;\n]+)(?=[.,;\n]|$)/g,
      function (_match, snippet) {
        return `\\(${latexifySnippet(snippet)}\\)`;
      }
    );

    formatted = formatted.replace(
      /\(([^()]{0,60}[→=][^()]{0,60})\)/g,
      function (_match, snippet) {
        if (/\\\(|\\\[/.test(snippet)) return `(${snippet})`;
        return `\\(${latexifySnippet(snippet)}\\)`;
      }
    );

    return formatted;
  }

  function protectMathSegments(text) {
    const tokens = [];
    const masked = String(text || "").replace(mathSegmentPattern, function (match) {
      const key = `@@TERMO_MATH_${tokens.length}@@`;
      tokens.push(escapeHtml(match));
      return key;
    });

    return { masked, tokens };
  }

  function restoreMathSegments(text, tokens) {
    return String(text || "").replace(/@@TERMO_MATH_(\d+)@@/g, function (_match, index) {
      return tokens[Number(index)] || "";
    });
  }

  function renderInlineMarkup(text) {
    // Never run the plain-text formatter inside an already delimited MathJax
    // segment. Otherwise an expression such as \(E_1 = \cdots\) can be
    // wrapped a second time, producing the nested delimiters seen by MathJax.
    const protectedText = protectMathSegments(text);
    const mathAware = autoFormatPlainMath(protectedText.masked);
    const escaped = escapeHtml(mathAware)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^\w*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

    return restoreMathSegments(escaped, protectedText.tokens);
  }

  function tokenizeGeneratedText(value) {
    const normalized = normalizeGeneratedMath(value);
    if (!normalized) return [];

    const blocks = [];
    const lines = normalized.split("\n");
    let paragraphLines = [];
    let displayLines = [];

    function flushParagraph() {
      if (!paragraphLines.length) return;
      const text = paragraphLines.join("\n").trim();
      if (text) {
        blocks.push({ type: "paragraph", value: text });
      }
      paragraphLines = [];
    }

    function flushDisplay() {
      if (!displayLines.length) return;
      const text = displayLines.join("\n").trim();
      if (text) {
        blocks.push({ type: "math", value: text });
      }
      displayLines = [];
    }

    lines.forEach(function (rawLine) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        flushDisplay();
        return;
      }

      if (displayLines.length) {
        displayLines.push(trimmed);
        if (/\\\]\s*$/.test(trimmed)) {
          flushDisplay();
        }
        return;
      }

      if (/^\\\[/.test(trimmed)) {
        flushParagraph();
        displayLines.push(trimmed);
        if (/\\\]\s*$/.test(trimmed)) {
          flushDisplay();
        }
        return;
      }

      paragraphLines.push(trimmed);
    });

    flushParagraph();
    flushDisplay();
    return blocks;
  }

  function isInlineMathOnly(value) {
    return /^\\\([\s\S]*?\\\)$/.test(String(value || "").trim());
  }

  function joinFragmentedInlineMath(blocks) {
    // The generation model occasionally puts a short inline expression in its
    // own Markdown paragraph ("mass" / "\\(m\\)" / "moving...").  That is
    // not a semantic paragraph boundary: it makes ordinary prose look broken,
    // especially on a phone. Reattach those fragments to their surrounding
    // sentence while leaving true display math (\\[ ... \\]) untouched.
    const merged = [];

    for (let index = 0; index < blocks.length; index += 1) {
      const current = blocks[index];
      const next = blocks[index + 1];

      if (
        current.type === "paragraph" &&
        isInlineMathOnly(current.value) &&
        next &&
        next.type === "paragraph"
      ) {
        if (merged.length && merged[merged.length - 1].type === "paragraph") {
          merged[merged.length - 1].value = `${merged[merged.length - 1].value.trim()} ${current.value.trim()} ${next.value.trim()}`;
        } else {
          merged.push({ type: "paragraph", value: `${current.value.trim()} ${next.value.trim()}` });
        }
        index += 1;
        continue;
      }

      if (
        current.type === "paragraph" &&
        isInlineMathOnly(current.value) &&
        merged.length &&
        merged[merged.length - 1].type === "paragraph"
      ) {
        merged[merged.length - 1].value = `${merged[merged.length - 1].value.trim()} ${current.value.trim()}`;
        continue;
      }

      merged.push(current);
    }

    return merged;
  }

  function formatGeneratedText(value) {
    return joinFragmentedInlineMath(tokenizeGeneratedText(value))
      .map(function (block) {
        if (block.type === "math") {
          return `<div class="termo-exercise__math-block">${escapeHtml(block.value)}</div>`;
        }

        // Model line wraps are not semantic paragraph breaks. Keeping them as
        // <br> made isolated inline symbols look like separate sentences.
        return `<p>${renderInlineMarkup(block.value.replace(/\s*\n\s*/g, " "))}</p>`;
      })
      .join("");
  }

  async function typesetMath(elements) {
    if (!window.MathJax || typeof window.MathJax.typesetPromise !== "function") return;

    try {
      if (typeof window.MathJax.typesetClear === "function") {
        window.MathJax.typesetClear(elements);
      }
      await window.MathJax.typesetPromise(elements);
    } catch (error) {
      console.warn("Could not compose the exercise equations.", error);
    }
  }

  async function readApiPayload(response) {
    const contentType = (response.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return {
      error: text || `HTTP ${response.status}`
    };
  }

  function firstText(selectors) {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const text = node && node.innerText ? node.innerText.trim() : "";
      if (text) return text;
    }
    return "";
  }

  function collapseText(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function collectRelevantText(root) {
    const selectors = [
      ".chapter-title",
      ".chapter-text",
      ".hdr-title",
      ".hdr-sub",
      ".title-main-heading",
      ".title-main-slide-heading",
      ".title-main-header",
      ".main-title",
      ".ch",
      ".card-heading",
      ".section-heading",
      ".body-t",
      ".body-text",
      ".content-paragraph-block",
      ".concept-text-block",
      ".text-paragraph",
      ".theory-text-block",
      ".theory-card-text",
      ".thermo-theory-card-text",
      ".thermo-provocation-body",
      ".topic-note",
      "p",
      "li"
    ];

    const fragments = [];
    const seen = new Set();

    root.querySelectorAll(selectors.join(",")).forEach(function (node) {
      const text = collapseText(node.innerText || node.textContent || "");
      if (!text || seen.has(text)) return;
      seen.add(text);
      fragments.push(text);
    });

    return collapseText(fragments.join("\n\n"));
  }

  function getPageContext(host){
    const title = firstText([
      ".chapter-title",
      ".hdr-title",
      ".title-main-heading",
      ".title-main-slide-heading",
      ".title-main-header",
      ".main-title",
      "h1"
    ]) || document.title || "";

    const subtitle = firstText([
      ".chapter-text",
      ".hdr-sub",
      ".title-section-label",
      ".title-label-section",
      ".title-section-label",
      ".topic-kicker",
      ".sub-title"
    ]);

    const sourceSelector = host.dataset.exerciseContextSelector;
    const sourceNode =
      (sourceSelector && document.querySelector(sourceSelector)) ||
      document.querySelector(".slide, .content-root, .body, .page, main, .slide-root, .slide-root-container, .slide-root-canvas") ||
      document.querySelector(".content-root, .page, main, .slide-root, .slide-root-container, .slide-root-canvas, body") ||
      document.body;

    const clone = sourceNode.cloneNode(true);
    clone.querySelectorAll([
      "[data-termo-ai-exercise]",
      "[data-qm-ai-exercise]",
      ".termo-exercise",
      "#aiExerciseBox",
      ".ai-exercise-card",
      ".termo-auth-trigger",
      ".termo-auth-overlay",
      ".termo-share-button",
      ".index-back-button",
      "script",
      "style",
      "noscript"
    ].join(", ")).forEach(function (node) {
      node.remove();
    });

    const relevantContent = collectRelevantText(clone);
    const fallbackContent = collapseText(clone.innerText || clone.textContent || "");
    const content = (relevantContent || fallbackContent).slice(0, 4500);

    return { title, subtitle, content };
  }

  function getChapterMeta() {
    const label = firstText([".chapter-label"]);
    const match = label.match(/Chapter\s+(\d+)\s*·\s*Item\s+([0-9.]+)/i);

    return {
      chapterId: match ? match[1].padStart(2, "0") : "",
      itemId: match ? match[2] : "",
      label
    };
  }

  async function canProfessorValidate() {
    if (!window.TermoAuth?.getSession) return false;

    try {
      const [session, config] = await Promise.all([
        window.TermoAuth.getSession(),
        window.TermoAuth.fetchConfig ? window.TermoAuth.fetchConfig().catch(function () { return null; }) : Promise.resolve(null)
      ]);
      const email = String(session?.user?.email || "").trim().toLowerCase();
      const validatorEmails = Array.isArray(config?.validatorEmails) && config.validatorEmails.length
        ? config.validatorEmails.map(function (value) {
            return String(value || "").trim().toLowerCase();
          }).filter(Boolean)
        : DEFAULT_VALIDATOR_EMAILS;

      return Boolean(email && validatorEmails.includes(email));
    } catch (_error) {
      return false;
    }
  }

  function setSaveStatus(host, message, tone) {
    const node = host.querySelector('[data-role="save-status"]');
    if (!node) return;

    if (!message) {
      node.hidden = true;
      node.textContent = "";
      node.classList.remove("is-success", "is-warning", "is-error");
      return;
    }

    node.hidden = false;
    node.textContent = message;
    node.classList.remove("is-success", "is-warning", "is-error");
    if (tone) {
      node.classList.add(`is-${tone}`);
    }
  }

  function setValidationStatus(host, message, tone) {
    const node = host.querySelector('[data-role="validation-status"]');
    if (!node) return;

    if (!message) {
      node.hidden = true;
      node.textContent = "";
      node.classList.remove("is-success", "is-warning", "is-error");
      return;
    }

    node.hidden = false;
    node.textContent = message;
    node.classList.remove("is-success", "is-warning", "is-error");
    if (tone) {
      node.classList.add(`is-${tone}`);
    }
  }

  function setMemoryStatus(host, message, tone) {
    const node = host.querySelector('[data-role="memory-status"]');
    if (!node) return;

    if (!message) {
      node.hidden = true;
      node.textContent = "";
      node.classList.remove("is-success", "is-warning");
      return;
    }

    node.hidden = false;
    node.textContent = message;
    node.classList.remove("is-success", "is-warning");
    if (tone) {
      node.classList.add(`is-${tone}`);
    }
  }

  function buildExerciseRecord(ctx, data, difficultyValue) {
    const chapter = getChapterMeta();
    const pageReference = getCurrentPageReference();

    return {
      chapterId: chapter.chapterId,
      itemId: chapter.itemId,
      pagePath: pageReference,
      pageUrl: pageReference,
      pageTitle: ctx.title || document.title || "Course page",
      difficulty: difficultyValue,
      exerciseCode: data.exerciseId || "",
      exerciseTitle: data.title || "Exercise",
      statement: data.statement || "",
      solution: data.solution || "",
      sourceModel: data.model || null,
      sourceReferences: data.sourceReferences || [],
      contextPackageMeta: data.contextPackageMeta || {}
    };
  }

  async function persistExercise(host, record) {
    if (!window.TermoUserData || typeof window.TermoUserData.saveExercise !== "function") {
      setSaveStatus(host, "", "");
      return { saved: false, reason: "user_data_not_available" };
    }

    try {
      const result = await window.TermoUserData.saveExercise(record);

      if (result.saved) {
        setSaveStatus(host, "Exercise saved in My exercises.", "success");
        return result;
      }

      if (result.reason === "not_authenticated") {
        setSaveStatus(host, "Sign in with Google to keep this exercise in My exercises.", "warning");
        return result;
      }

      if (result.reason === "auth_not_configured") {
        setSaveStatus(host, "", "");
        return result;
      }

      console.warn("Could not save the exercise.", result.error || result.reason);
      setSaveStatus(host, "Could not save this exercise right now.", "error");
      return result;
    } catch (error) {
      console.warn("Failed to save the generated exercise.", error);
      setSaveStatus(host, "Could not save this exercise right now.", "error");
      return { saved: false, reason: "unexpected_error", error };
    }
  }

  function syncValidationNoteVisibility(host) {
    ["statement", "solution"].forEach(function (scope) {
      const checked = host.querySelector(`input[name="${scope}-validation-${host.dataset.exerciseIdSuffix}"]:checked`);
      const noteBox = host.querySelector(`[data-role="${scope}-note-box"]`);
      if (!noteBox) return;
      const shouldOpen = checked && checked.value === "sim";
      noteBox.hidden = !shouldOpen;
    });
  }

  function resetValidationForm(host) {
    host.querySelectorAll('[data-role="validation-choice"]').forEach(function (input) {
      input.checked = false;
    });
    host.querySelectorAll('[data-role="validation-note"]').forEach(function (input) {
      input.value = "";
    });
    host.querySelectorAll(".termo-exercise__validation-note-box").forEach(function (box) {
      box.hidden = true;
    });
    setValidationStatus(host, "", "");
  }

  async function refreshValidationVisibility(host) {
    const toggle = host.querySelector('[data-role="toggle-validation"]');
    const panel = host.querySelector('[data-role="validation-panel"]');
    if (!toggle || !panel) return;

    const state = getHostState(host);
    const ready = Boolean(state.exercise && state.exercise.statement && state.exercise.solution);
    state.canValidate = ready;
    const visible = ready;

    toggle.hidden = !visible;
    panel.hidden = !visible || panel.hidden;
    if (!visible) {
      panel.hidden = true;
      setValidationStatus(host, "", "");
    }
  }

  async function submitValidation(host) {
    if (!EXERCISE_GENERATION_ENABLED) {
      disableExerciseHost(host);
      return;
    }

    const state = getHostState(host);
    if (!state.exercise) {
      setValidationStatus(host, "Generate an exercise before validating.", "warning");
      return;
    }

    const session = await window.TermoAuth?.getSession?.().catch(function () {
      return null;
    });
    const accessToken = session?.access_token;
    if (!accessToken) {
      setValidationStatus(host, "Sign in with Google to send the validation.", "warning");
      return;
    }

    const statementStatus = host.querySelector(`input[name="statement-validation-${host.dataset.exerciseIdSuffix}"]:checked`)?.value || "";
    const solutionStatus = host.querySelector(`input[name="solution-validation-${host.dataset.exerciseIdSuffix}"]:checked`)?.value || "";
    const statementNote = (host.querySelector('[data-role="statement-note"]')?.value || "").trim();
    const solutionNote = (host.querySelector('[data-role="solution-note"]')?.value || "").trim();

    if (!statementStatus || !solutionStatus) {
      setValidationStatus(host, "Fill in the statement and solution assessment.", "warning");
      return;
    }

    if (statementStatus === "sim" && !statementNote) {
      setValidationStatus(host, "Describe the statement problem in one sentence.", "warning");
      return;
    }

    if (solutionStatus === "sim" && !solutionNote) {
      setValidationStatus(host, "Describe the solution problem in one sentence.", "warning");
      return;
    }

    const button = host.querySelector('[data-role="submit-validation"]');
    const ctx = state.exercise.context || getPageContext(host);
    const chapter = getChapterMeta();
    const pageReference = getCurrentPageReference();

    try {
      if (button) button.disabled = true;
      setValidationStatus(host, "Sending for professor review...", "warning");

      const response = await fetch("/api/exercicio-validacao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          chapterId: chapter.chapterId,
          itemId: chapter.itemId,
          exerciseId: state.exercise.exerciseId || "",
          pagePath: pageReference,
          pageUrl: pageReference,
          pageTitle: ctx.title || document.title || "Course page",
          pageSubtitle: ctx.subtitle || "",
          pageContent: ctx.content || "",
          difficulty: state.exercise.difficulty || "medio",
          savedExerciseId: state.saveResult?.record?.id || "",
          exerciseTitle: state.exercise.title || "Exercise",
          statement: state.exercise.statement || "",
          solution: state.exercise.solution || "",
          statementStatus,
          solutionStatus,
          statementNote,
          solutionNote,
          language: "en"
        })
      });

      const payload = await readApiPayload(response);
      if (!response.ok) {
        throw new Error(
          payload?.details?.message ||
          payload?.details?.error_description ||
          payload?.details?.error ||
          payload?.error ||
          `HTTP error ${response.status}`
        );
      }

      setValidationStatus(
        host,
        payload.summary || "Report sent for professor review.",
        "success"
      );
    } catch (error) {
      console.warn("Could not send the exercise validation.", error);
      setValidationStatus(host, error && error.message ? error.message : "Could not register the validation right now.", "error");
    } finally {
      if (button) button.disabled = false;
    }
  }

  function renderShell(host) {
    const selectId = `termo-exercise-select-${Math.random().toString(36).slice(2, 10)}`;
    const validationSuffix = Math.random().toString(36).slice(2, 10);
    const title = host.dataset.exerciseTitle || "Exercise";
    const theme = host.dataset.exerciseTheme || "purple";
    const levelLabel = host.dataset.exerciseLevelLabel || "Level";

    host.dataset.exerciseMounted = "true";
    host.dataset.exerciseIdSuffix = validationSuffix;
    host.classList.add("termo-exercise");
    host.setAttribute("data-exercise-theme", theme);
    host.innerHTML = `
      <div class="termo-exercise__top">
        <div class="termo-exercise__title">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          ${escapeHtml(title)}
        </div>

        <div class="termo-exercise__controls">
          <div class="termo-exercise__level">
            <label class="termo-exercise__level-label" for="${selectId}">${escapeHtml(levelLabel)}</label>
            <select class="termo-exercise__select" id="${selectId}" data-role="difficulty">
              <option value="facil">Easy</option>
              <option selected value="medio">Medium</option>
              <option value="dificil">Hard</option>
            </select>
          </div>

          <button class="termo-exercise__btn" data-role="generate" type="button">New exercise</button>
          <button class="termo-exercise__btn termo-exercise__btn--secondary" data-role="toggle-solution" type="button" disabled>View solution</button>
        </div>
      </div>

      <div class="termo-exercise__disclaimer">
        <strong>Important note:</strong> all teaching content on the pages and in the associated book was created by Prof. Mario Reis. The exercise generator is a teaching experiment; exercises and solutions are generated automatically by AI and
        <strong>may contain conceptual, mathematical, or pedagogical errors</strong>. Detected errors should be reported to
        <a href="mailto:marioreis@id.uff.br">marioreis@id.uff.br</a>.
      </div>

      <div class="termo-exercise__save-status" data-role="save-status" hidden></div>
      <div class="termo-exercise__memory-status" data-role="memory-status" hidden></div>

      <div class="termo-exercise__body">
        <div class="termo-exercise__panel termo-exercise__output" data-role="output">
          <div class="termo-exercise__panel-title">
            <i class="fa-solid fa-circle-question"></i>
            Statement
          </div>
          <div class="termo-exercise__content termo-exercise__placeholder" data-role="output-content">
            <p>Choose the level and click <strong>New exercise</strong>.</p>
          </div>
        </div>

        <div class="termo-exercise__panel termo-exercise__solution" data-role="solution-panel">
          <div class="termo-exercise__panel-title termo-exercise__panel-title--solution">
            <i class="fa-solid fa-check"></i>
            Solution
          </div>
          <div class="termo-exercise__content termo-exercise__placeholder" data-role="solution-content">
            <p>The solution will appear here after the exercise is generated.</p>
          </div>
        </div>
      </div>

      <div class="termo-exercise__validation-tools">
        <button class="termo-exercise__btn termo-exercise__btn--validation" data-role="toggle-validation" type="button" hidden>
          <i class="fa-solid fa-shield-check"></i>
          Exercise validation
        </button>
      </div>

      <div class="termo-exercise__validation-panel" data-role="validation-panel" hidden>
        <div class="termo-exercise__validation-header">
          <div class="termo-exercise__validation-title">
            <i class="fa-solid fa-graduation-cap"></i>
            Exercise validation report
          </div>
          <div class="termo-exercise__validation-copy">Mark whether the statement or solution contains errors. If you choose <strong>yes</strong>, describe the problem in a single sentence.</div>
        </div>

        <div class="termo-exercise__validation-grid">
          <div class="termo-exercise__validation-group">
            <div class="termo-exercise__validation-label">Does the statement contain errors?</div>
            <div class="termo-exercise__validation-options">
              <label class="termo-exercise__validation-option">
                <input type="radio" name="statement-validation-${validationSuffix}" value="sim" data-role="validation-choice">
                <span>Yes</span>
              </label>
              <label class="termo-exercise__validation-option">
                <input type="radio" name="statement-validation-${validationSuffix}" value="nao" data-role="validation-choice">
                <span>No</span>
              </label>
              <label class="termo-exercise__validation-option">
                <input type="radio" name="statement-validation-${validationSuffix}" value="nao_sei" data-role="validation-choice">
                <span>Not sure</span>
              </label>
            </div>
            <div class="termo-exercise__validation-note-box" data-role="statement-note-box" hidden>
              <textarea class="termo-exercise__validation-note" data-role="statement-note" rows="2" maxlength="220" placeholder="Describe the statement error in one sentence."></textarea>
            </div>
          </div>

          <div class="termo-exercise__validation-group">
            <div class="termo-exercise__validation-label">Does the solution contain errors?</div>
            <div class="termo-exercise__validation-options">
              <label class="termo-exercise__validation-option">
                <input type="radio" name="solution-validation-${validationSuffix}" value="sim" data-role="validation-choice">
                <span>Yes</span>
              </label>
              <label class="termo-exercise__validation-option">
                <input type="radio" name="solution-validation-${validationSuffix}" value="nao" data-role="validation-choice">
                <span>No</span>
              </label>
              <label class="termo-exercise__validation-option">
                <input type="radio" name="solution-validation-${validationSuffix}" value="nao_sei" data-role="validation-choice">
                <span>Not sure</span>
              </label>
            </div>
            <div class="termo-exercise__validation-note-box" data-role="solution-note-box" hidden>
              <textarea class="termo-exercise__validation-note" data-role="solution-note" rows="2" maxlength="220" placeholder="Describe the solution error in one sentence."></textarea>
            </div>
          </div>
        </div>

        <div class="termo-exercise__validation-actions">
          <button class="termo-exercise__btn termo-exercise__btn--validation-submit" data-role="submit-validation" type="button">
            Send validation
          </button>
        </div>

        <div class="termo-exercise__validation-status" data-role="validation-status" hidden></div>
      </div>
    `;
  }

  async function generate(host) {
    if (!EXERCISE_GENERATION_ENABLED) {
      disableExerciseHost(host);
      return;
    }

    const generateBtn = host.querySelector('[data-role="generate"]');
    const toggleBtn = host.querySelector('[data-role="toggle-solution"]');
    const difficulty = host.querySelector('[data-role="difficulty"]');
    const output = host.querySelector('[data-role="output-content"]');
    const solution = host.querySelector('[data-role="solution-content"]');
    const solutionPanel = host.querySelector('[data-role="solution-panel"]');
    const outputTitle = host.querySelector('[data-role="output"] .termo-exercise__panel-title');
    const level = host.dataset.exerciseLevel || "undergraduate physics";
    const hostState = getHostState(host);

    if (!generateBtn || !toggleBtn || !difficulty || !output || !solution || !solutionPanel || !outputTitle) return;

    const ctx = getPageContext(host);
    const chapter = getChapterMeta();
    generateBtn.disabled = true;
    toggleBtn.disabled = true;
    solutionPanel.style.display = "none";
    hostState.exercise = null;
    hostState.saveResult = null;
    resetValidationForm(host);
    setMemoryStatus(host, "", "");
    await refreshValidationVisibility(host);

    outputTitle.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Generating exercise
    `;
    output.classList.add("termo-exercise__placeholder");
    output.innerHTML = "<p>Please wait a few seconds...</p>";
    solution.classList.add("termo-exercise__placeholder");
    solution.innerHTML = "<p>The solution will appear here after the exercise is generated.</p>";
    setSaveStatus(host, "", "");

    try {
      const response = await fetch("/api/exercicio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.chapterId,
          itemId: chapter.itemId,
          pagePath: window.location.pathname,
          pageTitle: ctx.title,
          pageSubtitle: ctx.subtitle,
          pageContent: ctx.content,
          difficulty: difficulty.value,
          language: "en",
          level
        })
      });

      const data = await readApiPayload(response);
      if (!response.ok) {
        throw new Error(
          data?.details?.error?.message ||
          data?.details?.error ||
          data?.details?.message ||
          data?.error ||
          `HTTP error ${response.status}`
        );
      }

      outputTitle.innerHTML = `
        <i class="fa-solid fa-circle-question"></i>
        <span class="termo-exercise__generated-title">${escapeHtml(data.title || "Exercise")}</span>
        ${data.exerciseId ? `<span class="termo-exercise__id-chip">${escapeHtml(data.exerciseId)}</span>` : ""}
      `;
      output.classList.remove("termo-exercise__placeholder");
      output.innerHTML = formatGeneratedText(data.statement || "The API did not return a statement.");

      solution.classList.remove("termo-exercise__placeholder");
      solution.innerHTML = formatGeneratedText(data.solution || "The API did not return a solution.");

      await typesetMath([output, solution]);
      toggleBtn.disabled = !(data.solution || "").trim();
      hostState.exercise = {
        title: data.title || "Exercise",
        exerciseId: data.exerciseId || "",
        statement: data.statement || "",
        solution: data.solution || "",
        difficulty: difficulty.value,
        context: ctx
      };
      hostState.saveResult = await persistExercise(host, buildExerciseRecord(ctx, data, difficulty.value));
      if (hostState.canValidate && Number(data.validationMemoryCount || 0) > 0) {
        setMemoryStatus(
          host,
          `This generation used ${Number(data.validationMemoryCount)} already confirmed correction(s) for this item.`,
          "success"
        );
      } else {
        setMemoryStatus(host, "", "");
      }
      resetValidationForm(host);
      await refreshValidationVisibility(host);
    } catch (error) {
      outputTitle.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        Could not generate the exercise
      `;
      output.classList.add("termo-exercise__placeholder");
      output.innerHTML = `
        <p><strong>Returned error:</strong> ${escapeHtml(error && error.message ? error.message : "Failed to call the exercises API.")}</p>
        <p>Check whether the project is published on Vercel, whether the file <strong>api/exercicio.js</strong> exists, and whether the <strong>GEMINI_API_KEY</strong> variable was configured.</p>
      `;
      setSaveStatus(host, "", "");
      setMemoryStatus(host, "", "");
      hostState.exercise = null;
      hostState.saveResult = null;
      resetValidationForm(host);
      await refreshValidationVisibility(host);
    } finally {
      generateBtn.disabled = false;
    }
  }

  function mount(host) {
    if (!host || host.dataset.exerciseMounted === "true") return;
    if (!EXERCISE_GENERATION_ENABLED) {
      disableExerciseHost(host);
      return;
    }
    renderShell(host);

    const generateBtn = host.querySelector('[data-role="generate"]');
    const toggleBtn = host.querySelector('[data-role="toggle-solution"]');
    const solutionPanel = host.querySelector('[data-role="solution-panel"]');
    const validationToggle = host.querySelector('[data-role="toggle-validation"]');
    const validationPanel = host.querySelector('[data-role="validation-panel"]');
    const validationSubmit = host.querySelector('[data-role="submit-validation"]');

    if (generateBtn) {
      generateBtn.addEventListener("click", function () {
        generate(host);
      });
    }

    if (toggleBtn && solutionPanel) {
      toggleBtn.addEventListener("click", function () {
        solutionPanel.style.display = solutionPanel.style.display === "block" ? "none" : "block";
      });
    }

    host.querySelectorAll('[data-role="validation-choice"]').forEach(function (input) {
      input.addEventListener("change", function () {
        syncValidationNoteVisibility(host);
      });
    });

    if (validationToggle && validationPanel) {
      validationToggle.addEventListener("click", function () {
        validationPanel.hidden = !validationPanel.hidden;
      });
    }

    if (validationSubmit) {
      validationSubmit.addEventListener("click", function () {
        submitValidation(host);
      });
    }

    if (window.TermoUserData?.onAuthStateChange) {
      window.TermoUserData.onAuthStateChange(function () {
        void refreshValidationVisibility(host);
      });
    }

    void refreshValidationVisibility(host);
  }

  function autoMount(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-termo-ai-exercise], [data-qm-ai-exercise]").forEach(function (host) {
      mount(host);
    });
  }

  window.TermoAIExercise = {
    isEnabled: EXERCISE_GENERATION_ENABLED,
    mount,
    autoMount,
    formatGeneratedText,
    normalizeGeneratedMath
  };
  window.QmAIExercise = window.TermoAIExercise;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      autoMount(document);
    });
  } else {
    autoMount(document);
  }
})();
