import { ensureSupabaseServerConfig, fetchAuthenticatedUser, jsonResponse, readBearerToken, supabaseRestRequest } from "./qm-server-shared.mjs";
import { buildAcademicEvaluationReport } from "./qm-learning-evaluation.mjs";

const ADMIN_EMAIL = "marioreis@id.uff.br";

export async function handleQmLearningEvaluation({ method, headers = {}, env = process.env }) {
  if (method !== "GET") return jsonResponse(405, { error: "Use GET." });
  const config = ensureSupabaseServerConfig(env);
  const token = readBearerToken(headers);
  if (!config) return jsonResponse(503, { error: "Academic evaluation is not configured." });
  if (!token) return jsonResponse(403, { error: "This area is restricted to the responsible account." });
  const user = await fetchAuthenticatedUser({ supabaseUrl: config.supabaseUrl, publishableKey: config.publishableKey, accessToken: token });
  if (String(user?.email || "").toLowerCase() !== String(env.QM_EMAIL_ADMIN || ADMIN_EMAIL).toLowerCase()) {
    return jsonResponse(403, { error: "This area is restricted to the responsible account." });
  }
  const summary = await supabaseRestRequest({ config, path: "rpc/read_qm_learning_evaluation_summary", method: "POST", body: {} });
  if (!summary.ok) return jsonResponse(503, { error: "The aggregate evaluation report is not available yet." });
  const payload = Array.isArray(summary.payload) ? summary.payload[0] : summary.payload;
  return jsonResponse(200, { report: buildAcademicEvaluationReport(payload || {}) });
}
