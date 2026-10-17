import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";
import { buildIndexMeta } from "../assets/qm-index-seo.mjs";
import { renderIndexResponse } from "../lib/qm-index-response.mjs";
import { getContentRegistry } from "../lib/qm-content-registry.mjs";
import { normalizeAnalyticsPagePath } from "../lib/qm-analytics-handler.mjs";
import vm from "node:vm";
import { withChapterRedirects } from "../scripts/build-qm-content-registry.mjs";
const template = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));

test("catalogue regeneration preserves hosting security, APIs and the legacy redirect", () => {
  const rebuilt = withChapterRedirects(config, ["08", "09", "10", "11", "12", "13"]);
  for (const key of ["routes", "rewrites", "headers", "functions"]) assert.deepEqual(rebuilt[key], config[key]);
  assert.deepEqual(rebuilt.redirects.find(r => r.source === "/index.html"), config.redirects.find(r => r.source === "/index.html"));
  assert.equal(rebuilt.redirects.length, 7);
  assert.deepEqual(withChapterRedirects(rebuilt, ["08", "09", "10", "11", "12", "13"]), rebuilt);
});

test("analytics treats legacy and canonical URLs as one page and removes auth data", () => {
  const source = readFileSync(new URL("../assets/qm-analytics.js", import.meta.url), "utf8");
  const safePath = source.slice(source.indexOf("  function safePath()"), source.indexOf("  function pageSlug()"));
  const expected = "/?view=chapters&chapter=01";
  for (const path of ["/", "/index.html"]) {
    const href = "https://quantummechanicsbook.app" + path + "?chapter=01&view=chapters&code=opaque#access_token=opaque";
    assert.equal(normalizeAnalyticsPagePath(href), expected);
    assert.equal(vm.runInNewContext(safePath + "; safePath()", { URL, URLSearchParams, window: {location: {href}} }), expected);
  }
});

test("canonical map: public reviewed chapters, tracking aliases and private states", () => {
  assert.equal(buildIndexMeta().canonical, "https://quantummechanicsbook.app/");
  for (const chapter of ["01", "02", "03", "04", "05", "06", "07"]) {
    const meta = buildIndexMeta("?view=chapters&chapter=" + chapter + "&utm_source=test&code=redacted");
    assert.equal(meta.canonical, "https://quantummechanicsbook.app/?view=chapters&chapter=" + chapter);
    assert.match(meta.robots, /^index,/);
  }
  assert.equal(buildIndexMeta("?view=simulators").canonical, "https://quantummechanicsbook.app/?view=simulators");
  for (const view of ["saved", "favorites", "journey", "ratings", "validation-review"]) {
    assert.match(buildIndexMeta("?view=" + view).robots, /^noindex,/);
  }
  for (const [id, chapter] of Object.entries(getContentRegistry().chapters)) {
    if (chapter.availability !== "published") assert.match(buildIndexMeta("?view=chapters&chapter=" + id).robots, /^noindex,/);
  }
});

test("initial HTML and client navigation use the same canonical, robots and structured data", () => {
  for (const search of ["", "?view=chapters&chapter=01", "?view=simulators", "?view=journey", "?view=chapters&chapter=08"]) {
    const expected = buildIndexMeta(search);
    const result = renderIndexResponse(template, search);
    assert.equal(result.canonical, expected.canonical);
    assert.equal(result.robots, expected.robots);
    assert.ok(result.html.includes('href="' + expected.canonical.replaceAll("&", "&amp;") + '"'));
    assert.ok(result.html.includes('name="robots" content="' + expected.robots + '"'));
    assert.equal((result.html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((result.html.match(/type="application\/ld\+json"/g) || []).length, 1);
    assert.ok(result.html.includes(JSON.stringify(expected.jsonLd)));
  }
  const runtime = readFileSync(new URL("../assets/termo-seo.js", import.meta.url), "utf8");
  assert.match(runtime, /import\(new URL\("qm-index-seo.mjs"/);
});

test("unknown URL values cannot inject HTML or leak auth parameters into metadata", () => {
  const result = renderIndexResponse(template, "?chapter=%3Cscript%3E&code=secret-fixture&access_token=secret-fixture");
  assert.ok(!result.html.includes("secret-fixture"));
  assert.equal(result.canonical, "https://quantummechanicsbook.app/");
});

test("hosting redirect and initial-response rewrite retain legacy bookmarks", () => {
  assert.deepEqual(config.redirects.find(r => r.source === "/index.html"), {source: "/index.html", destination: "/", permanent: true});
  assert.ok(config.routes.some(r => r.src === "/" && r.dest === "/api/app"));
  assert.ok(config.redirects.filter(r => r.source.startsWith("/slides/")).every(r => r.destination.startsWith("/?view=chapters")));
});

test("local HTTP preserves callback query, returns initial metadata and denies private source files", async () => {
  const reservation = net.createServer();
  await new Promise(resolve => reservation.listen(0, "127.0.0.1", resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const server = spawn(process.execPath, ["dev-server.mjs"], {
    cwd: new URL("..", import.meta.url), env: {...process.env, PORT: String(port)}, stdio: "ignore"
  });
  const base = "http://127.0.0.1:" + port;
  try {
    for (let i = 0; i < 80; i++) {
      try { const r = await fetch(base); await r.body.cancel(); if (r.ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    const query = "?view=favorites&chapter=01&code=opaque%2Bfixture&next=%2Fhelp.html";
    const redirect = await fetch(base + "/index.html" + query, {redirect: "manual"});
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get("location"), "/" + query);
    const page = await fetch(base + "/?view=chapters&chapter=07");
    assert.equal(page.status, 200);
    assert.match(await page.text(), /href="https:\/\/quantummechanicsbook.app\/\?view=chapters&amp;chapter=07"/);
    const privatePage = await fetch(base + "/?view=journey");
    assert.match(privatePage.headers.get("x-robots-tag"), /^noindex/);
    await privatePage.body.cancel();
    for (const path of ["/.env.local", "/lib/qm-server-shared.mjs", "/.git/config"]) {
      const denied = await fetch(base + path);
      assert.equal(denied.status, 404);
      await denied.body.cancel();
    }
  } finally {
    const exit = new Promise(resolve => server.once("exit", resolve));
    server.kill("SIGTERM");
    await exit;
  }
});
