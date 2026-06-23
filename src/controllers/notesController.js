const pool = require("../config/db");

// Create Note
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const result = await pool.query(
      `INSERT INTO notes (user_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, title, content],
    );

    res.status(201).json({
      success: true,
      note: result.rows[0],
    });
  } catch (error) {
    console.error("Create Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get All Notes
const getNotes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id],
    );

    res.status(200).json({
      success: true,
      notes: result.rows,
    });
  } catch (error) {
    console.error("Get Notes Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createNote,
  getNotes,
};
