(function () {
  "use strict";

  const PRINT_CSS = `
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #17251e; background: white; font: 12pt/1.6 Georgia, serif; }
    main { max-width: 680px; margin: 32px auto; padding: 0 16px; }
    h1 { font-size: 22pt; line-height: 1.2; margin: 8px 0 16px; }
    h2 { font: bold 12pt Arial, sans-serif; margin: 24px 0 12px; break-after: avoid; }
    .brand, .meta, .source, .toolbar { font-family: Arial, sans-serif; }
    .brand { color: #2f6b4f; font-weight: bold; letter-spacing: .08em; }
    .meta, .source { font-size: 10pt; overflow-wrap: anywhere; }
    p { margin: 0 0 12px; orphans: 3; widows: 3; }
    .termo-exercise__math-block { margin: 16px 0; break-inside: avoid; }
    mjx-container[display="true"] { max-width: 100%; }
    mjx-container svg { max-width: 100%; }
    .toolbar { padding: 16px; background: #f0f7f3; font-size: 14px; }
    button { padding: 10px 16px; margin: 8px 8px 0 0; cursor: pointer; }
    @media print {
      .toolbar { display: none !important; }
      main { max-width: none; margin: 0; padding: 0; }
      a { color: inherit; text-decoration: none; }
    }
  `;

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function safeSource(value) {
    try {
      const url = new URL(value, "https://quantummechanicsbook.app");
      return url.origin === "https://quantummechanicsbook.app" ? url.href : "";
    } catch { return ""; }
  }

  function buildContent(exercise, formatText, metadata, sourceUrl) {
    const source = safeSource(sourceUrl);
    return `<div class="brand">QUANTUM · Quantum Mechanics</div>
      <h1>${escapeHtml(exercise.exercise_title || "Exercise")}</h1>
      <p class="meta">${escapeHtml(metadata)}</p>
      <h2>Statement</h2><section>${formatText(exercise.statement || "")}</section>
      <h2>Solution</h2><section>${formatText(exercise.solution || "")}</section>
      ${source ? `<h2>Reviewed source</h2><p class="source"><a href="${escapeHtml(source)}">${escapeHtml(exercise.page_title || source)}</a><br>${escapeHtml(source)}</p>` : ""}`;
  }

  async function waitForMath(timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (window.MathJax?.typesetPromise && window.MathJax?.startup?.document) return window.MathJax;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Equations are not ready. Wait for the page to load, then export again.");
  }

  async function open(exercise, { formatText, metadata, sourceUrl }) {
    // Open synchronously in the click gesture; never send private exercises to a server.
    const popup = window.open("about:blank", "_blank");
    if (!popup) throw new Error("Allow pop-ups for QUANTUM, then export again.");
    popup.opener = null;
    popup.document.title = "Preparing QUANTUM exercise";
    popup.document.body.textContent = "Preparing equations for PDF export…";
    const root = document.createElement("main");
    root.setAttribute("aria-hidden", "true");
    root.style.cssText = "position:absolute;left:-10000px;top:0;width:680px;font:16px/1.6 Georgia,serif";
    let math;
    try {
      if (typeof formatText !== "function") throw new Error("Exercise formatter is unavailable. Reload and try again.");
      root.innerHTML = buildContent(exercise, formatText, metadata, sourceUrl);
      document.body.appendChild(root);
      math = await waitForMath();
      await math.typesetPromise([root]);
      if (root.querySelector('[data-mml-node="merror"], mjx-merror') || /\\[()[\]]/.test(root.textContent)) {
        throw new Error("Some equations could not be rendered. Export stopped; no raw LaTeX PDF was created.");
      }
      if (popup.closed) return "cancelled";
      // The application uses global SVG glyph caching. Carry its definitions along
      // so exported equations remain valid even after the original tab is closed.
      const cache = document.getElementById("MJX-SVG-global-cache");
      const styles = document.getElementById("MJX-SVG-styles");
      const doc = popup.document;
      doc.documentElement.lang = "en";
      doc.head.innerHTML = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
      doc.title = `exercise-${String(exercise.exercise_code || exercise.item_id || "quantum").replace(/[^a-z0-9.-]/gi, "-")}`;
      const css = doc.createElement("style");
      css.textContent = PRINT_CSS + (styles?.textContent || "");
      doc.head.appendChild(css);
      doc.body.innerHTML = '<div class="toolbar"><div role="status">Equations ready. Choose Print / Save as PDF, then select Save as PDF in your browser.</div><button type="button" id="printExercise">Print / Save as PDF</button><button type="button" id="closeExport">Close</button></div>';
      if (cache) doc.body.appendChild(doc.importNode(cache, true));
      const content = doc.createElement("main");
      content.innerHTML = root.innerHTML;
      // TeX may contain hyperlinks. Only local SVG glyph references survive in math.
      content.querySelectorAll("mjx-container [href], mjx-container [xlink\\:href]").forEach(node => {
        for (const attr of ["href", "xlink:href"]) {
          if (node.hasAttribute(attr) && !node.getAttribute(attr).startsWith("#")) node.removeAttribute(attr);
        }
      });
      doc.body.appendChild(content);
      await doc.fonts?.ready;
      doc.getElementById("printExercise").onclick = () => { popup.focus(); popup.print(); };
      doc.getElementById("closeExport").onclick = () => popup.close();
      doc.getElementById("printExercise").focus();
      doc.body.dataset.exportReady = "true";
      return "print";
    } catch (error) {
      if (!popup.closed) popup.document.body.textContent = error.message || "Export failed. Close this window and try again.";
      throw error;
    } finally {
      math?.typesetClear?.([root]);
      root.remove();
    }
  }

  window.QMExerciseExport = Object.freeze({ open, buildContent, safeSource });
})();
