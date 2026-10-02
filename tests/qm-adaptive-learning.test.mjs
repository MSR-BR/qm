import assert from "node:assert/strict";
import test from "node:test";
import { applyOptionalAiRanking, conceptGraphContract, deriveChapterMastery, deriveConceptStates, selectDailyChallenge } from "../lib/qm-adaptive-engine.mjs";
import { catalogContractRows, getQuiz, publicQuiz } from "../lib/qm-chapter-quiz-catalog.mjs";

const base = { concept_id: "classical-wave-benchmark", correct: true, hint_level: 0, solution_revealed: false, confidence: "high" };

test("reviewed catalog has three checkpoints and one changed representation per chapter", function () {
  const rows = catalogContractRows();
  assert.equal(rows.length, 42);
  for (const chapterId of ["01", "02", "03", "04", "05", "06", "07"]) {
    assert.equal(rows.filter(row => row.chapterId === chapterId && row.mode === "assessment").length, 3);
    assert.equal(rows.filter(row => row.chapterId === chapterId && row.mode === "retry").length, 3);
  }
  const publicValue = JSON.stringify(publicQuiz(getQuiz("01")));
  assert.doesNotMatch(publicValue, /"correct"|"explanation"|"hintLadder"/);
});

test("one success, one session or one representation never becomes mastery", function () {
  const one = deriveConceptStates([{ ...base, session_id: "s1", representation: "conceptual_recognition", occurred_at: "2026-09-20T10:00:00Z" }], "2026-09-26T10:00:00Z")
    .find(item => item.concept_id === base.concept_id);
  assert.notEqual(one.status, "mastered");
  const sameSession = deriveConceptStates([
    { ...base, session_id: "s1", representation: "conceptual_recognition", occurred_at: "2026-09-20T10:00:00Z" },
    { ...base, session_id: "s1", representation: "relation_transfer", occurred_at: "2026-09-22T10:00:00Z" }
  ], "2026-09-26T10:00:00Z").find(item => item.concept_id === base.concept_id);
  assert.notEqual(sameSession.status, "mastered");
  const sameForm = deriveConceptStates([
    { ...base, session_id: "s1", representation: "conceptual_recognition", occurred_at: "2026-09-20T10:00:00Z" },
    { ...base, session_id: "s2", representation: "conceptual_recognition", occurred_at: "2026-09-22T10:00:00Z" }
  ], "2026-09-26T10:00:00Z").find(item => item.concept_id === base.concept_id);
  assert.notEqual(sameForm.status, "mastered");
});

test("delayed unaided changed-form retrieval can satisfy one concept but not a whole chapter", function () {
  const states = deriveConceptStates([
    { ...base, session_id: "s1", representation: "conceptual_recognition", occurred_at: "2026-09-20T10:00:00Z" },
    { ...base, session_id: "s2", representation: "relation_transfer", occurred_at: "2026-09-22T10:00:00Z" }
  ], "2026-09-26T10:00:00Z");
  assert.equal(states.find(item => item.concept_id === base.concept_id).status, "mastered");
  assert.equal(deriveChapterMastery(states).find(item => item.chapter_id === "01").status, "insufficient_evidence");
});

test("Daily Challenge selects only completed reviewed sources and exposes an alternative", function () {
  const plan = selectDailyChallenge({ conceptStates: [], completedSectionIds: ["1.2", "1.6", "1.11"], generatedAt: "2026-09-26T10:00:00Z" });
  assert.equal(plan.status, "available");
  assert.equal(plan.questions.length, 3);
  assert.ok(plan.questions.every(question => ["1.2", "1.6", "1.11"].includes(question.reviewItem)));
  assert.equal(plan.alternative, "/index.html?view=chapters");
  assert.equal(selectDailyChallenge({ completedSectionIds: ["1.2"] }).status, "insufficient_studied_content");
});

test("optional AI may reorder eligible actions but cannot introduce a new action", function () {
  const eligible = [{ id: "review" }, { id: "read" }];
  const ranked = applyOptionalAiRanking(eligible, ["forged", "read"], { provider: "example", model: "example", policyVersion: "v1" });
  assert.deepEqual(ranked.actions.map(item => item.id), ["read", "review"]);
  assert.equal(applyOptionalAiRanking(eligible, ["read"], null).route, "deterministic_fallback");
});

test("concept graph is versioned and covers all seven reviewed chapters", function () {
  const graph = conceptGraphContract();
  assert.equal(graph.version, "qm-concept-graph-2026-09-26.1");
  assert.deepEqual(Object.keys(graph.assessmentCoverage), ["01", "02", "03", "04", "05", "06", "07"]);
  assert.ok(graph.nodes.every(node => node.sections.length > 0 && node.sections.every(section => section.sourceIds.length > 0)));
});
