const pool = require("../config/db");

const updateStreak = async (userId) => {
  const result = await pool.query(
    `UPDATE users
       SET streak = CASE
         WHEN last_study_date = CURRENT_DATE THEN streak
         WHEN last_study_date = CURRENT_DATE - INTERVAL '1 day' THEN streak + 1
         ELSE 1
       END,
       last_study_date = CURRENT_DATE
     WHERE id = $1 RETURNING streak`,
    [userId],
  );
  const streak = result.rows[0]?.streak || 0;
  const badges = [];
  if (streak >= 3) badges.push(["streak_3", "3 Day Streak", "Studied for 3 consecutive days"]);
  if (streak >= 7) badges.push(["streak_7", "7 Day Streak", "Studied for 7 consecutive days"]);
  for (const [code, title, description] of badges) {
    await pool.query("INSERT INTO achievements (user_id, code, title, description) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, code) DO NOTHING", [userId, code, title, description]);
  }
  return streak;
};

const recordProgress = async ({ userId, subject = "General", score, studyMinutes = 0 }) => {
  await pool.query(
    `INSERT INTO progress (user_id, subject, topics_completed, quizzes_completed, average_score, study_time_minutes)
     VALUES ($1, $2, 0, 1, $3, $4)
     ON CONFLICT (user_id, subject) DO UPDATE SET
       quizzes_completed = progress.quizzes_completed + 1,
       average_score = ROUND(((progress.average_score * progress.quizzes_completed + EXCLUDED.average_score) / (progress.quizzes_completed + 1))::numeric, 2),
       study_time_minutes = progress.study_time_minutes + EXCLUDED.study_time_minutes,
       updated_at = NOW()`,
    [userId, subject, score, studyMinutes],
  );
  if (score >= 90) await pool.query("INSERT INTO achievements (user_id, code, title, description) VALUES ($1, 'quiz_master', 'Quiz Master', 'Scored 90% or above on a quiz') ON CONFLICT (user_id, code) DO NOTHING", [userId]);
  return updateStreak(userId);
};

module.exports = { updateStreak, recordProgress };
