(function () {
  if (window.QMAnalytics) return;

  const VERSION = "0912.1";
  const CONFIG_ENDPOINT = "/api/public-config";
  const EVENT_ENDPOINT = "/api/qm-analytics-event";
  const CONSENT_STORAGE_KEY = "qm_analytics_consent_v1";
  const LOGIN_PENDING_KEY = "termo_auth_login_pending_v1";
  const SESSION_EVENT_KEY = "qm_analytics_session_event_v1";
  const CONSENT_VERSION = "qm-analytics-consent-v1";
  const PRODUCTION_HOST = "quantummechanicsbook.app";
  const QUEUE_LIMIT = 40;
  const BATCH_SIZE = 10;
  const FLUSH_DELAY_MS = 1600;
  const FLUSH_INTERVAL_MS = 15000;
  const EVENT_PROPERTIES = {
    session_start: ["language", "timezone", "viewport_group"],
    home_study_cta_click: ["surface", "destination", "chapter_id"],
    chapter_start: ["chapter_id", "entry_method"],
    section_open: ["chapter_id", "item_id", "page_slug"],
    section_complete: ["chapter_id", "item_id", "page_slug", "completed"],
    simulator_open: ["simulator_id", "entry_method"],
    assessment_start: ["chapter_id", "question_count"],
    assessment_complete: ["chapter_id", "question_count", "correct_count", "score_percent"],
    exercise_generate: ["chapter_id", "item_id", "difficulty"],
    exercise_solution_open: ["chapter_id", "item_id", "difficulty"],
    exercise_validation_submit: ["chapter_id", "item_id", "has_reported_issue"],
    favorite_changed: ["kind", "active", "count"],
    auth_open: ["surface"],
    login_success: ["provider"],
    rating_prompt_shown: ["visit_band", "content_view_band"],
    rating_submitted: ["rating", "has_feedback"],
    book_preview_open: ["provider", "surface"],
    search_submit: ["query_length_bucket", "result_count"],
    search_result_open: ["chapter_id", "item_id", "result_rank"]
  };
  const EVENT_NAMES = new Set(Object.keys(EVENT_PROPERTIES));
  const GOOGLE_EVENT_NAMES = new Set(Object.keys(EVENT_PROPERTIES).filter(function (name) {
    return name !== "session_start";
  }));

  let configPromise = null;
  let analyticsConfig = null;
  let consentDecision = readConsentDecision();
  let queue = [];
  let flushTimer = null;
  let flushInFlight = false;
  let googleTagConfigured = false;
  let analyticsEnabled = false;
  let booted = false;
  let searchTimer = null;

  function storageGet(storageName, key) {
    try {
      return window[storageName]?.getItem(key) || "";
    } catch (_error) {
      return "";
    }
  }

  function storageSet(storageName, key, value) {
    try {
      window[storageName]?.setItem(key, value);
    } catch (_error) {
      /* The current choice still applies in memory. */
    }
  }

  function storageRemove(storageName, key) {
    try {
      window[storageName]?.removeItem(key);
    } catch (_error) {
      /* Ignore unavailable storage. */
    }
  }

  function readConsentDecision() {
    try {
      const parsed = JSON.parse(window.localStorage?.getItem(CONSENT_STORAGE_KEY) || "{}");
      if (parsed?.version !== CONSENT_VERSION) return "unknown";
      return parsed?.decision === "granted" || parsed?.decision === "denied" ? parsed.decision : "unknown";
    } catch (_error) {
      return "unknown";
    }
  }

  function saveConsentDecision(decision) {
    storageSet("localStorage", CONSENT_STORAGE_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      decision,
      updatedAt: new Date().toISOString()
    }));
  }

  function currentScriptBase() {
    const ownScript = Array.from(document.scripts || []).find(function (script) {
      return String(script.src || "").includes("/qm-analytics.js");
    });
    try {
      return ownScript ? new URL("./", ownScript.src) : new URL("/assets/", window.location.origin);
    } catch (_error) {
      return null;
    }
  }

  function ensureStyle() {
    if (document.querySelector('link[data-qm-analytics-style]')) return;
    const base = currentScriptBase();
    if (!base) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("qm-analytics.css?v=" + VERSION, base).toString();
    link.dataset.qmAnalyticsStyle = "true";
    document.head.appendChild(link);
  }

  function safePath() {
    try {
      const url = new URL(window.location.href);
      const safeParams = new URLSearchParams();
      ["view", "chapter", "sim"].forEach(function (key) {
        const value = url.searchParams.get(key);
        if (value) safeParams.set(key, value.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 40));
      });
      const query = safeParams.toString();
      return (url.pathname + (query ? "?" + query : "")).slice(0, 240);
    } catch (_error) {
      return String(window.location.pathname || "/").slice(0, 240);
    }
  }

  function pageSlug() {
    return String(window.location.pathname.split("/").pop() || "home")
      .replace(/\.html$/i, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 80);
  }

  function inferChapterContext() {
    const pathMatch = window.location.pathname.match(/\/slides\/chapter-(\d+)\/([^/]+)\.html$/i);
    const label = String(
      document.querySelector(".chapter-label")?.textContent ||
      document.querySelector("[data-chapter-label]")?.textContent ||
      ""
    );
    const labelMatch = label.match(/Chapter\s+(\d+)\s*[·•.-]?\s*Item\s+([0-9]+(?:\.[0-9]+)?)/i);
    const queryChapter = new URLSearchParams(window.location.search).get("chapter") || "";
    const rawChapterId = String(pathMatch?.[1] || labelMatch?.[1] || queryChapter || "");
    return {
      chapter_id: rawChapterId ? rawChapterId.padStart(2, "0").slice(0, 12) : "",
      item_id: String(labelMatch?.[2] || "").slice(0, 24),
      page_slug: String(pathMatch?.[2] || pageSlug()).slice(0, 80)
    };
  }

  function inferSimulatorId(source) {
    const rootSlug = document.querySelector("[data-simulator-slug]")?.dataset?.simulatorSlug || "";
    const query = new URLSearchParams(window.location.search).get("sim") || "";
    let hrefSlug = "";
    if (source) {
      try {
        const url = new URL(source, window.location.href);
        hrefSlug = url.searchParams.get("sim") || (url.pathname.split("/").pop() || "").replace(/\.html$/i, "");
      } catch (_error) {
        hrefSlug = "";
      }
    }
    return String(rootSlug || query || hrefSlug || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  }

  function cleanScalar(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return Number.isFinite(value) ? Math.max(-1000000, Math.min(1000000, value)) : null;
    if (typeof value !== "string") return null;
    const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, 120);
    return cleaned || null;
  }

  function cleanProperties(eventName, properties) {
    const source = properties && typeof properties === "object" && !Array.isArray(properties) ? properties : {};
    const context = inferChapterContext();
    const merged = { ...context, ...source };
    const output = {};
    (EVENT_PROPERTIES[eventName] || []).forEach(function (key) {
      const value = cleanScalar(merged[key]);
      if (value !== null) output[key] = value;
    });
    return output;
  }

  function countBand(value) {
    const count = Math.max(0, Number(value || 0));
    if (count <= 1) return "0-1";
    if (count <= 3) return "2-3";
    if (count <= 7) return "4-7";
    return "8+";
  }

  function viewportGroup() {
    const width = Number(window.innerWidth || window.screen?.width || 0);
    if (width < 640) return "small";
    if (width < 1024) return "medium";
    return "large";
  }

  function queryLengthBucket(value) {
    const length = String(value || "").trim().length;
    if (length <= 2) return "1-2";
    if (length <= 5) return "3-5";
    if (length <= 10) return "6-10";
    if (length <= 20) return "11-20";
    return "21+";
  }

  async function getPublicConfig() {
    if (!configPromise) {
      configPromise = fetch(CONFIG_ENDPOINT, { cache: "no-store", credentials: "same-origin" })
        .then(function (response) {
          if (!response.ok) throw new Error("analytics_config_unavailable");
          return response.json();
        });
    }
    return configPromise;
  }

  function isDebugMode() {
    try {
      return window.__QM_ANALYTICS_DEBUG === true || new URLSearchParams(window.location.search).get("analytics_debug") === "1";
    } catch (_error) {
      return false;
    }
  }

  function runtimeIsAllowed(config) {
    const expectedHost = String(config?.productionHost || PRODUCTION_HOST).toLowerCase();
    return window.location.hostname.toLowerCase() === expectedHost || isDebugMode();
  }

  function initGoogleTag() {
    const measurementId = String(analyticsConfig?.measurementId || "");
    if (!analyticsEnabled || !/^G-[A-Z0-9]{6,16}$/i.test(measurementId) || googleTagConfigured) return;

    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }

    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied"
    });
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted"
    });

    if (!document.querySelector('script[data-qm-ga="gtag"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
      script.dataset.qmGa = "gtag";
      document.head.appendChild(script);
    }

    const safeLocation = window.location.origin + safePath();
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      anonymize_ip: true,
      page_location: safeLocation,
      page_path: safePath(),
      page_title: String(document.title || "QUANTUM").slice(0, 120),
      debug_mode: isDebugMode()
    });
    googleTagConfigured = true;
  }

  function sendGoogleEvent(event) {
    if (!googleTagConfigured || !GOOGLE_EVENT_NAMES.has(event.eventName) || typeof window.gtag !== "function") return;
    window.gtag("event", event.eventName, {
      ...event.properties,
      send_to: analyticsConfig.measurementId,
      debug_mode: isDebugMode()
    });
  }

  function buildEvent(eventName, properties) {
    return {
      eventName,
      pagePath: safePath(),
      properties: cleanProperties(eventName, properties)
    };
  }

  function requeue(events) {
    queue = events.concat(queue).slice(0, QUEUE_LIMIT);
  }

  async function flush(options) {
    if (!analyticsEnabled || consentDecision !== "granted" || flushInFlight || !queue.length) return;
    flushInFlight = true;
    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = null;
    }

    const events = queue.splice(0, BATCH_SIZE);
    const payload = JSON.stringify({
      analyticsConsent: true,
      consentVersion: CONSENT_VERSION,
      events
    });

    try {
      if (options?.beacon && navigator.sendBeacon) {
        const accepted = navigator.sendBeacon(EVENT_ENDPOINT, new Blob([payload], { type: "application/json" }));
        if (!accepted) requeue(events);
        return;
      }

      const response = await fetch(EVENT_ENDPOINT, {
        method: "POST",
        credentials: "same-origin",
        keepalive: Boolean(options?.keepalive),
        headers: { "Content-Type": "application/json" },
        body: payload
      });
      if (!response.ok && response.status >= 500) requeue(events);
    } catch (_error) {
      requeue(events);
    } finally {
      flushInFlight = false;
      if (queue.length) scheduleFlush(1000);
    }
  }

  function scheduleFlush(delay) {
    if (flushTimer || consentDecision !== "granted") return;
    flushTimer = window.setTimeout(function () {
      void flush();
    }, typeof delay === "number" ? delay : FLUSH_DELAY_MS);
  }

  function enqueueEvent(event) {
    queue.push(event);
    if (queue.length > QUEUE_LIMIT) queue = queue.slice(queue.length - QUEUE_LIMIT);
    sendGoogleEvent(event);
    if (queue.length >= 5) void flush();
    else scheduleFlush();
  }

  function track(eventName, properties) {
    const name = String(eventName || "").trim().toLowerCase();
    if (!EVENT_NAMES.has(name)) return;

    const normalizedProperties = { ...(properties || {}) };
    if (name === "rating_prompt_shown") {
      normalizedProperties.visit_band = normalizedProperties.visit_band || countBand(normalizedProperties.visit_count);
      normalizedProperties.content_view_band = normalizedProperties.content_view_band || countBand(normalizedProperties.content_view_count);
    }

    const event = buildEvent(name, normalizedProperties);
    if (!analyticsEnabled || consentDecision !== "granted") return;
    enqueueEvent(event);
  }

  function hideConsentPanel() {
    document.querySelector("[data-qm-analytics-consent-panel]")?.remove();
  }

  function showConsentPanel(manageMode) {
    if (!analyticsEnabled || !document.body) return;
    hideConsentPanel();
    const panel = document.createElement("aside");
    panel.className = "qm-analytics-consent";
    panel.dataset.qmAnalyticsConsentPanel = "true";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "qm-analytics-consent-title");
    panel.innerHTML =
      '<div class="qm-analytics-consent__copy">' +
        '<p class="qm-analytics-consent__eyebrow">Privacy controls</p>' +
        '<h2 id="qm-analytics-consent-title">' + (manageMode ? 'Analytics preferences' : 'Help improve QUANTUM') + '</h2>' +
        '<p>Optional analytics help us understand which reviewed chapters, simulators, exercises, and assessments are useful. We never send names, email addresses, search text, answers, generated content, or feedback text.</p>' +
      '</div>' +
      '<div class="qm-analytics-consent__actions">' +
        '<button type="button" class="qm-analytics-consent__button qm-analytics-consent__button--secondary" data-qm-analytics-consent="denied">Only necessary</button>' +
        '<button type="button" class="qm-analytics-consent__button qm-analytics-consent__button--primary" data-qm-analytics-consent="granted">Allow analytics</button>' +
      '</div>';
    document.body.appendChild(panel);
    window.requestAnimationFrame(function () { panel.classList.add("is-visible"); });
    panel.querySelector('[data-qm-analytics-consent="' + (consentDecision === "granted" ? "granted" : "denied") + '"]')?.focus();
  }

  function trackInitialContext() {
    if (storageGet("sessionStorage", SESSION_EVENT_KEY) !== "1") {
      storageSet("sessionStorage", SESSION_EVENT_KEY, "1");
      track("session_start", {
        language: navigator.language || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        viewport_group: viewportGroup()
      });
    }

    const context = inferChapterContext();
    if (/\/slides\/chapter-\d+\/[^/]+\.html$/i.test(window.location.pathname) && context.chapter_id) {
      const chapterKey = "qm_analytics_chapter_" + context.chapter_id;
      if (storageGet("sessionStorage", chapterKey) !== "1") {
        storageSet("sessionStorage", chapterKey, "1");
        track("chapter_start", { chapter_id: context.chapter_id, entry_method: "section_page" });
      }
      const sectionKey = "qm_analytics_section_" + safePath();
      if (storageGet("sessionStorage", sectionKey) !== "1") {
        storageSet("sessionStorage", sectionKey, "1");
        track("section_open", context);
      }
    }

    const simulatorId = inferSimulatorId();
    if (simulatorId) {
      const simulatorKey = "qm_analytics_simulator_" + simulatorId;
      if (storageGet("sessionStorage", simulatorKey) !== "1") {
        storageSet("sessionStorage", simulatorKey, "1");
        track("simulator_open", { simulator_id: simulatorId, entry_method: "standalone_page" });
      }
    }
  }

  async function activateAnalytics() {
    if (!analyticsEnabled || consentDecision !== "granted") return;
    initGoogleTag();
    trackInitialContext();
    await detectPendingLogin();
  }

  function setConsent(decision) {
    if (decision !== "granted" && decision !== "denied") return;
    consentDecision = decision;
    saveConsentDecision(decision);
    hideConsentPanel();

    if (decision === "granted") {
      void activateAnalytics();
    } else {
      queue = [];
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied"
        });
      }
    }

    window.dispatchEvent(new CustomEvent("qm-analytics-consent-change", {
      detail: { decision, version: CONSENT_VERSION }
    }));
  }

  async function detectPendingLogin(event) {
    if (consentDecision !== "granted" || storageGet("sessionStorage", LOGIN_PENDING_KEY) !== "1") return;
    let hasUser = Boolean(event?.detail?.user || event?.detail?.session?.user);
    if (!hasUser && window.TermoAuth?.getSession) {
      const session = await window.TermoAuth.getSession().catch(function () { return null; });
      hasUser = Boolean(session?.user);
    }
    if (!hasUser) return;
    storageRemove("sessionStorage", LOGIN_PENDING_KEY);
    track("login_success", { provider: "google" });
  }

  function bookProvider(href) {
    try {
      const host = new URL(href, window.location.href).hostname.toLowerCase();
      if (host.includes("books.google.")) return "google_books";
      if (host.includes("elsevier.")) return "elsevier";
      if (host.includes("sciencedirect.")) return "sciencedirect";
      if (host.includes("amazon.")) return "amazon";
    } catch (_error) {
      return "";
    }
    return "";
  }

  function clickSurface(element) {
    if (element.closest(".top-header, .hdr, header")) return "header";
    if (element.closest("footer")) return "footer";
    if (window.location.pathname.endsWith("/home.html")) return "home";
    return "content";
  }

  function handleClick(event) {
    if (!(event.target instanceof Element)) return;
    const target = event.target;

    const consentButton = target.closest("[data-qm-analytics-consent]");
    if (consentButton) {
      event.preventDefault();
      setConsent(consentButton.getAttribute("data-qm-analytics-consent"));
      return;
    }

    const settingsButton = target.closest("[data-qm-analytics-settings]");
    if (settingsButton) {
      event.preventDefault();
      showConsentPanel(true);
      return;
    }

    const googleLoginButton = target.closest("[data-termo-auth-google-button]");
    if (googleLoginButton) {
      storageSet("sessionStorage", LOGIN_PENDING_KEY, "1");
      return;
    }

    const authButton = target.closest("[data-termo-auth-button], [data-landing-login-target]");
    if (authButton) {
      track("auth_open", { surface: clickSurface(authButton) });
      return;
    }

    const solutionButton = target.closest('[data-role="toggle-solution"]');
    if (solutionButton && !solutionButton.disabled) {
      const panel = solutionButton.closest(".termo-exercise")?.querySelector('[data-role="solution-panel"]');
      if (!panel || panel.style.display !== "block") {
        const difficulty = solutionButton.closest(".termo-exercise")?.querySelector('[data-role="difficulty"]')?.value || "";
        track("exercise_solution_open", { difficulty });
      }
      return;
    }

    const result = target.closest(".result-card");
    if (result) {
      const label = String(result.querySelector(".result-meta")?.textContent || "");
      const match = label.match(/Chapter\s+(\d+)\s*·\s*Item\s+([0-9.]+)/i);
      const cards = Array.from(document.querySelectorAll(".result-card"));
      track("search_result_open", {
        chapter_id: match?.[1] || "",
        item_id: match?.[2] || "",
        result_rank: Math.max(1, cards.indexOf(result) + 1)
      });
      return;
    }

    const link = target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    const provider = bookProvider(href);
    if (provider) {
      track("book_preview_open", { provider, surface: clickSurface(link) });
      return;
    }

    if (window.location.pathname.endsWith("/home.html")) {
      let destination = null;
      try { destination = new URL(href, window.location.href); } catch (_error) { destination = null; }
      if (destination && destination.hostname === window.location.hostname && destination.pathname.endsWith("/index.html")) {
        track("home_study_cta_click", {
          surface: link.classList.contains("nav-link") ? "navigation" : "hero",
          destination: destination.searchParams.get("view") || "chapters",
          chapter_id: destination.searchParams.get("chapter") || ""
        });
      }
    }
  }

  function handleSearchInput(event) {
    const input = event.target;
    if (!(input instanceof Element) || input.id !== "searchInput") return;
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(function () {
      const raw = String(input.value || "").trim();
      if (!raw) return;
      track("search_submit", {
        query_length_bucket: queryLengthBucket(raw),
        result_count: document.querySelectorAll(".result-card").length
      });
    }, 900);
  }

  function bindEvents() {
    document.addEventListener("click", handleClick, true);
    document.addEventListener("input", handleSearchInput, true);
    window.addEventListener("termo-auth-state-change", function (event) {
      void detectPendingLogin(event);
    });
    window.addEventListener("termo-favorite-items-change", function (event) {
      track("favorite_changed", { kind: "saved_item", count: Number(event?.detail?.count || 0) });
    });
    window.addEventListener("qm-study-progress-change", function (event) {
      if (event?.detail?.record?.status !== "completed") return;
      const item = event.detail.item || {};
      track("section_complete", {
        chapter_id: item.chapterId || "",
        item_id: item.itemId || "",
        page_slug: String(item.pagePath || "").split("/").pop()?.replace(/\.html$/i, "") || "",
        completed: true
      });
    });
    window.addEventListener("pagehide", function () {
      void flush({ beacon: true, keepalive: true });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") void flush({ beacon: true, keepalive: true });
    });
  }

  async function boot() {
    if (booted) return;
    booted = true;
    ensureStyle();
    bindEvents();

    try {
      const publicConfig = await getPublicConfig();
      analyticsConfig = publicConfig?.analytics || null;
      analyticsEnabled = Boolean(analyticsConfig?.enabled && runtimeIsAllowed(analyticsConfig));
    } catch (_error) {
      analyticsEnabled = false;
    }

    if (!analyticsEnabled) return;

    if (consentDecision === "granted") {
      await activateAnalytics();
    } else if (consentDecision === "unknown") {
      showConsentPanel(false);
    }
  }

  window.QMAnalytics = {
    track,
    flush: function () { return flush(); },
    getConsent: function () { return { decision: consentDecision, version: CONSENT_VERSION }; },
    setConsent,
    openConsentSettings: function () { showConsentPanel(true); },
    isEnabled: function () { return analyticsEnabled; }
  };
  window.QmAnalytics = window.QMAnalytics;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { void boot(); }, { once: true });
  } else {
    void boot();
  }

  window.setInterval(function () {
    if (queue.length) void flush();
  }, FLUSH_INTERVAL_MS);
})();
