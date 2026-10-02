import { readFileSync } from "node:fs";
import { dailyQuestionPool } from "./qm-chapter-quiz-catalog.mjs";

const config = JSON.parse(readFileSync(new URL("../data/qm-learning-concept-graph.v1.json", import.meta.url)));
const taxonomy = JSON.parse(readFileSync(new URL("../data/book-topic-taxonomy.json", import.meta.url)));
const manifest = JSON.parse(readFileSync(new URL("../data/qm-exercise-source-manifest.json", import.meta.url)));

const manifestBySection = new Map(manifest.entries.map(entry => [entry.sectionId, entry]));
const labels = new Map(taxonomy.transversalTopics.map(entry => [entry.id, entry.label]));

export function buildConceptGraph() {
  const nodes = new Map();
  for (const section of taxonomy.sectionTopics) {
    const source = manifestBySection.get(section.sectionId);
    if (!source || !manifest.eligibleChapters.includes(section.chapterId) || source.needsReview) continue;
    const conceptId = section.primaryTopic;
    const existing = nodes.get(conceptId) || {
      id: conceptId,
      label: labels.get(conceptId) || section.title,
      chapterIds: [],
      sections: [],
      prerequisites: [],
      representations: [...config.representations]
    };
    if (!existing.chapterIds.includes(section.chapterId)) existing.chapterIds.push(section.chapterId);
    existing.sections.push({
      chapterId: section.chapterId,
      sectionId: section.sectionId,
      title: section.title,
      contentId: source.pagePath,
      sourceIds: source.canonicalReference.references.map(reference => reference.id)
    });
    nodes.set(conceptId, existing);
  }
  for (const [prerequisite, target] of config.prerequisiteEdges) {
    const node = nodes.get(target);
    if (node && nodes.has(prerequisite) && !node.prerequisites.includes(prerequisite)) node.prerequisites.push(prerequisite);
  }
  return {
    version: config.version,
    policyVersion: config.policyVersion,
    nodes: [...nodes.values()].sort((left, right) => left.id.localeCompare(right.id)),
    assessmentCoverage: config.assessmentCoverage,
    masteryRules: config.masteryRules
  };
}

const graph = buildConceptGraph();
const nodeById = new Map(graph.nodes.map(node => [node.id, node]));

function timestamp(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : null;
}

function addDays(value, days) {
  return new Date(value + days * 86400000).toISOString();
}

function separateDelayedSuccesses(events) {
  const successful = events.filter(event => event.correct === true && Number(event.hint_level || 0) === 0 && !event.solution_revealed);
  for (let left = 0; left < successful.length; left += 1) {
    for (let right = left + 1; right < successful.length; right += 1) {
      const first = timestamp(successful[left].occurred_at);
      const second = timestamp(successful[right].occurred_at);
      if (first !== null && second !== null && Math.abs(second - first) >= graph.masteryRules.minimumDelayHours * 3600000
        && successful[left].session_id !== successful[right].session_id) return true;
    }
  }
  return false;
}

export function deriveConceptStates(attemptItems = [], generatedAt = new Date().toISOString()) {
  const now = timestamp(generatedAt) ?? Date.now();
  const grouped = new Map();
  for (const event of attemptItems) {
    if (!nodeById.has(event.concept_id)) continue;
    const list = grouped.get(event.concept_id) || [];
    list.push(event);
    grouped.set(event.concept_id, list);
  }

  return graph.nodes.map(node => {
    const events = (grouped.get(node.id) || []).slice().sort((left, right) => (timestamp(left.occurred_at) || 0) - (timestamp(right.occurred_at) || 0));
    if (!events.length) {
      return {
        concept_id: node.id,
        label: node.label,
        chapter_ids: node.chapterIds,
        prerequisites: node.prerequisites,
        status: "insufficient_evidence",
        due_at: null,
        evidence_count: 0,
        correct_count: 0,
        unaided_correct_count: 0,
        separate_sessions: 0,
        representations: [],
        delayed_retrieval: false,
        source: node.sections[0] || null
      };
    }
    const last = events.at(-1);
    const unaided = events.filter(event => event.correct === true && Number(event.hint_level || 0) === 0 && !event.solution_revealed);
    const sessions = new Set(unaided.map(event => event.session_id).filter(Boolean));
    const representations = new Set(unaided.map(event => event.representation).filter(Boolean));
    const delayed = separateDelayedSuccesses(events);
    const mastered = unaided.length >= graph.masteryRules.minimumUnaidedCorrect
      && sessions.size >= graph.masteryRules.minimumSeparateSessions
      && representations.size >= graph.masteryRules.minimumRepresentations
      && delayed;
    const lastAt = timestamp(last.occurred_at) || now;
    let intervalDays = 1;
    if (last.correct && Number(last.hint_level || 0) === 0 && !last.solution_revealed && last.confidence === "high") {
      intervalDays = mastered ? 14 : 3;
    }
    const dueAt = addDays(lastAt, intervalDays);
    const weak = !last.correct || Boolean(last.solution_revealed);
    const due = Date.parse(dueAt) <= now;
    return {
      concept_id: node.id,
      label: node.label,
      chapter_ids: node.chapterIds,
      prerequisites: node.prerequisites,
      status: mastered ? "mastered" : weak ? "needs_review" : due ? "due" : "developing",
      due_at: dueAt,
      evidence_count: events.length,
      correct_count: events.filter(event => event.correct).length,
      unaided_correct_count: unaided.length,
      separate_sessions: sessions.size,
      representations: [...representations],
      delayed_retrieval: delayed,
      last_outcome: weak ? "needs_review" : last.confidence === "low" ? "low_confidence_correct" : "correct",
      source: node.sections[0] || null
    };
  });
}

