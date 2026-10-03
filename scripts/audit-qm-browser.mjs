import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const BASE_URL = new URL(process.env.QM_AUDIT_BASE_URL || "https://quantummechanicsbook.app");
const CHROME_PATH = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const EVIDENCE_DIR = process.env.QM_AUDIT_EVIDENCE_DIR || path.join(os.tmpdir(), "qm-c17-browser");
const errors = [];
const warnings = [];
const evidence = [];

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

async function freePort() {
  return new Promise(function (resolve, reject) {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", function () {
      const address = server.address();
      server.close(function () { resolve(address.port); });
    });
  });
}

async function waitForJson(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome has not opened its debugging endpoint yet.
    }
    await sleep(150);
  }
  throw new Error("Chrome DevTools endpoint did not become ready.");
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result || {});
        return;
      }
      const callbacks = this.listeners.get(message.method) || [];
      callbacks.forEach(function (callback) { callback(message.params || {}); });
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, callback) {
    const callbacks = this.listeners.get(method) || [];
    callbacks.push(callback);
    this.listeners.set(method, callbacks);
  }

  once(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const callbacks = this.listeners.get(method) || [];
      const timeout = setTimeout(function () {
        const index = callbacks.indexOf(handler);
        if (index >= 0) callbacks.splice(index, 1);
        reject(new Error("Timed out waiting for " + method));
      }, timeoutMs);
      const handler = function (params) {
        clearTimeout(timeout);
        const index = callbacks.indexOf(handler);
        if (index >= 0) callbacks.splice(index, 1);
        resolve(params);
      };
      callbacks.push(handler);
      this.listeners.set(method, callbacks);
    });
  }

  close() {
    this.socket.close();
  }
}

const scenarios = [
  {
    name: "home-desktop",
    path: "/home.html",
    width: 1440,
    height: 900,
    expected: ["Study quantum mechanics through a guided book.", "Start with Chapter 1"],
    capture: true
  },
  {
    name: "chapters-mobile-menu",
    path: "/index.html?view=chapters&chapter=07",
    width: 390,
    height: 844,
    expected: ["Chapter 7", "Addition of angular momenta"],
    interaction: "document.getElementById('menuToggleButton')?.click()",
    requireDrawer: true,
    capture: true
  },
  {
    name: "search-desktop",
    path: "/search.html?q=angular%20momentum",
    width: 1440,
    height: 900,
    expected: ["Search the book", "Angular momentum"]
  },
  {
    name: "section-math-desktop",
    path: "/slides/chapter-07/hilbert-space-expansion.html",
    width: 1440,
    height: 900,
    expected: ["Hilbert space expansion", "Guided reading"],
    requireMath: true,
    capture: true
  },
  {
    name: "simulator-mobile",
    path: "/simulators/angular-momentum-coupled-states.html",
    width: 390,
    height: 844,
    expected: ["Coupled Bases", "Clebsch-Gordan"],
    requireMath: true,
    requireTable: true,
    capture: true
  },
  {
    name: "assessment-mobile",
    path: "/assessments.html",
    width: 390,
    height: 844,
    expected: ["Chapter assessments", "Start assessment"]
  },
  {
    name: "daily-challenge-mobile",
    path: "/daily-challenge.html",
    width: 390,
    height: 844,
    expected: ["Daily Challenge", "Prepare my challenge", "no missed-day penalty"],
    capture: true
  },
  {
    name: "learning-help-mobile-zoom",
    path: "/help.html",
    width: 320,
    height: 720,
    expected: ["How learning works", "Why this activity?", "Points, badges and streaks", "Research and limitations"],
    interaction: "document.documentElement.style.fontSize='200%'",
    reducedMotion: true,
    capture: true
  },
  {
    name: "index-minimum-width",
    path: "/index.html?view=chapters",
    width: 320,
    height: 720,
    expected: ["Interactive Quantum Mechanics", "Book preview", "Sign in", "Send"],
    reducedMotion: true,
    capture: true
  },
  {
    name: "assessment-minimum-width-zoom",
    path: "/assessments.html",
    width: 320,
    height: 720,
    expected: ["Chapter assessments", "Reviewed chapter", "Start assessment"],
    interaction: "document.documentElement.style.fontSize='200%'",
    reducedMotion: true,
    capture: true
  },
  {
    name: "journey-signed-out",
    path: "/index.html?view=journey",
    width: 1440,
    height: 900,
    expected: ["Study journey", "Sign in with Google"]
  },
  {
    name: "locked-chapter-mobile",
    path: "/index.html?view=chapters&chapter=08",
    width: 390,
    height: 844,
    expected: ["Time-independent perturbation theory", "Under editorial review"]
  }
];

