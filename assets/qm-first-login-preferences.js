(function () {
  if (window.QMFirstLoginPreferences) return;

  let activeUserId = "";
  let currentSession = null;
  let requestToken = 0;
  let overlay = null;
  let previousFocus = null;
  let previousOverflow = "";

  function documentsAccepted(data) {
    return Boolean(
      data &&
      data.termsAcceptedAt &&
      data.privacyAcknowledgedAt &&
      data.termsVersion === data.termsCurrentVersion &&
      data.privacyVersion === data.privacyCurrentVersion
    );
  }

  function ensureDialog() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "qm-first-login-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <section class="qm-first-login-dialog" role="dialog" aria-modal="true" aria-labelledby="qmFirstLoginTitle" aria-describedby="qmFirstLoginIntro">
        <header class="qm-first-login-header">
          <p class="qm-first-login-kicker">Before you continue</p>
          <h2 class="qm-first-login-title" id="qmFirstLoginTitle">Privacy and communication</h2>
        </header>
        <form class="qm-first-login-body" data-role="qm-first-login-form">
          <p class="qm-first-login-copy" id="qmFirstLoginIntro">QUANTUM stores essential private account data to provide sign-in, study progress, saved exercises, assessments, and learning rewards. Optional email updates are a separate choice.</p>
          <details class="qm-first-login-details">
            <summary>Terms summary</summary>
            <p>Use QUANTUM as educational support and verify automatically generated exercises and solutions. Content may evolve as reviewed chapters are published.</p>
          </details>
          <details class="qm-first-login-details">
            <summary>Privacy summary</summary>
            <p>Account identity and private learning records are used only to operate the learning experience. They are not sold or used for personalized advertising. You may request correction or deletion by contacting marioreis@id.uff.br.</p>
          </details>
          <label class="qm-first-login-option">
            <input type="checkbox" name="accept" required>
            <span>I have read and acknowledge the current Terms and Privacy information for QUANTUM.</span>
          </label>
          <label class="qm-first-login-option qm-first-login-option--optional">
            <input type="checkbox" name="email">
            <span>Send me optional updates about QUANTUM.</span>
          </label>
          <p class="qm-first-login-note">Optional updates are off by default. You can change this choice later in Personal Area → Privacy and communication.</p>
          <p class="qm-first-login-status" data-role="qm-first-login-status" role="status" aria-live="polite"></p>
          <div class="qm-first-login-actions">
            <button class="qm-first-login-button qm-first-login-button--primary" type="submit">Save and continue</button>
            <button class="qm-first-login-button" type="button" data-role="qm-first-login-signout">Sign out</button>
          </div>
        </form>
      </section>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") return;
      const controls = Array.from(overlay.querySelectorAll('button:not([disabled]), input:not([disabled]), summary, [href], [tabindex]:not([tabindex="-1"])'));
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const form = overlay.querySelector('[data-role="qm-first-login-form"]');
    form.addEventListener("submit", submitPreferences);
    form.querySelector('[data-role="qm-first-login-signout"]').addEventListener("click", signOut);
    return overlay;
  }

  function openDialog() {
    const node = ensureDialog();
    if (node.classList.contains("is-open")) return;
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.classList.add("is-open");
    node.setAttribute("aria-hidden", "false");
    window.setTimeout(function () {
      node.querySelector('input[name="accept"]')?.focus();
    }, 0);
  }

  function closeDialog() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousOverflow;
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }

  async function submitPreferences(event) {
    event.preventDefault();
    if (!currentSession?.access_token) return;
    const form = event.currentTarget;
    const status = form.querySelector('[data-role="qm-first-login-status"]');
    const submit = form.querySelector('button[type="submit"]');
    if (!form.elements.accept.checked) {
      status.textContent = "Please acknowledge the current Terms and Privacy information first.";
      form.elements.accept.focus();
      return;
    }
    submit.disabled = true;
    status.textContent = "Saving your choices...";
    const response = await fetch("/api/qm-legal-preferences", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + currentSession.access_token
      },
      body: JSON.stringify({
        acceptDocuments: true,
        emailUpdatesOptedIn: Boolean(form.elements.email.checked)
      })
    }).catch(function () { return null; });
    submit.disabled = false;
    if (!response?.ok) {
      status.textContent = "Your choices could not be saved. Please try again.";
      return;
    }
    status.textContent = "Preferences saved.";
    closeDialog();
    window.dispatchEvent(new CustomEvent("qm-legal-preferences-change"));
  }

  async function signOut() {
    const status = overlay?.querySelector('[data-role="qm-first-login-status"]');
    if (status) status.textContent = "Signing out...";
    const client = await window.TermoAuth?.ensureSupabase?.().catch(function () { return null; });
    if (!client) {
      if (status) status.textContent = "Could not sign out. Please try again.";
      return;
    }
    const result = await client.auth.signOut({ scope: "local" }).catch(function () { return { error: true }; });
    if (result?.error) {
      if (status) status.textContent = "Could not sign out. Please try again.";
      return;
    }
    closeDialog();
  }

  async function inspectSession(session) {
    currentSession = session || null;
    const userId = String(session?.user?.id || "");
    const token = ++requestToken;
    if (!userId || !session?.access_token) {
      activeUserId = "";
      closeDialog();
      return;
    }
    activeUserId = userId;
    const response = await fetch("/api/qm-legal-preferences", {
      headers: { Authorization: "Bearer " + session.access_token }
    }).catch(function () { return null; });
    if (token !== requestToken || activeUserId !== userId) return;
    if (!response?.ok) {
      openDialog();
      const status = overlay?.querySelector('[data-role="qm-first-login-status"]');
      if (status) status.textContent = "Your current preferences could not be loaded. Retry by saving your choices below.";
      return;
    }
    const data = await response.json().catch(function () { return null; });
    if (documentsAccepted(data)) {
      closeDialog();
      return;
    }
    openDialog();
  }

  function boot() {
    window.addEventListener("termo-auth-state-change", function (event) {
      void inspectSession(event.detail?.session || null);
    });
    let attempts = 0;
    const timer = window.setInterval(async function () {
      attempts += 1;
      if (window.TermoAuth?.getSession) {
        window.clearInterval(timer);
        const session = await window.TermoAuth.getSession().catch(function () { return null; });
        void inspectSession(session);
      } else if (attempts >= 40) {
        window.clearInterval(timer);
      }
    }, 100);
  }

  window.QMFirstLoginPreferences = { inspectSession, documentsAccepted };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
