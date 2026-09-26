import { getQuiz, publicQuiz, grade } from "./qm-chapter-quiz-catalog.mjs";

function jsonResponse(status, body) {
  return { status, body };
}

function readBearerToken(headers = {}) {
  return String(headers.authorization || headers.Authorization || "")
    .replace(/^Bearer\s+/i, "")
    .trim();
}

function serverConfig(env) {
  const supabaseUrl = String(env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const publishableKey = String(env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "");
  const serviceRoleKey = String(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "");
  return supabaseUrl && publishableKey && serviceRoleKey
    ? { supabaseUrl, publishableKey, serviceRoleKey }
    : null;
}

async function authenticatedUser(config, token) {
  const response = await fetch(config.supabaseUrl + "/auth/v1/user", {
    headers: {
      apikey: config.publishableKey,
      Authorization: "Bearer " + token
    }
  });
  return response.ok ? response.json() : null;
}

async function rest(config, path, options = {}) {
  const response = await fetch(config.supabaseUrl + "/rest/v1/" + path, {
    ...options,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: "Bearer " + config.serviceRoleKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

function requestBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function normalizeChapterId(value) {
  return String(value || "").replace(/\D/g, "").padStart(2, "0").slice(-2);
}

function normalizeAnswers(quiz, input) {
  if (!Array.isArray(input) || input.length !== quiz.questions.length) return null;

  const validQuestions = new Set(quiz.questions.map(function (question) {
    return question.questionId;
  }));
  const seen = new Set();
  const answers = [];

  for (const entry of input) {
    const questionId = String(entry?.questionId || "");
    const choice = String(entry?.choice || "").toLowerCase();
    if (!validQuestions.has(questionId) || seen.has(questionId) || !["a", "b", "c", "d"].includes(choice)) {
      return null;
    }
    seen.add(questionId);
    answers.push({ questionId, choice });
  }

  return answers;
}

function assessmentStorageError(action) {
  return jsonResponse(503, {
    error: action === "history"
      ? "Your assessment history could not be loaded. Please try again."
      : "Your assessment attempt could not be saved. Please try again."
  });
}

export async function handleQmChapterQuiz({
  method,
  headers = {},
  body = {},
  query = {},
  env = process.env
}) {
  const input = requestBody(body);
  const chapterId = normalizeChapterId(input.chapterId || query.chapterId);

  if (method === "GET" && query.history) {
    const config = serverConfig(env);
    const token = readBearerToken(headers);
    if (!config) return jsonResponse(503, { error: "Assessment service is not configured." });
    if (!token) return jsonResponse(401, { error: "Sign in to view assessment history." });

    const user = await authenticatedUser(config, token);
    if (!user?.id) return jsonResponse(401, { error: "Your session could not be verified." });

    const result = await rest(
      config,
      "qm_chapter_quiz_attempts?user_id=eq." + encodeURIComponent(user.id) +
        "&select=id,quiz_key,chapter_id,score,correct_count,question_count,created_at" +
        "&order=created_at.desc&limit=20",
      { method: "GET" }
    );

    return result.ok
      ? jsonResponse(200, { attempts: Array.isArray(result.data) ? result.data : [] })
      : assessmentStorageError("history");
  }

  const quiz = getQuiz(chapterId);
  if (!quiz) return jsonResponse(404, { error: "No reviewed assessment is available for this chapter." });
  if (method === "GET") return jsonResponse(200, { quiz: publicQuiz(quiz) });
  if (method !== "POST") return jsonResponse(405, { error: "Use GET or POST." });

  const config = serverConfig(env);
  const token = readBearerToken(headers);
  if (!config) return jsonResponse(503, { error: "Assessment service is not configured." });
  if (!token) return jsonResponse(401, { error: "Sign in to use chapter assessments." });

  const user = await authenticatedUser(config, token);
  if (!user?.id) return jsonResponse(401, { error: "Your session could not be verified." });

  const answers = normalizeAnswers(quiz, input.answers);
  if (!answers) return jsonResponse(422, { error: "Answer every assessment question once before submitting." });

  const result = grade(quiz, answers);
  const stored = await rest(config, "qm_chapter_quiz_attempts", {
    method: "POST",
    body: JSON.stringify({
      user_id: user.id,
      quiz_key: quiz.quizKey,
      chapter_id: quiz.chapterId,
      answers,
      feedback: result.feedback,
      score: result.score,
      correct_count: result.correctCount,
      question_count: result.questionCount
    })
  });

  if (!stored.ok) return assessmentStorageError("save");

  return jsonResponse(200, {
    quiz: publicQuiz(quiz),
    result,
    attempt: Array.isArray(stored.data) ? stored.data[0] || null : stored.data || null
  });
}
