(function () {
  const content = document.querySelector("#content"); const status = document.querySelector("#pageStatus"); const load = document.querySelector("#loadChallenge");
  let challenge = null; let sessionId = null;
  const esc = value => String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
  async function session() { await window.TermoAuth?.whenReady?.(5000).catch(() => null); return window.TermoAuth?.getSession?.().catch(() => null); }
  async function request(body) {
    const current = await session(); if (!current?.access_token) { window.TermoAuth?.openModal?.(); throw new Error("Sign in to use the Daily Challenge."); }
    const response = await fetch("/api/qm-adaptive-learning", { method: body ? "POST" : "GET", cache: "no-store",
      headers: { ...(body ? { "Content-Type":"application/json" } : {}), Authorization: "Bearer " + current.access_token }, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Daily Challenge unavailable."); return data;
  }
  function confidence(question) { return `<label class="assessment-confidence">Confidence before feedback <select required name="confidence:${esc(question.questionId)}"><option value="">Choose</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>`; }
  function render() {
    if (challenge.status !== "available") { content.innerHTML = `<section class="assessment-card"><h2>Not enough studied material yet</h2><p>${esc(challenge.explanation)}</p><a class="assessment-button assessment-button--primary" href="${esc(challenge.alternative)}">Open reviewed chapters</a></section>`; return; }
    content.innerHTML = `<section class="assessment-card"><div class="assessment-card__head"><h2>Chapter ${Number(challenge.chapterId)} retrieval</h2><span class="assessment-progress">about ${Number(challenge.expectedMinutes)} minutes</span></div><form id="dailyForm">${challenge.questions.map((q,i)=>`<fieldset class="assessment-question"><legend>${i+1}. ${esc(q.prompt)}</legend><p class="assessment-rationale"><strong>Why now:</strong> ${esc(q.selectionReason)}</p>${Object.entries(q.options).map(([key,value])=>`<label class="assessment-option"><input required type="radio" name="${esc(q.questionId)}" value="${esc(key)}"><span><strong>${key.toUpperCase()}.</strong> ${esc(value)}</span></label>`).join("")}${confidence(q)}<div class="assessment-hints"><button class="assessment-button" type="button" data-hint="${esc(q.questionId)}" data-level="1">Show orienting hint</button><p data-hint-copy="${esc(q.questionId)}" role="status"></p></div><a class="assessment-source" href="${esc(q.reviewPath)}">Reviewed source: ${esc(q.reviewTitle)}</a></fieldset>`).join("")}<div class="assessment-submit-row"><button class="assessment-button assessment-button--primary" type="submit">Submit retrieval</button><p id="dailyStatus" role="status"></p></div></form></section>`;
    content.querySelectorAll("[data-hint]").forEach(button => button.addEventListener("click", revealHint)); content.querySelector("#dailyForm").addEventListener("submit", submit);
  }
  async function revealHint(event) {
    const button=event.currentTarget; button.disabled=true;
    try { const data=await request({action:"hint",issueId:challenge.issueId,questionId:button.dataset.hint,level:Number(button.dataset.level)}); content.querySelector(`[data-hint-copy="${CSS.escape(button.dataset.hint)}"]`).textContent=data.hint.text; if (data.hint.level<4) { button.dataset.level=String(data.hint.level+1); button.textContent=data.hint.level===3?"Show worked support":"Show next hint"; button.disabled=false; } else button.textContent="Worked support shown"; }
    catch(error) { status.textContent=error.message; button.disabled=false; }
  }
  async function submit(event) {
    event.preventDefault(); const form=event.currentTarget; if(!form.reportValidity()) return; const data=new FormData(form);
    const answers=challenge.questions.map(q=>({questionId:q.questionId,choice:data.get(q.questionId),confidence:data.get("confidence:"+q.questionId)})); const button=form.querySelector('[type="submit"]'); button.disabled=true;
    try { const result=await request({action:"submit_daily",issueId:challenge.issueId,sessionId,idempotencyKey:crypto.randomUUID(),answers}); content.innerHTML=`<section class="assessment-result"><p class="assessment-kicker">Retrieval complete</p><h2>${Number(result.result.score)}%</h2><p>${Number(result.result.correctCount)} of ${Number(result.result.questionCount)} correct. This adds evidence, not an instant mastery label. Daily Challenge awards no extra points.</p><div class="assessment-feedback">${result.result.feedback.map(item=>`<article class="assessment-feedback__item${item.correct?" is-correct":""}"><h3>${item.correct?"Correct retrieval":"Review recommended"}</h3><p>${esc(item.explanation)}</p><a class="assessment-source" href="${esc(item.reviewPath)}">Open ${esc(item.reviewTitle)}</a></article>`).join("")}</div><a class="assessment-button assessment-button--primary" href="index.html?view=journey">Return to Study journey</a></section>`; }
    catch(error) { document.querySelector("#dailyStatus").textContent=error.message; button.disabled=false; }
  }
  async function loadChallenge() { load.disabled=true; status.textContent="Preparing reviewed retrieval…"; try { const data=await request(); challenge=data.challenge; sessionId=crypto.randomUUID(); status.textContent=""; render(); } catch(error) { status.textContent=error.message; } finally { load.disabled=false; } }
  load.addEventListener("click", loadChallenge);
})();
