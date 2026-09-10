import {
  ensureSupabaseConfig,
  fetchAuthenticatedUser,
  jsonResponse,
  readBearerToken
} from "./qm-server-shared.mjs";

const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_TEST_ADMIN_EMAIL = "marioreis@id.uff.br";
const EMAIL_FROM = "QUANTUM <hello@quantummechanicsbook.app>";
const EMAIL_REPLY_TO = "marioreis@id.uff.br";
const TEST_DESTINATION_URL = "https://quantummechanicsbook.app/index.html?view=chapters&chapter=01&utm_source=email&utm_medium=owned&utm_campaign=email_test";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function getTestAdminEmail(env) {
  return normalizeEmail(env.QM_EMAIL_ADMIN || DEFAULT_TEST_ADMIN_EMAIL);
}

function buildTestEmail() {
  return {
    from: EMAIL_FROM,
    to: [EMAIL_REPLY_TO],
    reply_to: EMAIL_REPLY_TO,
    subject: "Delivery test — QUANTUM",
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f7fb;color:#142b44;font-family:Arial,Helvetica,sans-serif;">
    <main style="max-width:600px;margin:0 auto;padding:32px 20px;">
      <section style="background:#ffffff;border:1px solid #dbe5f0;border-radius:16px;padding:32px;">
        <p style="margin:0 0 14px;color:#00518e;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">QUANTUM</p>
        <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;">Test delivery confirmed</h1>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">This is a technical test of the QUANTUM email channel. No subscriber received this message.</p>
        <p style="margin:0 0 26px;font-size:16px;line-height:1.6;">Check the sender, mobile rendering, and whether replies reach the configured address.</p>
        <p style="margin:0;"><a href="${TEST_DESTINATION_URL}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#00518e;color:#ffffff;font-weight:700;text-decoration:none;">Open Chapter 1</a></p>
      </section>
      <p style="margin:18px 0 0;color:#5d6d7e;font-size:12px;line-height:1.5;">Test message sent only to the QUANTUM responsible account.</p>
    </main>
  </body>
</html>`,
    text: `QUANTUM — test delivery confirmed.\n\nThis is a technical test of the QUANTUM email channel. No subscriber received this message.\n\nOpen Chapter 1: ${TEST_DESTINATION_URL}`,
    tags: [
      { name: "category", value: "email-test" },
      { name: "source", value: "admin" }
    ]
  };
}

async function getAuthenticatedUser(headers, env) {
  const config = ensureSupabaseConfig(env);
  const accessToken = readBearerToken(headers);
  if (!config || !accessToken) return null;

  return fetchAuthenticatedUser({
    supabaseUrl: config.supabaseUrl,
    publishableKey: config.publishableKey,
    accessToken
  });
}

export async function handleEmailTestRequest({ method, headers = {}, env = process.env }) {
  if (method !== "POST") return jsonResponse(405, { error: "Use POST." });

  const user = await getAuthenticatedUser(headers, env);
  if (!user?.id) return jsonResponse(401, { error: "Sign in with Google to send the test." });
  if (normalizeEmail(user.email) !== getTestAdminEmail(env)) {
    return jsonResponse(403, { error: "This test is available only to the responsible account." });
  }

  const apiKey = String(env.RESEND_API_KEY || "").trim();
  if (!apiKey) return jsonResponse(500, { error: "Email delivery is not configured yet." });

  let resendResponse;
  try {
    resendResponse = await fetch(RESEND_EMAILS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildTestEmail())
    });
  } catch {
    return jsonResponse(502, { error: "Could not reach the email service." });
  }

  if (!resendResponse.ok) {
    return jsonResponse(502, { error: "The email service rejected the test. Check Resend configuration." });
  }

  return jsonResponse(200, { sent: true, destination: EMAIL_REPLY_TO });
}
