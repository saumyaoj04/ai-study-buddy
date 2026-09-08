const pool = require("../config/db");
const { geminiRequest } = require("../services/geminiService");
const { updateStreak } = require("../services/activityService");

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "message is required" });
    const history = await pool.query("SELECT role, content FROM chat_messages WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10", [req.user.id]);
    const conversation = history.rows.reverse().map((item) => `${item.role}: ${item.content}`).join("\n");
    const reply = await geminiRequest(`You are AI Study Buddy, a concise and encouraging academic tutor. Help the student learn, do not complete assessed work for them. Conversation:\n${conversation}\nuser: ${message.trim()}\nassistant:`);
    await pool.query("INSERT INTO chat_messages (user_id, role, content) VALUES ($1,'user',$2),($1,'assistant',$3)", [req.user.id, message.trim(), reply]);
    const streak = await updateStreak(req.user.id);
    res.json({ success: true, message: reply, streak });
  } catch (error) { next(error); }
};

const getHistory = async (req, res) => {
  try { const result = await pool.query("SELECT id, role, content, created_at FROM chat_messages WHERE user_id=$1 ORDER BY created_at ASC LIMIT 100", [req.user.id]); res.json({ success: true, messages: result.rows }); }
  catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};
module.exports = { chat, getHistory };
