import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Execute the shipped handler, not a rewritten approximation of its lock.
const source = readFileSync(new URL('../assets/qm-assessments.js', import.meta.url), 'utf8');
const submitSource = source.slice(source.indexOf('  async function submitAssessment(event)'), source.indexOf('  function renderResult()'));
function harness({ session, fetch } = {}) {
  const requests = [], messages = [];
  const button = { disabled: false, isConnected: true };
  const fieldset = { disabled: false };
  const form = { isConnected: true, valid: true, answer: 'a', reportValidity() { return this.valid; }, querySelector: () => button, querySelectorAll: () => [fieldset] };
  let uuid = 0, opened = 0, rendered = 0;
  const context = vm.createContext({
    quiz: { chapterId: '01', itemSetVersion: 'fixture', questions: [{ questionId: 'q1' }] },
    result: null, attemptMeta: null, pendingSubmission: null, submitting: false,
    attemptAction: 'assessment', remediationCycleId: null, sessionId: 'session',
    loadButton: { disabled: false }, chapterSelect: { disabled: false },
    FormData: class { constructor(f) { this.f = f; } get(name) { return name.startsWith('confidence:') ? 'high' : this.f.answer; } },
    window: { TermoAuth: { getSession: session || (async () => ({ user: { id: 'fixture-user' }, access_token: 'synthetic' })), openModal() { opened++; } } },
    crypto: { randomUUID: () => `key-${++uuid}` },
    setSubmitStatus: message => messages.push(message), trackAssessmentEvent() {},
    renderResult() { rendered++; form.isConnected = false; button.isConnected = false; },
    fetch: async (url, options) => {
      requests.push(JSON.parse(options.body));
      return fetch ? fetch(url, options) : { ok: true, json: async () => ({ result: { correctCount: 1, score: 100 }, attempt: { xp_delta: 30 } }) };
    }
  });
  vm.runInContext(submitSource + '\nthis.submit = submitAssessment;', context);
  return { context, form, button, fieldset, requests, messages, submit: () => context.submit({ preventDefault() {}, currentTarget: form }), get opened() { return opened; }, get rendered() { return rendered; } };
}
test('rapid submit while authentication is pending sends one request and renders once', async () => {
  let release;
  const h = harness({ session: () => new Promise(resolve => { release = resolve; }) });
  const first = h.submit();
  assert.equal(h.button.disabled, true);
  assert.equal(h.context.loadButton.disabled, true);
  await h.submit();
  assert.equal(h.requests.length, 0);
  release({ user: { id: 'fixture-user' }, access_token: 'synthetic' });
  await first;
  await h.submit(); // stale event after success must not submit again
  assert.equal(h.requests.length, 1);
  assert.equal(h.rendered, 1);
  assert.equal(h.context.submitting, false);
});
for (const failure of ['network', '503', 'invalid-json']) {
  test(`uncertain ${failure} response preserves key and answers for exact replay`, async () => {
    let calls = 0;
    const h = harness({ fetch: async () => {
      if (++calls === 1) {
        if (failure === 'network') throw Error('lost response after commit');
        if (failure === 'invalid-json') return { ok: true, json: async () => { throw Error('truncated'); } };
        return { ok: false, json: async () => ({ error: 'Retry' }) };
      }
      return { ok: true, json: async () => ({ result: { score: 100, correctCount: 1 }, attempt: { deduped: true, xp_delta: 0 } }) };
    } });
    await h.submit();
    assert.equal(h.button.disabled, false);
    assert.equal(h.fieldset.disabled, true);
    h.form.answer = 'b'; // even a scripted edit cannot mutate the replay
    await h.submit();
    assert.deepEqual(h.requests[1], h.requests[0]);
    assert.equal(h.rendered, 1);
  });
}
test('missing/rejected auth and invalid form unlock without sending evidence', async () => {
  for (const session of [async () => null, async () => { throw Error('auth unavailable'); }]) {
    const h = harness({ session });
    await h.submit();
    assert.equal(h.requests.length, 0);
    assert.equal(h.context.submitting, false);
    assert.equal(h.button.disabled, false);
    assert.equal(h.context.loadButton.disabled, false);
  }
  const h = harness(); h.form.valid = false;
  await h.submit(); assert.equal(h.requests.length, 0);
});
test('an uncertain submission cannot be replayed under another signed-in account', async () => {
  const h = harness({ fetch: async () => { throw Error('lost'); } });
  await h.submit();
  h.context.window.TermoAuth.getSession = async () => ({ user: { id: 'other-user' }, access_token: 'synthetic-other' });
  await h.submit();
  assert.equal(h.requests.length, 1);
  assert.match(h.messages.at(-1), /another sign-in/);
  assert.equal(h.context.submitting, false);
});
test('starting another quiz resets pending request, but cannot race an active submit', () => {
  assert.match(source, /function renderQuiz\(nextQuiz, options\)\s*\{\s*quiz = nextQuiz;\s*pendingSubmission = null;/);
  assert.match(source, /if \(submitting \|\| loadButton.disabled\) return;/);
});
