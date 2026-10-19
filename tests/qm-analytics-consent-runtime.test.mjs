import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../assets/qm-analytics.js", import.meta.url), "utf8");
const KEY = "qm_campaign_attribution_v1";
const decisionKey = "qm_analytics_consent_v1";
const adsKey = "qm_ads_measurement_consent_v1";
const storage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};

async function boot({ decision, ads, url = "https://quantummechanicsbook.app/", session, local, eventFetch } = {}) {
  const nodes = [];
  const listeners = {};
  const requests = [];
  const deletions = [];
  const localStorage = local || storage(decision ? {
    [decisionKey]: JSON.stringify({ version: "qm-analytics-consent-v1", decision }),
    ...(ads ? { [adsKey]: "granted" } : {})
  } : {});
  const sessionStorage = session || storage();
  const node = () => ({ dataset: {}, classList: { add() {} }, setAttribute() {}, querySelector() { return null; }, remove() {}, focus() {} });
  const document = {
    scripts: [], title: "QUANTUM", referrer: "https://example.org/private/person?email=private@example.org#token",
    readyState: "complete", visibilityState: "visible", body: { appendChild: n => nodes.push(n) },
    head: { appendChild: n => nodes.push(n) }, createElement: node, querySelector: () => null,
    querySelectorAll: () => [], addEventListener: (name, fn) => { listeners["document:" + name] = fn; }
  };
  Object.defineProperty(document, "cookie", { get: () => "_ga=private; _ga_X5Y1C68QMN=private; _gcl_aw=private; auth_session=private", set: value => deletions.push(value) });
  const window = {
    location: new URL(url), localStorage, sessionStorage, innerWidth: 400,
    setTimeout: () => 1, clearTimeout() {}, setInterval() {}, requestAnimationFrame: fn => fn(),
    addEventListener: (name, fn) => { listeners[name] = fn; }, dispatchEvent() {}
  };
  const context = vm.createContext({ window, document, navigator: { language: "en" }, URL, URLSearchParams, Intl, Date,
    Element: class {}, CustomEvent: class { constructor(name, options) { this.type = name; this.detail = options.detail; } },
    fetch: async (endpoint, options) => {
      requests.push({ endpoint, options });
      if (endpoint.includes("analytics-event") && eventFetch) return eventFetch();
      return { ok: true, json: async () => ({ analytics: { enabled: true, measurementId: "G-X5Y1C68QMN", productionHost: "quantummechanicsbook.app" } }) };
    }
  });
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  const calls = () => (window.dataLayer || []).map(args => Array.from(args));
  const config = () => calls().filter(call => call[0] === "config").at(-1)?.[2];
  return { window, document, localStorage, sessionStorage, listeners, nodes, requests, deletions, calls, config };
}

test("unknown and denied choices load no Google tag, send no events and store no attribution", async () => {
  for (const decision of [undefined, "denied"]) {
    const app = await boot({ decision, url: "https://quantummechanicsbook.app/?utm_source=codex_qa&utm_medium=qa&utm_campaign=quantum_c18_validation" });
    app.window.QMAnalytics.track("section_complete", { completed: true });
    await app.window.QMAnalytics.flush();
    assert.equal(app.calls().length, 0);
    assert.equal(app.nodes.some(n => n.src?.includes("googletagmanager")), false);
    assert.equal(app.requests.length, 1); // public configuration only
    assert.equal(app.sessionStorage.getItem(KEY), null);
  }
});

test("legacy analytics consent never opts into advertising; defaults precede configuration", async () => {
  const app = await boot({ decision: "granted" });
  assert.equal(app.window.QMAnalytics.getConsent().advertisingMeasurement, false);
  const defaults = app.calls().find(c => c[0] === "consent" && c[1] === "default")[2];
  assert.ok(Object.values(defaults).every(value => value === "denied"));
  const update = app.calls().find(c => c[0] === "consent" && c[1] === "update")[2];
  assert.equal(update.analytics_storage, "granted");
  assert.equal(update.ad_user_data, "denied");
  assert.equal(update.ad_storage, "denied");
  assert.equal(update.ad_personalization, "denied");
  assert.equal(app.config().allow_google_signals, false);
  assert.equal(app.config().allow_ad_personalization_signals, false);
});

