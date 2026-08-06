import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = resolve(ROOT_DIR, "data/book-section-corpus.json");
const SOLUTION_OUTPUT_PATH = resolve(ROOT_DIR, "data/book-solution-guidance.json");

// PDF page numbers, not printed book-page numbers. Keep this map alongside new chapter pages.
const CHAPTERS = [
  {
    id: "01",
    title: "Old quantum physics",
    theoryPdf: "/Users/marioreis/Desktop/qm/c1 Reis Quantum Mechanics copy 2.pdf",
    solutionsPdf: "/Users/marioreis/Desktop/qm/c1_Reis QM solutions copy 3.pdf",
    ranges: [[2, 2], [2, 3], [3, 5], [5, 8], [9, 15], [16, 17], [18, 20], [21, 22], [23, 24], [25, 27], [28, 28], [29, 30], [30, 35], [35, 40], [47, 51]]
  },
  {
    id: "02",
    title: "Construction of quantum theory I: wave mechanics",
    theoryPdf: "/Users/marioreis/Desktop/qm/c2 Reis Quantum Mechanics copy 3.pdf",
    solutionsPdf: "/Users/marioreis/Desktop/qm/c2_Reis QM solutions copy 3.pdf",
    ranges: [[2, 2], [2, 2], [3, 3], [4, 5], [6, 9], [9, 10], [11, 11], [12, 17], [18, 19], [20, 20], [21, 24], [25, 26], [27, 30], [31, 34], [31, 34]]
  },
  {
    id: "03",
    title: "Construction of quantum theory II: matrix mechanics",
    theoryPdf: "/Users/marioreis/Desktop/qm/c3 Reis Quantum Mechanics copy 4.pdf",
    solutionsPdf: "/Users/marioreis/Desktop/qm/c3_Reis QM solutions copy 3.pdf",
    ranges: [[2, 2], [2, 4], [5, 6], [5, 6], [7, 10], [7, 10], [11, 12], [13, 14], [7, 10], [15, 16], [17, 17], [18, 18], [19, 20], [21, 21]]
  },
  {
    id: "04",
    title: "One-dimensional problems: bound and unbound states",
    theoryPdf: "/Users/marioreis/Desktop/qm/c4 Reis Quantum Mechanics copy 5.pdf",
    solutionsPdf: "/Users/marioreis/Desktop/qm/c4_Reis QM solutions copy 3.pdf",
    // Curated to the chapter's actual sections, not merely to equal-size page
    // slices. The final item uses the book's practice appendix as a
    // qualitative chapter-synthesis source.
    ranges: [[2, 2], [2, 10], [3, 6], [11, 18], [45, 48], [19, 21], [22, 26], [27, 30], [31, 32], [33, 37], [38, 40], [41, 44], [49, 51]]
  }
];

function runPdftotext(pdfPath) {
  const result = spawnSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8", maxBuffer: 24 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Could not extract ${pdfPath}: ${result.stderr || "pdftotext failed"}`);
  return String(result.stdout || "").split("\f").map((page) => page.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim());
}

function truncate(value, maxChars) {
  const text = String(value || "").trim();
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const breakpoint = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "));
  return `${slice.slice(0, breakpoint > maxChars * 0.55 ? breakpoint + 1 : maxChars).trimEnd()}...`;
}

function pageRangeText(pages, start, end) {
  return pages.slice(Math.max(0, start - 1), end).join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function loadTopics(chapterId) {
  const data = JSON.parse(readFileSync(resolve(ROOT_DIR, `data/chapter-${chapterId}.json`), "utf8"));
  return Array.isArray(data.topics) ? data.topics : [];
}

const sections = [];
const solutionGuidance = [];

for (const chapter of CHAPTERS) {
  if (!existsSync(chapter.theoryPdf) || !existsSync(chapter.solutionsPdf)) {
    throw new Error(`Missing source PDF for chapter ${chapter.id}.`);
  }
  const theoryPages = runPdftotext(chapter.theoryPdf);
  const solutionPages = runPdftotext(chapter.solutionsPdf);
  const topics = loadTopics(chapter.id);

  if (topics.length !== chapter.ranges.length) throw new Error(`Topic/page-map mismatch for chapter ${chapter.id}.`);

  topics.forEach((topic, index) => {
    const [pageStart, pageEnd] = chapter.ranges[index];
    const content = pageRangeText(theoryPages, pageStart, pageEnd);
    sections.push({
      chapterId: chapter.id,
      itemId: topic.id,
      topicTitle: topic.title,
      pagePath: topic.url,
      pdfChapterNumber: String(Number(chapter.id)),
      pdfChapterTitle: chapter.title,
      pageStart,
      pageEnd,
      mappingReason: "Curated PDF-page mapping aligned with the corresponding book-app item.",
      extractionSources: [`chapter-${chapter.id}-theory.pdf`],
      referenceCount: 1,
      needsReview: false,
      references: [{
        id: `qm-${chapter.id}-${topic.id}`,
        label: `Chapter ${Number(chapter.id)}, item ${topic.id}`,
        pdfChapterNumber: String(Number(chapter.id)),
        pdfChapterTitle: chapter.title,
        pageStart,
        pageEnd,
        mappingReason: "Curated PDF-page mapping aligned with the corresponding book-app item.",
        extractionSources: [`chapter-${chapter.id}-theory.pdf`],
        needsReview: false,
        content: truncate(content, 3600),
        excerpt: truncate(content, 1100)
      }],
      content: truncate(content, 3600),
      excerpt: truncate(content, 1100)
    });
  });

  // Solution PDFs calibrate the requested solution style. They are deliberately
  // supplied as chapter-level guidance, never as a bank to copy verbatim.
  solutionGuidance.push({
    chapterId: chapter.id,
    source: `chapter-${chapter.id}-solutions.pdf`,
    content: truncate(pageRangeText(solutionPages, 1, Math.min(solutionPages.length, 8)), 2400),
    usage: "Use only to calibrate solution completeness and notation. Do not reproduce a textbook exercise or answer."
  });
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, `${JSON.stringify({ version: "qm-book-section-corpus-v1", generatedAt: new Date().toISOString(), sections }, null, 2)}\n`);
writeFileSync(SOLUTION_OUTPUT_PATH, `${JSON.stringify({ version: "qm-solution-guidance-v1", generatedAt: new Date().toISOString(), chapters: solutionGuidance }, null, 2)}\n`);
console.log(`Wrote ${sections.length} section references to ${OUTPUT_PATH}`);
console.log(`Wrote ${solutionGuidance.length} solution-guidance references to ${SOLUTION_OUTPUT_PATH}`);
