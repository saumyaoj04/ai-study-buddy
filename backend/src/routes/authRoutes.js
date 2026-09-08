const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working",
  });
});

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Protected Route Accessed",
    user: req.user,
  });
});
module.exports = router;
