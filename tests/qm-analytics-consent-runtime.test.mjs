import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../assets/qm-analytics.js", import.meta.url), "utf8");
const KEY = "qm_campaign_attribution_v1";
const decisionKey = "qm_analytics_consent_v1";
const adsKey = "qm_ads_measurement_consent_v1";
const completionPrefix = "qm_analytics_completed_v1:";
const storage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key),
    get length() { return values.size; }, key: index => [...values.keys()][index] || null };
};

async function boot({ decision, ads, url = "https://quantummechanicsbook.app/", session, local, eventFetch, clock = Date, locks } = {}) {
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
  const context = vm.createContext({ window, document, navigator: { language: "en", locks }, URL, URLSearchParams, Intl, Date: clock,
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

function progress(app, status = "completed", item = { chapterId: "01", itemId: "1.2", pagePath: "slides/chapter-01/fixture.html" }) {
  app.listeners["qm-study-progress-change"]({ detail: { record: { status }, item } });
}
const completions = app => app.calls().filter(c => c[0] === "event" && c[1] === "section_complete");

test("completion is counted once across unmark/remark, reload and tabs, independently per section", async () => {
  const app = await boot({ decision: "granted" });
  progress(app); progress(app, "in_progress"); progress(app);
  assert.equal(completions(app).length, 1);
  const reloaded = await boot({ local: app.localStorage });
  progress(reloaded, "completed", { chapterId: "1", itemId: "1.2" });
  assert.equal(completions(reloaded).length, 0);
  progress(reloaded, "completed", { chapterId: "01", itemId: "1.3" });
  assert.equal(completions(reloaded).length, 1);
  await app.window.QMAnalytics.flush();
  const payload = JSON.parse(app.requests.find(r => r.endpoint.includes("analytics-event")).options.body);
  assert.equal(payload.events.filter(e => e.eventName === "section_complete").length, 1);
  assert.equal(payload.events.find(e => e.eventName === "section_complete").properties.item_id, "1.2");
});

test("no completion marker is stored without consent or successful, identified progress", async () => {
  for (const decision of [undefined, "denied", "granted"]) {
    const app = await boot({ decision });
    progress(app, "in_progress"); progress(app, "completed", {});
    if (decision !== "granted") progress(app);
    assert.equal(completions(app).length, 0);
    assert.equal(app.localStorage.getItem(completionPrefix + "01:1.2"), null);
  }
});

test("revoking analytics clears completion markers, but revoking ads preserves them and study/auth data", async () => {
  const app = await boot({ decision: "granted", ads: true });
  app.localStorage.setItem("study_progress", "preserved");
  app.localStorage.setItem("auth_session", "preserved");
  progress(app);
  app.window.QMAnalytics.setConsent("granted", false);
  progress(app);
  assert.equal(completions(app).length, 1);
  assert.equal(app.localStorage.getItem(completionPrefix + "01:1.2"), "1");
  app.window.QMAnalytics.setConsent("denied");
  assert.equal(app.localStorage.getItem(completionPrefix + "01:1.2"), null);
  assert.equal(app.localStorage.getItem("study_progress"), "preserved");
  assert.equal(app.localStorage.getItem("auth_session"), "preserved");
  app.window.QMAnalytics.setConsent("granted");
  progress(app);
  assert.equal(completions(app).length, 2);
});

test("cross-tab revocation clears both persisted and in-memory completion markers", async () => {
  const app = await boot({ decision: "granted" });
  progress(app);
  app.localStorage.setItem(decisionKey, JSON.stringify({ version: "qm-analytics-consent-v1", decision: "denied" }));
  app.listeners.storage({ key: decisionKey });
  assert.equal(app.localStorage.getItem(completionPrefix + "01:1.2"), null);
  app.window.QMAnalytics.setConsent("granted");
  progress(app);
  assert.equal(completions(app).length, 2);
});

test("a completion waiting for another tab cannot survive consent withdrawal and regrant", async () => {
  let waiting;
  const app = await boot({ decision: "granted", locks: { request(_key, action) { waiting = action; return Promise.resolve(); } } });
  progress(app);
  app.window.QMAnalytics.setConsent("denied");
  app.window.QMAnalytics.setConsent("granted");
  waiting();
  assert.equal(completions(app).length, 0);
  assert.equal(app.localStorage.getItem(completionPrefix + "01:1.2"), null);
  progress(app);
  waiting();
  assert.equal(completions(app).length, 1);
});

test("blocked browser storage still deduplicates within the current document", async () => {
  const local = storage();
  local.setItem = () => { throw new Error("storage blocked"); };
  const app = await boot({ local });
  app.window.QMAnalytics.setConsent("granted");
  progress(app); progress(app);
  assert.equal(completions(app).length, 1);
});

test("attribution slides on consented page views and expires after 30 minutes without a view", async () => {
  let now = Date.parse("2026-10-19T15:00:00Z");
  class Clock extends Date { static now() { return now; } }
  const app = await boot({ decision: "granted", clock: Clock, url: "https://quantummechanicsbook.app/?utm_source=codex_qa&utm_medium=qa&utm_campaign=quantum_c18_validation" });
  const expiry = target => JSON.parse(target.sessionStorage.getItem(KEY)).expires;
  const initialExpiry = expiry(app);
  now += 20 * 60 * 1000;
  app.window.QMAnalytics.track("auth_open", { surface: "header" });
  assert.equal(expiry(app), initialExpiry, "an event must not extend a page-view TTL");
  const next = await boot({ local: app.localStorage, session: app.sessionStorage, clock: Clock });
  assert.equal(expiry(next), now + 30 * 60 * 1000);
  now += 20 * 60 * 1000; // 40 minutes since the original landing, only 20 since navigation
  const returned = await boot({ local: app.localStorage, session: app.sessionStorage, clock: Clock, url: "https://quantummechanicsbook.app/?view=chapters&code=private" });
  assert.equal(returned.config().campaign_source, "codex_qa");
  now += 30 * 60 * 1000;
  const expired = await boot({ local: app.localStorage, session: app.sessionStorage, clock: Clock });
  assert.equal(expired.config().campaign_source, undefined);
  assert.equal(expired.sessionStorage.getItem(KEY), null);
});

test("only the three approved campaign tuples renew; malformed storage and unknown campaigns fail closed", async () => {
  for (const [name, source, medium] of [["quantum_international_en_search_pilot", "google", "cpc"], ["quantum_uk_ie_en_search_pilot", "google", "cpc"], ["quantum_c18_validation", "codex_qa", "qa"]]) {
    const app = await boot({ decision: "granted", url: `https://quantummechanicsbook.app/?utm_source=${source}&utm_medium=${medium}&utm_campaign=${name}` });
    assert.equal(app.config().campaign_name, name);
    const unknown = await boot({ local: app.localStorage, session: app.sessionStorage, url: "https://quantummechanicsbook.app/?utm_source=unknown" });
    assert.equal(unknown.sessionStorage.getItem(KEY), null);
  }
  for (const value of ["null", "broken", JSON.stringify({ name: "quantum_c18_validation", expires: String(Date.now() + 10000) }), JSON.stringify({ name: "quantum_c18_validation", expires: Date.now() + 3600000 })]) {
    const app = await boot({ decision: "granted", session: storage({ [KEY]: value }) });
    assert.equal(app.config().campaign_name, undefined);
    assert.equal(app.sessionStorage.getItem(KEY), null);
  }
});

test("internal app navigation and Back renew attribution without adding Google events or bypassing consent", async () => {
  let now = Date.parse("2026-10-19T15:00:00Z");
  class Clock extends Date { static now() { return now; } }
  const app = await boot({ decision: "granted", clock: Clock, url: "https://quantummechanicsbook.app/?utm_source=codex_qa&utm_medium=qa&utm_campaign=quantum_c18_validation" });
  const originalCalls = app.calls().length;
  now += 20 * 60 * 1000;
  app.window.location = new URL("https://quantummechanicsbook.app/?view=journey");
  app.listeners["qm-navigation-change"]();
  const expiry = JSON.parse(app.sessionStorage.getItem(KEY)).expires;
  assert.equal(expiry, now + 30 * 60 * 1000);
  now += 5 * 60 * 1000;
  app.listeners["qm-navigation-change"]();
  assert.equal(JSON.parse(app.sessionStorage.getItem(KEY)).expires, expiry, "same route is not a new page view");
  app.window.location = new URL("https://quantummechanicsbook.app/?view=chapters");
  app.listeners.popstate();
  assert.equal(JSON.parse(app.sessionStorage.getItem(KEY)).expires, now + 30 * 60 * 1000);
  assert.equal(app.calls().length, originalCalls, "navigation must not add Google events/config calls");
  app.window.QMAnalytics.setConsent("denied");
  app.window.location = new URL("https://quantummechanicsbook.app/?view=journey&utm_source=codex_qa&utm_medium=qa&utm_campaign=quantum_c18_validation");
  app.listeners["qm-navigation-change"]();
  assert.equal(app.sessionStorage.getItem(KEY), null);
});

test("revocation clears sliding attribution and regrant without campaign does not restore it", async () => {
  const app = await boot({ decision: "granted", url: "https://quantummechanicsbook.app/?utm_source=google&utm_medium=cpc&utm_campaign=quantum_international_en_search_pilot" });
  app.window.location = new URL("https://quantummechanicsbook.app/?view=chapters");
  app.window.QMAnalytics.setConsent("denied");
  assert.equal(app.sessionStorage.getItem(KEY), null);
  app.window.QMAnalytics.setConsent("granted");
  assert.equal(app.config().campaign_source, undefined);
});
