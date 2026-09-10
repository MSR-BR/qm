import {
  ensureSupabaseServerConfig,
  fetchAuthenticatedUser,
  jsonResponse,
  parseJsonBody,
  readBearerToken,
  supabaseRestRequest
} from "./qm-server-shared.mjs";
import { PRIVACY_VERSION, TERMS_VERSION } from "./qm-legal-preferences-handler.mjs";

const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_ADMIN_EMAIL = "marioreis@id.uff.br";
const EMAIL_FROM = "QUANTUM <hello@quantummechanicsbook.app>";
const EMAIL_REPLY_TO = "marioreis@id.uff.br";
const MAX_RECIPIENTS_PER_CAMPAIGN = 100;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function getAdminEmail(env) {
  return normalizeEmail(env.QM_EMAIL_ADMIN || DEFAULT_ADMIN_EMAIL);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function paragraphHtml(value) {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .filter(Boolean)
    .map(function (paragraph) {
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${paragraph.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

function validHttpUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function buildDraft(input = {}) {
  const subject = normalizeText(input.subject, 140);
  const message = normalizeText(input.message, 5000);
  const ctaLabel = normalizeText(input.ctaLabel, 80);
  const ctaUrlInput = normalizeText(input.ctaUrl, 2048);
  const ctaUrl = validHttpUrl(ctaUrlInput);

  if (!subject || !message) return { error: "Provide a subject and message." };
  if (ctaUrlInput && !ctaUrl) return { error: "The button URL must start with http:// or https://." };
  if ((ctaLabel && !ctaUrl) || (!ctaLabel && ctaUrl)) {
    return { error: "Provide the button label and URL together, or leave both blank." };
  }

  return { subject, message, ctaLabel, ctaUrl };
}

function buildEmail({ draft, destination, campaignId, test = false }) {
  const cta = draft.ctaUrl
    ? `<p style="margin:8px 0 26px;"><a href="${escapeHtml(draft.ctaUrl)}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#00518e;color:#ffffff;font-weight:700;text-decoration:none;">${escapeHtml(draft.ctaLabel)}</a></p>`
    : "";
  const footer = test
    ? "Test message sent only to the QUANTUM responsible account. No subscriber received this message."
    : "You received this message because you opted in to QUANTUM updates. To unsubscribe, sign in and change your email preference in the Personal Area.";

  return {
    from: EMAIL_FROM,
    to: [destination],
    reply_to: EMAIL_REPLY_TO,
    subject: draft.subject,
    html: `<!doctype html><html lang="en"><body style="margin:0;background:#f4f7fb;color:#142b44;font-family:Arial,Helvetica,sans-serif;"><main style="max-width:600px;margin:0 auto;padding:32px 20px;"><section style="background:#ffffff;border:1px solid #dbe5f0;border-radius:16px;padding:32px;"><p style="margin:0 0 14px;color:#00518e;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">QUANTUM</p><h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;">${escapeHtml(draft.subject)}</h1>${paragraphHtml(draft.message)}${cta}</section><p style="margin:18px 0 0;color:#5d6d7e;font-size:12px;line-height:1.5;">${footer}</p></main></body></html>`,
    text: `QUANTUM\n\n${draft.subject}\n\n${draft.message}${draft.ctaUrl ? `\n\n${draft.ctaLabel}: ${draft.ctaUrl}` : ""}\n\n${footer}`,
    tags: [
      { name: "category", value: test ? "campaign-test" : "campaign" },
      { name: "campaign", value: campaignId }
    ]
  };
}

async function resolveAdmin(headers, env) {
  const config = ensureSupabaseServerConfig(env);
  const accessToken = readBearerToken(headers);
  if (!config || !accessToken) return { config, user: null };
  const user = await fetchAuthenticatedUser({
    supabaseUrl: config.supabaseUrl,
    publishableKey: config.publishableKey,
    accessToken
  });
  if (normalizeEmail(user?.email) !== getAdminEmail(env)) return { config, user: null };
  return { config, user };
}

async function fetchAuthUsers(config) {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`
    }
  });
  if (!response.ok) return null;
  const payload = await response.json().catch(function () { return null; });
  return Array.isArray(payload?.users) ? payload.users : Array.isArray(payload) ? payload : null;
}

async function getEligibleRecipients(config) {
  const preferences = await supabaseRestRequest({
    config,
    path: "qm_user_legal_preferences",
    params: {
      select: "user_id",
      email_updates_opted_in: "is.true",
      terms_version: `eq.${TERMS_VERSION}`,
      terms_accepted_at: "not.is.null",
      privacy_version: `eq.${PRIVACY_VERSION}`,
      privacy_acknowledged_at: "not.is.null",
      limit: MAX_RECIPIENTS_PER_CAMPAIGN
    }
  });
  if (!preferences.ok) return { error: "Could not load email preferences." };

  const optedInIds = new Set((Array.isArray(preferences.payload) ? preferences.payload : []).map(function (row) {
    return String(row.user_id || "");
  }));
  if (!optedInIds.size) return { recipients: [] };

  const users = await fetchAuthUsers(config);
  if (!users) return { error: "Could not load authorized recipients." };

  return {
    recipients: users
      .filter(function (user) { return optedInIds.has(String(user.id || "")) && normalizeEmail(user.email); })
      .map(function (user) { return { id: String(user.id), email: normalizeEmail(user.email) }; })
      .sort(function (a, b) { return a.email.localeCompare(b.email); })
  };
}

function selectRecipients(eligibleRecipients, input) {
  const audienceType = input.audienceType === "selected_users" ? "selected_users" : "all_opted_in";
  if (audienceType === "all_opted_in") return { audienceType, recipients: eligibleRecipients };
  const selected = new Set(Array.isArray(input.recipientIds) ? input.recipientIds.map(String) : []);
  return {
    audienceType,
    recipients: eligibleRecipients.filter(function (recipient) { return selected.has(recipient.id); })
  };
}

async function sendWithResend(apiKey, email, idempotencyKey) {
  const response = await fetch(RESEND_EMAILS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify(email)
  });
  const payload = await response.json().catch(function () { return {}; });
  return { ok: response.ok, id: String(payload?.id || "") };
}

async function recordRecipientDeliveries(config, campaignId, recipients, deliveries, subject) {
  const rows = recipients.map(function (recipient, index) {
    const delivery = deliveries[index] || {};
    return {
      campaign_id: campaignId,
      user_id: recipient.id,
      delivery_kind: "campaign",
      idempotency_key: `${campaignId}:${recipient.id}`,
      subject,
      status: delivery.ok ? "sent" : "failed",
      resend_message_id: delivery.id || null,
      sent_at: new Date().toISOString()
    };
  });
  if (!rows.length) return;
  // This is an audit improvement introduced after the original campaign table.
  // Do not turn a successful delivery into a false failure if its migration is
  // still awaiting application.
  await supabaseRestRequest({
    config,
    path: "qm_email_recipient_deliveries",
    method: "POST",
    prefer: "return=minimal,resolution=ignore-duplicates",
    body: rows
  });
}

function createCampaignId() {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `campaign-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function handleEmailCampaignRequest({ method, headers = {}, body, env = process.env }) {
  if (method !== "POST") return jsonResponse(405, { error: "Use POST." });

  const { config, user } = await resolveAdmin(headers, env);
  if (!config) return jsonResponse(500, { error: "Communication is not configured on the server yet." });
  if (!user?.id) return jsonResponse(403, { error: "This area is available only to the responsible QUANTUM account." });

  const input = parseJsonBody(body);
  const action = String(input.action || "");
  const audience = await getEligibleRecipients(config);
  if (audience.error) return jsonResponse(502, { error: audience.error });
  const selection = selectRecipients(audience.recipients, input);

  if (action === "audience") {
    return jsonResponse(200, { recipients: audience.recipients, totalEligible: audience.recipients.length });
  }

  const draft = buildDraft(input);
  if (draft.error) return jsonResponse(400, { error: draft.error });
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  if (!apiKey) return jsonResponse(500, { error: "Email delivery is not configured yet." });

  if (action === "test") {
    const campaignId = `test-${createCampaignId()}`;
    const result = await sendWithResend(apiKey, buildEmail({ draft, destination: getAdminEmail(env), campaignId, test: true }), campaignId);
    if (!result.ok) return jsonResponse(502, { error: "The email service rejected the test. Check Resend." });
    return jsonResponse(200, { sent: true, destination: getAdminEmail(env) });
  }

  if (action !== "send") return jsonResponse(400, { error: "Choose a valid action." });
  if (input.confirmationText !== "ENVIAR" || Number(input.confirmRecipientCount) !== selection.recipients.length) {
    return jsonResponse(400, { error: "Confirm the text SEND and the recipient count before sending." });
  }
  if (!selection.recipients.length) return jsonResponse(400, { error: "There are no opted-in recipients for this delivery." });

  const campaignId = createCampaignId();
  const created = await supabaseRestRequest({
    config,
    path: "qm_email_campaigns",
    method: "POST",
    prefer: "return=minimal",
    body: {
      id: campaignId,
      created_by: user.id,
      audience_type: selection.audienceType,
      recipient_count: selection.recipients.length,
      subject: draft.subject,
      message: draft.message,
      cta_label: draft.ctaLabel || null,
      cta_url: draft.ctaUrl || null,
      status: "sending"
    }
  });
  if (!created.ok) return jsonResponse(500, { error: "Could not record the campaign. Apply the communication migration first." });

  const deliveries = await Promise.all(selection.recipients.map(async function (recipient) {
    return sendWithResend(apiKey, buildEmail({ draft, destination: recipient.email, campaignId }), `${campaignId}-${recipient.id}`);
  }));
  await recordRecipientDeliveries(config, campaignId, selection.recipients, deliveries, draft.subject);
  const messageIds = deliveries.map(function (delivery) { return delivery.id; }).filter(Boolean);
  const deliveredCount = deliveries.filter(function (delivery) { return delivery.ok; }).length;
  const failedCount = deliveries.length - deliveredCount;
  const status = failedCount === 0 ? "sent" : deliveredCount ? "partial_failure" : "failed";
  await supabaseRestRequest({
    config,
    path: "qm_email_campaigns",
    method: "PATCH",
    params: { id: `eq.${campaignId}` },
    prefer: "return=minimal",
    body: { status, delivered_count: deliveredCount, failed_count: failedCount, resend_message_ids: messageIds }
  });

  return jsonResponse(200, { sent: true, campaignId, deliveredCount, failedCount, recipientCount: selection.recipients.length });
}
