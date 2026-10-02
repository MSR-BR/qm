import { handleQmAdaptiveLearning } from "../lib/qm-adaptive-learning-handler.mjs";
import { handleQmLearningCommunication } from "../lib/qm-learning-communication-handler.mjs";
import { handleQmLearningEvaluation } from "../lib/qm-learning-evaluation-handler.mjs";
import { handleQmLearningProfile } from "../lib/qm-learning-profile-handler.mjs";
import { handleQmGamificationEvent } from "../lib/qm-gamification-handler.mjs";

const routes = Object.freeze({
  adaptive: handleQmAdaptiveLearning,
  communication: handleQmLearningCommunication,
  evaluation: handleQmLearningEvaluation,
  profile: handleQmLearningProfile,
  reward: handleQmGamificationEvent
});

export default async function handler(req, res) {
  const url = new URL(req.url || "/api/qm-learning", "https://quantum.invalid");
  const route = url.searchParams.get("route");
  const action = Object.hasOwn(routes, route) ? routes[route] : null;
  if (!action) return res.status(404).json({ error: "Learning route not found." });

  const query = Object.fromEntries(url.searchParams.entries());
  delete query.route;
  const result = await action({
    method: req.method,
    headers: req.headers,
    body: req.body,
    query,
    env: process.env
  });
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(result.status).json(result.body);
}
