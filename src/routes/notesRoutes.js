const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const { createNote, getNotes } = require("../controllers/notesController");

router.post("/", verifyToken, createNote);
router.get("/", verifyToken, getNotes);

module.exports = router;
