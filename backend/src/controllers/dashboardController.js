const pool = require("../config/db");

const getDashboard = async (req, res) => {
  try {
    const [user, counts, recentNotes, progress, achievements] = await Promise.all([
      pool.query("SELECT id, full_name, email, streak, last_study_date FROM users WHERE id=$1", [req.user.id]),
      pool.query("SELECT (SELECT COUNT(*) FROM notes WHERE user_id=$1)::int AS notes, (SELECT COUNT(*) FROM flashcards WHERE user_id=$1)::int AS flashcards, (SELECT COUNT(*) FROM quizzes WHERE user_id=$1)::int AS quizzes", [req.user.id]),
      pool.query("SELECT id, title, subject, created_at FROM notes WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5", [req.user.id]),
      pool.query("SELECT subject, topics_completed, quizzes_completed, average_score, study_time_minutes, updated_at FROM progress WHERE user_id=$1 ORDER BY updated_at DESC", [req.user.id]),
      pool.query("SELECT code, title, description, unlocked_at FROM achievements WHERE user_id=$1 ORDER BY unlocked_at DESC", [req.user.id]),
    ]);
    res.json({ success: true, dashboard: { user: user.rows[0], counts: counts.rows[0], recentNotes: recentNotes.rows, progress: progress.rows, achievements: achievements.rows } });
  } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
};
module.exports = { getDashboard };
