(function () {
  if (window.QMSimulatorProgress) return;

  const AUTH_ASSET_VERSION = "0910.3";
  const SESSION_KEY_PREFIX = "qm-simulator-open:v2:";
  let authLoaderPromise = null;
  let recordPromise = null;

  function assetUrl(fileName) {
    try {
      const activeScript = document.currentScript ||
        Array.from(document.scripts).find(function (script) {
          return String(script.src || "").includes("qm-simulator-progress.js");
        });
      const base = activeScript?.src
        ? new URL("./", activeScript.src)
        : new URL("/assets/", window.location.origin);
      return new URL(fileName, base).toString();
    } catch (_error) {
      return "/assets/" + fileName;
    }
  }

  async function ensureAuthRuntime() {
    if (window.TermoAuth) return window.TermoAuth;
    if (authLoaderPromise) return authLoaderPromise;

    authLoaderPromise = new Promise(function (resolve) {
      let attempts = 0;
      let script = Array.from(document.scripts).find(function (node) {
        return String(node.src || "").includes("/assets/termo-auth.js");
      });

      if (!script) {
        script = document.createElement("script");
        script.src = assetUrl("termo-auth.js?v=" + AUTH_ASSET_VERSION);
        script.async = true;
        script.dataset.qmSimulatorAuthLoader = "true";
        document.head.appendChild(script);
      }

      function check() {
        attempts += 1;
        if (window.TermoAuth) {
          resolve(window.TermoAuth);
          return;
        }
        if (attempts >= 120) {
          resolve(null);
          return;
        }
        window.setTimeout(check, 50);
      }

      check();
    });

    return authLoaderPromise;
  }

  function simulatorIdentity() {
    const pagePath = window.location.pathname.replace(/^\/+/, "") + (window.location.search || "");
    const declaredSlug = document.querySelector("[data-simulator-slug]")?.getAttribute("data-simulator-slug");
    const querySlug = new URLSearchParams(window.location.search).get("sim");
    const fileSlug = window.location.pathname.split("/").pop().replace(/\.html$/i, "");
    return {
      pagePath,
      slug: String(declaredSlug || querySlug || fileSlug || "simulator")
    };
  }

  function sessionKey(userId, pagePath) {
    return SESSION_KEY_PREFIX + String(userId) + ":" + String(pagePath);
  }

  function wasRecorded(key) {
    try {
      return window.sessionStorage?.getItem(key) === "1";
    } catch (_error) {
      return false;
    }
  }

  function markRecorded(key) {
    try {
      window.sessionStorage?.setItem(key, "1");
    } catch (_error) {
      return;
    }
  }

  async function recordOnce() {
    const auth = await ensureAuthRuntime();
    if (!auth) return { ok: false, reason: "auth_unavailable" };

    if (typeof auth.whenReady === "function") {
      await auth.whenReady(6000).catch(function () {
        return null;
      });
    }

    const client = await auth.ensureSupabase?.().catch(function () {
      return null;
    });
    const session = await auth.getSession?.().catch(function () {
      return null;
    });
    if (!client || !session?.user?.id) return { ok: false, reason: "not_authenticated" };

    const identity = simulatorIdentity();
    const key = sessionKey(session.user.id, identity.pagePath);
    if (wasRecorded(key)) return { ok: true, deduped: true, identity };

    const found = await client
      .from("qm_simulator_activity")
      .select("open_count")
      .eq("user_id", session.user.id)
      .eq("simulator_path", identity.pagePath)
      .maybeSingle();

    if (found.error) return { ok: false, reason: "query_failed", error: found.error };

    const now = new Date().toISOString();
    const payload = {
      user_id: session.user.id,
      simulator_path: identity.pagePath,
      simulator_slug: identity.slug,
      last_opened_at: now,
      open_count: Number(found.data?.open_count || 0) + 1
    };

    const saved = found.data
      ? await client
          .from("qm_simulator_activity")
          .update(payload)
          .eq("user_id", session.user.id)
          .eq("simulator_path", identity.pagePath)
      : await client.from("qm_simulator_activity").insert(payload);

    if (saved.error) return { ok: false, reason: "write_failed", error: saved.error };

    markRecorded(key);
    window.dispatchEvent(new CustomEvent("qm-simulator-progress-change", {
      detail: { simulatorPath: identity.pagePath, simulatorSlug: identity.slug }
    }));
    return { ok: true, deduped: false, identity };
  }

  function record() {
    if (!recordPromise) {
      recordPromise = recordOnce().finally(function () {
        recordPromise = null;
      });
    }
    return recordPromise;
  }

  function boot() {
    void record();
  }

  window.QMSimulatorProgress = {
    record,
    ensureAuthRuntime,
    simulatorIdentity
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