const auditExpression = `(() => {
  const visible = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && !element.hidden && rect.width > 0 && rect.height > 0;
  };
  const text = document.body?.innerText || "";
  const interactive = Array.from(document.querySelectorAll("a[href],button,input,select,textarea")).filter(visible);
  const missingNames = interactive.filter((element) => {
    const name = (element.getAttribute("aria-label") || element.getAttribute("title") || element.innerText || element.value || "").trim();
    return !name;
  }).map((element) => element.tagName.toLowerCase() + (element.id ? "#" + element.id : "")).slice(0, 12);
  const missingAlt = Array.from(document.images).filter((image) => visible(image) && !image.hasAttribute("alt")).map((image) => image.src).slice(0, 12);
  const duplicateIds = Array.from(document.querySelectorAll("[id]")).map((element) => element.id).filter((id, index, all) => all.indexOf(id) !== index);
  return {
    title: document.title,
    lang: document.documentElement.lang,
    readyState: document.readyState,
    bodyText: text.slice(0, 40000),
    h1Count: Array.from(document.querySelectorAll("h1")).filter(visible).length,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    missingNames,
    missingAlt,
    duplicateIds: [...new Set(duplicateIds)].slice(0, 12),
    interactiveCount: interactive.length,
    mathCount: document.querySelectorAll("mjx-container").length,
    canvasCount: document.querySelectorAll("canvas").length,
    tableCount: document.querySelectorAll("table").length,
    drawerOpen: document.getElementById("menuDrawerOverlay")?.classList.contains("is-open") || false,
    errorOverlay: Boolean(document.querySelector(".error-overlay,[data-error-overlay]"))
  };
})()`;

const keyboardFocusExpression = `(() => {
  const element = document.activeElement;
  if (!element || element === document.body || element === document.documentElement) {
    return { tag: "none", visible: false };
  }
  const style = getComputedStyle(element);
  const hasOutline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth || "0") > 0;
  const hasShadow = Boolean(style.boxShadow && style.boxShadow !== "none");
  return {
    tag: element.tagName.toLowerCase() + (element.id ? "#" + element.id : ""),
    visible: hasOutline || hasShadow
  };
})()`;

await mkdir(EVIDENCE_DIR, { recursive: true });
const profileDir = await mkdtemp(path.join(os.tmpdir(), "qm-c17-chrome-"));
const port = await freePort();
const chrome = spawn(CHROME_PATH, [
  "--headless=new",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-sync",
  "--metrics-recording-only",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-address=127.0.0.1",
  "--remote-debugging-port=" + port,
  "--user-data-dir=" + profileDir,
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });
let chromeStderr = "";
chrome.stderr.on("data", function (chunk) { chromeStderr += String(chunk); });

