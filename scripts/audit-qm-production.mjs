const BASE_URL = new URL(process.env.QM_AUDIT_BASE_URL || "https://quantummechanicsbook.app");
const REQUIRE_SECURITY_HEADERS = process.env.QM_AUDIT_REQUIRE_SECURITY_HEADERS !== "0";
const errors = [];
const warnings = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function timedFetch(url, options = {}) {
  const startedAt = performance.now();
  const response = await fetch(url, {
    redirect: options.redirect || "follow",
    ...options,
    headers: {
      "User-Agent": "QUANTUM-C17-production-audit/1.0",
      ...(options.headers || {})
    }
  });
  return {
    response,
    elapsedMs: Math.round(performance.now() - startedAt)
  };
}

async function runPool(items, worker, concurrency = 8) {
  const queue = [...items];
  const results = [];
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length || 1) }, async function () {
    while (queue.length) {
      const item = queue.shift();
      results.push(await worker(item));
    }
  }));
  return results;
}

const sitemapUrl = new URL("/sitemap.xml", BASE_URL);
const sitemapResult = await timedFetch(sitemapUrl);
check(sitemapResult.response.status === 200, "Primary sitemap did not return HTTP 200.");
const sitemapXml = await sitemapResult.response.text();
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(function (match) {
  return decodeXml(match[1]);
});
check(urls.length === 96, "Expected 96 sitemap URLs, received " + urls.length + ".");
check(new Set(urls).size === urls.length, "The sitemap contains duplicate URLs.");
urls.forEach(function (value) {
  const url = new URL(value);
  check(url.origin === BASE_URL.origin, "Foreign origin in sitemap: " + value);
  check(!/(?:chapter-|chapter=)(?:08|09|10|11|12|13)(?:\D|$)/.test(value), "Locked chapter leaked into sitemap: " + value);
});

const routeResults = await runPool(urls, async function (value) {
  try {
    const result = await timedFetch(value);
    const contentType = String(result.response.headers.get("content-type") || "");
    const body = contentType.includes("text/html") ? await result.response.text() : "";
    return {
      value,
      status: result.response.status,
      finalUrl: result.response.url,
      headers: result.response.headers,
      elapsedMs: result.elapsedMs,
      body
    };
  } catch (error) {
    return { value, status: 0, elapsedMs: 0, body: "", error: String(error) };
  }
});

const assetUrls = new Set();
routeResults.forEach(function (result) {
  check(result.status === 200, "Published route failed: " + result.value + " (" + result.status + ")");
  if (!result.body) return;
  check(/<html[^>]+lang=["']en["']/i.test(result.body), "Missing English language declaration: " + result.value);
  check(/<title>[^<]+<\/title>/i.test(result.body), "Missing document title: " + result.value);
  check(!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(result.body), "Indexed route declares noindex: " + result.value);
  for (const match of result.body.matchAll(/<(?:script|img|link)\b[^>]+(?:src|href)=["']([^"'#]+)["']/gi)) {
    try {
      const assetUrl = new URL(match[1], result.finalUrl || result.value);
      if (assetUrl.origin !== BASE_URL.origin) continue;
      if (!/\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|ico)(?:\?|$)/i.test(assetUrl.href)) continue;
      assetUrl.search = "";
      assetUrls.add(assetUrl.href);
    } catch {
      errors.push("Invalid local asset reference on " + result.value + ": " + match[1]);
    }
  }
});

const assetResults = await runPool([...assetUrls], async function (value) {
  try {
    const result = await timedFetch(value, { method: "HEAD" });
    return { value, status: result.response.status };
  } catch (error) {
    return { value, status: 0, error: String(error) };
  }
});
assetResults.forEach(function (result) {
  check(result.status === 200, "Local asset failed: " + result.value + " (" + result.status + ")");
});

for (const chapterId of ["08", "09", "10", "11", "12", "13"]) {
  const target = new URL("/slides/chapter-" + chapterId + "/c17-probe.html", BASE_URL);
  const result = await timedFetch(target, { redirect: "manual" });
  check([307, 308].includes(result.response.status), "Locked Chapter " + chapterId + " did not redirect.");
  check(
    result.response.headers.get("location") === "/index.html?view=chapters&chapter=" + chapterId,
    "Locked Chapter " + chapterId + " redirected to an unexpected location."
  );
}

const searchResult = await timedFetch(new URL("/data/qm-published-search-index.json", BASE_URL));
check(searchResult.response.status === 200, "Published search index is unavailable.");
const searchIndex = await searchResult.response.json();
check(Array.isArray(searchIndex.sections) && searchIndex.sections.length === 85, "Published search index must contain 85 reviewed sections.");
for (const section of searchIndex.sections || []) {
  check(!["08", "09", "10", "11", "12", "13"].includes(String(section.chapterId)), "Locked chapter leaked into search index.");
}

const registryResult = await timedFetch(new URL("/data/qm-content-registry.json", BASE_URL));
check(registryResult.response.status === 200, "Content registry is unavailable.");
const registry = await registryResult.response.json();
for (const chapterId of ["01", "02", "03", "04", "05", "06", "07"]) {
  const chapter = registry.chapters?.[chapterId];
  check(chapter?.availability === "published" && chapter?.seoEligible === true && chapter?.exerciseEligible === true, "Reviewed Chapter " + chapterId + " is not fully published.");
}
for (const chapterId of ["08", "09", "10", "11", "12", "13"]) {
  const chapter = registry.chapters?.[chapterId];
  check(chapter?.availability === "under_editorial_review" && chapter?.seoEligible === false && chapter?.exerciseEligible === false, "Locked Chapter " + chapterId + " has an invalid registry state.");
}

const apiChecks = [
  { path: "/api/qm-app-rating", options: {}, status: 403 },
  { path: "/api/qm-legal-preferences", options: {}, status: 401 },
  { path: "/api/qm-email-test", options: { method: "POST" }, status: 401 },
  { path: "/api/qm-email-campaign", options: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "audience" }) }, status: 403 },
  { path: "/api/qm-gamification-event", options: { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, status: 401 },
  { path: "/api/exercicio-validacao-admin", options: {}, status: 401 },
  { path: "/api/qm-analytics-event", options: {}, status: 405 },
  { path: "/api/qm-chapter-quiz?chapterId=01", options: {}, status: 200 },
  { path: "/api/qm-chapter-quiz?chapterId=08", options: {}, status: 404 }
];

