// Shared offline contract helpers. These are not an event-ingestion or award API.
// The host must authenticate, validate evidence and transact in C29/C30.
export function classifyEvent(eventMap, channel, name) {
  const entry = eventMap.events.find(event => event.channel === channel && event.name === name);
  if (!entry) throw new Error(`Unclassified event: ${channel}/${name}`);
  return entry;
}

export function validateLearningAdapter(policy, eventMap, cards) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  require(policy.contractVersion === "learning-contract-v1", "Unsupported contract version");
  require(["contract_only", "c29_local_implementation_pending_remote_migration", "c30_local_implementation_pending_authorized_remote_migration"].includes(policy.activation), "Unsupported activation state");
  for (const artifact of [eventMap, cards]) {
    require(artifact.policyVersion === policy.policyVersion, "Policy version mismatch");
    require(artifact.adapterVersion === policy.adapterVersion, "Adapter version mismatch");
  }
  require(policy.authority.analyticsCanAward === false && policy.authority.clientCanAward === false, "Only authoritative evidence may award");
  require(policy.mastery.singleCorrectAnswerSufficient === false && policy.mastery.openingOrCompletionSufficient === false, "Activity is not mastery");
  require(policy.mastery.minimumSeparateSessions >= 2 && policy.mastery.minimumRepresentations >= 2 && policy.mastery.requiresDelayedRetrieval === true, "Repeated delayed varied evidence required");
  require(policy.rewardRules.negativePoints === false && policy.rewardRules.pointsPurchaseAnswersOrGrades === false, "Rewards cannot punish errors or buy grades");
  require(policy.rewardRules.pageOpeningPoints === 0 && policy.rewardRules.simulatorOpeningPoints === 0, "Openings cannot earn points");
  require(policy.communication.optInDefault === false && policy.communication.requiresTimestampedAffirmativeOptIn === true, "Affirmative opt-in required");
  require(policy.structural.publicIndividualLeaderboard === false, "Public ranking disabled");
  require(policy.recommendations.deterministicFallback === true && policy.recommendations.aiMayOverrideEligibility === false, "AI must respect deterministic eligibility");
  const names = new Set();
  const categories = new Set(["activity", "learning", "reward", "analytics", "experience", "fidelity", "privacy", "safety", "infrastructure"]);
  for (const event of eventMap.events) {
    const key = `${event.channel}/${event.name}`;
    require(!names.has(key), `Duplicate event: ${key}`);
    names.add(key);
    require(categories.has(event.category), `Missing classification: ${key}`);
    require(event.awardAuthority === false && event.masteryAuthority === false, `Mapping cannot confer authority: ${key}`);
    require(typeof event.source === "string" && event.source.length > 0, `Missing source: ${key}`);
    if (["analytics", "ui"].includes(event.channel)) require(event.canonicalEvent === null, `Client signal cannot be promoted: ${key}`);
    if (event.canonicalEvent) require(eventMap.canonicalEvents.includes(event.canonicalEvent), `Unknown canonical event: ${key}`);
  }
  require(new Set(eventMap.canonicalEvents).size === eventMap.canonicalEvents.length, "Duplicate canonical event");
  const cardIds = new Set();
  for (const card of cards.mechanisms) {
    require(!cardIds.has(card.id), `Duplicate mechanism: ${card.id}`);
    cardIds.add(card.id);
    for (const field of ["goal", "behavior", "mechanism", "evidence", "eligibility", "rewardAndDeduplication", "learningMeasure", "risk", "fallback", "exposure", "owner", "reviewDate", "status"]) {
      require(typeof card[field] === "string" && card[field].trim().length > 0, `Incomplete ${card.id}: ${field}`);
    }
  }
  for (const [event, reward] of Object.entries(policy.rewards)) {
    require(eventMap.canonicalEvents.includes(event), `Unknown reward event: ${event}`);
    require(Number.isInteger(reward.points) && reward.points >= 0 && reward.cap === 1 && Boolean(reward.scope) && Boolean(reward.evidence), `Unbounded reward: ${event}`);
    require(cards.mechanisms.some(card => card.rewardEvents?.includes(event)), `Missing reward mechanism: ${event}`);
  }
  return errors;
}

// Exact section/source matching: no permissive digit stripping, URL rewriting or
// assumed review status. Missing/ambiguous metadata fails closed.
export function eligibleSection(policy, registry, manifest, candidate) {
  if (!candidate || typeof candidate.chapterId !== "string" || typeof candidate.sectionId !== "string" || typeof candidate.pagePath !== "string") return null;
  const { chapterId, sectionId, pagePath } = candidate;
  if (!policy.eligibleChapters.includes(chapterId)) return null;
  const chapter = registry?.chapters?.[chapterId];
  if (chapter?.availability !== "published" || chapter.reviewStatus !== "reviewed" || chapter.exerciseEligible !== true) return null;
  if (!manifest?.eligibleChapters?.includes(chapterId)) return null;
  const matches = (manifest.entries || []).filter(entry => entry.chapterId === chapterId && entry.sectionId === sectionId && entry.pagePath === pagePath);
  if (matches.length !== 1) return null;
  const entry = matches[0];
  const references = entry.canonicalReference?.references;
  if (entry.needsReview !== false || !Array.isArray(references) || references.length === 0 || references.some(ref => ref.needsReview !== false || typeof ref.id !== "string" || !ref.id)) return null;
  if (!Array.isArray(entry.sourceFiles) || !entry.sourceFiles.length) return null;
  return { chapterId, sectionId, contentId: pagePath, sourceIds: references.map(ref => ref.id) };
}
