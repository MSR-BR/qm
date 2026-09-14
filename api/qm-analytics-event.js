import { handleAnalyticsEventRequest } from "../lib/qm-analytics-handler.mjs";

export default async function handler(req, res) {
  const response = await handleAnalyticsEventRequest({
    method: req.method,
    headers: req.headers,
    body: req.body,
    env: process.env
  });

  res.setHeader("Cache-Control", "no-store");
  return res.status(response.status).json(response.body);
}
