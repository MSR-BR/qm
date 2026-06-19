import path from "node:path";
import { fileURLToPath } from "node:url";
import { readdir, readFile, writeFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const slidesDir = path.join(rootDir, "slides");
const dataDir = path.join(rootDir, "data");

const SITE_URL = "https://qm-beta.vercel.app";
const SEO_ASSET_VERSION = "0614.1";
const COURSE_TITLE = "Quantum Mechanics";
const AUTHOR_NAME = "Prof. Mario Reis";
const PUBLISHER_NAME = "Institute of Physics — Fluminense Federal University";
const DEFAULT_SITE_DESCRIPTION = "Interactive Quantum Mechanics book with chapters, favorites, and a personal study area by Prof. Mario Reis (IF-UFF).";
const TODAY = "2026-06-14";

const chapterCatalog = {
    "01": {
      title: "Old quantum physics",
      description: "Experimental foundations, Bohr model, de Broglie hypothesis and semi-classical quantization."
    },
    "02": {
      title: "Construction of quantum theory I: wave mechanics",
      description: "Schrödinger equation, wave functions, postulates and uncertainty."
    },
    "03": {
      title: "Construction of quantum theory II: matrix mechanics",
      description: "State vectors, observables, commutation relations and time evolution."
    },
    "04": {
      title: "One-dimensional problems: bound and unbound states",
      description: "Harmonic oscillator, finite wells, scattering coefficients and one-dimensional potentials."
    },
    "05": {
      title: "Traditional problems with central potential",
      description: "Separation of variables, Hydrogen atom and three-dimensional harmonic oscillator."
    },
    "06": {
      title: "Angular momentum",
      description: "Angular momentum algebra, matrix representation and position-space representation."
    },
    "07": {
      title: "Addition of angular momenta",
      description: "Coupled bases, Clebsch-Gordan coefficients and applications to atomic angular momentum."
    },
    "08": {
      title: "Time-independent perturbation theory",
      description: "Non-degenerate and degenerate perturbation theory with physical applications."
    },
    "09": {
      title: "Time-dependent perturbation theory",
      description: "Interaction picture, coupled equations, Dyson series and magnetic resonance."
    },
    "10": {
      title: "Scattering: partial waves",
      description: "Scattering quantities, partial-wave expansion and spherical examples."
    },
    "11": {
      title: "Density operator",
      description: "Pure and mixed states, bipartite systems, partial trace and statistical mechanics connections."
    },
    "12": {
      title: "Entangled states",
      description: "Classical and quantum correlations, concurrence and entanglement of formation."
    },
    "13": {
      title: "Relativistic quantum mechanics",
      description: "Klein-Gordon and Dirac approaches, spinors, potentials and the Klein paradox."
    }
  };

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xmlEscape(value) {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function truncate(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

async function collectHtmlFiles(dir, bucket = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectHtmlFiles(fullPath, bucket);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      bucket.push(fullPath);
    }
  }

  return bucket;
}

async function loadTopicMap() {
  const entries = await readdir(dataDir);
  const chapterFiles = entries.filter((fileName) => /^chapter-\d+\.json$/.test(fileName)).sort();
  const topicMap = new Map();

  for (const fileName of chapterFiles) {
    const chapterId = fileName.match(/^chapter-(\d+)\.json$/)?.[1] || "";
    const raw = await readFile(path.join(dataDir, fileName), "utf8");
    const parsed = JSON.parse(raw);
    const topics = Array.isArray(parsed?.topics) ? parsed.topics : [];

    for (const topic of topics) {
      const normalizedUrl = String(topic.url || "").replace(/^\/+/, "");
      if (!normalizedUrl) continue;
      topicMap.set(normalizedUrl, {
        chapterId,
        chapterTitle: chapterCatalog[chapterId]?.title || `Chapter ${Number(chapterId)}`,
        id: String(topic.id || "").trim(),
        title: String(topic.title || "").trim(),
        note: String(topic.note || "").trim()
      });
    }
  }

  return topicMap;
}

function getRelativeAssetPath(filePath, assetName) {
  return toPosix(path.relative(path.dirname(filePath), path.join(rootDir, "assets", assetName))) || assetName;
}

function getCanonicalUrl(relativePath) {
  if (!relativePath || relativePath === "index.html") {
    return `${SITE_URL}/`;
  }
  return `${SITE_URL}/${relativePath}`;
}

function getCoverMeta(relativePath) {
  const match = relativePath.match(/^slides\/chapter-(\d+)\/page_1\.html$/i);
  if (!match) return null;

  const chapterId = match[1];
  const chapter = chapterCatalog[chapterId];
  if (!chapter) return null;

  return {
    title: `Chapter ${Number(chapterId)} — ${chapter.title} | ${COURSE_TITLE}`,
    description: truncate(`${chapter.description} Interactive material from the book ${COURSE_TITLE}, with teaching authorship by ${AUTHOR_NAME}.`, 170)
  };
}

function getSourceCanonical(relativePath) {
  return relativePath.replace("/source/", "/");
}

function inferPageMeta(relativePath, html, topicMap) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const currentTitle = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : COURSE_TITLE;
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");
  const isIndex = normalizedRelativePath === "index.html";
  const isInstructions = normalizedRelativePath === "INSTRUCOES_SNIPPET.html";
  const isSource = normalizedRelativePath.includes("/source/");
  const topic = topicMap.get(normalizedRelativePath);
  const coverMeta = getCoverMeta(normalizedRelativePath);

  if (isIndex) {
    return {
      title: `${COURSE_TITLE} | Interactive Quantum Mechanics book`,
      description: DEFAULT_SITE_DESCRIPTION,
      canonical: `${SITE_URL}/`,
      robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      ogType: "website",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: COURSE_TITLE,
          url: `${SITE_URL}/`,
          inLanguage: "en"
        },
        {
          "@context": "https://schema.org",
          "@type": "Course",
          name: COURSE_TITLE,
          description: DEFAULT_SITE_DESCRIPTION,
          provider: {
            "@type": "CollegeOrUniversity",
            name: PUBLISHER_NAME
          },
          creator: {
            "@type": "Person",
            name: AUTHOR_NAME
          },
          url: `${SITE_URL}/`
        }
      ]
    };
  }

  if (isInstructions) {
    return {
      title: `Internal instructions | ${COURSE_TITLE}`,
      description: "Internal project instructions file.",
      canonical: `${SITE_URL}/`,
      robots: "noindex,nofollow,noarchive",
      ogType: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `Internal instructions | ${COURSE_TITLE}`,
        description: "Internal instructions file."
      }
    };
  }

  const title = topic
    ? `${topic.title} | Chapter ${Number(topic.chapterId)} | ${COURSE_TITLE}`
    : coverMeta?.title || `${currentTitle} | ${COURSE_TITLE}`;

  const description = topic
    ? truncate(`${topic.note} Interactive material from the book ${COURSE_TITLE}, with teaching authorship by ${AUTHOR_NAME} (${PUBLISHER_NAME}).`, 170)
    : coverMeta?.description || truncate(`${currentTitle}. Page do livro interativo ${COURSE_TITLE}, created by ${AUTHOR_NAME} no ${PUBLISHER_NAME}.`, 170);

  const canonicalRelativePath = isSource ? getSourceCanonical(normalizedRelativePath) : normalizedRelativePath;

  return {
    title,
    description,
    canonical: getCanonicalUrl(canonicalRelativePath),
    robots: isSource ? "noindex,follow,noarchive" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: title,
      description,
      url: getCanonicalUrl(canonicalRelativePath),
      inLanguage: "en",
      isAccessibleForFree: true,
      educationalUse: "instruction",
      learningResourceType: "InteractiveResource",
      author: {
        "@type": "Person",
        name: AUTHOR_NAME
      },
      publisher: {
        "@type": "CollegeOrUniversity",
        name: PUBLISHER_NAME
      },
      isPartOf: {
        "@type": "Course",
        name: COURSE_TITLE,
        url: `${SITE_URL}/`
      }
    }
  };
}

