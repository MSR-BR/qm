(function () {
  if (window.QmRating) return;

  const STORAGE_KEY = "quantum_app_rating_v1";
  const VISIT_GAP_MS = 30 * 60 * 1000;
  const DISMISS_MS = 30 * 24 * 60 * 60 * 1000;
  const OPEN_DELAY_MS = 5000;
  const MAX_TRACKED_PAGES = 30;
  let selectedRating = 0;
  let activeDialog = null;
  let previousFocus = null;

  function readState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function writeState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      /* Rating still works for the current session without local persistence. */
    }
  }

  function createVisitorToken() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID().replace(/-/g, "");
    }
    return "tr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 18);
  }

  function pageReference() {
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams();
      ["view", "chapter", "sim"].forEach(function (name) {
        const value = url.searchParams.get(name);
        if (value) params.set(name, value.slice(0, 40));
      });
      const query = params.toString();
      return (url.pathname + (query ? "?" + query : "")).slice(0, 240);
    } catch (_error) {
      return String(window.location.pathname || "/").slice(0, 240);
    }
  }

  function updateVisitState() {
    const now = Date.now();
    const state = readState();
    if (!state.visitorToken) state.visitorToken = createVisitorToken();
    if (!state.lastSeenAt || now - Number(state.lastSeenAt) >= VISIT_GAP_MS) {
      state.visitCount = Number(state.visitCount || 0) + 1;
      state.pagesThisVisit = [];
    }

    const reference = pageReference();
    const pagesThisVisit = Array.isArray(state.pagesThisVisit) ? state.pagesThisVisit : [];
    if (!pagesThisVisit.includes(reference)) {
      pagesThisVisit.push(reference);
      state.pagesThisVisit = pagesThisVisit.slice(-MAX_TRACKED_PAGES);
      state.contentViewCount = Number(state.contentViewCount || 0) + 1;
    }
    state.lastSeenAt = now;
    writeState(state);
    return state;
  }

  function isEligible(state) {
    if (state.ratedAt) return false;
    if (Number(state.dismissedUntil || 0) > Date.now()) return false;
    const visits = Number(state.visitCount || 0);
    const contentViews = Number(state.contentViewCount || 0);
    return visits >= 3 || (visits >= 2 && contentViews >= 2);
  }

  function track(eventName, properties) {
    if (window.QmAnalytics && typeof window.QmAnalytics.track === "function") {
      window.QmAnalytics.track(eventName, properties || {});
    }
  }

  function closeDialog() {
    if (!activeDialog) return;
    document.removeEventListener("keydown", handleKeydown, true);
    activeDialog.remove();
    activeDialog = null;
    selectedRating = 0;
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    previousFocus = null;
  }

  function dismiss() {
    const state = readState();
    state.dismissedUntil = Date.now() + DISMISS_MS;
    writeState(state);
    track("rating_prompt_dismissed", {});
    closeDialog();
  }

  function handleKeydown(event) {
    if (!activeDialog) return;
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(activeDialog.querySelectorAll("button:not([disabled]), textarea:not([disabled])"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function selectRating(value) {
    selectedRating = value;
    if (!activeDialog) return;
    activeDialog.querySelectorAll("[data-quantum-rating-star]").forEach(function (button) {
      const selected = Number(button.dataset.quantumRatingStar) <= value;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", Number(button.dataset.quantumRatingStar) === value ? "true" : "false");
    });
    const followup = activeDialog.querySelector("[data-quantum-rating-followup]");
    const question = activeDialog.querySelector("[data-quantum-rating-question]");
    followup.hidden = false;
    question.textContent = value <= 3
      ? "What could we improve? (optional)"
      : "What did you like most? (optional)";
    activeDialog.querySelector("[data-quantum-rating-submit]").disabled = false;
    activeDialog.querySelector("[data-quantum-rating-feedback]").focus();
    track("rating_selected", { rating: value });
  }

  async function submitRating() {
    if (!activeDialog || selectedRating < 1 || selectedRating > 5) return;
    const submit = activeDialog.querySelector("[data-quantum-rating-submit]");
    const dismissButton = activeDialog.querySelector("[data-quantum-rating-dismiss]");
    const feedback = activeDialog.querySelector("[data-quantum-rating-feedback]");
    const status = activeDialog.querySelector("[data-quantum-rating-status]");
    submit.disabled = true;
    dismissButton.disabled = true;
    status.textContent = "Sending your rating…";

    const state = readState();
    try {
      const response = await fetch("/api/qm-app-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorToken: state.visitorToken,
          rating: selectedRating,
          feedback: feedback.value,
          pagePath: pageReference(),
          visitCount: Number(state.visitCount || 0),
          contentViewCount: Number(state.contentViewCount || 0)
        })
      });
      if (!response.ok) throw new Error("rating_submit_failed");

      state.ratedAt = Date.now();
      state.rating = selectedRating;
      delete state.dismissedUntil;
      writeState(state);
      track("rating_submitted", { rating: selectedRating, has_feedback: Boolean(feedback.value.trim()) });
      status.textContent = "Thank you. Your feedback helps improve QUANTUM.";
      window.setTimeout(closeDialog, 1300);
    } catch (_error) {
      submit.disabled = false;
      dismissButton.disabled = false;
      status.textContent = "Could not send your rating now. Please try again.";
    }
  }

  function buildDialog() {
    const backdrop = document.createElement("div");
    backdrop.className = "quantum-rating-backdrop";
    backdrop.dataset.quantumRatingBackdrop = "true";
    backdrop.innerHTML = [
      '<section class="quantum-rating-dialog" role="dialog" aria-modal="true" aria-labelledby="quantum-rating-title" aria-describedby="quantum-rating-copy">',
      '  <p class="quantum-rating-eyebrow">Your experience</p>',
      '  <h2 class="quantum-rating-title" id="quantum-rating-title">How would you rate QUANTUM?</h2>',
      '  <p class="quantum-rating-copy" id="quantum-rating-copy">Choose from 1 to 5 stars. Your response is anonymous and takes only a few seconds.</p>',
      '  <div class="quantum-rating-stars" role="group" aria-label="Choose a rating from 1 to 5">',
      [1, 2, 3, 4, 5].map(function (value) {
        return '<button class="quantum-rating-star" type="button" data-quantum-rating-star="' + value + '" aria-label="' + value + (value === 1 ? ' star' : ' stars') + '" aria-pressed="false">★</button>';
      }).join(""),
      '  </div>',
      '  <div class="quantum-rating-followup" data-quantum-rating-followup hidden>',
      '    <p class="quantum-rating-question" data-quantum-rating-question></p>',
      '    <textarea class="quantum-rating-feedback" data-quantum-rating-feedback maxlength="600" placeholder="Tell us in a few words"></textarea>',
      '    <p class="quantum-rating-privacy">Do not include your name, email address, or other personal data.</p>',
      '  </div>',
      '  <p class="quantum-rating-status" data-quantum-rating-status aria-live="polite"></p>',
      '  <div class="quantum-rating-actions">',
      '    <button class="quantum-rating-button quantum-rating-button--secondary" type="button" data-quantum-rating-dismiss>Not now</button>',
      '    <button class="quantum-rating-button quantum-rating-button--primary" type="button" data-quantum-rating-submit disabled>Send rating</button>',
      '  </div>',
      '</section>'
    ].join("\n");

    backdrop.querySelectorAll("[data-quantum-rating-star]").forEach(function (button) {
      button.addEventListener("click", function () {
        selectRating(Number(button.dataset.quantumRatingStar));
      });
    });
    backdrop.querySelector("[data-quantum-rating-dismiss]").addEventListener("click", dismiss);
    backdrop.querySelector("[data-quantum-rating-submit]").addEventListener("click", function () {
      void submitRating();
    });
    return backdrop;
  }

  function openDialog() {
    if (activeDialog || document.querySelector("[data-quantum-rating-backdrop]")) return;
    const state = readState();
    if (!isEligible(state)) return;
    previousFocus = document.activeElement;
    activeDialog = buildDialog();
    document.body.appendChild(activeDialog);
    document.addEventListener("keydown", handleKeydown, true);
    activeDialog.querySelector("[data-quantum-rating-star]").focus();
    track("rating_prompt_shown", {
      visit_count: Number(state.visitCount || 0),
      content_view_count: Number(state.contentViewCount || 0)
    });
  }

  function boot() {
    const state = updateVisitState();
    if (!isEligible(state)) return;
    window.setTimeout(openDialog, OPEN_DELAY_MS);
  }

  window.QmRating = {
    open: openDialog,
    isEligible: function () { return isEligible(readState()); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
