import { handleExerciseRequest } from "../lib/exercicio-handler.mjs";

const EXERCISE_GENERATION_ENABLED = false;

export default async function handler(req, res) {
  if (!EXERCISE_GENERATION_ENABLED) {
    return res.status(503).json({
      error: "Exercise generation is inactive for this project."
    });
  }

  const response = await handleExerciseRequest({
    method: req.method,
    body: req.body,
    env: process.env
  });

  return res.status(response.status).json(response.body);
}
