const pool = require("../config/db");
const { geminiRequest, parseJson } = require("../services/geminiService");
const { recordProgress } = require("../services/activityService");

const validateQuestions = (questions) => Array.isArray(questions) && questions.length > 0 && questions.every((q) => typeof q.question === "string" && Array.isArray(q.options) && q.options.length >= 2 && Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.options.length);

const createQuiz = async (req, res) => {
  try {
    const { title = "Study Quiz", subject = "General", noteId = null, questions } = req.body;
    if (!validateQuestions(questions)) return res.status(400).json({ success: false, message: "questions must contain question, at least two options, and answerIndex" });
    const result = await pool.query("INSERT INTO quizzes (user_id, note_id, title, subject, questions) VALUES ($1,$2,$3,$4,$5) RETURNING *", [req.user.id, noteId, title.trim(), subject.trim() || "General", JSON.stringify(questions)]);
    res.status(201).json({ success: true, quiz: result.rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

const generateQuiz = async (req, res, next) => {
  try {
    const { content, subject = "General", title = "AI Generated Quiz", count = 5, noteId = null } = req.body;
    const amount = Math.min(Math.max(Number(count) || 5, 1), 10);
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Study content is required" });
    const text = await geminiRequest(`Create ${amount} multiple-choice study questions from the following content. Return ONLY valid JSON: an array of objects with string question, string options (array of exactly 4), and integer answerIndex (0-3). Content:\n${content}`);
    const questions = parseJson(text);
    if (!validateQuestions(questions)) { const error = new Error("AI returned an invalid quiz format"); error.status = 502; throw error; }
    req.body = { title, subject, noteId, questions };
    return createQuiz(req, res);
  } catch (error) { next(error); }
};

const getQuizzes = async (req, res) => {
  try { const result = await pool.query("SELECT id, note_id, title, subject, jsonb_array_length(questions) AS question_count, created_at FROM quizzes WHERE user_id=$1 ORDER BY created_at DESC", [req.user.id]); res.json({ success: true, quizzes: result.rows }); }
  catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

const getQuiz = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM quizzes WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: "Quiz not found" });
    const quiz = result.rows[0];
    quiz.questions = quiz.questions.map(({ answerIndex, ...safeQuestion }) => safeQuestion);
    res.json({ success: true, quiz });
  } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

const submitAttempt = async (req, res, next) => {
  try {
    const { answers, studyMinutes = 0 } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ success: false, message: "answers must be an array of selected option indexes" });
    const result = await pool.query("SELECT * FROM quizzes WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: "Quiz not found" });
    const quiz = result.rows[0];
    const score = quiz.questions.reduce((total, question, index) => total + (answers[index] === question.answerIndex ? 1 : 0), 0);
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const attempt = await pool.query("INSERT INTO quiz_attempts (quiz_id, user_id, answers, score, total_questions) VALUES ($1,$2,$3,$4,$5) RETURNING *", [quiz.id, req.user.id, JSON.stringify(answers), score, quiz.questions.length]);
    const streak = await recordProgress({ userId: req.user.id, subject: quiz.subject, score: percentage, studyMinutes: Math.max(Number(studyMinutes) || 0, 0) });
    res.status(201).json({ success: true, attempt: attempt.rows[0], percentage, streak });
  } catch (error) { next(error); }
};

module.exports = { createQuiz, generateQuiz, getQuizzes, getQuiz, submitAttempt };
