import { handleQmChapterQuiz } from "../lib/qm-chapter-quiz-handler.mjs";
import { queryFromRequestUrl } from "../lib/qm-request-query.mjs";

export default async function handler(req, res) {
  const response = await handleQmChapterQuiz({
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: queryFromRequestUrl(req.url),
    env: process.env
  });
  return res.status(response.status).json(response.body);
}
