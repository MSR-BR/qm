import assert from "node:assert/strict";
import test from "node:test";
import { handleExerciseRequest } from "../lib/exercicio-handler.mjs";

const exerciseBody = {
  chapterId: "01",
  itemId: "1.1",
  pagePath: "slides/chapter-01/wave-optics.html",
  pageTitle: "Wave optics",
  pageContent: "Interference is a classical wave phenomenon."
};

const validExercise = {
  candidates: [{
    content: {
      parts: [{ text: JSON.stringify({
        title: "Concept check",
        statement: "Describe constructive interference in words.",
        solution: "Coherent waves reinforce one another."
      }) }]
    }
  }]
};

function mockGemini(t, responses) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/[^/]+:generateContent$/);
    const response = responses.shift();
    assert.ok(response, "Unexpected Gemini request");
    calls.push({ url: String(url), body: JSON.parse(options.body) });
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.body
    };
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  return calls;
}

async function generateWith(model) {
  return handleExerciseRequest({
    method: "POST",
    body: exerciseBody,
    env: { GEMINI_API_KEY: "fake-test-key", GEMINI_MODEL: model }
  });
}

test("Gemini 3.8 omits deprecated sampling and unsupported thinking controls", async (t) => {
  const calls = mockGemini(t, [{ status: 200, body: validExercise }]);
  const result = await generateWith("gemini-3.8-flash");
  assert.equal(result.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.generationConfig.responseMimeType, "application/json");
  assert.deepEqual(Object.keys(calls[0].body.generationConfig), ["responseMimeType"]);
});

test("moving Flash alias omits sampling controls", async (t) => {
  const calls = mockGemini(t, [{ status: 200, body: validExercise }]);
  const result = await generateWith("gemini-flash-latest");
  assert.equal(result.status, 200);
  assert.deepEqual(Object.keys(calls[0].body.generationConfig), ["responseMimeType"]);
});

test("fixed Gemini 2.5 retains its established sampling behavior", async (t) => {
  const calls = mockGemini(t, [{ status: 200, body: validExercise }]);
  const result = await generateWith("gemini-2.5-flash");
  assert.equal(result.status, 200);
  assert.equal(calls[0].body.generationConfig.temperature, 0.7);
  assert.equal(calls[0].body.generationConfig.responseMimeType, "application/json");
});

test("unset model still defaults to Gemini 2.5 with its prior temperature", async (t) => {
  const calls = mockGemini(t, [{ status: 200, body: validExercise }]);
  const result = await generateWith(undefined);
  assert.equal(result.status, 200);
  assert.match(calls[0].url, /gemini-2\.5-flash:generateContent$/);
  assert.equal(calls[0].body.generationConfig.temperature, 0.7);
});

test("simulated 400 on a newer model falls back once to Gemini 2.5", async (t) => {
  const calls = mockGemini(t, [
    { status: 400, body: { error: { status: "INVALID_ARGUMENT" } } },
    { status: 200, body: validExercise }
  ]);
  const result = await generateWith("gemini-3.8-flash");
  assert.equal(result.status, 200);
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /gemini-3\.8-flash:generateContent$/);
  assert.equal(calls[0].body.generationConfig.temperature, undefined);
  assert.match(calls[1].url, /gemini-2\.5-flash:generateContent$/);
  assert.equal(calls[1].body.generationConfig.temperature, 0.7);
});

test("simulated 400 from both models is returned without another request", async (t) => {
  const calls = mockGemini(t, [
    { status: 400, body: { error: { status: "INVALID_ARGUMENT" } } },
    { status: 400, body: { error: { status: "INVALID_ARGUMENT" } } }
  ]);
  const result = await generateWith("gemini-3.8-flash");
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Error returned by the Gemini API.");
  assert.equal(calls.length, 2);
});
