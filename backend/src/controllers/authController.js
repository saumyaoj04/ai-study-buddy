const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const bcrypt = require("bcrypt");

// REGISTER USER
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ success: false, message: "Enter a valid email and a password of at least 8 characters" });
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users
      (full_name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, full_name, email`,
      [fullName.trim(), normalizedEmail, hashedPassword],
    );

    res.status(201).json({
      success: true,
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// LOGIN USER
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.rows[0].id,
        email: user.rows[0].email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.rows[0].id,
        fullName: user.rows[0].full_name,
        email: user.rows[0].email,
      },
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
  register,
  login,
};
