/**
 * interviewController.js
 * =======================
 * Controller for Member A Backend Feature: Interview Creation API.
 * Exposes POST /api/interview/create
 *
 * Validates identifiers, verifies referenced MongoDB documents exist (Candidate, Resume, JobDescription),
 * creates and initializes an Interview document, and returns the created interview details.
 */

const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Candidate = require("../models/Candidate");
const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");

/**
 * POST /api/interview/create
 */
async function createInterview(req, res) {
  try {
    const { candidateId, resumeId, jobDescriptionId } = req.body || {};

    // 1. Validate resumeId input
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        error: "resumeId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid resumeId format. Must be a valid MongoDB ObjectId.",
      });
    }

    // 2. Verify Resume document exists
    let resumeDoc;
    try {
      resumeDoc = await Resume.findById(resumeId);
    } catch (dbErr) {
      console.error("[InterviewController] Resume lookup error:", dbErr.message);
      return res.status(500).json({
        success: false,
        error: "Database error while querying Resume.",
      });
    }

    if (!resumeDoc) {
      return res.status(404).json({
        success: false,
        error: `Resume document with id '${resumeId}' not found.`,
      });
    }

    // 3. Determine candidateId to use (from request body or fallback to resumeDoc.candidateId)
    const candidateIdToUse = candidateId || (resumeDoc.candidateId ? resumeDoc.candidateId.toString() : null);

    if (!candidateIdToUse) {
      return res.status(400).json({
        success: false,
        error: "candidateId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(candidateIdToUse)) {
      return res.status(400).json({
        success: false,
        error: "Invalid candidateId format. Must be a valid MongoDB ObjectId.",
      });
    }

    // 4. Verify Candidate document exists
    let candidateDoc;
    try {
      candidateDoc = await Candidate.findById(candidateIdToUse);
    } catch (dbErr) {
      console.error("[InterviewController] Candidate lookup error:", dbErr.message);
      return res.status(500).json({
        success: false,
        error: "Database error while querying Candidate.",
      });
    }

    if (!candidateDoc) {
      return res.status(404).json({
        success: false,
        error: `Candidate document with id '${candidateIdToUse}' not found.`,
      });
    }

    // 5. If jobDescriptionId is provided, validate and verify JobDescription document exists
    let validJdId = null;
    if (jobDescriptionId) {
      if (!mongoose.Types.ObjectId.isValid(jobDescriptionId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid jobDescriptionId format. Must be a valid MongoDB ObjectId.",
        });
      }

      let jdDoc;
      try {
        jdDoc = await JobDescription.findById(jobDescriptionId);
      } catch (dbErr) {
        console.error("[InterviewController] JobDescription lookup error:", dbErr.message);
        return res.status(500).json({
          success: false,
          error: "Database error while querying JobDescription.",
        });
      }

      if (!jdDoc) {
        return res.status(404).json({
          success: false,
          error: `JobDescription document with id '${jobDescriptionId}' not found.`,
        });
      }
      validJdId = jdDoc._id;
    }

    // 6. Create & initialize Interview document
    const interviewData = {
      candidateId: candidateDoc._id,
      resumeId: resumeDoc._id,
      status: "scheduled",
      currentQuestionIndex: 0,
      currentFollowUpCount: 0,
      questions: [],
    };

    if (validJdId) {
      interviewData.jobDescriptionId = validJdId;
    }

    const interview = new Interview(interviewData);
    await interview.save();

    // 7. Return success response
    return res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interviewId: interview._id.toString(),
      interview: {
        id: interview._id.toString(),
        candidateId: interview.candidateId.toString(),
        resumeId: interview.resumeId.toString(),
        jobDescriptionId: interview.jobDescriptionId ? interview.jobDescriptionId.toString() : null,
        status: interview.status,
        currentQuestionIndex: interview.currentQuestionIndex,
        currentFollowUpCount: interview.currentFollowUpCount,
        questions: interview.questions,
        createdAt: interview.createdAt,
      },
    });
  } catch (err) {
    console.error("[InterviewController] Unexpected error:", err.message);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while creating the interview.",
    });
  }
}

module.exports = { createInterview };
