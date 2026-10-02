import { readFileSync } from "node:fs";

export const evaluationContract = JSON.parse(readFileSync(new URL("../data/qm-learning-evaluation.v1.json", import.meta.url)));

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function rate(numerator, denominator) {
  return denominator > 0 ? Number((numerator / denominator).toFixed(3)) : null;
}

export function buildAcademicEvaluationReport(summary = {}) {
  const sample = number(summary.learning_sample);
  const delayed = number(summary.delayed_retrieval_learners);
  const changed = number(summary.changed_representation_learners);
  const eligible = number(summary.communication_eligible);
  const delivered = number(summary.communication_delivered);
  const acted = number(summary.mechanic_acted);
  const mechanicExposed = number(summary.mechanic_exposed);
  return {
    reportVersion: evaluationContract.version,
    generatedAt: String(summary.generated_at || new Date().toISOString()),
    population: "Signed-in QUANTUM learners with reviewed in-app evidence represented in the selected database window.",
    sample: { learningLearners: sample, voluntaryRatings: number(summary.rating_count) },
    outcomes: {
      learning: {
        delayedUnaidedRetrieval: { numerator: delayed, denominator: number(summary.delayed_eligible_learners), proportion: rate(delayed, number(summary.delayed_eligible_learners)) },
        changedRepresentation: { numerator: changed, denominator: number(summary.changed_representation_eligible), proportion: rate(changed, number(summary.changed_representation_eligible)) },
        claimBoundary: evaluationContract.claimRules.mastery
      },
      behavior: { analyticsEvents: number(summary.analytics_events), claimBoundary: evaluationContract.claimRules.engagement },
      experience: { ratingCount: number(summary.rating_count), averageRating: summary.average_rating === null ? null : number(summary.average_rating), claimBoundary: evaluationContract.claimRules.experience },
      implementationFidelity: { eligible: number(summary.mechanic_eligible), exposed: mechanicExposed, acted, exposureToAction: rate(acted, mechanicExposed) },
      equitySafety: { communicationEligible: eligible, communicationSent: number(summary.communication_sent), communicationDelivered: delivered, communicationExposed: null, deliveryFailures: number(summary.communication_failed), optOuts: number(summary.communication_opted_out), exposureRate: null,
        exposureLimitation: "Provider acceptance and confirmed delivery do not establish that a learner read a message. Learner exposure is not measured." }
    },
    attrition: { exposedWithoutAction: Math.max(0, mechanicExposed - acted), explanation: "Observed implementation-fidelity attrition; not learner dropout from a controlled study." },
    missingData: ["Offline study, external assessments and learners who did not consent to product analytics are not observed."],
    effectSize: null,
    uncertainty: "Descriptive operational evidence only. No causal effect size or confidence interval is reported without a prespecified comparison design.",
    adverseEffects: { communicationFailures: number(summary.communication_failed), optOuts: number(summary.communication_opted_out) },
    limitations: [
      "The current report is descriptive and does not establish causality.",
      "Product activity and voluntary ratings are not learning outcomes.",
      "Small-cell demographic or individual segmentation is intentionally unavailable.",
      "Retention, transfer and mastery claims require baseline plus delayed or changed-form evidence."
    ],
    analyticsSeparation: evaluationContract.analyticsSeparation
  };
}