function buildSeoBlock(meta) {
  return [
    "<!-- termo-seo:start -->",
    `<meta name="description" content="${escapeHtml(meta.description)}"/>`,
    `<meta name="author" content="${escapeHtml(AUTHOR_NAME)}"/>`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}"/>`,
    `<meta name="googlebot" content="${escapeHtml(meta.robots)}"/>`,
    `<meta name="theme-color" content="#004B87"/>`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}"/>`,
    `<meta property="og:locale" content="en_US"/>`,
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}"/>`,
    `<meta property="og:site_name" content="${escapeHtml(COURSE_TITLE)}"/>`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}"/>`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}"/>`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}"/>`,
    `<meta name="twitter:card" content="summary"/>`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}"/>`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}"/>`,
    `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`,
    "<!-- termo-seo:end -->"
  ].join("\n");
}

function upsertTitle(html, title) {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }
  return html.replace(/<\/head>/i, `<title>${escapeHtml(title)}</title>\n</head>`);
}

function upsertSeoBlock(html, block) {
  if (/<!-- termo-seo:start -->[\s\S]*?<!-- termo-seo:end -->/i.test(html)) {
    return html.replace(/<!-- termo-seo:start -->[\s\S]*?<!-- termo-seo:end -->/i, block);
  }
  return html.replace(/<\/head>/i, `${block}\n</head>`);
}

function upsertSeoAsset(html, assetTag) {
  if (/termo-seo\.js/i.test(html)) {
    return html.replace(/<script defer src="[^"]*termo-seo\.js(?:\?v=[^"]*)?"><\/script>/i, assetTag);
  }
  return html.replace(/<\/head>/i, `${assetTag}\n</head>`);
}

async function processHtmlFile(filePath, topicMap) {
  const relativePath = toPosix(path.relative(rootDir, filePath));
  let html = await readFile(filePath, "utf8");
  const meta = inferPageMeta(relativePath, html, topicMap);
  const seoBlock = buildSeoBlock(meta);
  const assetTag = `<script defer src="${getRelativeAssetPath(filePath, "termo-seo.js")}?v=${SEO_ASSET_VERSION}"></script>`;

  html = upsertTitle(html, meta.title);
  html = upsertSeoBlock(html, seoBlock);
  html = upsertSeoAsset(html, assetTag);

  await writeFile(filePath, html, "utf8");
}

async function writeRobotsFile() {
  const content = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`
  ].join("\n");

  await writeFile(path.join(rootDir, "robots.txt"), `${content}\n`, "utf8");
}

