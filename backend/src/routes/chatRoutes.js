const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const { chat, getHistory } = require("../controllers/chatController");
const router = express.Router();
router.use(verifyToken);
router.post("/", chat);
router.get("/history", getHistory);
module.exports = router;
