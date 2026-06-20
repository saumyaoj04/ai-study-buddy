const pool = require("../config/db");

const getProfile = async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT id, full_name, email, role, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id],
    );

    res.status(200).json({
      success: true,
      user: user.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getProfile,
};
