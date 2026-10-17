import { buildIndexMeta } from "../assets/qm-index-seo.mjs";

const escapeHtml = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// Only generated metadata is interpolated; never reflect arbitrary request values.
export function renderIndexResponse(template, search = "") {
  const meta = buildIndexMeta(search);
  let html = template.replace(/<title>[^<]*<\/title>/, "<title>" + escapeHtml(meta.title) + "</title>");
  for (const [name, value] of Object.entries({
    description: meta.description, robots: meta.robots, googlebot: meta.robots,
    "twitter:title": meta.title, "twitter:description": meta.description
  })) html = html.replace(new RegExp('(<meta name="' + name + '" content=")[^"]*(")'), (_, a, b) => a + escapeHtml(value) + b);
  for (const [name, value] of Object.entries({
    "og:title": meta.title, "og:description": meta.description, "og:url": meta.canonical
  })) html = html.replace(new RegExp('(<meta property="' + name + '" content=")[^"]*(")'), (_, a, b) => a + escapeHtml(value) + b);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => a + escapeHtml(meta.canonical) + b);
  html = html.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,
    '<script type="application/ld+json" data-termo-seo-runtime="true">' + JSON.stringify(meta.jsonLd).replaceAll("<", "\\u003c") + "</script>");
  return { html, robots: meta.robots, canonical: meta.canonical };
}
