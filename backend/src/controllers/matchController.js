/**
 * matchController.js
 * ==================
 * Controller for Feature 4F – Node Backend resumeId-based matching with Python ML Service.
 *
 * Exposes POST /api/match
 * Receives: { resumeId, jdText }
 * Fetches: Resume document from MongoDB by resumeId (extracting field `extractedText`)
 * Calls: POST http://localhost:8000/predict
 * Returns: { matchScore, fitClass, skillGaps, features }
 */

const mongoose = require("mongoose");
const axios = require("axios");
const Resume = require("../models/Resume");
const { extractMatchingFeatures } = require("../services/matchingFeatureExtractor");

const PYTHON_ML_URL = process.env.PYTHON_ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/match
 */
async function getMatchResult(req, res) {
  try {
    const { resumeId, jdText, jobDescription } = req.body || {};
    const effectiveJd = (jdText || jobDescription || "").trim();

    // 1. Validate inputs
    if (!resumeId) {
      return res.status(400).json({
        error: "resumeId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        error: "Invalid resumeId format. Must be a valid MongoDB ObjectId.",
      });
    }

    if (!effectiveJd) {
      return res.status(400).json({
        error: "jdText or jobDescription is required and must not be empty.",
      });
    }

    // 2. Find Resume document by resumeId
    let resumeDoc;
    try {
      resumeDoc = await Resume.findById(resumeId);
    } catch (dbErr) {
      console.error("[MatchController] Database query error:", dbErr.message);
      return res.status(500).json({
        error: "Database query failed.",
      });
    }

    if (!resumeDoc) {
      return res.status(404).json({
        error: `Resume document with id '${resumeId}' not found.`,
      });
    }

    // 3. Extract stored cleaned resume text and calculate deterministic matching features
    const storedResumeText = resumeDoc.extractedText || "";
    const matchingFeatures = extractMatchingFeatures(resumeDoc, { description: effectiveJd });
    const computedSkillGaps = matchingFeatures.skillGaps || [];

    // 4. Call Python ML Service POST /predict
    let mlResponse;
    try {
      mlResponse = await axios.post(
        `${PYTHON_ML_URL}/predict`,
        {
          resume_text: storedResumeText,
          job_description: effectiveJd,
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

    // 5. Process Python ML service response
    const data = mlResponse.data || {};

    // 6. Return formatted response shape with deterministic skillGaps
    return res.status(200).json({
      matchScore: data.matchScore,
      fitClass: data.fitClass,
      skillGaps: (data.skillGaps && data.skillGaps.length > 0) ? data.skillGaps : computedSkillGaps,
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
