import { handleExerciseValidationAdminRequest } from "../lib/exercicio-handler.mjs";
import { queryFromRequestUrl } from "../lib/qm-request-query.mjs";

export default async function handler(req, res) {
  const response = await handleExerciseValidationAdminRequest({
    method: req.method,
    body: req.body,
    headers: req.headers,
    query: queryFromRequestUrl(req.url),
    env: process.env
  });

  return res.status(response.status).json(response.body);
}
