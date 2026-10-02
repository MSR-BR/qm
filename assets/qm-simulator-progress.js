(function () {
  if (window.QMSimulatorProgress) return;

  const AUTH_ASSET_VERSION = "0910.3";
  const SESSION_KEY_PREFIX = "qm-simulator-open:v2:";
  let authLoaderPromise = null;
  let recordPromise = null;
  let learningActivity = null;
  let interactionCount = 0;

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

  async function recordLearningStage(stage, responseCode) {
    const auth = await ensureAuthRuntime();
    if (!auth) return { ok: false, reason: "auth_unavailable" };
    const session = await auth.getSession?.().catch(function () { return null; });
    if (!session?.access_token) return { ok: false, reason: "not_authenticated" };
    if (!learningActivity) learningActivity = window.crypto.randomUUID();
    const identity = simulatorIdentity();
    const response = await fetch("/api/qm-adaptive-learning", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
      body: JSON.stringify({ action: "simulator_stage", activityId: learningActivity,
        idempotencyKey: window.crypto.randomUUID(), simulatorSlug: identity.slug, stage,
        responseCode: responseCode || null, interactionCount })
    }).catch(function () { return null; });
    if (!response) return { ok: false, reason: "unavailable" };
    const data = await response.json().catch(function () { return {}; });
    return response.ok ? { ok: true, data } : { ok: false, reason: data.error || "request_failed" };
  }

  function mountLearningCycle() {
    if (!document.body || typeof window.crypto?.randomUUID !== "function" || document.querySelector("[data-qm-learning-cycle]")) return;
    const style = document.createElement("style");
    style.textContent = ".qm-sim-cycle{position:relative;margin:16px auto;padding:16px;width:min(94%,760px);border:1px solid #b8d8c4;border-radius:16px;background:#fff;color:#27313f;font:15px/1.45 Inter,system-ui,sans-serif;box-shadow:0 10px 28px rgba(31,65,50,.12)}.qm-sim-cycle h2{margin:0 0 7px;color:#2f6b4f;font-size:1.15rem}.qm-sim-cycle p{margin:6px 0}.qm-sim-cycle__row{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin-top:10px}.qm-sim-cycle button,.qm-sim-cycle select{min-height:42px;border:1px solid #b8d8c4;border-radius:10px;padding:8px 12px;background:#fff;color:#2f6b4f;font:inherit;font-weight:700}.qm-sim-cycle button{cursor:pointer}.qm-sim-cycle button:disabled{opacity:.55}.qm-sim-cycle [role=status]{font-weight:700;color:#6d6258}.qm-sim-cycle__help{display:inline-block;margin-top:8px;color:#155c46;font-weight:700;text-underline-offset:3px}.qm-sim-cycle__help:focus-visible{outline:3px solid #1b70c9;outline-offset:3px}";
    document.head.appendChild(style);
    const panel = document.createElement("section");
    panel.className = "qm-sim-cycle"; panel.dataset.qmLearningCycle = "true";
    panel.innerHTML = '<h2>Guided simulator cycle</h2><p>Make a prediction, change at least two controls, then compare and explain. This records learning evidence, not instant mastery, and awards no points.</p><div class="qm-sim-cycle__row"><label>Prediction <select data-qm-prediction><option value="">Choose</option><option value="lower">The target will decrease</option><option value="same">The target will stay similar</option><option value="higher">The target will increase</option><option value="uncertain">I am uncertain</option></select></label><button type="button" data-qm-stage="prediction">Record prediction</button></div><div class="qm-sim-cycle__row"><button type="button" data-qm-stage="interaction" disabled>Confirm meaningful interaction</button><span data-qm-count>0 relevant changes observed</span></div><div class="qm-sim-cycle__row"><label>Comparison <select data-qm-reflection><option value="">Choose</option><option value="qualitative_match">Outcome matched my prediction</option><option value="qualitative_mismatch">Outcome differed from my prediction</option><option value="uncertain">I need more review</option></select></label><button type="button" data-qm-stage="reflection" disabled>Complete reflection</button></div><p role="status" data-qm-cycle-status></p><a class="qm-sim-cycle__help" href="/help.html#simulators">How simulator evidence works</a>';
    document.body.insertBefore(panel, document.body.firstChild);
    const status = panel.querySelector("[data-qm-cycle-status]"); const predictionButton = panel.querySelector('[data-qm-stage="prediction"]');
    const interactionButton = panel.querySelector('[data-qm-stage="interaction"]'); const reflectionButton = panel.querySelector('[data-qm-stage="reflection"]');
    document.addEventListener("input", function (event) { if (event.target.closest?.("[data-qm-learning-cycle]")) return; interactionCount += 1; panel.querySelector("[data-qm-count]").textContent = interactionCount + " relevant changes observed"; if (interactionCount >= 2 && predictionButton.disabled) interactionButton.disabled = false; }, true);
    predictionButton.addEventListener("click", async function () { const code=panel.querySelector("[data-qm-prediction]").value; if(!code){status.textContent="Choose a prediction first.";return;} predictionButton.disabled=true; status.textContent="Recording prediction…"; const saved=await recordLearningStage("prediction_recorded",code); if(!saved.ok){status.textContent="Prediction could not be recorded. Sign in and try again.";predictionButton.disabled=false;return;} status.textContent="Prediction recorded. Manipulate at least two controls."; if(interactionCount>=2) interactionButton.disabled=false; });
    interactionButton.addEventListener("click", async function () { interactionButton.disabled=true; status.textContent="Recording interaction…"; const saved=await recordLearningStage("meaningful_interaction",null); if(!saved.ok){status.textContent="Interaction could not be recorded.";interactionButton.disabled=false;return;} status.textContent="Interaction recorded. Compare the result with your prediction."; reflectionButton.disabled=false; });
    reflectionButton.addEventListener("click", async function () { const code=panel.querySelector("[data-qm-reflection]").value;if(!code){status.textContent="Choose a comparison first.";return;} reflectionButton.disabled=true;status.textContent="Recording reflection…";let saved=await recordLearningStage("reflection_recorded",code);if(!saved.ok){status.textContent="Reflection could not be recorded.";reflectionButton.disabled=false;return;} saved=await recordLearningStage("goal_completed",null);status.textContent=saved.ok?"Guided cycle complete. This evidence will inform later retrieval.":"Reflection saved; goal completion can be retried later."; });
  }

  function boot() {
    void record();
    mountLearningCycle();
  }

  window.QMSimulatorProgress = {
    record,
    ensureAuthRuntime,
    simulatorIdentity,
    recordLearningStage
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