for (const apiCheck of apiChecks) {
  const result = await timedFetch(new URL(apiCheck.path, BASE_URL), apiCheck.options);
  check(result.response.status === apiCheck.status, apiCheck.path + " returned " + result.response.status + "; expected " + apiCheck.status + ".");
  const contentType = String(result.response.headers.get("content-type") || "");
  check(contentType.includes("application/json"), apiCheck.path + " did not return JSON.");
  const payload = await result.response.json().catch(function () { return null; });
  if (apiCheck.path.includes("chapterId=01") && result.response.ok) {
    check(!JSON.stringify(payload).includes('"correct"'), "Public assessment response exposed an answer key.");
  }
}

const publicConfigResult = await timedFetch(new URL("/api/public-config", BASE_URL));
check(publicConfigResult.response.status === 200, "Public configuration is unavailable.");
const publicConfig = await publicConfigResult.response.json();
check(publicConfig.authEnabled === true, "Production authentication is not enabled.");
check(publicConfig.analytics?.measurementId === "G-X5Y1C68QMN", "Unexpected GA4 Measurement ID.");
check(!JSON.stringify(publicConfig).toLowerCase().includes("service_role"), "Public configuration leaked a service-role field.");
check(!JSON.stringify(publicConfig).includes("SUPABASE_SECRET_KEY"), "Public configuration leaked a secret-key field.");

const rootResult = routeResults.find(function (result) {
  return new URL(result.value).pathname === "/" && !new URL(result.value).search;
});
if (rootResult && REQUIRE_SECURITY_HEADERS) {
  const expectedHeaders = {
    "strict-transport-security": /max-age=/i,
    "x-content-type-options": /^nosniff$/i,
    "x-frame-options": /^SAMEORIGIN$/i,
    "referrer-policy": /^strict-origin-when-cross-origin$/i,
    "permissions-policy": /camera=\(\)/
  };
  Object.entries(expectedHeaders).forEach(function ([name, pattern]) {
    const value = String(rootResult.headers.get(name) || "");
    check(pattern.test(value), "Missing or invalid security header " + name + ".");
  });
}

const timings = routeResults.map(function (result) { return result.elapsedMs; }).filter(Number.isFinite).sort(function (a, b) { return a - b; });
const p95 = timings.length ? timings[Math.min(timings.length - 1, Math.floor(timings.length * 0.95))] : 0;
if (p95 > 4000) warnings.push("Route p95 exceeded 4000 ms during this audit: " + p95 + " ms.");

const summary = {
  ok: errors.length === 0,
  baseUrl: BASE_URL.origin,
  sitemapUrls: urls.length,
  reviewedSearchSections: Array.isArray(searchIndex.sections) ? searchIndex.sections.length : 0,
  localAssetsChecked: assetResults.length,
  apiBoundariesChecked: apiChecks.length,
  routeTimingMs: {
    min: timings[0] || 0,
    p95,
    max: timings[timings.length - 1] || 0
  },
  warnings,
  errors
};

console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
