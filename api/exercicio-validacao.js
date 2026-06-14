import { handleExerciseValidationRequest } from "../lib/exercicio-handler.mjs";

const EXERCISE_VALIDATION_ENABLED = false;

export default async function handler(req, res) {
  if (!EXERCISE_VALIDATION_ENABLED) {
    return res.status(503).json({
      error: "Exercise validation is inactive for this project."
    });
  }

  const response = await handleExerciseValidationRequest({
    method: req.method,
    body: req.body,
    headers: req.headers,
    env: process.env
  });

  return res.status(response.status).json(response.body);
}