export function deriveChapterMastery(conceptStates) {
  const byId = new Map(conceptStates.map(state => [state.concept_id, state]));
  return Object.entries(graph.assessmentCoverage).map(([chapterId, conceptIds]) => {
    const covered = conceptIds.filter(conceptId => byId.get(conceptId)?.status === "mastered");
    return {
      chapter_id: chapterId,
      status: covered.length === conceptIds.length ? "mastered" : "insufficient_evidence",
      mastered_concepts: covered.length,
      required_concepts: conceptIds.length
    };
  });
}

function stableNumber(value) {
  let hash = 2166136261;
  for (const character of String(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

export function selectDailyChallenge({ conceptStates = [], completedSectionIds = [], generatedAt = new Date().toISOString(), itemCount = 3 } = {}) {
  const completed = new Set(completedSectionIds);
  const states = new Map(conceptStates.map(state => [state.concept_id, state]));
  const pool = dailyQuestionPool().filter(question => completed.has(question.reviewItem));
  const concepts = [...new Set(pool.map(question => question.conceptId))];
  const scored = concepts.map(conceptId => {
    const state = states.get(conceptId);
    const missingPrerequisite = (state?.prerequisites || []).some(prerequisite => {
      const prerequisiteState = states.get(prerequisite);
      return prerequisiteState && prerequisiteState.status !== "mastered" && prerequisiteState.evidence_count > 0;
    });
    let score = 35;
    let reason = "Interleave a reviewed concept you have studied.";
    if (state?.status === "needs_review") { score = 100; reason = "A recent error or solution reveal makes this concept a priority for a changed retrieval."; }
    else if (missingPrerequisite) { score = 85; reason = "A prerequisite needs attention before a harder target."; }
    else if (state?.evidence_count > 0 && !state.delayed_retrieval) { score = 70; reason = "You have succeeded before, but not yet after a separate-session delay."; }
    else if (state?.status === "due") { score = 60; reason = "This reviewed concept is due for maintenance retrieval."; }
    else if (!state || state.evidence_count === 0) { score = 45; reason = "You studied the source but have not yet produced retrieval evidence."; }
    return { conceptId, state, score, reason };
  });
  scored.sort((left, right) => right.score - left.score || stableNumber(`${generatedAt.slice(0, 10)}:${left.conceptId}`) - stableNumber(`${generatedAt.slice(0, 10)}:${right.conceptId}`));

  const selectedConcepts = [];
  const weak = scored.filter(entry => entry.score >= 85).slice(0, Math.max(1, itemCount - 1));
  selectedConcepts.push(...weak);
  for (const entry of scored) {
    if (selectedConcepts.length >= itemCount) break;
    if (!selectedConcepts.some(selected => selected.conceptId === entry.conceptId)) selectedConcepts.push(entry);
  }

  const questions = selectedConcepts.map(entry => {
    const candidates = pool.filter(question => question.conceptId === entry.conceptId);
    const previousRepresentations = new Set(entry.state?.representations || []);
    const preferred = candidates.find(question => !previousRepresentations.has(question.representation)) || candidates[stableNumber(`${generatedAt.slice(0, 10)}:${entry.conceptId}`) % candidates.length];
    return { ...preferred, selection_reason: entry.reason };
  });
  return {
    status: questions.length >= itemCount ? "available" : "insufficient_studied_content",
    questions,
    expected_minutes: Math.max(5, Math.min(10, questions.length * 2)),
    alternative: "/index.html?view=chapters"
  };
}

export function applyOptionalAiRanking(eligibleActions, proposal, provenance) {
  if (!Array.isArray(proposal) || !provenance?.provider || !provenance?.model || !provenance?.policyVersion) {
    return { actions: eligibleActions, route: "deterministic_fallback", provenance: null };
  }
  const byId = new Map(eligibleActions.map(action => [action.id, action]));
  const ordered = proposal.map(id => byId.get(id)).filter(Boolean);
  for (const action of eligibleActions) if (!ordered.includes(action)) ordered.push(action);
  return { actions: ordered, route: "source_constrained_ai_rank", provenance };
}

export function conceptGraphContract() {
  return graph;
}
