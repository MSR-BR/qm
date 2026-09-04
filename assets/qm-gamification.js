(function () {
  if (window.QMGamification) return;

  const PROFILE_TABLE = "qm_gamification_profiles";
  const EVENT_ENDPOINT = "/api/qm-gamification-event";

  async function getSession() {
    return window.TermoAuth?.getSession?.().catch(function () { return null; }) || null;
  }

  async function getClient() {
    return window.TermoAuth?.ensureSupabase?.().catch(function () { return null; }) || null;
  }

  function eventKey(item) {
    return ["section", item.chapterId, item.itemId, String(item.pagePath || "").replace(/^\/+/, "")].join(":");
  }

  async function listProfile() {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session?.user?.id) return { ok: false, reason: "not_authenticated", profile: null };
    const result = await client.from(PROFILE_TABLE).select("xp_total, level, current_streak, best_streak, studied_items_count, last_active_on").maybeSingle();
    if (result.error) return { ok: false, reason: "query_failed", error: result.error, profile: null };
    return { ok: true, profile: result.data || { xp_total: 0, level: 1, current_streak: 0, best_streak: 0, studied_items_count: 0 } };
  }

  async function recordSectionCompletion(item) {
    const session = await getSession();
    if (!session?.access_token || !item) return { ok: false, reason: "not_authenticated" };
    const response = await fetch(EVENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
      body: JSON.stringify({ eventType: "section_completed", idempotencyKey: eventKey(item), chapterId: item.chapterId, itemId: item.itemId, pagePath: item.pagePath })
    });
    let data = null;
    try { data = await response.json(); } catch (_error) { data = null; }
    if (!response.ok || !data?.ok) return { ok: false, reason: "request_failed", status: response.status, data: data };
    window.dispatchEvent(new CustomEvent("qm-gamification-change", { detail: data }));
    return data;
  }

  window.QMGamification = { listProfile, recordSectionCompletion };

  window.addEventListener("qm-study-progress-change", function (event) {
    const detail = event?.detail || {};
    if (detail?.record?.status !== "completed" || !detail.item) return;
    void recordSectionCompletion(detail.item).then(function (result) {
      if (!result?.ok || !result.awarded) return;
      const copy = document.querySelector(".qm-progress-control__copy span");
      if (copy) copy.textContent = "+" + result.xpDelta + " points added to your private study journey.";
    });
  });
})();
