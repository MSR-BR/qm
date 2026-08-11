import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const taxonomy = JSON.parse(readFileSync(resolve(root, "data/book-topic-taxonomy.json"), "utf8"));
const index = JSON.parse(readFileSync(resolve(root, "data/book-topic-index.json"), "utf8"));
const outputPath = resolve(root, "docs/exercicios-ia-indice-referencias.html");

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function topicLabel(topicId = "") {
  const topic = (index.topics || []).find((entry) => entry.id === topicId)
    || (taxonomy.transversalTopics || []).find((entry) => entry.id === topicId);
  return topic ? `${topic.label} (${topic.id})` : topicId;
}

function listTopics(topicIds = []) {
  if (!topicIds.length) return "<span class=\"muted\">none</span>";
  return `<ul>${topicIds.map((topicId) => `<li>${escapeHtml(topicLabel(topicId))}</li>`).join("")}</ul>`;
}

function pageRange(reference = {}) {
  if (!reference.pageStart) return "";
  return reference.pageEnd && reference.pageEnd !== reference.pageStart
    ? `p. ${reference.pageStart}-${reference.pageEnd}`
    : `p. ${reference.pageStart}`;
}

const sectionRows = (index.sectionIndex || []).map((section) => `
  <tr>
    <td><code>${escapeHtml(section.sectionId)}</code></td>
    <td>${escapeHtml(section.title)}</td>
    <td>${escapeHtml(section.canonicalReference?.pdfChapterTitle || "")}<br><span class="muted">${escapeHtml(pageRange(section.canonicalReference))}</span></td>
    <td>${escapeHtml(topicLabel(section.primaryTopic))}</td>
    <td>${listTopics((section.transversalTopics || []).filter((topicId) => topicId !== section.primaryTopic))}</td>
    <td>${listTopics(section.advancedSupportTopics || [])}</td>
  </tr>
`).join("");

const topicRows = (index.topics || []).map((topic) => `
  <tr>
    <td><code>${escapeHtml(topic.id)}</code></td>
    <td>${escapeHtml(topic.label)}</td>
    <td>${escapeHtml(topic.usage || "default")}</td>
    <td>${escapeHtml(String(topic.sectionCount || 0))}</td>
    <td>${escapeHtml((topic.chapters || []).join(", "))}</td>
  </tr>
`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QM AI exercise index and references</title>
  <style>
    :root{color-scheme:light;--green:#2d6b4f;--soft:#eef7f1;--line:#cfe3d7;--ink:#1f2937;--muted:#667085;}
    body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;color:var(--ink);background:#fafafa;line-height:1.5;}
    main{max-width:1180px;margin:0 auto;padding:32px 20px 56px;}
    h1,h2{color:var(--green);}
    .note{background:var(--soft);border:1px solid var(--line);border-left:6px solid var(--green);border-radius:18px;padding:18px 20px;margin:18px 0 26px;}
    table{width:100%;border-collapse:collapse;background:white;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;margin:18px 0 34px;}
    th,td{vertical-align:top;text-align:left;padding:12px 14px;border-bottom:1px solid #e5e7eb;}
    th{background:#f3f7f5;color:var(--green);font-size:.9rem;text-transform:uppercase;letter-spacing:.04em;}
    tr:last-child td{border-bottom:0;}
    code{background:#f2f4f7;border-radius:8px;padding:2px 6px;}
    ul{margin:0;padding-left:18px;}
    .muted{color:var(--muted);}
  </style>
</head>
<body>
<main>
  <h1>QM AI exercise index and references</h1>
  <div class="note">
    <p><strong>Purpose.</strong> This page documents the curated topic map used by the QM exercise generator. The canonical source remains the book corpus; the taxonomy only controls which related fragments may support an exercise.</p>
    <p><strong>Scope.</strong> Chapters ${(taxonomy.scope?.chapters || []).join(", ")}; ${index.sectionCount} app sections; ${index.topicCount} curated topics. Generated from <code>${escapeHtml(index.sourceTaxonomy || "")}</code>.</p>
  </div>

  <h2>Sections</h2>
  <table>
    <thead>
      <tr>
        <th>Section</th>
        <th>Title</th>
        <th>Canonical book reference</th>
        <th>Primary topic</th>
        <th>Related topics</th>
        <th>Advanced support</th>
      </tr>
    </thead>
    <tbody>${sectionRows}</tbody>
  </table>

  <h2>Curated topics</h2>
  <table>
    <thead>
      <tr>
        <th>Topic id</th>
        <th>Label</th>
        <th>Usage</th>
        <th>Sections</th>
        <th>Chapters</th>
      </tr>
    </thead>
    <tbody>${topicRows}</tbody>
  </table>
</main>
</body>
</html>
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
console.log(`Wrote ${outputPath}`);