test("known QA attribution survives navigation and OAuth return without forwarding secrets", async () => {
  const app = await boot({ decision: "granted", url: "https://quantummechanicsbook.app/?utm_source=codex_qa&utm_medium=qa&utm_campaign=quantum_c18_validation&email=private@example.org&code=secret#access_token=secret" });
  assert.equal(app.config().campaign_source, "codex_qa");
  assert.equal(app.config().campaign_medium, "qa");
  assert.equal(app.config().page_location, "https://quantummechanicsbook.app/");
  assert.equal(app.config().page_referrer, "https://example.org/");
  const returned = await boot({ decision: "granted", session: app.sessionStorage, url: "https://quantummechanicsbook.app/?view=chapters&code=secret" });
  assert.equal(returned.config().campaign_name, "quantum_c18_validation");
  returned.listeners["qm-study-progress-change"]({ detail: { record: { status: "completed" }, item: { chapterId: "1", itemId: "1.2" } } });
  const events = returned.calls().filter(c => c[0] === "event" && c[1] === "section_complete");
  assert.equal(events.length, 1);
  assert.equal(events[0][2].campaign_source, "codex_qa");
  assert.doesNotMatch(JSON.stringify(returned.calls()), /secret|private@example/);
  await returned.window.QMAnalytics.flush();
  const payload = returned.requests.find(r => r.endpoint.includes("analytics-event"))?.options.body;
  assert.doesNotMatch(payload, /campaign_|utm_|gclid|secret|private@example/);
});

test("unknown/mismatched campaign and expired tab attribution fail closed", async () => {
  for (const query of ["utm_source=private@example.org&utm_medium=qa&utm_campaign=quantum_c18_validation", "utm_campaign=private-person", "utm_campaign=toString"]) {
    const app = await boot({ decision: "granted", url: "https://quantummechanicsbook.app/?" + query });
    assert.equal(app.config().campaign_source, undefined);
    assert.equal(app.sessionStorage.getItem(KEY), null);
  }
  const app = await boot({ decision: "granted", session: storage({ [KEY]: JSON.stringify({ name: "quantum_c18_validation", expires: Date.now() - 1 }) }) });
  assert.equal(app.config().campaign_source, undefined);
  assert.equal(app.sessionStorage.getItem(KEY), null);
});

test("ads measurement requires explicit separate choice and never grants personalization", async () => {
  const app = await boot({ decision: "granted", url: "https://quantummechanicsbook.app/?gclid=synthetic_test_id_12345&code=secret" });
  assert.doesNotMatch(app.config().page_location, /gclid/);
  app.window.QMAnalytics.setConsent("granted", true);
  assert.equal(app.localStorage.getItem(adsKey), "granted");
  const state = app.calls().filter(c => c[0] === "consent" && c[1] === "update").at(-1)[2];
  assert.equal(state.ad_storage, "granted");
  assert.equal(state.ad_user_data, "granted");
  assert.equal(state.ad_personalization, "denied");
  assert.match(app.config().page_location, /gclid=synthetic_test_id_12345/);
  assert.doesNotMatch(app.config().page_location, /secret/);
  assert.equal(app.sessionStorage.getItem(KEY), null); // no custom storage for click IDs
});

test("withdrawal stops future collection and clears measurement only, including across tabs", async () => {
  const app = await boot({ decision: "granted", ads: true });
  app.window.QMAnalytics.setConsent("denied");
  assert.equal(app.window["ga-disable-G-X5Y1C68QMN"], true);
  assert.ok(app.deletions.some(c => c.startsWith("_ga=")));
  assert.ok(app.deletions.some(c => c.startsWith("_gcl_aw=")));
  assert.ok(app.deletions.every(c => !c.startsWith("auth_session=")));
  const before = app.calls().length;
  app.window.QMAnalytics.track("section_complete", { completed: true });
  await app.window.QMAnalytics.flush();
  assert.equal(app.calls().length, before);
  assert.equal(app.requests.length, 1);
  const other = await boot({ decision: "granted", ads: true });
  other.localStorage.setItem(decisionKey, JSON.stringify({ version: "qm-analytics-consent-v1", decision: "denied" }));
  other.listeners.storage({ key: decisionKey });
  assert.equal(other.window["ga-disable-G-X5Y1C68QMN"], true);
  assert.equal(other.window.QMAnalytics.getConsent().advertisingMeasurement, false);
});

test("failed/uncompleted progress does not emit a conversion", async () => {
  const app = await boot({ decision: "granted" });
  app.listeners["qm-study-progress-change"]({ detail: { record: { status: "started" } } });
  assert.equal(app.calls().filter(c => c[1] === "section_complete").length, 0);
});

test("a late failed request cannot resurrect events after withdrawal and regrant", async () => {
  let finish;
  const app = await boot({ decision: "granted", eventFetch: () => new Promise(resolve => { finish = resolve; }) });
  app.window.QMAnalytics.track("section_complete", { completed: true });
  const sending = app.window.QMAnalytics.flush();
  app.window.QMAnalytics.setConsent("denied");
  app.window.QMAnalytics.setConsent("granted");
  finish({ ok: false, status: 503 });
  await sending;
  await app.window.QMAnalytics.flush();
  assert.equal(app.requests.filter(r => r.endpoint.includes("analytics-event")).length, 1);
});