let client;
try {
  await waitForJson("http://127.0.0.1:" + port + "/json/version");
  const target = await fetch("http://127.0.0.1:" + port + "/json/new?about:blank", { method: "PUT" }).then(function (response) { return response.json(); });
  client = new CdpClient(target.webSocketDebuggerUrl);
  await client.ready;
  await Promise.all([
    client.send("Page.enable"),
    client.send("Runtime.enable"),
    client.send("Network.enable"),
    client.send("Log.enable")
  ]);

  let scenarioConsoleErrors = [];
  let scenarioNetworkErrors = [];
  const requestUrls = new Map();
  client.on("Runtime.exceptionThrown", function (event) {
    scenarioConsoleErrors.push(event.exceptionDetails?.text || "Uncaught exception");
  });
  client.on("Log.entryAdded", function (event) {
    if (["error", "warning"].includes(event.entry?.level)) {
      scenarioConsoleErrors.push(event.entry.text || event.entry.level);
    }
  });
  client.on("Network.requestWillBeSent", function (event) {
    requestUrls.set(event.requestId, event.request?.url || "");
  });
  client.on("Network.responseReceived", function (event) {
    const url = event.response?.url || requestUrls.get(event.requestId) || "";
    if (url.startsWith(BASE_URL.origin) && Number(event.response?.status || 0) >= 400) {
      scenarioNetworkErrors.push(event.response.status + " " + url);
    }
  });
  client.on("Network.loadingFailed", function (event) {
    const url = requestUrls.get(event.requestId) || "";
    if (url.startsWith(BASE_URL.origin) && !event.canceled) {
      scenarioNetworkErrors.push((event.errorText || "loading failed") + " " + url);
    }
  });

  for (const scenario of scenarios) {
    scenarioConsoleErrors = [];
    scenarioNetworkErrors = [];
    requestUrls.clear();
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: scenario.width,
      height: scenario.height,
      deviceScaleFactor: 1,
      mobile: scenario.width < 600
    });
    await client.send("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [{ name: "prefers-reduced-motion", value: scenario.reducedMotion ? "reduce" : "no-preference" }]
    });
    const load = client.once("Page.loadEventFired", 20000).catch(function () { return null; });
    await client.send("Page.navigate", { url: new URL(scenario.path, BASE_URL).toString() });
    await load;
    await sleep(2500);
    // This is an isolated, disposable Chrome profile. Decline optional analytics
    // so screenshots and accessibility checks inspect the actual page content.
    // Never reuse an owner's profile or choose consent on their behalf.
    await client.send("Runtime.evaluate", {
      expression: "document.querySelector('[data-qm-analytics-consent=\"denied\"]')?.click()",
      returnByValue: true
    });
    await sleep(100);
    if (scenario.interaction) {
      await client.send("Runtime.evaluate", { expression: scenario.interaction, awaitPromise: true });
      await sleep(500);
    }
    const evaluated = await client.send("Runtime.evaluate", {
      expression: auditExpression,
      returnByValue: true,
      awaitPromise: true
    });
    const result = evaluated.result?.value || {};
    let keyboardFocus = { tag: "none", visible: false };
    if (result.interactiveCount) {
      await client.send("Runtime.evaluate", {
        expression: "document.body.tabIndex=-1; document.body.focus();",
        returnByValue: true
      });
      await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      await sleep(100);
      const focused = await client.send("Runtime.evaluate", {
        expression: keyboardFocusExpression,
        returnByValue: true
      });
      keyboardFocus = focused.result?.value || keyboardFocus;
    }
    const bodyText = String(result.bodyText || "");
    scenario.expected.forEach(function (expected) {
      if (!bodyText.toLowerCase().includes(expected.toLowerCase())) {
        errors.push(scenario.name + " is missing expected text: " + expected);
      }
    });
    if (result.lang !== "en") errors.push(scenario.name + " does not declare English.");
    if (result.readyState !== "complete") errors.push(scenario.name + " did not finish loading.");
    if (result.h1Count !== 1) errors.push(scenario.name + " has " + result.h1Count + " visible h1 elements.");
    if (result.horizontalOverflow) errors.push(scenario.name + " overflows horizontally (" + result.documentWidth + " > " + result.viewportWidth + ").");
    if (result.missingNames?.length) errors.push(scenario.name + " has unnamed controls: " + result.missingNames.join(", "));
    if (result.missingAlt?.length) errors.push(scenario.name + " has visible images without alt text.");
    if (result.duplicateIds?.length) errors.push(scenario.name + " has duplicate IDs: " + result.duplicateIds.join(", "));
    if (result.errorOverlay) errors.push(scenario.name + " displayed an error overlay.");
    if (scenario.requireMath && !result.mathCount) errors.push(scenario.name + " did not render MathJax.");
    if (scenario.requireCanvas && !result.canvasCount) errors.push(scenario.name + " did not render its canvas.");
    if (scenario.requireTable && !result.tableCount) errors.push(scenario.name + " did not render its result table.");
    if (scenario.requireDrawer && !result.drawerOpen) errors.push(scenario.name + " did not open the navigation drawer.");
    if (scenarioConsoleErrors.length) errors.push(scenario.name + " console errors: " + [...new Set(scenarioConsoleErrors)].join(" | "));
    if (scenarioNetworkErrors.length) errors.push(scenario.name + " network errors: " + [...new Set(scenarioNetworkErrors)].join(" | "));
    if (result.interactiveCount && !keyboardFocus.visible) errors.push(scenario.name + " has no visible keyboard focus indicator on " + keyboardFocus.tag + ".");
    if (scenario.capture) {
      const screenshot = await client.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      await writeFile(path.join(EVIDENCE_DIR, scenario.name + ".png"), Buffer.from(screenshot.data, "base64"));
    }
    evidence.push({
      name: scenario.name,
      viewport: scenario.width + "x" + scenario.height,
      title: result.title,
      mathCount: result.mathCount,
      canvasCount: result.canvasCount,
      tableCount: result.tableCount,
      drawerOpen: result.drawerOpen,
      keyboardFocus
    });
  }
} finally {
  if (client) client.close();
  chrome.kill("SIGTERM");
  await sleep(300);
  if (!chrome.killed) chrome.kill("SIGKILL");
  await rm(profileDir, { recursive: true, force: true });
}

if (/Address already in use|DevToolsActivePort file doesn't exist/i.test(chromeStderr)) {
  errors.push("Chrome reported a DevTools startup failure.");
}

console.log(JSON.stringify({
  ok: errors.length === 0,
  baseUrl: BASE_URL.origin,
  evidenceDir: EVIDENCE_DIR,
  scenarios: evidence,
  warnings,
  errors
}, null, 2));
if (errors.length) process.exitCode = 1;
