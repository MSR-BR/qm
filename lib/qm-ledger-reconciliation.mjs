import { createHash } from "node:crypto";
import { eligibleQmSection } from "./qm-learning-adapter.mjs";

// Offline planning only. Never creates events or grants missing historical points.
export function planLedgerImport({ complete, profiles, rewardEvents, ledger }) {
  if (complete !== true || ![profiles,rewardEvents,ledger].every(Array.isArray)) throw new Error("A complete scoped snapshot is required.");
  const subjects = new Set([...profiles,...rewardEvents,...ledger].map(row => row.user_id));
  const users = [...subjects].map(userId => {
    const projections = profiles.filter(row => row.user_id === userId);
    const events = rewardEvents.filter(row => row.user_id === userId);
    const entries = ledger.filter(row => row.user_id === userId);
    const issues = [];
    if (!userId || projections.length !== 1) issues.push("missing_or_duplicate_projection");
    if (new Set(events.map(e => e.id)).size !== events.length || new Set(events.map(e => e.page_path)).size !== events.length) issues.push("duplicate_legacy_reward");
    if (events.some(e => !e.id || e.event_type !== "section_completed" || e.xp_delta !== 20 ||
      !eligibleQmSection({ chapterId:e.chapter_id,sectionId:e.item_id,pagePath:e.page_path }))) issues.push("ineligible_legacy_reward");
    const xp = events.reduce((sum,e) => sum + (Number.isInteger(e.xp_delta) ? e.xp_delta : 0),0);
    if (projections[0]?.xp_total !== xp || projections[0]?.studied_items_count !== events.length ||
      projections[0]?.level !== Math.floor(xp/100)+1) issues.push("projection_mismatch");
    const existing = new Map(entries.filter(e => e.legacy_reward_id).map(e => [e.legacy_reward_id,e]));
    if (existing.size !== entries.filter(e => e.legacy_reward_id).length || entries.some(e => e.event_type === "section_completed" &&
      !events.some(old => old.id === e.legacy_reward_id && old.page_path === e.content_id && old.xp_delta === e.xp_delta))) issues.push("ledger_mismatch");
    if (entries.some(e => e.event_type !== "section_completed" && e.xp_delta !== 0)) issues.push("unsupported_award_requires_review");
    const pending = events.filter(e => !existing.has(e.id)).length;
    return { subject: createHash("sha256").update(String(userId)).digest("hex").slice(0,12),
      legacy_events: events.length, preserved_xp: xp, proposed_imports: pending, issues,
      eligible: issues.length === 0, evidence: "legacy_unknown_not_mastery" };
  });
  return { mode: "dry-run", remote_writes: false, users, counts: { users: users.length,
    blocked: users.filter(u => !u.eligible).length,
    eligible_imports: users.filter(u => u.eligible).reduce((n,u) => n + u.proposed_imports,0) } };
}
