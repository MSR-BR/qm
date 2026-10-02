(function () {
  if (window.QMGamification) return;

  const EVENT_ENDPOINT = "/api/qm-gamification-event";

  async function getSession() {
    return window.TermoAuth?.getSession?.().catch(function () { return null; }) || null;
  }

  function eventKey(item) {
    return ["section", item.chapterId, item.itemId, String(item.pagePath || "").replace(/^\/+/, "")].join(":");
  }

  async function listProfile() {
    const result = await learningProfile();
    return { ...result, ok: result.ok && result.profile.rewards.status === "available", profile: result.profile?.rewards || null };
  }

  async function learningProfile() {
    const session = await getSession();
    if (!session?.access_token) return { ok: false, reason: "not_authenticated", profile: null };
    try {
      const response = await fetch("/api/qm-learning-profile", { headers: { Authorization: "Bearer " + session.access_token }, cache: "no-store" });
      const data = await response.json();
      const currentSession = await getSession();
      if (currentSession?.access_token !== session.access_token) return { ok: false, reason: "session_changed", profile: null };
      return response.ok && data.profile?.profile_version === "learning-profile-v1"
        ? { ok: true, profile: data.profile } : { ok: false, reason: "unavailable", profile: null };
    } catch { return { ok: false, reason: "unavailable", profile: null }; }
  }

  async function recordSectionCompletion(item) {
    const session = await getSession();
    if (!session?.access_token || !item) return { ok: false, reason: "not_authenticated" };
    const response = await fetch(EVENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
      body: JSON.stringify({ eventType: "section_completed", idempotencyKey: eventKey(item), chapterId: item.chapterId, itemId: item.itemId, pagePath: item.pagePath })
    }).catch(function () { return null; });
    if (!response) return { ok: false, reason: "unavailable" };
    let data = null;
    try { data = await response.json(); } catch (_error) { data = null; }
    if (!response.ok || !data?.ok) return { ok: false, reason: "request_failed", status: response.status, data: data };
    window.dispatchEvent(new CustomEvent("qm-gamification-change", { detail: data }));
    return data;
  }

  window.QMGamification = { listProfile, learningProfile, recordSectionCompletion };

  window.addEventListener("qm-study-progress-change", function (event) {
    const detail = event?.detail || {};
    if (detail?.record?.status !== "completed" || !detail.item) return;
    void recordSectionCompletion(detail.item).then(function (result) {
      const copy = document.querySelector(".qm-progress-control__copy span");
      if (!result?.ok) {
        if (copy) copy.textContent = "Progress saved. Points could not be confirmed yet; your record has not been reset.";
        return;
      }
      if (!result.awarded) return;
      if (copy) copy.textContent = "+" + result.xpDelta + " points added to your private study journey.";
    });
  });
})();