async function writeSitemap(topicMap) {
  const urls = new Map();
  urls.set(`${SITE_URL}/`, { priority: "1.0", changefreq: "weekly" });

  for (const chapterId of Object.keys(chapterCatalog).sort()) {
    urls.set(`${SITE_URL}/?view=chapters&chapter=${chapterId}`, { priority: "0.9", changefreq: "weekly" });
  }

  for (const [relativeUrl] of topicMap.entries()) {
    urls.set(`${SITE_URL}/${relativeUrl}`, { priority: "0.7", changefreq: "monthly" });
  }

  const body = Array.from(urls.entries())
    .map(([url, meta]) => [
      "  <url>",
      `    <loc>${xmlEscape(url)}</loc>`,
      `    <lastmod>${TODAY}</lastmod>`,
      `    <changefreq>${meta.changefreq}</changefreq>`,
      `    <priority>${meta.priority}</priority>`,
      "  </url>"
    ].join("\n"))
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>"
  ].join("\n");

  await writeFile(path.join(rootDir, "sitemap.xml"), `${xml}\n`, "utf8");
}

const topicMap = await loadTopicMap();
const htmlFiles = [path.join(rootDir, "index.html"), path.join(rootDir, "INSTRUCOES_SNIPPET.html"), ...(await collectHtmlFiles(slidesDir))];

for (const filePath of htmlFiles) {
  await processHtmlFile(filePath, topicMap);
}

await writeRobotsFile();
await writeSitemap(topicMap);

console.log(`SEO atualizado em ${htmlFiles.length} HTMLs, robots.txt e sitemap.xml.`);
