(function () {
  const content = document.querySelector("#content");
  const chapterSelect = document.querySelector("#chapter");
  const loadButton = document.querySelector("#load");
  const pageStatus = document.querySelector("#pageStatus");
  let quiz = null;
  let result = null;
  let submitting = false;
  let reporting = false;
  let attemptMeta = null;
  let attemptAction = "assessment";
  let remediationCycleId = null;
  const sessionId = crypto.randomUUID();

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character];
    });
  }

  function trackAssessmentEvent(name, properties) {
    const analytics = window.QMAnalytics || window.QmAnalytics;
    if (analytics && typeof analytics.track === "function") analytics.track(name, properties || {});
  }

  function setPageStatus(message) {
    pageStatus.textContent = message || "";
  }

  function setSubmitStatus(message) {
    const status = document.querySelector("#assessmentStatus");
    if (status) status.textContent = message || "";
  }

  async function typeset(root) {
    if (!window.MathJax || typeof window.MathJax.typesetPromise !== "function") return;
    try {
      if (typeof window.MathJax.typesetClear === "function") window.MathJax.typesetClear([root]);
      await window.MathJax.typesetPromise([root]);
    } catch (error) {
      console.warn("Could not render assessment mathematics.", error);
    }
  }

  function renderQuiz(nextQuiz, options) {
    quiz = nextQuiz;
    result = null;
    attemptMeta = null;
    attemptAction = options?.action || "assessment";
    remediationCycleId = options?.cycleId || null;
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    content.innerHTML = `
      <section class="assessment-card" aria-labelledby="quizTitle">
        <div class="assessment-card__head">
          <h2 id="quizTitle">${escapeHtml(quiz.title)}</h2>
          <span class="assessment-progress">${questions.length} ${questions.length === 1 ? "question" : "questions"}</span>
        </div>
        <form id="assessmentForm">
          ${questions.map(function (question, index) {
            return `
              <fieldset class="assessment-question">
                <legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>
                ${Object.entries(question.options).map(function ([key, value]) {
                  return `<label class="assessment-option"><input required type="radio" name="${escapeHtml(question.questionId)}" value="${escapeHtml(key)}"><span><strong>${escapeHtml(key.toUpperCase())}.</strong> ${escapeHtml(value)}</span></label>`;
                }).join("")}
                <label class="assessment-confidence">Confidence before feedback
                  <select required name="confidence:${escapeHtml(question.questionId)}">
                    <option value="">Choose</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </label>
                <a class="assessment-source" href="${escapeHtml(question.reviewPath)}" target="_blank" rel="noopener noreferrer">Review source: ${escapeHtml(question.reviewTitle)}</a>
              </fieldset>
            `;
          }).join("")}
          <div class="assessment-submit-row">
            <button class="assessment-button assessment-button--primary" type="submit"><i class="fa-solid fa-check" aria-hidden="true"></i> Submit assessment</button>
            <p class="assessment-submit-status" id="assessmentStatus" role="status" aria-live="polite"></p>
          </div>
        </form>
      </section>
    `;
    content.querySelector("#assessmentForm").addEventListener("submit", submitAssessment);
    void typeset(content);
  }

  async function loadAssessment() {
    if (loadButton.disabled) return;
    loadButton.disabled = true;
    setPageStatus("Loading assessment...");
    try {
      const response = await fetch("/api/qm-chapter-quiz?chapterId=" + encodeURIComponent(chapterSelect.value));
      const data = await response.json().catch(function () { return {}; });
      if (!response.ok || !data.quiz) {
        setPageStatus(data.error || "Assessment service is unavailable. Please try again.");
        return;
      }
      renderQuiz(data.quiz);
      setPageStatus("");
      trackAssessmentEvent("assessment_start", {
        chapter_id: data.quiz.chapterId,
        question_count: Array.isArray(data.quiz.questions) ? data.quiz.questions.length : 0
      });
      content.querySelector("input")?.focus();
    } catch (error) {
      setPageStatus("Assessment service is unavailable. Please try again.");
    } finally {
      loadButton.disabled = false;
    }
  }

  async function submitAssessment(event) {
    event.preventDefault();
    if (submitting || !quiz) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const session = await window.TermoAuth?.getSession?.().catch(function () { return null; });
    if (!session?.access_token) {
      setSubmitStatus("Please sign in with Google before submitting.");
      window.TermoAuth?.openModal?.();
      return;
    }
    const formData = new FormData(form);
    const answers = quiz.questions.map(function (question) {
      return { questionId: question.questionId, choice: formData.get(question.questionId), confidence: formData.get("confidence:" + question.questionId) };
    });
    const submitButton = form.querySelector('button[type="submit"]');
    submitting = true;
    submitButton.disabled = true;
    setSubmitStatus("Submitting assessment...");
    try {
      const response = await fetch("/api/qm-chapter-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ chapterId: quiz.chapterId, action: attemptAction, cycleId: remediationCycleId,
          sessionId: sessionId, idempotencyKey: crypto.randomUUID(), answers })
      });
      const data = await response.json().catch(function () { return {}; });
      if (!response.ok || !data.result) {
        setSubmitStatus(data.error || "Could not submit the assessment. Please try again.");
        return;
      }
      result = data.result;
      attemptMeta = data.attempt || null;
      trackAssessmentEvent("assessment_complete", {
        chapter_id: quiz.chapterId,
        question_count: quiz.questions.length,
        correct_count: result.correctCount,
        score_percent: Number(result.score || 0)
      });
      renderResult();
    } catch (error) {
      setSubmitStatus("Could not submit the assessment. Please try again.");
    } finally {
      submitting = false;
      if (submitButton.isConnected) submitButton.disabled = false;
    }
  }

  function renderResult() {
    const feedback = Array.isArray(result.feedback) ? result.feedback : [];
    const missed = feedback.filter(function (item) { return !item.correct; });
    const cycleId = attemptMeta?.remediation_cycle_id || remediationCycleId;
    content.innerHTML = `
      <section class="assessment-result" aria-labelledby="resultTitle">
        <p class="assessment-kicker">Assessment complete</p>
        <h2 id="resultTitle" tabindex="-1">${escapeHtml(result.score)}%</h2>
        <p>${escapeHtml(result.correctCount)} of ${escapeHtml(result.questionCount)} questions correct. ${attemptMeta?.xp_delta ? "+" + escapeHtml(attemptMeta.xp_delta) + " points were recorded. " : ""}A score alone is not mastery; mastery requires changed, delayed, unaided retrieval.</p>
        <div class="assessment-feedback">
          ${feedback.map(function (item, index) {
            return `<article class="assessment-feedback__item${item.correct ? " is-correct" : ""}">
              <h3>Question ${index + 1}: ${item.correct ? "Correct" : "Review recommended"}</h3>
              <p>${escapeHtml(item.explanation)}</p>
              ${item.correct ? "" : `<ol class="assessment-hint-ladder">${item.hintLadder.map(function (hint) { return `<li>${escapeHtml(hint)}</li>`; }).join("")}</ol>`}
              <a class="assessment-source" href="${escapeHtml(item.reviewPath)}">Open ${escapeHtml(item.reviewTitle)}</a>
            </article>`;
          }).join("")}
        </div>
        <div class="assessment-submit-row">
          ${missed.length && cycleId ? '<button class="assessment-button assessment-button--primary" type="button" id="completeReview"><i class="fa-solid fa-book-open" aria-hidden="true"></i> Complete guided review</button>' : '<button class="assessment-button assessment-button--primary" type="button" id="retryAssessment"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Start a new assessment</button>'}
          <button class="assessment-button" type="button" id="chooseAssessment">Choose another chapter</button>
          <p class="assessment-submit-status" id="reviewStatus" role="status" aria-live="polite"></p>
        </div>
        <details class="assessment-report">
          <summary>Report a possible assessment error</summary>
          <p>Send the complete assessment context to the private professor-review queue. Do not include personal information.</p>
          <div class="assessment-report__actions">
            <button class="assessment-button" id="reportAssessment" type="button">Report this assessment</button>
            <p class="assessment-report__status" id="reportStatus" role="status" aria-live="polite"></p>
          </div>
        </details>
      </section>
    `;
    content.querySelector("#retryAssessment")?.addEventListener("click", function () { void loadAssessment(); });
    content.querySelector("#completeReview")?.addEventListener("click", function () { void completeReview(cycleId); });
    content.querySelector("#chooseAssessment").addEventListener("click", function () { content.innerHTML = ""; chapterSelect.focus(); });
    content.querySelector("#reportAssessment").addEventListener("click", reportQuiz);
    content.querySelector("#resultTitle")?.focus?.();
    void typeset(content);
  }

  async function completeReview(cycleId) {
    const status = document.querySelector("#reviewStatus"); const button = document.querySelector("#completeReview");
    const session = await window.TermoAuth?.getSession?.().catch(function () { return null; });
    if (!session?.access_token) { status.textContent = "Please sign in first."; return; }
    button.disabled = true; status.textContent = "Recording guided review…";
    try {
      const saved = await fetch("/api/qm-chapter-quiz", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ chapterId: quiz.chapterId, action: "review", cycleId, highestHintLevel: 4, solutionRevealed: true }) });
      const review = await saved.json().catch(function () { return {}; });
      if (!saved.ok) throw new Error(review.error || "Could not save guided review.");
      status.textContent = review.review?.xp_delta ? "+" + review.review.xp_delta + " review points. Preparing a changed retry…" : "Review saved. Preparing a changed retry…";
      const retry = await fetch("/api/qm-chapter-quiz?action=retry&cycleId=" + encodeURIComponent(cycleId), { headers: { Authorization: "Bearer " + session.access_token }, cache: "no-store" });
      const data = await retry.json().catch(function () { return {}; });
      if (!retry.ok || !data.quiz) throw new Error(data.error || "Focused retry is unavailable.");
      renderQuiz(data.quiz, { action: "retry", cycleId }); content.querySelector("input")?.focus();
    } catch (error) { status.textContent = error.message; button.disabled = false; }
  }

  async function reportQuiz() {
    if (reporting || !quiz || !result) return;
    const status = document.querySelector("#reportStatus");
    const button = document.querySelector("#reportAssessment");
    const session = await window.TermoAuth?.getSession?.().catch(function () { return null; });
    if (!session?.access_token) {
      status.textContent = "Please sign in first.";
      window.TermoAuth?.openModal?.();
      return;
    }
    const reference = result.feedback.find(function (item) { return !item.correct; }) || result.feedback[0];
    const statement = quiz.questions.map(function (question) {
      return question.prompt + " " + Object.entries(question.options).map(function ([key, value]) { return key + ") " + value; }).join(" ");
    }).join("\n");
    const solution = result.feedback.map(function (item) { return item.explanation + " Review: " + item.reviewTitle; }).join("\n");
    reporting = true;
    button.disabled = true;
    status.textContent = "Sending report...";
    try {
      const response = await fetch("/api/exercicio-validacao", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({
          chapterId: quiz.chapterId,
          itemId: reference.reviewItem,
          pagePath: reference.reviewPath,
          pageUrl: reference.reviewPath,
          pageTitle: reference.reviewTitle,
          pageContent: quiz.title,
          difficulty: "medium",
          exerciseId: quiz.quizKey,
          exerciseTitle: quiz.title,
          statement,
          solution,
          statementStatus: "sim",
          solutionStatus: "nao_sei",
          statementNote: "Possible issue reported from chapter assessment. See the learner report context.",
          solutionNote: "",
          language: "en"
        })
      });
      const data = await response.json().catch(function () { return {}; });
      status.textContent = response.ok ? (data.summary || "Report sent.") : (data.error || "Could not send this report.");
    } catch (error) {
      status.textContent = "Could not send this report.";
    } finally {
      reporting = false;
      button.disabled = false;
    }
  }

  loadButton.addEventListener("click", loadAssessment);
})();
