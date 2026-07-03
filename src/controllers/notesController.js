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

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const result = await pool.query(
      `UPDATE notes
             SET title = $1,
                 content = $2
             WHERE id = $3
             AND user_id = $4
             RETURNING *`,
      [title, content, id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      note: result.rows[0],
    });
  } catch (error) {
    console.error("Update Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM notes
             WHERE id = $1
             AND user_id = $2
             RETURNING *`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
};
