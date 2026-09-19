/**
 * answerScoreController.js
 * ========================
 * Controller for Answer Scoring ML Inference integration with Python ML Service.
 *
 * Exposes POST /api/score-answer
 * Receives: { questionText, referenceAnswer, candidateAnswer }
 * Calls: POST http://localhost:8000/predict-answer
 * Returns: { score, features: { semanticSimilarity, keywordOverlap, answerLength, technicalKeywordCount } }
 */

const axios = require("axios");

const PYTHON_ML_URL = process.env.PYTHON_ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/score-answer
 */
async function scoreAnswer(req, res) {
  try {
    const { questionText, referenceAnswer, candidateAnswer } = req.body || {};

    // 1. Validate inputs - all three fields must be non-empty strings
    if (!questionText || typeof questionText !== "string" || !questionText.trim()) {
      return res.status(400).json({
        error: "questionText is required and must be a non-empty string.",
      });
    }

    if (!referenceAnswer || typeof referenceAnswer !== "string" || !referenceAnswer.trim()) {
      return res.status(400).json({
        error: "referenceAnswer is required and must be a non-empty string.",
      });
    }

    if (!candidateAnswer || typeof candidateAnswer !== "string" || !candidateAnswer.trim()) {
      return res.status(400).json({
        error: "candidateAnswer is required and must be a non-empty string.",
      });
    }

    // 2. Call Python ML Service POST /predict-answer
    let mlResponse;
    try {
      mlResponse = await axios.post(
        `${PYTHON_ML_URL}/predict-answer`,
        {
          questionText: questionText.trim(),
          referenceAnswer: referenceAnswer.trim(),
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

    // 3. Return Python ML service response
    return res.status(200).json(mlResponse.data);
  } catch (err) {
    console.error("[AnswerScoreController] Unexpected error:", err.message);
    return res.status(500).json({
      error: "An unexpected error occurred while scoring the answer.",
    });
  }
}

module.exports = { scoreAnswer };
