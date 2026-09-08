const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const { createFlashcard, getFlashcards, updateFlashcard, deleteFlashcard, generateFlashcards } = require("../controllers/flashcardController");

router.post("/", verifyToken, createFlashcard);
router.post("/generate", verifyToken, generateFlashcards);
router.get("/", verifyToken, getFlashcards);
router.put("/:id", verifyToken, updateFlashcard);
router.delete("/:id", verifyToken, deleteFlashcard);

module.exports = router;
