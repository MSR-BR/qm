import { readFileSync } from "node:fs";
import { classifyEvent, eligibleSection, validateLearningAdapter } from "./learning-policy-contract.mjs";

function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function read(name) {
  return freeze(JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8")));
}
export const policy = read("qm-learning-policy.v1.json");
export const eventMap = read("qm-learning-event-map.v1.json");
export const mechanismCards = read("qm-learning-mechanisms.v1.json");
const registry = read("qm-content-registry.json");
const manifest = read("qm-exercise-source-manifest.json");
export const classifyQmEvent = (channel, name) => classifyEvent(eventMap, channel, name);
export const eligibleQmSection = candidate => eligibleSection(policy, registry, manifest, candidate);
export const validateQmAdapter = () => validateLearningAdapter(policy, eventMap, mechanismCards);
