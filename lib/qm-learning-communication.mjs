import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { eligibleQmSection } from "./qm-learning-adapter.mjs";

const policy = JSON.parse(readFileSync(new URL("../data/qm-learning-policy.v1.json", import.meta.url)));
export const LEARNING_EMAIL_CONSENT_VERSION = "qm-learning-email-consent-2026-09-26.1";
export const LEARNING_EMAIL_CONFIRMATION = "SEND REVIEWED LEARNING UPDATES";
const DAY_MS = 86400000;

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function unbase64url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function validTimeZone(value) {
  const timeZone = String(value || "").trim();
  if (!timeZone || timeZone.length > 80) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function localParts(now, timeZone) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(now).map(part => [part.type, part.value]));
}

function withinQuietHours(now, timeZone) {
  const parts = localParts(now, timeZone);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const start = 21 * 60;
  const end = 7 * 60;
  return minutes >= start || minutes < end;
}

function localDay(now, timeZone) {
  const parts = localParts(now, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function planReviewedLearningMessage(profile) {
  const due = Array.isArray(profile?.due_reviews?.items) ? profile.due_reviews.items : [];
  for (const concept of due) {
    const source = concept?.source || {};
    const eligible = eligibleQmSection({
      chapterId: source.chapterId,
      sectionId: source.sectionId,
      pagePath: source.contentId
    });
    if (!eligible) continue;
    return {
      messageKind: "due_review",
      contextId: String(concept.concept_id || source.sectionId),
      contentId: eligible.contentId,
      chapterId: eligible.chapterId,
      sectionId: eligible.sectionId,
      conceptLabel: String(concept.label || "a reviewed concept").slice(0, 160),
      reasonCode: concept.status === "needs_review" ? "recent_evidence_needs_review" : "spaced_retrieval_due",
      reason: concept.status === "needs_review"
        ? "A recent reviewed activity indicates that a changed retrieval could help you revisit this concept."
        : "This reviewed concept is due for optional spaced retrieval.",
      href: `/${eligible.contentId}`
    };
  }
  return null;
}

export function evaluateLearningMessageEligibility({ preference, profile, recentEvents = [], now = new Date() } = {}) {
  if (preference?.email_updates_opted_in !== true || !preference?.email_updates_opted_in_at
    || preference.learning_email_consent_version !== LEARNING_EMAIL_CONSENT_VERSION) {
    return { eligible: false, reason: "not_opted_in" };
  }
  if (preference.learning_email_paused === true) return { eligible: false, reason: "paused" };
  if (!validTimeZone(preference.timezone)) return { eligible: false, reason: "unknown_timezone" };
  if (withinQuietHours(now, preference.timezone)) return { eligible: false, reason: "quiet_hours" };
  const plan = planReviewedLearningMessage(profile);
  if (!plan) return { eligible: false, reason: "no_reviewed_due_activity" };

  const counted = recentEvents.filter(event => event?.event_type === "eligible" && Number.isFinite(Date.parse(event.occurred_at)));
  const today = localDay(now, preference.timezone);
  const todayCount = counted.filter(event => localDay(new Date(event.occurred_at), preference.timezone) === today).length;
  if (todayCount >= Number(policy.communication.dailyCap || 1)) return { eligible: false, reason: "daily_cap" };
  const rollingCount = counted.filter(event => now.getTime() - Date.parse(event.occurred_at) < 7 * DAY_MS).length;
  if (rollingCount >= Number(policy.communication.rollingSevenDayCap || 2)) return { eligible: false, reason: "rolling_cap" };
  return { eligible: true, reason: "eligible_due_review", plan };
}

export function learningProviderIdempotencyKey({ userId, reservationKey, secret }) {
  if (!userId || !reservationKey || String(secret || "").length < 32) throw new Error("Invalid provider idempotency input");
  return "qm-learning-" + createHmac("sha256", secret).update(JSON.stringify([userId, reservationKey])).digest("hex");
}

export function createUnsubscribeToken({ userId, optedInAt, secret }) {
  if (!/^[0-9a-f-]{36}$/i.test(String(userId || "")) || !Number.isFinite(Date.parse(optedInAt || "")) || String(secret || "").length < 32) throw new Error("Invalid unsubscribe token input");
  const payload = base64url(JSON.stringify({ u: userId, c: optedInAt, v: LEARNING_EMAIL_CONSENT_VERSION }));
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyUnsubscribeToken(token, secret) {
  if (String(token || "").length > 2048 || String(secret || "").length < 32) return null;
  const [payload, supplied] = String(token || "").split(".");
  if (!payload || !supplied || !secret) return null;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const decoded = JSON.parse(unbase64url(payload));
    return /^[0-9a-f-]{36}$/i.test(String(decoded?.u || ""))
      && Number.isFinite(Date.parse(decoded?.c || ""))
      && decoded?.v === LEARNING_EMAIL_CONSENT_VERSION ? decoded : null;
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

export function buildLearningEmail({ plan, destination, unsubscribeUrl, oneClickUrl, baseUrl = "https://quantummechanicsbook.app" }) {
  if (!plan?.contentId || !destination || !unsubscribeUrl || !oneClickUrl) throw new Error("Invalid reviewed learning email");
  const contentUrl = new URL(plan.href, baseUrl).toString();
  const subject = "An optional QUANTUM review is ready";
  const explanation = `${plan.reason} You are receiving this message because you explicitly enabled optional learning updates.`;
  const reassurance = "You can ignore this suggestion or study something else. There is no missed-day penalty, point loss, rank loss or deadline.";
  const text = `QUANTUM\n\n${subject}\n\n${explanation}\n\nReviewed source: ${plan.conceptLabel}\n${contentUrl}\n\n${reassurance}\n\nManage pause or unsubscribe: ${unsubscribeUrl}`;
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#f3f8f5;color:#173d30;font-family:Arial,Helvetica,sans-serif"><main style="max-width:600px;margin:auto;padding:28px 18px"><section style="background:white;border:1px solid #cfe2d7;border-radius:16px;padding:28px"><p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:.08em">QUANTUM · OPTIONAL LEARNING SUPPORT</p><h1 style="font-size:26px">${escapeHtml(subject)}</h1><p style="line-height:1.6">${escapeHtml(explanation)}</p><p style="line-height:1.6"><strong>Reviewed source:</strong> ${escapeHtml(plan.conceptLabel)}</p><p><a href="${escapeHtml(contentUrl)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#176b4d;color:white;text-decoration:none;font-weight:700">Open reviewed source</a></p><p style="line-height:1.6">${escapeHtml(reassurance)}</p></section><p style="font-size:12px;line-height:1.5;color:#52675f">Optional message. <a href="${escapeHtml(unsubscribeUrl)}">Manage pause or unsubscribe</a>. Compatible email clients also provide one-click unsubscribe.</p></main></body></html>`;
  return { from: "QUANTUM <hello@quantummechanicsbook.app>", to: [destination], reply_to: "marioreis@id.uff.br", subject, text, html,
    headers: { "List-Unsubscribe": `<${oneClickUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    tags: [{ name: "category", value: "reviewed-learning" }, { name: "reason", value: plan.reasonCode }] };
}
