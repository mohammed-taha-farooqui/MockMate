/**
 * answerScoreController.js
 * ========================
 * Controller for Answer Scoring ML Inference and Answer Persistence.
 *
 * Exposes POST /api/score-answer
 * Receives: { interviewId, questionId, questionText, referenceAnswer, candidateAnswer }
 * Validates: interviewId, questionId, questionText, candidateAnswer
 * Verifies: Interview and Question documents exist in DB
 * Calls: POST http://localhost:8000/predict-answer
 * Creates: Answer document in MongoDB
 * Returns: { answerId, score, features }
 */

const mongoose = require("mongoose");
const axios = require("axios");
const Interview = require("../models/Interview");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

const PYTHON_ML_URL = process.env.PYTHON_ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/score-answer
 */
async function scoreAnswer(req, res) {
  try {
    const { interviewId, questionId, questionText, referenceAnswer, candidateAnswer } = req.body || {};

    // 1. Validate inputs
    if (!interviewId) {
      return res.status(400).json({
        error: "interviewId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        error: "Invalid interviewId format. Must be a valid MongoDB ObjectId.",
      });
    }

    if (!questionId) {
      return res.status(400).json({
        error: "questionId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        error: "Invalid questionId format. Must be a valid MongoDB ObjectId.",
      });
    }

    if (!questionText || typeof questionText !== "string" || !questionText.trim()) {
      return res.status(400).json({
        error: "questionText is required and must be a non-empty string.",
      });
    }

    if (!candidateAnswer || typeof candidateAnswer !== "string" || !candidateAnswer.trim()) {
      return res.status(400).json({
        error: "candidateAnswer is required and must be a non-empty string.",
      });
    }

    const refAnsString = typeof referenceAnswer === "string" ? referenceAnswer.trim() : "";

    // 2. Verify Interview and Question exist in MongoDB
    try {
      const interviewDoc = await Interview.findById(interviewId);
      if (!interviewDoc) {
        return res.status(404).json({
          error: `Interview document with id '${interviewId}' not found.`,
        });
      }

      const questionDoc = await Question.findById(questionId);
      if (!questionDoc) {
        return res.status(404).json({
          error: `Question document with id '${questionId}' not found.`,
        });
      }
    } catch (dbErr) {
      console.error("[AnswerScoreController] Database verification error:", dbErr.message);
      return res.status(500).json({
        error: "Database query failed during document verification.",
      });
    }

    // 3. Call Python ML Service POST /predict-answer
    let mlResponse;
    try {
      mlResponse = await axios.post(
        `${PYTHON_ML_URL}/predict-answer`,
        {
          questionText: questionText.trim(),
          referenceAnswer: refAnsString,
          candidateAnswer: candidateAnswer.trim(),
        },
        { timeout: 30000 }
      );
    } catch (err) {
      console.error(
        `[AnswerScoreController] Error calling Python ML service at ${PYTHON_ML_URL}/predict-answer:`,
        err.message
      );
      if (err.response && err.response.status === 400) {
        return res.status(400).json({
          error: err.response.data?.detail || "Invalid request sent to ML service.",
        });
      }
      return res.status(503).json({
        error: "ML inference service is currently unavailable. Please try again later.",
      });
    }

    const mlData = mlResponse.data || {};

    // 4. Create Answer document in MongoDB
    let answerDoc;
    try {
      answerDoc = await Answer.create({
        interviewId,
        questionId,
        answerText: candidateAnswer.trim(),
        score: mlData.score,
        features: {
          semanticSimilarity: mlData.features?.semanticSimilarity || 0,
          keywordOverlap: mlData.features?.keywordOverlap || 0,
          answerLength: mlData.features?.answerLength || 0,
          technicalKeywordCount: mlData.features?.technicalKeywordCount || 0,
        },
      });
    } catch (createErr) {
      console.error("[AnswerScoreController] Failed to save Answer document:", createErr.message);
      return res.status(500).json({
        error: "Failed to save answer record to database.",
      });
    }

    // 5. Return JSON response
    return res.status(200).json({
      answerId: answerDoc._id.toString(),
      score: answerDoc.score,
      features: answerDoc.features,
    });
  } catch (err) {
    console.error("[AnswerScoreController] Unexpected error:", err.message);
    return res.status(500).json({
      error: "An unexpected error occurred while processing answer score.",
    });
  }
}

module.exports = { scoreAnswer };
