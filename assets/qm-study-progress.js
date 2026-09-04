(function () {
  if (window.QMStudyProgress) return;

  const TABLE_NAME = "qm_study_progress";
  let currentItem = null;
  let control = null;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizePath(value) {
    try {
      return new URL(value, window.location.origin).pathname.replace(/^\/+/, "");
    } catch (_error) {
      return String(value || "").split(/[?#]/)[0].replace(/^\/+/, "");
    }
  }

  function getChapterId() {
    const match = window.location.pathname.match(/\/slides\/chapter-(\d+)\//i);
    return match ? String(match[1]).padStart(2, "0") : "";
  }

  function isPublishedChapter(chapterId) {
    return window.QMContentRegistry?.chapters?.[chapterId]?.availability === "published";
  }

  async function getSession() {
    return window.TermoAuth?.getSession?.().catch(function () { return null; }) || null;
  }

  async function getClient() {
    return window.TermoAuth?.ensureSupabase?.().catch(function () { return null; }) || null;
  }

  function progressPayload(item, userId) {
    return {
      user_id: userId,
      chapter_id: item.chapterId,
      item_id: item.itemId,
      page_path: item.pagePath,
      page_title: item.title,
      last_opened_at: new Date().toISOString()
    };
  }

  async function recordOpen(item) {
    if (!item || !isPublishedChapter(item.chapterId)) return { ok: false, reason: "unavailable_content" };

    const client = await getClient();
    const session = await getSession();
    if (!client || !session?.user?.id) return { ok: false, reason: "not_authenticated" };

    const payload = progressPayload(item, session.user.id);
    const result = await client
      .from(TABLE_NAME)
      .upsert(payload, { onConflict: "user_id,page_path" })
      .select("id, status, completed_at, last_opened_at")
      .single();

    if (result.error) return { ok: false, reason: "upsert_failed", error: result.error };
    return { ok: true, record: result.data };
  }

  async function setCompletion(item, completed) {
    if (!item || !isPublishedChapter(item.chapterId)) return { ok: false, reason: "unavailable_content" };

    const client = await getClient();
    const session = await getSession();
    if (!client || !session?.user?.id) return { ok: false, reason: "not_authenticated" };

    const now = new Date().toISOString();
    const payload = {
      ...progressPayload(item, session.user.id),
      status: completed ? "completed" : "in_progress",
      completed_at: completed ? now : null
    };

    const result = await client
      .from(TABLE_NAME)
      .upsert(payload, { onConflict: "user_id,page_path" })
      .select("id, status, completed_at, last_opened_at")
      .single();

    if (result.error) return { ok: false, reason: "upsert_failed", error: result.error };
    window.dispatchEvent(new CustomEvent("qm-study-progress-change", { detail: { item, record: result.data } }));
    return { ok: true, record: result.data };
  }

  async function listProgress() {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session?.user?.id) return { ok: false, reason: "not_authenticated", progress: [] };

    const result = await client
      .from(TABLE_NAME)
      .select("chapter_id, item_id, page_path, page_title, status, first_opened_at, last_opened_at, completed_at")
      .order("last_opened_at", { ascending: false });

    if (result.error) return { ok: false, reason: "query_failed", error: result.error, progress: [] };
    return { ok: true, progress: result.data || [] };
  }

  async function resolveCurrentItem() {
    const chapterId = getChapterId();
    if (!chapterId || !isPublishedChapter(chapterId)) return null;

    const response = await fetch("/data/chapter-" + chapterId + ".json", { credentials: "same-origin" });
    if (!response.ok) return null;
    const payload = await response.json();
    const pagePath = normalizePath(window.location.pathname);
    const topic = (Array.isArray(payload?.topics) ? payload.topics : []).find(function (entry) {
      return normalizePath(entry.url) === pagePath;
    });
    if (!topic) return null;

    return {
      chapterId,
      itemId: String(topic.id || ""),
      pagePath,
      title: String(topic.title || document.title || "Course item")
    };
  }

  function renderControl(record) {
    if (!currentItem || !control) return;
    const completed = record?.status === "completed";
    control.innerHTML = '<div class="qm-progress-control__copy"><strong>' + (completed ? "Section completed" : "Study journey") + '</strong><span>' + (completed ? "This section is included in your completed study record." : "Save this section in your private study record.") + '</span></div>' +
      '<button type="button" class="qm-progress-control__button' + (completed ? " is-completed" : "") + '">' +
      '<i class="fa-solid ' + (completed ? "fa-rotate-left" : "fa-circle-check") + '"></i>' +
      '<span>' + (completed ? "Mark as in progress" : "Mark as completed") + "</span></button>";

    control.querySelector("button").addEventListener("click", async function () {
      const button = control.querySelector("button");
      button.disabled = true;
      const result = await setCompletion(currentItem, !completed);
      button.disabled = false;
      if (result.ok) renderControl(result.record);
    });
  }

  async function mount() {
    currentItem = await resolveCurrentItem().catch(function () { return null; });
    if (!currentItem) return;

    const session = await getSession();
    if (!session?.user) return;

    const result = await recordOpen(currentItem);
    const header = document.querySelector(".hdr-inner");
    if (!header || !result.ok) return;

    control = document.createElement("section");
    control.className = "qm-progress-control";
    header.appendChild(control);
    renderControl(result.record);
  }

  async function boot() {
    for (let attempt = 0; attempt < 16; attempt += 1) {
      if (window.TermoAuth && window.QMContentRegistry) break;
      await new Promise(function (resolve) { window.setTimeout(resolve, 150); });
    }
    await mount();
  }

  window.QMStudyProgress = {
    recordOpen,
    setCompletion,
    listProgress,
    resolveCurrentItem
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { void boot(); }, { once: true });
  } else {
    void boot();
  }
})();
