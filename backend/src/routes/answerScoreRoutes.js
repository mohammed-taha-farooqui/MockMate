/**
 * answerScoreRoutes.js
 * ====================
 * Express router for Answer Scoring ML Inference.
 */

const express = require("express");
const { scoreAnswer } = require("../controllers/answerScoreController");

const router = express.Router();

// POST /api/score-answer
router.post("/", scoreAnswer);

module.exports = router;
