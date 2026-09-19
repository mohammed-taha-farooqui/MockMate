/**
 * matchController.js
 * ==================
 * Controller for Feature 4E – Node Backend integration with Python ML Service.
 *
 * Exposes POST /api/match
 * Receives: { resumeText, jobDescription }
 * Calls: POST http://localhost:8000/predict
 * Returns: { matchScore, fitClass, skillGaps, features }
 */

const axios = require("axios");

const PYTHON_ML_URL = process.env.PYTHON_ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/match
 */
async function getMatchResult(req, res) {
  try {
    const { resumeText, jobDescription } = req.body || {};

    // 1. Validation
    if (
      !resumeText ||
      typeof resumeText !== "string" ||
      !resumeText.trim() ||
      !jobDescription ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        error: "resumeText and jobDescription are required and must not be empty.",
      });
    }

    // 2. Call Python ML Service POST /predict
    let mlResponse;
    try {
      mlResponse = await axios.post(
        `${PYTHON_ML_URL}/predict`,
        {
          resume_text: resumeText.trim(),
          job_description: jobDescription.trim(),
        },
        { timeout: 30000 }
      );
    } catch (err) {
      console.error(
        `[MatchController] Error calling Python ML service at ${PYTHON_ML_URL}/predict:`,
        err.message
      );
      return res.status(503).json({
        error: "ML inference service is currently unavailable. Please try again later.",
      });
    }

    // 3. Process Python response
    const data = mlResponse.data || {};

    // 4. Return formatted response shape
    return res.status(200).json({
      matchScore: data.matchScore,
      fitClass: data.fitClass,
      skillGaps: data.skillGaps || [],
      features: data.features || {},
    });
  } catch (err) {
    console.error("[MatchController] Unexpected error:", err.message);
    return res.status(500).json({
      error: "An unexpected error occurred while processing the match request.",
    });
  }
}

module.exports = { getMatchResult };
