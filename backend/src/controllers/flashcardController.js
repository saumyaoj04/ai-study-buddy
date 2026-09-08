const pool = require("../config/db");
const { geminiRequest, parseJson } = require("../services/geminiService");

// Create Flashcard
const createFlashcard = async (req, res) => {
  try {
    const { question, answer, subject = "General", noteId = null } = req.body;
    if (!question?.trim() || !answer?.trim()) return res.status(400).json({ success: false, message: "Question and answer are required" });

    const result = await pool.query(
      `INSERT INTO flashcards (user_id, question, answer, subject, note_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, question.trim(), answer.trim(), subject.trim() || "General", noteId],
    );

    res.status(201).json({
      success: true,
      flashcard: result.rows[0],
    });
  } catch (error) {
    console.error("Create Flashcard Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getFlashcards = async (req, res) => {
  try {
    const { subject } = req.query;
    const result = await pool.query(`SELECT * FROM flashcards WHERE user_id = $1 ${subject ? "AND subject = $2" : ""} ORDER BY created_at DESC`, subject ? [req.user.id, subject] : [req.user.id]);
    res.json({ success: true, flashcards: result.rows });
  } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

const updateFlashcard = async (req, res) => {
  try {
    const { question, answer, subject = "General" } = req.body;
    if (!question?.trim() || !answer?.trim()) return res.status(400).json({ success: false, message: "Question and answer are required" });
    const result = await pool.query("UPDATE flashcards SET question=$1, answer=$2, subject=$3 WHERE id=$4 AND user_id=$5 RETURNING *", [question.trim(), answer.trim(), subject.trim() || "General", req.params.id, req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: "Flashcard not found" });
    res.json({ success: true, flashcard: result.rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

const deleteFlashcard = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM flashcards WHERE id=$1 AND user_id=$2 RETURNING id", [req.params.id, req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: "Flashcard not found" });
    res.json({ success: true, message: "Flashcard deleted successfully" });
  } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};

const generateFlashcards = async (req, res, next) => {
  try {
    const { content, subject = "General", noteId = null, count = 5 } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Study content is required" });
    const amount = Math.min(Math.max(Number(count) || 5, 1), 20);
    const text = await geminiRequest(`Create ${amount} concise revision flashcards from this content. Return ONLY valid JSON: an array of objects with string question and string answer. Content:\n${content}`);
    const cards = parseJson(text);
    if (!Array.isArray(cards) || !cards.every((card) => card.question?.trim() && card.answer?.trim())) { const error = new Error("AI returned an invalid flashcard format"); error.status = 502; throw error; }
    const created = [];
    for (const card of cards) {
      const result = await pool.query("INSERT INTO flashcards (user_id, note_id, question, answer, subject) VALUES ($1,$2,$3,$4,$5) RETURNING *", [req.user.id, noteId, card.question.trim(), card.answer.trim(), subject.trim() || "General"]);
      created.push(result.rows[0]);
    }
    res.status(201).json({ success: true, flashcards: created });
  } catch (error) { next(error); }
};

module.exports = {
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
  generateFlashcards,
};
